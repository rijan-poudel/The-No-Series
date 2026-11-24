import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectIntake, parseIntake } from "../src/editorial/intake.ts";
import { publicManifest } from "../src/data/public-schema.ts";

const input = readFileSync(
  new URL("../evidence/fd-pilot-2026-11-23.json", import.meta.url),
  "utf8",
);
const snapshot = parseIntake(input);
const observed = snapshot.captures.find((row) => row.status === "observed");
assert(observed);
const single = (row: (typeof snapshot.captures)[number]) => ({
  ...snapshot,
  captures: [row],
});

test("pilot capture preserves missing facts and stays outside the public manifest", () => {
  const review = inspectIntake(snapshot);
  assert.equal(review.publishedOffers, 0);
  assert.equal(publicManifest.safeParse(review).success, false);
  const nabil = review.captures.find((row) => row.source === "nabil");
  assert.equal(nabil?.status, "observed");
  assert.equal(
    nabil && "minimumNpr" in nabil ? nabil.minimumNpr : undefined,
    null,
  );
  assert(
    nabil &&
      "openEvidence" in nabil &&
      nabil.openEvidence?.includes("minimum-deposit"),
  );
  assert.equal(
    review.captures.find((row) => row.source === "global-ime")?.change,
    "recheck",
  );
});

test("intake diff compares normalized facts and retains prior evidence on changes", () => {
  const initial = single(observed);
  const equivalent = single({
    ...observed,
    annualRate: "2.8",
    excerpt: "Updated page layout",
  });
  const changed = single({ ...observed, annualRate: "2.79" });
  assert.equal(
    inspectIntake(equivalent, initial).captures[0].change,
    "unchanged",
  );
  const record = inspectIntake(changed, initial).captures[0];
  assert.equal(record.change, "changed");
  assert("previous" in record && record.previous?.status === "observed");
  assert.equal(record.previous.annualRate, observed.annualRate);
});

test("intake distinguishes an unconfirmed fetch from a confirmed missing row", () => {
  const initial = single(observed);
  const unavailable = single({
    source: observed.source,
    status: "unavailable",
    reason: "Table absent from response",
  });
  const missing = single({
    source: observed.source,
    status: "missing",
    locator: "Deposit rates table",
    reason: "Scope checked and no matching row",
  });
  assert.equal(
    inspectIntake(unavailable, initial).captures[0].change,
    "recheck",
  );
  assert.equal(inspectIntake(missing, initial).captures[0].change, "missing");
});

test("intake rejects invalid rates, term scope, duplicate sources and publication fields", () => {
  const encode = (value: unknown) => JSON.stringify(value);
  for (const row of [
    { ...observed, annualRate: "2.8%" },
    { ...observed, minimumMonths: 13 },
    { ...observed, maximumMonths: 11 },
    { ...observed, status: "published" },
    { ...observed, verified: true },
    { ...observed, effectiveOn: "2026-02-30" },
  ]) {
    assert.throws(() => parseIntake(encode({ ...snapshot, captures: [row] })));
  }
  assert.throws(() =>
    parseIntake(encode({ ...snapshot, captures: [observed, observed] })),
  );
  assert.throws(() => parseIntake(" ".repeat(64 * 1024 + 1)), /64 KiB/);
  assert.throws(
    () => inspectIntake(snapshot, { ...snapshot, observedOn: "2026-11-24" }),
    /baseline/,
  );
});
