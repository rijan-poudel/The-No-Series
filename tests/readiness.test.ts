import assert from "node:assert/strict";
import { test } from "node:test";
import { demoClock, demoRelease } from "../src/data/fixtures.ts";
import { releaseReadiness } from "../src/data/readiness.ts";
import { publicRelease } from "../src/data/release.ts";

test("readiness distinguishes unavailable, unseeded, withdrawn and evidence without current offers", () => {
  const clock = demoClock();
  assert.equal(releaseReadiness(publicRelease, clock, true), "unavailable");
  assert.equal(releaseReadiness(publicRelease, clock, false), "unseeded");
  assert.equal(releaseReadiness(demoRelease(), clock, false), "unseeded");
  assert.equal(
    releaseReadiness({ ...publicRelease, revoked: true }, clock, false),
    "withdrawn",
  );
  assert.equal(
    releaseReadiness({ ...demoRelease(), kind: "public" }, clock, false),
    "no-current-offers",
  );
});

test("readiness falls after a verified offer expires", () => {
  const fixture = demoRelease();
  const release = {
    ...fixture,
    kind: "public" as const,
    institutions: fixture.institutions.map((institution) => ({
      ...institution,
      fictional: false,
    })),
    sources: fixture.sources.map((source) => ({
      ...source,
      kind: "rate" as const,
      fixture: false,
      url: "https://bank.example/notice",
    })),
  };
  assert.equal(releaseReadiness(release, demoClock(), false), "ready");
  assert.equal(
    releaseReadiness(release, new Date("2026-12-15T00:00:00Z"), false),
    "no-current-offers",
  );
});
