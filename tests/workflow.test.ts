import { strict as assert } from "node:assert";
import { test } from "node:test";
import { demoClock, demoRelease } from "../src/data/fixtures.ts";
import { compare } from "../src/domain/engine.ts";
import type { Scenario } from "../src/domain/model.ts";
import {
  decide,
  detectCandidates,
  observeNotice,
  publishFixture,
  suppressAffected,
} from "../src/editorial/workflow.ts";

const clock = demoClock();
const now = clock.toISOString();
const old = observeNotice(
  '[{"offer":"alder-deposit","rate":"6.00","effective":"2026-11-01"}]',
  now,
);
const next = observeNotice(
  '[{"offer":"alder-deposit","rate":"6.35","effective":"2026-11-23"}]',
  now,
);
const other = observeNotice(
  '[{"offer":"alder-deposit","rate":"6.33","effective":"2026-11-23"}]',
  now,
);
const fixture = demoRelease();
const reviewer = { id: "a", role: "reviewer" } as const;
const publisher = { id: "c", role: "publisher" } as const;
const scenario: Scenario = {
  product: "fixed-deposits",
  amount: "100000",
  months: 12,
  currency: "NPR",
  payout: "maturity",
  customer: "individual",
};

test("raw fingerprints detect replacements while the semantic diff ignores formatting", () => {
  const formatOnly = observeNotice(
    '[ { "rate": "6.00", "offer": "alder-deposit", "effective": "2026-11-01" } ]',
    now,
  );
  assert.notEqual(old.hash, formatOnly.hash);
  assert.equal(old.semanticHash, formatOnly.semanticHash);
  assert.deepEqual(detectCandidates(old, formatOnly), []);
  assert.equal(
    detectCandidates(old, observeNotice("[]", now))[0].kind,
    "missing",
  );
  assert.throws(() =>
    observeNotice(
      '[{"offer":"alder-deposit","rate":"6.35","effective":"2026-02-31"}]',
      now,
    ),
  );
});

test("independent approvals, role checks, immutable publish and retry", () => {
  const [candidate] = detectCandidates(old, next);
  assert.throws(() => decide(candidate, publisher, "approve", now));
  const first = decide(candidate, reviewer, "approve", now);
  assert.throws(() => decide(first, reviewer, "approve", now));
  assert.throws(() => publishFixture(fixture, first, publisher, "2026-11-23"));
  const second = decide(first, { id: "b", role: "reviewer" }, "approve", now);
  assert.throws(() =>
    publishFixture(
      { ...fixture, kind: "public" },
      second,
      publisher,
      "2026-11-23",
    ),
  );
  assert.throws(() =>
    publishFixture(fixture, second, { ...publisher, id: "a" }, "2026-11-23"),
  );
  const published = publishFixture(fixture, second, publisher, "2026-11-23");
  assert.notEqual(fixture.id, published.id);
  assert.equal(
    compare(scenario, fixture, clock).groups[0].rows[0].calculation.primary,
    "5700.00",
  );
  assert.equal(
    compare(scenario, published, clock).groups[0].rows[0].calculation.primary,
    "6032.50",
  );
  assert.equal(
    publishFixture(published, second, publisher, "2026-11-23"),
    published,
  );
});

test("a conflicting statement removes the affected offer from the ranking", () => {
  const candidates = detectCandidates(old, next, other);
  const unrankable = compare(
    scenario,
    suppressAffected(fixture, candidates),
    clock,
  );
  assert.equal(unrankable.exclusions.disputed, 1);
  assert(
    !unrankable.groups
      .flatMap(({ rows }) => rows)
      .some(({ offer }) => offer.id === "alder-deposit"),
  );
});

test("review walkthrough publishes only after both steps and removes the conflict", async () => {
  const { reviewDemo } = await import("../src/editorial/demo.ts");
  assert.equal(reviewDemo(0).currentNet, "5700.00");
  assert.equal(reviewDemo(2).currentNet, "5700.00");
  assert.equal(reviewDemo(3).currentNet, "6032.50");
  assert.equal(reviewDemo(4).currentNet, null);
});
