import assert from "node:assert/strict";
import { test } from "node:test";
import {
  archiveIndex,
  tariffReview,
  tariffReviewSummary,
} from "../src/editorial/tariff-review.ts";

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

test("summarizes a verified zero and an unconfirmed extracted value distinctly", () => {
  const prior = index([
    {
      bank: "a",
      url,
      status: "captured",
      candidate: { reload: "0", annual: "5" },
    },
  ]);
  const current = index([
    { bank: "a", url, status: "captured", candidate: { reload: "0" } },
    { bank: "b", url, status: "captured", candidate: { reload: "0" } },
    { bank: "c", status: "needs-source" },
  ]);
  const summary = tariffReviewSummary(tariffReview(prior, current));
  assert.match(summary, /Extracted values to check \(2\)/);
  assert.match(summary, /annual · 5 → unconfirmed/);
  assert.match(summary, /reload · unconfirmed → 0/);
  assert.match(summary, /Sources to recheck \(1\)/);
});

test("labels bank names, units and exact scan timestamps in the summary", () => {
  const prior = index([]);
  const current = archiveIndex.parse({
    ...index([
      {
        bank: "nepal",
        url,
        status: "captured",
        mobileCandidate: { renewalNpr: "300" },
      },
    ]),
    observedAt: "2026-11-24T01:02:03.456Z",
  });
  const summary = tariffReviewSummary(tariffReview(prior, current));
  assert.ok(summary.includes("**Nepal Bank**"));
  assert.ok(
    summary.includes(
      String.raw`Mobile banking renewal per account \(NPR\) · unconfirmed → 300`,
    ),
  );
  assert.ok(summary.includes(current.observedAt));
  assert.ok(summary.includes(prior.observedAt));
});

test("flags an unsuccessful first extraction independently of document capture", () => {
  const current = index([
    { bank: "a", url, status: "captured", hash: "a", mobileCandidate: null },
    { bank: "b", url, status: "captured", hash: "b" },
    { bank: "c", url, status: "unavailable" },
  ]);
  const report = tariffReview(index([]), current);
  assert.deepEqual(
    report.changes.map(({ status }) => status),
    ["extraction-unconfirmed", "new-document", "unavailable"],
  );
  assert.deepEqual(report.changes[0].changedFacts, []);
  assert.match(tariffReviewSummary(report), /extraction unconfirmed/u);
});
