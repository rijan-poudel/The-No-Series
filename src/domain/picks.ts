import Decimal from "decimal.js-light";
import { feeFor, reviewedOffers, validDecimal } from "./engine.ts";
import { nepalDate, payouts, type Product, type Release } from "./model.ts";

export const depositTerms = [3, 6, 12, 24] as const;
export const feePriorities = ["issuance", "app", "branch"] as const;

export type DepositChoice = {
  product: "fixed-deposits";
  term: (typeof depositTerms)[number];
  payout: (typeof payouts)[number];
};
export type CardChoice = {
  product: "dollar-cards";
  fee: (typeof feePriorities)[number];
  form: "virtual" | "physical";
};
export type Priority = DepositChoice | CardChoice;

export function priorityQuery(choice: Priority | null) {
  if (!choice) return "";
  const params =
    choice.product === "fixed-deposits"
      ? new URLSearchParams({
          term: String(choice.term),
          payout: choice.payout,
        })
      : new URLSearchParams({ fee: choice.fee, form: choice.form });
  return "?" + params.toString();
}

export function readPriority(
  product: Product,
  query: Record<string, string | string[] | undefined>,
): Priority | null {
  if (product === "fixed-deposits") {
    const term = depositTerms.find((value) => String(value) === query.term);
    return term && (query.payout === "maturity" || query.payout === "quarterly")
      ? { product, term, payout: query.payout }
      : null;
  }
  const fee = feePriorities.find((value) => value === query.fee);
  return fee && (query.form === "virtual" || query.form === "physical")
    ? { product, fee, form: query.form }
    : null;
}

type Reviewed = ReturnType<typeof reviewedOffers>[number];
type Pick = Omit<Reviewed, "reason" | "institution"> & {
  institution: NonNullable<Reviewed["institution"]>;
  value: string;
  verified: string | undefined;
  keyCitations: readonly string[];
};

export function editorialPicks(
  priority: Priority,
  release: Release,
  clock: Date,
) {
  const date = nepalDate(clock);
  const verifiedOn = (ids: readonly string[]) =>
    release.citations
      .filter((source) => ids.includes(source.id))
      .map((source) => source.verified)
      .sort()
      .at(0);
  const pool = release.offers.filter(
    (offer) => offer.product === priority.product,
  );
  const rows = reviewedOffers(pool, release, date).flatMap<Pick>(
    ({ offer, institution, reason, evidence }) => {
      if (
        reason ||
        !institution ||
        offer.eligibility.value.customer !== "individual"
      )
        return [];
      if (
        priority.product === "fixed-deposits" &&
        offer.product === "fixed-deposits"
      ) {
        const band = offer.months.value;
        const term = priority.term;
        if (
          offer.eligibility.value.currency !== "NPR" ||
          !validDecimal(offer.rate.value, 100) ||
          offer.payout.value !== priority.payout ||
          (band.includeMin ? term < band.min : term <= band.min) ||
          (band.includeMax ? term > band.max : term >= band.max)
        )
          return [];
        return [
          {
            offer,
            institution,
            evidence,
            value: offer.rate.value,
            verified: verifiedOn(offer.rate.citations),
            keyCitations: [...offer.rate.citations, ...offer.catch.citations],
          },
        ];
      }
      if (
        priority.product !== "dollar-cards" ||
        offer.product !== "dollar-cards" ||
        offer.form.value !== priority.form ||
        offer.eligibility.value.currency !== "USD"
      )
        return [];
      const fee =
        priority.fee === "issuance"
          ? offer.fees.issuance
          : offer.fees.topUp[priority.fee];
      const value = fee && feeFor(fee.value, "NPR");
      return fee && value != null
        ? [
            {
              offer,
              institution,
              evidence,
              value,
              verified: verifiedOn(fee.citations),
              keyCitations: [...fee.citations, ...offer.catch.citations],
            },
          ]
        : [];
    },
  );
  rows.sort((a, b) => {
    const order =
      new Decimal(a.value).cmp(b.value) *
      (priority.product === "fixed-deposits" ? -1 : 1);
    return (
      order ||
      (a.offer.id < b.offer.id ? -1 : Number(a.offer.id !== b.offer.id))
    );
  });
  const leader = rows[0];
  const leaders = leader
    ? rows.filter((row) => new Decimal(row.value).eq(leader.value))
    : [];
  return { rows, leaders, date };
}
