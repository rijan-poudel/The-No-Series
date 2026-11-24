import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const input = JSON.stringify({
  product: "fixed-deposits",
  amount: "१,००,०००",
  currency: "NPR",
  months: 12,
  payout: "any",
  customer: "individual",
});

function run(mode: string, scenario = input) {
  return spawnSync(process.execPath, ["scripts/compare-local.ts", mode], {
    input: scenario,
    encoding: "utf8",
  });
}

test("agent command separates fictional results from unseeded coverage", () => {
  const demo = run("--demo");
  assert.equal(demo.status, 0, demo.stderr);
  const result = JSON.parse(demo.stdout);
  assert.equal(result.demo, true);
  assert.ok(result.groups.length > 0);

  const empty = run("--empty");
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(JSON.parse(empty.stdout).status, "unavailable");
  assert.equal(JSON.parse(empty.stdout).demo, false);
});

test("agent command isolates errors from JSON output", () => {
  const outcome = run("--demo", "{");
  assert.equal(outcome.status, 1);
  assert.equal(outcome.stdout, "");
  assert.match(outcome.stderr, /valid JSON/);
});
