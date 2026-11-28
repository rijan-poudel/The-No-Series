import assert from "node:assert/strict";
import { test } from "node:test";
import {
  observeSavingsSources,
  savingsFingerprint,
  savingsObservationChanges,
  savingsSources,
} from "../src/editorial/savings-monitor.ts";

test("savings HTML fingerprints ignore changing scripts but retain visible terms", () => {
  const encoder = new TextEncoder();
  const first = encoder.encode(
    '<main><h1>Minimum Balance</h1><p>Rs. 500</p></main><script>nonce="a"</script>',
  );
  const sameTerms = encoder.encode(
    '<main><h1>Minimum Balance</h1><p>Rs. 500</p></main><script>nonce="b"</script>',
  );
  const changedTerms = encoder.encode(
    '<main><h1>Minimum Balance</h1><p>Rs. 1,000</p></main><script>nonce="b"</script>',
  );
  assert.equal(
    savingsFingerprint(first, "text/html"),
    savingsFingerprint(sameTerms, "text/html"),
  );
  assert.notEqual(
    savingsFingerprint(first, "text/html"),
    savingsFingerprint(changedTerms, "text/html"),
  );
});

test("savings source monitor keeps terms distinct and never treats a fetch as review", async () => {
  const observations = await observeSavingsSources(async (input, options) => {
    assert.equal(options?.redirect, "error");
    const url = String(input);
    if (url.includes("nmb.com.np")) return new Response(null, { status: 503 });
    return new Response(url, { headers: { "Content-Type": "text/html" } });
  });
  assert.equal(observations.length, savingsSources.length);
  assert.ok(observations.some((source) => source.kind === "account-terms"));
  assert.ok(observations.some((source) => source.kind === "tariff"));
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
