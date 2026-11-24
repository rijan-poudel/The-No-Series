import Decimal from "decimal.js-light";
import { calendarDate, nepalDate } from "./model.ts";
import type {
  Band,
  Card,
  Citation,
  Deposit,
  Fact,
  FeeRule,
  OfferVersion,
  Payout,
  Release,
  Scenario,
  Withdrawal,
} from "./model.ts";

export const methodology = {
  version: "1.0",
  rateMaxDays: 31,
  tariffMaxDays: 90,
} as const;
const D = Decimal.clone({ precision: 48, rounding: Decimal.ROUND_HALF_UP });
const dayMs = 86_400_000;
const money = (value: Decimal) => value.toDecimalPlaces(2, D.ROUND_HALF_UP);
const rate = (percent: string) => new D(percent).div(100);
const zero = () => new D(0);
const positiveDecimal = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
export const validDecimal = (value: string, max?: number) =>
  positiveDecimal.test(value) && (max === undefined || new D(value).lte(max));
const keyOrder = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

function inside(value: string | number, band: Band<string | number>) {
  const amount = new D(value);
  return (
    (band.includeMin ? amount.gte(band.min) : amount.gt(band.min)) &&
    (band.includeMax ? amount.lte(band.max) : amount.lt(band.max))
  );
}

function overlaps(a: Band<string | number>, b: Band<string | number>) {
  const left = new D(a.max).cmp(b.min);
  const right = new D(b.max).cmp(a.min);
  return (
    (left > 0 || (left === 0 && a.includeMax && b.includeMin)) &&
    (right > 0 || (right === 0 && b.includeMax && a.includeMin))
  );
}

function dateAtMonth(start: string, months: number) {
  const [year, month, day] = start.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month + months, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1 + months, Math.min(day, lastDay)))
    .toISOString()
    .slice(0, 10);
}

export type LedgerEntry = {
  month: number;
  date: string;
  gross: string;
  tax: string | null;
  paid: string | null;
};
type Breakdown = {
  key: string;
  value: string | null;
  citations: readonly string[];
};
export type Calculation = {
  primary: string | null;
  gross: string | null;
  rankable: boolean;
  lines: Breakdown[];
  ledger: LedgerEntry[];
  unsupported?: "stub" | "rule";
};

