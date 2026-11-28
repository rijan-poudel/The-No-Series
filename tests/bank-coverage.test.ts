import assert from "node:assert/strict";
import { test } from "node:test";

import { banks } from "../src/data/banks.ts";
import checks from "../src/data/fd-bank-checks.json" with { type: "json" };
import { latestDepositChecks } from "../scripts/fd-coverage.ts";
import { searchBranches } from "../src/data/branch-search.ts";
import { usageCost } from "../src/domain/usage-cost.ts";
import { savingsReadings } from "../src/data/savings.ts";

test("public status reflects the latest dated intake for each registered bank", async () => {
  assert.deepEqual(await latestDepositChecks(), checks);
  assert.deepEqual(Object.keys(checks).sort(), banks.map((b) => b.id).sort());
  assert.equal(checks["rastriya-banijya"].status, "missing");
  assert.equal(checks["shine-resunga"].status, "observed");
});
test("branch search preserves source codes, bounds pages and handles the missing bank", () => {
  assert.equal(searchBranches("", "", 1).total, 5953);
  assert.equal(
    banks.filter((b) => searchBranches(b.id, "", 1).total > 0).length,
    36,
  );
  assert.equal(searchBranches("karnali", "", 1).total, 0);
  assert.ok(
    searchBranches("nepal", "०१०१ pokhara", 1).rows.some(
      (r) => r.name === "Pokhara City Office",
    ),
  );
  assert.equal(searchBranches("", "!!!", 1).total, 0);
  const end = searchBranches("", "", 1000);
  assert.equal(end.current, end.pages);
});
test("subtotal counts only requested events and propagates missing fees", () => {
  assert.equal(usageCost("nepal-sbi", 12, true).total, 380);
  assert.equal(usageCost("everest", 12, false).total, 180);
  assert.equal(usageCost("everest", 12, true).total, null);
  assert.equal(usageCost("nepal", 0, true).total, 300);
  assert.equal(usageCost("karnali", 1, false).total, null);
  assert.throws(() => usageCost("nepal", 1.5, true));
  assert.equal(savingsReadings.sangrila?.minimumNpr, "0");
  assert.equal(savingsReadings.adbl?.minimumNpr, null);
  assert.equal(savingsReadings.nepal?.belowMinimumFeeNpr, "0");
});
