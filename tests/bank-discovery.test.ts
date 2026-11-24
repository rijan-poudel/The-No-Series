import assert from "node:assert/strict";
import { test } from "node:test";
import { banks, findBanks } from "../src/data/banks.ts";
import { discoverSources, sourceSeeds } from "../src/editorial/discovery.ts";

test("bank registry covers A and B classes and matches acronyms and Nepali aliases", () => {
  assert.equal(banks.filter(({ kind }) => kind === "commercial").length, 20);
  assert.equal(banks.filter(({ kind }) => kind === "development").length, 17);
  assert.equal(new Set(banks.map(({ id }) => id)).size, banks.length);
  assert.equal(findBanks("NMB")[0]?.id, "nmb");
  assert.equal(findBanks("कृषि")[0]?.id, "adbl");
  assert.equal(findBanks("Shine res")[0]?.id, "shine-resunga");
  assert.deepEqual(findBanks("unknown"), []);
});

test("discovery prioritizes evidence and ignores foreign origins and duplicate links", () => {
  const seed = sourceSeeds.nmb[1];
  const rows = discoverSources(
    "nmb",
    seed,
    [
      '<a href="/interest-rate">Interest rate</a>',
      '<a href="/docs/current.pdf#page=2">Tariff schedule</a>',
      '<a href="/docs/current.pdf">Tariff</a>',
      '<a href="https://example.invalid/tariff.pdf">Tariff</a>',
    ].join(""),
  );
  assert.deepEqual(
    rows.map(({ kind, priority }) => [kind, priority]),
    [
      ["tariff", 3],
      ["rate", 1],
    ],
  );
  assert.equal(rows[0]?.discoveredOn, seed);
  assert.equal(discoverSources("nmb", "https://example.invalid", "").length, 0);
});