export function depositCalculation(
  principal: string,
  months: number,
  start: string,
  offer: Deposit,
): Calculation {
  const { mode, yearBasis, intervalMonths, rounding, withholding } =
    offer.rule.value;
  const quarterly = offer.payout.value === "quarterly";
  const step = quarterly ? 3 : mode === "compound" ? intervalMonths : months;
  if (!step || months % step)
    return {
      primary: null,
      gross: null,
      rankable: false,
      lines: [],
      ledger: [],
      unsupported: "stub",
    };
  if (
    yearBasis !== "contract-months" ||
    rounding !== "period-half-up" ||
    (quarterly && (mode === "compound" || withholding !== "period")) ||
    (mode === "compound" && intervalMonths !== step)
  ) {
    return {
      primary: null,
      gross: null,
      rankable: false,
      lines: [],
      ledger: [],
      unsupported: "rule",
    };
  }
  const base = new D(principal);
  let balance = base;
  let gross = zero();
  let taxes = zero();
  let netPaid = zero();
  const tax = offer.tax ? rate(offer.tax.value) : null;
  const fee = offer.openingFee ? new D(offer.openingFee.value) : null;
  const ledger: LedgerEntry[] = [];
  for (let month = step; month <= months; month += step) {
    const interest = money(
      balance.times(rate(offer.rate.value)).times(step).div(12),
    );
    gross = gross.plus(interest);
    const taxDue =
      tax === null
        ? null
        : withholding === "period"
          ? money(interest.times(tax))
          : month === months
            ? money(gross.times(tax))
            : zero();
    if (taxDue !== null) taxes = taxes.plus(taxDue);
    const pricedNet = taxDue === null ? null : interest.minus(taxDue);
    if (
      mode === "compound" &&
      (withholding === "maturity" || pricedNet !== null)
    ) {
      balance = balance.plus(
        withholding === "maturity" ? interest : pricedNet!,
      );
    }
    const paid = quarterly
      ? pricedNet
      : month === months && tax !== null
        ? gross.minus(taxes)
        : month === months
          ? null
          : zero();
    if (paid !== null) netPaid = netPaid.plus(paid);
    ledger.push({
      month,
      date: dateAtMonth(start, month),
      gross: interest.toFixed(2),
      tax: taxDue?.toFixed(2) ?? null,
      paid: paid?.toFixed(2) ?? null,
    });
    if (
      mode === "compound" &&
      withholding === "period" &&
      tax === null &&
      month < months
    ) {
      return {
        primary: null,
        gross: null,
        rankable: false,
        lines: [],
        ledger: [],
        unsupported: "rule",
      };
    }
  }
  const net =
    tax !== null && fee !== null ? netPaid.minus(fee).toFixed(2) : null;
  const lastPayout = ledger.at(-1)?.paid;
  const common = [
    ...offer.rate.citations,
    ...offer.rule.citations,
    ...offer.payout.citations,
  ];
  const deductions = [
    ...common,
    ...(offer.tax?.citations ?? []),
    ...(offer.openingFee?.citations ?? []),
  ];
  return {
    primary: net,
    gross: gross.toFixed(2),
    rankable: net !== null,
    ledger,
    lines: [
      { key: "gross", value: gross.toFixed(2), citations: common },
      {
        key: "tax",
        value: tax === null ? null : taxes.toFixed(2),
        citations: offer.tax?.citations ?? [],
      },
      {
        key: "fees",
        value: fee?.toFixed(2) ?? null,
        citations: offer.openingFee?.citations ?? [],
      },
      { key: "net", value: net, citations: deductions },
      {
        key: "maturityPayment",
        value: lastPayout == null ? null : base.plus(lastPayout).toFixed(2),
        citations: deductions,
      },
      {
        key: "receipts",
        value: tax === null ? null : base.plus(netPaid).toFixed(2),
        citations: deductions,
      },
    ],
  };
}

export function withdrawalCalculation(
  principal: string,
  months: number,
  priorPayout: string,
  offer: Deposit,
) {
  const policy = offer.withdrawal?.value;
  if (
    !policy ||
    (typeof policy === "object" && "en" in policy) ||
    !offer.tax ||
    !offer.openingFee ||
    !Number.isInteger(months) ||
    months < 1 ||
    !validDecimal(principal) ||
    !validDecimal(priorPayout)
  ) {
    return {
      status: "unsupported" as const,
      reason: "withdrawal-evidence" as const,
    };
  }
  const verified = policy as Withdrawal;
  const repriced = money(
    new D(principal).times(rate(verified.rate)).times(months).div(12),
  );
  const tax = money(repriced.times(rate(offer.tax.value)));
  const settlement = new D(principal)
    .plus(repriced)
    .minus(tax)
    .minus(priorPayout)
    .minus(verified.fee);
  return {
    status: "estimated" as const,
    settlement: settlement.toFixed(2),
    netGain: repriced
      .minus(tax)
      .minus(verified.fee)
      .minus(offer.openingFee.value)
      .toFixed(2),
    citations: [
      ...offer.withdrawal!.citations,
      ...offer.tax.citations,
      ...offer.openingFee.citations,
    ],
  };
}

