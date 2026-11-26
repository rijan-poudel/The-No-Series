import { createHash } from "node:crypto";
import Decimal from "decimal.js-light";
import { z } from "zod";
import { calendarDate } from "../domain/model.ts";

import { banks } from "../data/banks.ts";
import { bankPublishers } from "../data/bank-publishers.ts";
import { pilotSources } from "./pilot-sources.ts";
export { pilotSources };

export const intakeSources: Record<string, { name: string; url: string }> = {
  ...Object.fromEntries(
    banks.map((bank) => [
      bank.id === "nepal" ? "nepal-bank" : bank.id,
      { name: bank.name, url: bankPublishers[bank.id].url },
    ]),
  ),

  ...pilotSources,
  "corporate-development": {
    name: banks.find((b) => b.id === "corporate-development")!.name,
    url: "https://www.corporatebank.com.np/fixed",
  },
  miteri: {
    name: banks.find((b) => b.id === "miteri")!.name,
    url: "https://miteribank.com.np/control/Interestrate/94/",
  },
  muktinath: {
    name: banks.find((b) => b.id === "muktinath")!.name,
    url: "https://www.muktinathbank.com.np/interest-rates",
  },
  "shine-resunga": {
    name: banks.find((b) => b.id === "shine-resunga")!.name,
    url: "https://srdb.com.np/Interest-Rate",
  },
  "nic-asia": {
    name: banks.find((b) => b.id === "nic-asia")!.name,
    url: "https://www.nicasiabank.com/interest-rates/",
  },
  "standard-chartered": {
    name: banks.find((b) => b.id === "standard-chartered")!.name,
    url: "https://av.sc.com/np/content/docs/np-interest-rate.pdf",
  },
  machhapuchchhre: {
    name: banks.find((b) => b.id === "machhapuchchhre")!.name,
    url: "https://assets.machbank.com/uploads/Notices/Interest%20Rate%20Mangsir%202083.jpeg",
  },
  "rastriya-banijya": {
    name: banks.find((b) => b.id === "rastriya-banijya")!.name,
    url: "https://www.rbb.com.np/storage/photos/14/interestRate/IR_20830801.jpg",
  },
  excel: {
    name: "Excel Development Bank",
    url: "https://edb.com.np/wp-content/uploads/2026/11/Int.-Rate-Sheet-for-Mangsir2083-scaled.jpeg",
  },
  sindhu: {
    name: "Sindhu Bikash Bank",
    url: "https://www.sindhubank.com.np/wp-content/uploads/2026/07/interest-rate_sindhu_3x16-Mangsir-2083-Website_page-0001.jpg",
  },
  lumbini: {
    name: "Lumbini Bikas Bank",
    url: "https://www.lumbinibikasbank.com/interest-rates",
  },
  adbl: {
    name: "Agricultural Development Bank",
    url: "https://adbl.gov.np/en/interest-rate/interest-rates-effective-from-mangsir-01-2083-17-november-2026",
  },
  "nepal-sbi": {
    name: "Nepal SBI Bank",
    url: "https://nsbl.statebank/interest-rates-deposits",
  },
  "laxmi-sunrise": {
    name: "Laxmi Sunrise Bank",
    url: "https://www.laxmisunrise.com/rates/interest-rates/",
  },
  everest: {
    name: "Everest Bank",
    url: "https://everestbankltd.com/supports/interest-and-rates/interest-rates-deposit/",
  },
  siddhartha: {
    name: "Siddhartha Bank",
    url: "https://www.siddharthabank.com/interest-rates",
  },
  garima: {
    name: "Garima Bikas Bank",
    url: "https://garimabank.com.np/interest-rates",
  },
  mahalaxmi: {
    name: "Mahalaxmi Bikas Bank",
    url: "https://www.mahalaxmibank.com/assets/backend/uploads/Popup/Interest%20Rate%20for%20the%20month%20of%20Mangsir%202083.pdf",
  },
  kumari: {
    name: "Kumari Bank",
    url: "https://www.kumaribank.com/en/interest-rate-deposits",
  },
};
const sourceId = z.custom<keyof typeof intakeSources>(
  (value) => typeof value === "string" && Object.hasOwn(intakeSources, value),
  "Unknown intake source",
);
const amount = z.string().regex(/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/);
const monthlyTerm = z.number().int().min(1).max(120);
const evidenceText = z.string().trim().min(1).max(320);

