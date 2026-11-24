import { demoClock, demoRelease } from "../data/fixtures.ts";
import { compare } from "../domain/engine.ts";
import type { Scenario } from "../domain/model.ts";
import {
  decide,
  detectCandidates,
  observeNotice,
  publishFixture,
  suppressAffected,
} from "./workflow.ts";

export type ReviewStep = 0 | 1 | 2 | 3 | 4;
const scenario: Scenario = {
  product: "fixed-deposits",
  amount: "100000",
  months: 12,
  currency: "NPR",
  payout: "maturity",
  customer: "individual",
};

export function reviewDemo(step: ReviewStep) {
  const clock = demoClock();
  const fixture = demoRelease();
  const now = clock.toISOString();
  const notice = (rate: string, effective: string) =>
    observeNotice(
      JSON.stringify([{ offer: "alder-deposit", rate, effective }]),
      now,
    );
  const previous = notice("6.00", "2026-11-01");
  const incoming = notice("6.35", "2026-11-23");
  let [candidate] = detectCandidates(previous, incoming);
  if (step >= 1)
    candidate = decide(
      candidate,
      { id: "reviewer-a", role: "reviewer" },
      "approve",
      now,
    );
  if (step >= 2)
    candidate = decide(
      candidate,
      { id: "reviewer-b", role: "reviewer" },
      "approve",
      now,
    );
  const published =
    step < 3
      ? fixture
      : publishFixture(
          fixture,
          candidate,
          { id: "publisher-c", role: "publisher" },
          "2026-11-23",
        );
  const disputed =
    step < 4
      ? published
      : suppressAffected(
          published,
          detectCandidates(incoming, incoming, notice("6.50", "2026-11-23")),
        );
  const before = compare(scenario, fixture, clock);
  const after = compare(scenario, disputed, clock);
  const rateFrom = (comparison: ReturnType<typeof compare>) =>
    comparison.groups
      .flatMap(({ rows }) => rows)
      .find(({ offer }) => offer.id === candidate.offer);
  return {
    candidate,
    before,
    after,
    previousNet: rateFrom(before)?.calculation.primary ?? null,
    currentNet: rateFrom(after)?.calculation.primary ?? null,
  };
}