export function feeFor(rule: FeeRule, currency: string, basis?: string) {
  if (
    rule.currency !== currency ||
    [rule.fixed, rule.percent, rule.floor, rule.cap].some(
      (input) => input !== undefined && !validDecimal(input),
    ) ||
    (rule.floor !== undefined &&
      rule.cap !== undefined &&
      new D(rule.floor).gt(rule.cap))
  )
    return null;
  if (rule.waived) return "0.00";
  if (rule.fixed === undefined && rule.percent === undefined) return null;
  if (
    (rule.band || rule.percent !== undefined) &&
    (basis === undefined || !validDecimal(basis))
  )
    return null;
  if (rule.band && !inside(basis!, rule.band)) return null;
  let value = new D(rule.fixed ?? 0);
  if (rule.percent !== undefined)
    value = value.plus(new D(basis!).times(rate(rule.percent)));
  if (rule.floor !== undefined && value.lt(rule.floor))
    value = new D(rule.floor);
  if (rule.cap !== undefined && value.gt(rule.cap)) value = new D(rule.cap);
  return money(value).toFixed(2);
}

type CardScenario = Extract<Scenario, { product: "dollar-cards" }>;
function cardCalculation(offer: Card, scenario: CardScenario): Calculation {
  const lines: Breakdown[] = [];
  const charge = (
    key: string,
    event: FeeRule["event"],
    fact: Fact<FeeRule> | undefined,
    count: number,
  ) => {
    if (count === 0) return;
    const each = fact?.value.event === event ? feeFor(fact.value, "NPR") : null;
    lines.push({
      key,
      value: each === null ? null : new D(each).times(count).toFixed(2),
      citations: fact?.citations ?? [],
    });
  };
  charge("issuance", "issuance", offer.fees.issuance, 1);
  charge(
    "topUp",
    "top-up",
    offer.fees.topUp[scenario.channel],
    scenario.reloads,
  );
  const renewal = offer.fees.renewal;
  const firstCharge = renewal?.value.startsInYear;
  const renewalFact = firstCharge === undefined ? undefined : renewal;
  if (firstCharge === 2) {
    lines.push({
      key: "renewal",
      value: "0.00",
      citations: renewalFact?.citations ?? [],
    });
  } else {
    charge("renewal", "renewal", renewalFact, 1);
  }
  const firstYear = lines.every((line) => line.value !== null)
    ? lines.reduce((total, line) => total.plus(line.value!), zero()).toFixed(2)
    : null;
  const annualCitations = [...new Set(lines.flatMap((line) => line.citations))];
  lines.push({
    key: "firstYear",
    value: firstYear,
    citations: annualCitations,
  });
  charge(
    "laterTopUp",
    "top-up",
    offer.fees.topUp[scenario.channel],
    scenario.reloads * (scenario.years - 1),
  );
  charge("laterRenewal", "renewal", renewalFact, scenario.years - 1);
  const charges = lines.filter((line) => line.key !== "firstYear");
  const known = charges
    .reduce((total, line) => total.plus(line.value ?? "0"), zero())
    .toFixed(2);
  const primary = charges.every((line) => line.value !== null) ? known : null;
  lines.push({
    key: "knownSubtotal",
    value: known,
    citations: [
      ...new Set(
        charges
          .filter((line) => line.value !== null)
          .flatMap((line) => line.citations),
      ),
    ],
  });
  return {
    primary,
    gross: null,
    rankable: primary !== null,
    ledger: [],
    lines,
  };
}

export type Exclusion =
  | "missing"
  | "ineligible"
  | "stale"
  | "expired"
  | "future"
  | "changed"
  | "disputed"
  | "pending"
  | "suppressed"
  | "overlap";
export type Row = {
  offer: OfferVersion;
  institution: Release["institutions"][number];
  calculation: Calculation;
  evidence: { id: string; title: Citation["title"] }[];
  corrections: Release["corrections"];
};
export type Comparison = {
  release: string;
  methodology: string;
  date: string;
  demo: boolean;
  status: "ready" | "unavailable" | "revoked" | "unsupported" | "no-match";
  reviewed: number;
  eligible: number;
  exclusions: Partial<Record<Exclusion, number>>;
  groups: {
    key: Payout | "cardVirtual" | "cardPhysical" | "unranked";
    rows: Row[];
  }[];
};

