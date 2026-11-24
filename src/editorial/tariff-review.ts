import { z } from "zod";

const row = z.object({
  bank: z.string(),
  url: z.string().optional(),
  status: z.enum([
    "captured",
    "needs-source",
    "unavailable",
    "too-large",
    "invalid-document",
  ]),
  hash: z.string().optional(),
  candidate: z.record(z.string()).nullable().optional(),
  mobileCandidate: z.record(z.string()).nullable().optional(),
});

export const archiveIndex = z.object({
  observedAt: z.string().datetime(),
  results: z.array(row),
  supplemental: z.array(row).default([]),
});

type Row = z.infer<typeof row>;
type Index = z.infer<typeof archiveIndex>;

function key({ bank, url }: Row) {
  return bank + "|" + (url ?? "");
}

function facts({ candidate, mobileCandidate }: Row) {
  return { ...candidate, ...mobileCandidate };
}

export function tariffReview(previous: Index, current: Index) {
  const baseline = new Map(
    [...previous.results, ...previous.supplemental].map((source) => [
      key(source),
      source,
    ]),
  );
  const statuses = {
    "needs-source": 0,
    unavailable: 0,
    "facts-changed": 0,
    "facts-found": 0,
    "extraction-lost": 0,
    "document-changed": 0,
    "new-document": 0,
    "not-observed": 0,
    unchanged: 0,
  };
  const sources = [...current.results, ...current.supplemental];
  const observed = new Set(sources.map(key));
  const changes = sources.map(
    (
      source,
    ): {
      bank: string;
      source: string | undefined;
      status: keyof typeof statuses;
      changedFacts: {
        field: string;
        before: string | null;
        after: string | null;
      }[];
    } => {
      const prior = baseline.get(key(source));
      const before = prior ? facts(prior) : {};
      const after = facts(source);
      const changedFacts = [
        ...new Set([...Object.keys(before), ...Object.keys(after)]),
      ]
        .sort()
        .filter((field) => before[field] !== after[field])
        .map((field) => ({
          field,
          before: before[field] ?? null,
          after: after[field] ?? null,
        }));

      let status: keyof typeof statuses = "unchanged";
      if (source.status === "needs-source") status = "needs-source";
      else if (source.status !== "captured") status = "unavailable";
      else if (Object.keys(before).length && !Object.keys(after).length)
        status = "extraction-lost";
      else if (changedFacts.length)
        status = Object.keys(before).length ? "facts-changed" : "facts-found";
      else if (!prior?.hash) status = "new-document";
      else if (prior.hash !== source.hash) status = "document-changed";
      statuses[status]++;
      return {
        bank: source.bank,
        source: source.url,
        status,
        changedFacts:
          status === "facts-changed" || status === "facts-found"
            ? changedFacts
            : [],
      };
    },
  );
  for (const [id, prior] of baseline) {
    if (prior.status !== "captured" || observed.has(id)) continue;
    statuses["not-observed"]++;
    changes.push({
      bank: prior.bank,
      source: prior.url,
      status: "not-observed",
      changedFacts: [],
    });
  }
  return {
    baseline: previous.observedAt,
    current: current.observedAt,
    statuses,
    changes: changes.filter(({ status }) => status !== "unchanged"),
  };
}