const channel = z.enum(["in-person", "mobile-app"]).optional();
const capture = z.discriminatedUnion("status", [
  z
    .object({
      source: sourceId,
      channel,
      status: z.literal("observed"),
      effectiveLabel: evidenceText,
      effectiveOn: calendarDate.nullable(),
      minimumNpr: amount.nullable(),
      minimumMonths: monthlyTerm.nullable(),
      maximumMonths: monthlyTerm,
      payout: z.enum(["quarterly", "monthly", "maturity"]).optional(),
      annualRate: z.string().regex(/^(?:0|[1-9]\d?)(?:\.\d{1,4})?$/),
      locator: evidenceText,
      excerpt: evidenceText,
    })
    .strict(),
  z
    .object({
      source: sourceId,
      channel,
      status: z.literal("unavailable"),
      reason: evidenceText,
    })
    .strict(),
  z
    .object({
      source: sourceId,
      channel,
      status: z.literal("missing"),
      locator: evidenceText,
      reason: evidenceText,
    })
    .strict(),
]);

function captureKey(row: z.infer<typeof capture>) {
  return row.source + "/" + (row.channel ?? "unspecified");
}

const snapshotSchema = z
  .object({
    observedOn: calendarDate,
    scope: z.literal("individual-normal-npr-12-months"),
    captures: z
      .array(capture)
      .min(1)
      .max(Object.keys(intakeSources).length * 2),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    const seen = new Set<string>();
    for (const [index, row] of snapshot.captures.entries()) {
      if (
        seen.has(captureKey(row)) ||
        (row.channel
          ? seen.has(row.source + "/unspecified")
          : snapshot.captures.some(
              (other) => other.source === row.source && other.channel,
            ))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["captures", index, "source"],
          message: "Duplicate source",
        });
      }
      seen.add(captureKey(row));
      if (
        row.status === "observed" &&
        ((row.minimumMonths !== null && row.minimumMonths > 12) ||
          row.maximumMonths < 12)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["captures", index],
          message: "The stated term must include 12 months",
        });
      }
    }
  });

export type IntakeSnapshot = z.infer<typeof snapshotSchema>;
type Capture = IntakeSnapshot["captures"][number];
type Observed = Extract<Capture, { status: "observed" }>;
const decimal = (value: string | null) =>
  value === null ? null : new Decimal(value).toString();
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalizeLabel = (label: string) =>
  label.trim().toLowerCase().replace(/\s+/g, " ");

function semanticFingerprint(row: Observed) {
  return hash([
    row.source,
    row.effectiveOn ?? normalizeLabel(row.effectiveLabel),
    decimal(row.minimumNpr),
    row.minimumMonths,
    row.maximumMonths,
    decimal(row.annualRate),
    ...(row.channel ? [row.channel] : []),
    ...(row.payout ? [row.payout] : []),
  ]);
}

export function parseIntake(input: string): IntakeSnapshot {
  if (Buffer.byteLength(input) > 64 * 1024)
    throw new Error("Intake file is larger than 64 KiB");
  return snapshotSchema.parse(JSON.parse(input));
}

function compareCapture(row: Capture, prior: Capture | undefined) {
  if (row.status === "unavailable") return "recheck";
  if (row.status === "missing") return "missing";
  if (prior?.status !== "observed") return "new";
  return semanticFingerprint(row) === semanticFingerprint(prior)
    ? "unchanged"
    : "changed";
}

export function inspectIntake(
  current: IntakeSnapshot,
  previous?: IntakeSnapshot,
) {
  if (previous && previous.observedOn > current.observedOn) {
    throw new Error(
      "The comparison baseline must be no newer than the current intake",
    );
  }
  const priorBySource = new Map(
    previous?.captures.map((row) => [captureKey(row), row]),
  );
  const observed = new Set(
    current.captures
      .filter((row) => row.status === "observed")
      .map((row) => row.source),
  );
  const unresolved = banks.flatMap((bank) => {
    const source = bank.id === "nepal" ? "nepal-bank" : bank.id;
    if (observed.has(source)) return [];
    const capture = current.captures.find((row) => row.source === source);
    return [
      {
        source,
        ...intakeSources[source],
        status: capture?.status ?? "not-captured",
      },
    ];
  });
  return {
    coverage: {
      registered: banks.length,
      withObservedRate: observed.size,
      unresolved,
    },
    observedOn: current.observedOn,
    scope: current.scope,
    publishedOffers: 0,
    captures: current.captures.map((row) => {
      const prior = priorBySource.get(captureKey(row));
      const change = compareCapture(row, prior);
      return {
        ...row,
        ...intakeSources[row.source],
        change,
        ...(row.status === "observed" && {
          fingerprint: semanticFingerprint(row),
          openEvidence: [
            ...(row.effectiveOn === null ? ["gregorian-effective-date"] : []),
            ...(row.minimumMonths === null ? ["minimum-term"] : []),
            ...(row.minimumNpr === null ? ["minimum-deposit"] : []),
            "maximum-deposit-or-unbounded-terms",
            "expiry-or-supersession",
            row.payout ? "accrual" : "payout-and-accrual",
            "withholding-and-fees",
            "withdrawal-and-eligibility-conditions",
            "independent-review",
          ],
        }),
        ...(change === "changed" &&
          prior?.status === "observed" && { previous: prior }),
      };
    }),
  };
}
