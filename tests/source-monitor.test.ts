import assert from "node:assert/strict";
import { test } from "node:test";
import {
  observationChanges,
  observeSources,
} from "../src/editorial/source-monitor.ts";

test("monitor returns stable fingerprints and distinguishes failure from changed content", async () => {
  const initial = await observeSources(
    async () =>
      new Response("notice", { headers: { "Content-Type": "text/html" } }),
  );
  const baseline = Object.fromEntries(
    initial.map(({ source, hash }) => [source, hash!]),
  );
  const latest = await observeSources(async (input, options) => {
    assert.equal(options?.redirect, "error");
    const host = new URL(String(input)).hostname;
    if (host.includes("nabil")) return new Response(null, { status: 503 });
    return new Response(host.includes("nepalbank") ? "changed" : "notice", {
      headers: { "Content-Type": "text/html" },
    });
  });
  assert.deepEqual(
    observationChanges(latest, baseline).map(({ status }) => status),
    ["unchanged", "unavailable", "changed"],
  );
});
