import assert from "node:assert/strict";
import { test } from "node:test";
import { archiveIndex, tariffReview } from "../src/editorial/tariff-review.ts";

const url = "https://example.invalid/fees";
const index = (rows: unknown[]) =>
  archiveIndex.parse({ observedAt: "2026-11-24T00:00:00.000Z", results: rows });

test("flags actual fee changes separately from document and retrieval changes", () => {
  const prior = index([
    {
      bank: "a",
      url,
      status: "captured",
      hash: "aaa",
      candidate: { fee: "0" },
    },
    {
      bank: "b",
      url,
      status: "captured",
      hash: "bbb",
      candidate: { fee: "5" },
    },
    { bank: "c", url, status: "captured", hash: "ccc" },
    {
      bank: "d",
      url,
      status: "captured",
      hash: "ddd",
      candidate: { fee: "8" },
    },
  ]);
  const current = index([
    {
      bank: "a",
      url,
      status: "captured",
      hash: "111",
      candidate: { fee: "8" },
    },
    { bank: "b", url, status: "unavailable" },
    { bank: "c", url, status: "captured", hash: "333" },
    { bank: "d", url, status: "captured", hash: "444", candidate: null },
  ]);
  const report = tariffReview(prior, current);
  assert.deepEqual(
    report.changes.map(({ status }) => status),
    ["facts-changed", "unavailable", "document-changed", "extraction-lost"],
  );
  assert.deepEqual(report.changes[1].changedFacts, []);
  assert.deepEqual(report.changes[0].changedFacts, [
    { field: "fee", before: "0", after: "8" },
  ]);
});

test("reports a previously captured supplemental URL absent from the new scan", () => {
  const bank = "a";
  const oldUrl = url + "/old.pdf";
  const newUrl = url + "/new.pdf";
  const primary = { bank, url, status: "captured", hash: "index" };
  const prior = archiveIndex.parse({
    ...index([primary]),
    supplemental: [
      {
        bank,
        url: oldUrl,
        status: "captured",
        hash: "old",
        candidate: { fee: "0" },
      },
      { bank, url: url + "/unavailable.pdf", status: "unavailable" },
    ],
  });
  const current = archiveIndex.parse({
    ...index([primary]),
    supplemental: [{ bank, url: newUrl, status: "captured", hash: "new" }],
  });
  const report = tariffReview(prior, current);
  assert.equal(report.statuses["not-observed"], 1);
  assert.deepEqual(report.changes, [
    { bank, source: newUrl, status: "new-document", changedFacts: [] },
    { bank, source: oldUrl, status: "not-observed", changedFacts: [] },
  ]);
});
