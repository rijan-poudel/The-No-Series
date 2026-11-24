import { createHash } from "node:crypto";
import { z } from "zod";
import { calendarDate } from "../domain/model.ts";
import type { Deposit, Release } from "../domain/model.ts";

const rowSchema = z
  .array(
    z
      .object({
        offer: z.string().regex(/^[a-z0-9-]{1,80}$/),
        rate: z.string().regex(/^(?:0|[1-9]\d?)(?:\.\d{1,4})?$/),
        effective: calendarDate,
      })
      .strict(),
  )
  .max(500)
  .superRefine((rows, ctx) => {
    const keys = new Set<string>();
    for (const row of rows) {
      if (keys.has(row.offer))
        ctx.addIssue({ code: "custom", message: "Duplicate offer key" });
      keys.add(row.offer);
    }
  });
type Row = z.infer<typeof rowSchema>[number];
type Actor = { id: string; role: "reviewer" | "publisher" };
export type Candidate = {
  id: string;
  offer: string;
  before: Row | null;
  after: Row | null;
  kind: "new" | "changed" | "missing" | "conflict";
  observation: string;
  decisions: {
    actor: string;
    outcome: "approve" | "reject" | "clarify";
    at: string;
  }[];
};
const fingerprint = (input: string) =>
  createHash("sha256").update(input).digest("hex");
const canonical = (rows: Row[]) =>
  JSON.stringify(
    rows
      .map(({ offer, rate, effective }) => ({ offer, rate, effective }))
      .sort((a, b) => a.offer.localeCompare(b.offer, "en")),
  );
export function observeNotice(input: string, observedAt: string) {
  if (Buffer.byteLength(input) > 128 * 1024)
    throw new Error("Notice exceeds fixture limit");
  if (!z.string().datetime().safeParse(observedAt).success)
    throw new Error("Invalid observation time");
  const rows = rowSchema.parse(JSON.parse(input));
  return {
    hash: fingerprint(input),
    semanticHash: fingerprint(canonical(rows)),
    observedAt,
    rows,
    parserVersion: "fixture-json-1",
  };
}

export function detectCandidates(
  previous: ReturnType<typeof observeNotice>,
  current: ReturnType<typeof observeNotice>,
  corroboration?: ReturnType<typeof observeNotice>,
): Candidate[] {
  const before = new Map(previous.rows.map((row) => [row.offer, row]));
  const after = new Map(current.rows.map((row) => [row.offer, row]));
  const other = new Map(corroboration?.rows.map((row) => [row.offer, row]));
  return [...new Set([...before.keys(), ...after.keys()])]
    .sort()
    .flatMap((offer) => {
      const old = before.get(offer) ?? null;
      const next = after.get(offer) ?? null;
      const alternative = other.get(offer);
      const conflict = !!(
        next &&
        alternative &&
        (alternative.rate !== next.rate ||
          alternative.effective !== next.effective)
      );
      if (
        !conflict &&
        old?.rate === next?.rate &&
        old?.effective === next?.effective
      )
        return [];
      const kind = conflict
        ? "conflict"
        : !next
          ? "missing"
          : old
            ? "changed"
            : "new";
      return [
        {
          id: fingerprint(
            JSON.stringify([
              offer,
              kind,
              old,
              next,
              alternative ?? null,
              current.semanticHash,
            ]),
          ),
          offer,
          before: old,
          after: next,
          kind,
          observation: current.hash,
          decisions: [],
        },
      ];
    });
}

export function decide(
  candidate: Candidate,
  actor: Actor,
  outcome: Candidate["decisions"][number]["outcome"],
  at: string,
): Candidate {
  if (
    actor.role !== "reviewer" ||
    !actor.id ||
    !z.string().datetime().safeParse(at).success
  )
    throw new Error("Reviewer identity and timestamp required");
  if (
    candidate.decisions.some(
      (decision) =>
        decision.actor === actor.id || decision.outcome !== "approve",
    )
  ) {
    throw new Error("A fresh candidate and independent review are required");
  }
  return {
    ...candidate,
    decisions: [...candidate.decisions, { actor: actor.id, outcome, at }],
  };
}

export function suppressAffected(
  release: Release,
  candidates: Candidate[],
): Release {
  const byOffer = new Map(
    candidates.map((candidate) => [candidate.offer, candidate]),
  );
  return {
    ...release,
    id:
      release.id +
      "-hold-" +
      fingerprint(
        candidates
          .map((candidate) => candidate.id)
          .sort()
          .join(),
      ).slice(0, 12),
    offers: release.offers.map((offer) => {
      const candidate = byOffer.get(offer.id);
      if (!candidate) return offer;
      return {
        ...offer,
        status: candidate.kind === "conflict" ? "disputed" : "changed",
      };
    }),
  };
}

export function publishFixture(
  release: Release,
  candidate: Candidate,
  publisher: Actor,
  verified: string,
): Release {
  if (
    release.kind !== "demo" ||
    release.revoked ||
    publisher.role !== "publisher" ||
    !publisher.id
  )
    throw new Error("Sandbox publisher required");
  const approved = new Set(
    candidate.decisions
      .filter((decision) => decision.outcome === "approve")
      .map((decision) => decision.actor),
  );
  const next = candidate.after;
  if (
    !next ||
    candidate.kind === "missing" ||
    candidate.kind === "conflict" ||
    candidate.decisions.some((decision) => decision.outcome !== "approve") ||
    approved.size < 2 ||
    approved.has(publisher.id)
  ) {
    throw new Error(
      "Two independent approvals and a separate publisher are required",
    );
  }
  if (
    !calendarDate.safeParse(verified).success ||
    candidate.decisions.some((decision) => decision.at.slice(0, 10) > verified)
  )
    throw new Error("Invalid verification date");
  const offer = release.offers.find(
    (item): item is Deposit =>
      item.id === candidate.offer && item.product === "fixed-deposits",
  );
  const previousCitation =
    offer &&
    release.citations.find((item) => item.id === offer.rate.citations[0]);
  if (!offer || !previousCitation || next.effective >= offer.until)
    throw new Error("Unsupported offer interval");
  const id = "sandbox-" + candidate.id.slice(0, 20);
  if (release.id === id) return release;
  if (
    candidate.before?.rate !== offer.rate.value ||
    candidate.before?.effective !== offer.from
  )
    throw new Error("Candidate base no longer matches the offer");
  const citation = {
    ...previousCitation,
    id: id + "-rate",
    locator: {
      en: "Synthetic notice row " + next.offer,
      ne: "काल्पनिक सूचनाको हरफ " + next.offer,
    },
    excerpt: { en: next.rate + "% per year.", ne: next.rate + "% प्रतिवर्ष।" },
    effective: next.effective,
    verified,
  };
  const nextOffer: Deposit = {
    ...offer,
    from: next.effective,
    verified,
    status: "verified",
    rate: { value: next.rate, citations: [citation.id] },
  };
  return {
    ...release,
    id,
    citations: [...release.citations, citation],
    offers: [
      ...release.offers.filter((item) => item.id !== offer.id),
      nextOffer,
    ],
  };
}
