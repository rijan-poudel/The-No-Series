import assert from "node:assert/strict";
import { test } from "node:test";
import { demoClock, demoRelease } from "../src/data/fixtures.ts";
import { editorialPicks, readPriority } from "../src/domain/picks.ts";

test("deposit picks rank the verified published rate for the requested term and payout", () => {
  const choice = readPriority("fixed-deposits", {
    term: "12",
    payout: "maturity",
  });
  assert.ok(choice?.product === "fixed-deposits");
  const release = demoRelease();
  const result = editorialPicks(choice, release, demoClock());
  assert.deepEqual(
    result.leaders.map(({ offer }) => offer.id),
    ["ember-deposit"],
  );
  assert.equal(
    editorialPicks({ ...choice, term: 3 }, release, demoClock()).rows.length,
    0,
  );
  assert.deepEqual(
    editorialPicks(
      { ...choice, payout: "quarterly" },
      release,
      demoClock(),
    ).leaders.map(({ offer }) => offer.id),
    ["dune-deposit"],
  );
  assert.equal(
    editorialPicks(choice, { ...release, revoked: true }, demoClock()).rows
      .length,
    0,
  );
  assert.equal(
    editorialPicks(choice, release, new Date("2026-12-20")).rows.length,
    0,
  );
});

test("card picks rank each flat fee separately and preserve verified zero", () => {
  const choice = readPriority("dollar-cards", { fee: "app", form: "virtual" });
  assert.ok(choice?.product === "dollar-cards");
  const result = editorialPicks(choice, demoRelease(), demoClock());
  assert.equal(result.leaders[0]?.value, "0.00");
  assert.equal(result.leaders[0]?.institution.id, "alder");
  assert.equal(
    result.rows.some(({ institution }) => institution.id === "cedar"),
    false,
  );
  assert.equal(
    editorialPicks({ ...choice, fee: "branch" }, demoRelease(), demoClock())
      .leaders[0]?.institution.id,
    "cedar",
  );
  assert.equal(
    readPriority("dollar-cards", { fee: ["app", "branch"], form: "virtual" }),
    null,
  );
});