function facts(offer: OfferVersion): Fact<unknown>[] {
  const common = [offer.eligibility, offer.catch];
  if (offer.product === "fixed-deposits") {
    return [
      ...common,
      offer.principal,
      offer.months,
      offer.rate,
      offer.payout,
      offer.rule,
      ...[offer.tax, offer.openingFee, offer.withdrawal].filter(
        (fact) => fact !== undefined,
      ),
    ];
  }
  return [
    ...common,
    offer.account,
    offer.form,
    ...[
      offer.fees.issuance,
      offer.fees.renewal,
      offer.fees.topUp.app,
      offer.fees.topUp.branch,
    ].filter((fact) => fact !== undefined),
  ];
}

export function offerEvidence(offer: OfferVersion) {
  return [...new Set(facts(offer).flatMap((fact) => fact.citations))];
}

function overlapsOffer(a: OfferVersion, b: OfferVersion) {
  if (
    a.institutionId !== b.institutionId ||
    a.product !== b.product ||
    a.eligibility.value.customer !== b.eligibility.value.customer ||
    a.eligibility.value.currency !== b.eligibility.value.currency
  )
    return false;
  return a.product === "fixed-deposits" && b.product === "fixed-deposits"
    ? a.payout.value === b.payout.value &&
        overlaps(a.principal.value, b.principal.value) &&
        overlaps(a.months.value, b.months.value)
    : a.product === "dollar-cards" &&
        b.product === "dollar-cards" &&
        a.form.value === b.form.value;
}

export function reviewedOffers(
  relevant: readonly OfferVersion[],
  release: Release,
  date: string,
) {
  const sources = new Map(release.sources.map((source) => [source.id, source]));
  const institutions = new Map(
    release.institutions.map((institution) => [institution.id, institution]),
  );
  const citations = new Map(
    release.citations.map((citation) => [citation.id, citation]),
  );
  const startOfDay = Date.parse(date);
  const hasOverlap = (offer: OfferVersion) =>
    relevant.some(
      (other) =>
        other !== offer &&
        other.status === "verified" &&
        other.from <= date &&
        date < other.until &&
        (other.id === offer.id || overlapsOffer(other, offer)),
    );
  return relevant.map((offer) => {
    const institution = institutions.get(offer.institutionId);
    const allFacts = facts(offer);
    const maxAge =
      offer.product === "fixed-deposits"
        ? methodology.rateMaxDays
        : methodology.tariffMaxDays;
    const dateAge = (value: string) => (startOfDay - Date.parse(value)) / dayMs;
    let reason: Exclusion | undefined;
    if (release.revoked) reason = "suppressed";
    else if (offer.status !== "verified") reason = offer.status;
    else if (
      ![offer.from, offer.until, offer.verified].every(
        (day) => calendarDate.safeParse(day).success,
      ) ||
      offer.from >= offer.until ||
      !institution ||
      (release.kind === "public" && institution.fictional)
    )
      reason = "missing";
    else if (date < offer.from) reason = "future";
    else if (date >= offer.until) reason = "expired";
    else if (dateAge(offer.verified) > maxAge || dateAge(offer.verified) < 0)
      reason = "stale";
    else if (
      allFacts.some(
        (fact) =>
          !fact.citations.length ||
          fact.citations.some((id) => {
            const citation = citations.get(id);
            const source = citation && sources.get(citation.sourceId);
            return (
              !citation ||
              !source ||
              !calendarDate.safeParse(citation.effective).success ||
              !calendarDate.safeParse(citation.verified).success ||
              citation.effective > date ||
              dateAge(citation.verified) < 0 ||
              dateAge(citation.verified) >
                (source.kind === "rate" || source.kind === "fixture"
                  ? maxAge
                  : methodology.tariffMaxDays) ||
              (release.kind === "public" &&
                (source.fixture ||
                  source.kind === "fixture" ||
                  !source.url?.startsWith("https://")))
            );
          }),
      )
    )
      reason = "missing";
    else if (hasOverlap(offer)) reason = "overlap";
    return {
      offer,
      institution,
      reason,
      evidence: offerEvidence(offer).flatMap((id) => {
        const citation = citations.get(id);
        return citation ? [{ id, title: citation.title }] : [];
      }),
    };
  });
}

