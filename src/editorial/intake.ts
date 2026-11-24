import { createHash } from "node:crypto";
import Decimal from "decimal.js-light";
import { z } from "zod";
import { calendarDate } from "../domain/model.ts";

import { pilotSources } from "./pilot-sources.ts";
export { pilotSources };

const sourceId = z.enum(["global-ime", "nabil", "nepal-bank"]);
const amount = z.string().regex(/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/);
const monthlyTerm = z.number().int().min(1).max(120);
const evidenceText = z.string().trim().min(1).max(320);

const capture = z.discriminatedUnion("status", [
  z
    .object({
      source: sourceId,
      status: z.literal("observed"),
      effectiveLabel: evidenceText,
      effectiveOn: calendarDate.nullable(),
      minimumNpr: amount.nullable(),
      minimumMonths: monthlyTerm,
      maximumMonths: monthlyTerm,
      annualRate: z.string().regex(/^(?:0|[1-9]\d?)(?:\.\d{1,4})?$/),
      locator: evidenceText,
      excerpt: evidenceText,
    })
    .strict(),
  z
    .object({
      source: sourceId,
      status: z.literal("unavailable"),
      reason: evidenceText,
    })
    .strict(),
  z
    .object({
      source: sourceId,
      status: z.literal("missing"),
      locator: evidenceText,
      reason: evidenceText,
    })
    .strict(),
]);

const snapshotSchema = z
  .object({
    observedOn: calendarDate,
    scope: z.literal("individual-normal-npr-12-months"),
    captures: z.array(capture).min(1).max(3),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    const seen = new Set<string>();
    for (const [index, row] of snapshot.captures.entries()) {
      if (seen.has(row.source)) {
        ctx.addIssue({
          code: "custom",
          path: ["captures", index, "source"],
          message: "Duplicate source",
        });
      }
      seen.add(row.source);
      if (
        row.status === "observed" &&
        (row.minimumMonths > 12 || row.maximumMonths < 12)
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
    previous?.captures.map((row) => [row.source, row]),
  );
  return {
    observedOn: current.observedOn,
    scope: current.scope,
    publishedOffers: 0,
    captures: current.captures.map((row) => {
      const prior = priorBySource.get(row.source);
      const change = compareCapture(row, prior);
      return {
        ...row,
        ...pilotSources[row.source],
        change,
        ...(row.status === "observed" && {
          fingerprint: semanticFingerprint(row),
          openEvidence: [
            ...(row.effectiveOn === null ? ["gregorian-effective-date"] : []),
            ...(row.minimumNpr === null ? ["minimum-deposit"] : []),
            "maximum-deposit-or-unbounded-terms",
            "expiry-or-supersession",
            "payout-and-accrual",
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
