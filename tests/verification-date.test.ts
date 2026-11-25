import assert from "node:assert/strict";
import { test } from "node:test";
import { verificationDate } from "../src/ui/verification-date.ts";

test("Nepali cards carry the verified civil day across the Mangsir boundary", () => {
  assert.equal(verificationDate("ne", "2026-11-17"), "वि.सं. २०८३ मंसिर १");
  assert.equal(verificationDate("ne", "2026-11-23"), "वि.सं. २०८३ मंसिर ७");
  assert.match(verificationDate("en", "2026-11-23"), /23 Nov 2026/);
});

test("a date beyond the supported BS table retains an explicit Gregorian label", () => {
  assert.match(verificationDate("ne", "2044-04-13"), /२०४४.*ई\.सं\./);
});