export function compare(
  scenario: Scenario,
  release: Release,
  clock: Date,
): Comparison {
  const date = nepalDate(clock);
  const relevant = release.offers.filter(
    (offer) => offer.product === scenario.product,
  );
  const result: Comparison = {
    release: release.id,
    methodology: methodology.version,
    date,
    demo: release.kind === "demo",
    reviewed: new Set(relevant.map((offer) => offer.institutionId)).size,
    eligible: 0,
    status: "unavailable",
    exclusions: {},
    groups: [],
  };
  if (release.revoked) return { ...result, status: "revoked" };
  if (
    scenario.customer !== "individual" ||
    (scenario.product === "fixed-deposits" && scenario.currency !== "NPR")
  ) {
    return { ...result, status: "unsupported" };
  }
  if (!relevant.length) return result;
  const groups = new Map<Comparison["groups"][number]["key"], Row[]>();
  for (const {
    offer,
    institution,
    reason: verification,
    evidence,
  } of reviewedOffers(relevant, release, date)) {
    let reason = verification;
    if (!reason && offer.eligibility.value.customer !== scenario.customer)
      reason = "ineligible";
    let calculation: Calculation | undefined;
    let key: Comparison["groups"][number]["key"] = "unranked";
    if (
      !reason &&
      offer.product === "fixed-deposits" &&
      scenario.product === "fixed-deposits"
    ) {
      if (
        offer.eligibility.value.currency !== scenario.currency ||
        !inside(scenario.amount, offer.principal.value) ||
        !inside(scenario.months, offer.months.value) ||
        (scenario.payout !== "any" && offer.payout.value !== scenario.payout)
      )
        reason = "ineligible";
      else if (
        !validDecimal(offer.rate.value, 100) ||
        (offer.tax && !validDecimal(offer.tax.value, 100)) ||
        (offer.openingFee && !validDecimal(offer.openingFee.value))
      )
        reason = "missing";
      else {
        calculation = depositCalculation(
          scenario.amount,
          scenario.months,
          date,
          offer,
        );
        if (calculation.rankable) key = offer.payout.value;
      }
    }
    if (
      !reason &&
      offer.product === "dollar-cards" &&
      scenario.product === "dollar-cards"
    ) {
      if (
        offer.eligibility.value.currency !== "USD" ||
        (offer.account.value === "yes" && scenario.account === "no") ||
        (scenario.form !== "any" && offer.form.value !== scenario.form)
      )
        reason = "ineligible";
      else {
        calculation = cardCalculation(offer, scenario);
        if (calculation.rankable)
          key = offer.form.value === "virtual" ? "cardVirtual" : "cardPhysical";
      }
    }
    if (reason)
      result.exclusions[reason] = (result.exclusions[reason] ?? 0) + 1;
    else if (calculation && institution) {
      const row = {
        offer,
        institution,
        calculation,
        corrections: release.corrections.filter(
          (item) => item.offerId === offer.id,
        ),
        evidence,
      };
      const rows = groups.get(key) ?? [];
      rows.push(row);
      groups.set(key, rows);
      result.eligible++;
    }
  }
  for (const key of [
    "maturity",
    "quarterly",
    "cardVirtual",
    "cardPhysical",
    "unranked",
  ] as const) {
    const rows = groups.get(key);
    if (!rows) continue;
    rows.sort((a, b) => {
      const first = a.calculation.primary;
      const second = b.calculation.primary;
      const direction = key.startsWith("card") ? 1 : -1;
      return (
        (first === null || second === null
          ? 0
          : new D(first).cmp(second) * direction) ||
        keyOrder(a.institution.id, b.institution.id) ||
        keyOrder(a.offer.id, b.offer.id)
      );
    });
    result.groups.push({ key, rows });
  }
  result.status = result.eligible ? "ready" : "no-match";
  return result;
}
