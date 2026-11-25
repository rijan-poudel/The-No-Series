import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractEverestCardFees,
  extractSbiMobileFees,
} from "../src/editorial/tariff-extraction.ts";

test("extracts exact card fees and declines changed wording", () => {
  const html =
    "<h1>EBL E-Com Dollar Card</h1><p>Card Issuance: Physical Card: USD 10.00 Virtual Card: USD 5.00 Load / reload fee: Free Transactions Fee: Min. USD 1 or 1.50% whichever is higher</p><h2>Security Features</h2>";
  assert.deepEqual(extractEverestCardFees(html), {
    physicalIssuanceUsd: "10.00",
    virtualIssuanceUsd: "5.00",
    reloadUsd: "0",
    paymentMinimumUsd: "1",
    paymentPercent: "1.50",
  });
  assert.equal(
    extractEverestCardFees(html.replace("whichever is higher", "negotiable")),
    null,
  );
});

test("PDF discovery retains public same-origin tariffs only", async () => {
  const { tariffDocumentCandidates } = await import(
    "../src/editorial/tariff-links.ts"
  );
  const source = "https://bank.example/fees";
  const html =
    '<a href="/2026.pdf">Standard tariff</a><a href="/2026.pdf#page=3">Standard tariff</a>' +
    '<a href="/private.pdf?token=example">Standard tariff</a><a href="https://other.example/fees.pdf">Tariff</a>';
  assert.deepEqual(tariffDocumentCandidates(source, html), [
    { url: "https://bank.example/2026.pdf", label: "Standard tariff" },
  ]);
});

test("NMB picks the newest labeled archive PDF and ignores lookalike origins", async () => {
  const { nmbLatestArchiveLink } = await import(
    "../src/editorial/tariff-links.ts"
  );
  const official = "https://media.nmb.com.np/nmbcms/downloads/NEW.pdf";
  const html =
    '<a href="' +
    official +
    '?signed=test">STC-NMB BANK-September 2026</a>' +
    '<a href="https://media.nmb.com.np/nmbcms/downloads/OLD.pdf">STC-NMB BANK-August 2026</a>' +
    '<a href="https://other.example/nmbcms/downloads/FAKE.pdf">STC-NMB BANK-December 2026</a>';
  assert.equal(nmbLatestArchiveLink(html), official + "?signed=test");
});

test("Nepal Bank mobile fees preserve annual and per-account scope", async () => {
  const { extractNepalMobileFees } = await import(
    "../src/editorial/tariff-extraction.ts"
  );
  const rows = [
    ["Registration", "NPR 300 Per Account"],
    ["Renewal Period", "1 Year"],
    ["Renewal Fee", "NPR 300 Per Account"],
    ["PIN Reset", "NPR 50"],
  ]
    .map(
      ([name, value]) =>
        "<tr><td>1</td><td>" + name + "</td><td>" + value + "</td></tr>",
    )
    .join("");
  const table = "<table>" + rows + "</table>";
  assert.deepEqual(extractNepalMobileFees(table), {
    registrationNpr: "300",
    renewalNpr: "300",
    renewalYears: "1",
    pinResetNpr: "50",
  });
  assert.equal(extractNepalMobileFees(table + table), null);
  assert.equal(
    extractNepalMobileFees(table.replaceAll("Per Account", "Per Customer")),
    null,
  );
});

test("reads scoped PDF tariff rows and preserves explicit zero", () => {
  const text = [
    "30.1    MOBILE BANKING    Mobile Banking Registration    Nil",
    "30.2    MOBILE BANKING    Mobile Banking Annual Charge    NPR 12.00",
    "30.3    MOBILE BANKING    Mobile Banking Re Pin for Yono    NPR 3",
    "30.4    MOBILE BANKING    Cheque book request via Yono    Nil",
  ].join("\n");
  assert.deepEqual(extractSbiMobileFees(text), {
    sbiRegistrationNpr: "0",
    sbiAnnualNpr: "12.00",
    sbiPinResetNpr: "3",
    sbiChequeRequestNpr: "0",
  });
  assert.equal(extractSbiMobileFees(text.replace("NPR 12.00", "Waived")), null);
  assert.equal(extractSbiMobileFees(text.replace("30.3", "29.3")), null);
  assert.equal(extractSbiMobileFees(text + "\n" + text), null);
});
