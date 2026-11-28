import assert from "node:assert/strict";
import { test } from "node:test";
import {
  observeSavingsSources,
  savingsObservationChanges,
  savingsSources,
} from "../src/editorial/savings-monitor.ts";

test("savings source monitor keeps terms distinct and never treats a fetch as review", async () => {
  const observations = await observeSavingsSources(async (input, options) => {
    assert.equal(options?.redirect, "error");
    const url = String(input);
    if (url.includes("nmb.com.np")) return new Response(null, { status: 503 });
    return new Response(url, { headers: { "Content-Type": "text/html" } });
  });
  assert.equal(observations.length, savingsSources.length);
  assert.ok(observations.some((source) => source.kind === "account-terms"));
  const baseline = Object.fromEntries(
    observations
      .filter((source) => source.hash)
      .map((source) => [source.id, source.hash!]),
  );
  const changes = savingsObservationChanges(observations, baseline);
  assert.ok(changes.some((source) => source.status === "unavailable"));
  assert.ok(changes.some((source) => source.status === "unchanged"));
  assert.ok(changes.every((source) => !("reviewed" in source)));
});

test("savings source monitor bounds concurrent source requests", async () => {
  let active = 0;
  let peak = 0;
  await observeSavingsSources(async () => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    active -= 1;
    return new Response("notice", {
      headers: { "Content-Type": "text/html" },
    });
  });
  assert.ok(peak <= 4);
  assert.ok(peak > 1);
});
