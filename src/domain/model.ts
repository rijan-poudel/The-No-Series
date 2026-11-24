import { z } from "zod";

export const products = ["fixed-deposits", "dollar-cards"] as const;
export const productSchema = z.enum(products);
export type Product = z.infer<typeof productSchema>;
export const payouts = ["maturity", "quarterly"] as const;
export type Payout = (typeof payouts)[number];

export const digits = (input: string) =>
  input.replace(/[०-९]/g, (digit) => String("०१२३४५६७८९".indexOf(digit)));

export function normalizeAmount(input: string) {
  const normalized = digits(input.trim());
  const plain = /^\d{1,11}(\.\d{1,2})?$/;
  const grouped =
    /^(?:\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})+,\d{3})(?:\.\d{1,2})?$/;
  if (!plain.test(normalized) && !grouped.test(normalized)) return undefined;
  const amount = normalized.replaceAll(",", "");
  return plain.test(amount) && !/^0+(\.0+)?$/.test(amount) ? amount : undefined;
}

export const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(value);
    return (
      Number.isFinite(date.valueOf()) &&
      date.toISOString().slice(0, 10) === value
    );
  });

export function nepalDate(clock: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(clock);
}

const customer = z.enum(["individual", "institutional"]);
export const scenarioSchema = z.discriminatedUnion("product", [
  z
    .object({
      product: z.literal("fixed-deposits"),
      amount: z
        .string()
        .max(30)
        .transform((input, ctx) => {
          const value = normalizeAmount(input);
          if (value) return value;
          ctx.addIssue({ code: z.ZodIssueCode.custom });
          return z.NEVER;
        }),
      currency: z.enum(["NPR", "USD", "EUR", "GBP"]),
      months: z.number().int().min(1).max(120),
      payout: z.enum(["any", ...payouts]),
      customer,
    })
    .strict(),
  z
    .object({
      product: z.literal("dollar-cards"),
      channel: z.enum(["app", "branch"]),
      form: z.enum(["any", "virtual", "physical"]),
      reloads: z.number().int().min(0).max(120),
      years: z.union([z.literal(1), z.literal(2)]),
      account: z.enum(["yes", "no"]),
      customer,
    })
    .strict(),
]);
export type Scenario = z.infer<typeof scenarioSchema>;

export type Copy = { en: string; ne: string };
export type Institution = {
  id: string;
  name: Copy;
  officialUrl?: string;
  fictional: boolean;
};
export type SourceRegistry = {
  id: string;
  publisher: Copy;
  url?: string;
  kind: "rate" | "terms" | "tariff" | "tax" | "fixture";
  fixture?: boolean;
};
export type Artifact = {
  id: string;
  sourceId: string;
  hash: string;
  observedAt: string;
  mime: string;
};
export type Observation = {
  artifactId: string;
  parserVersion: string;
  status: "unchanged" | "changed" | "failed";
};
export type Citation = {
  id: string;
  sourceId: string;
  title: Copy;
  locator: Copy;
  excerpt: Copy;
  effective: string;
  originalDate?: string;
  verified: string;
};
export type Fact<T> = { value: T; citations: readonly string[] };
export type Correction = {
  id: string;
  offerId: string;
  note: Copy;
  date: string;
};
export type CandidateReview = {
  candidateId: string;
  actor: string;
  decision: "approve" | "reject" | "clarify";
  at: string;
};
type Eligibility = { customer: Scenario["customer"]; currency: string };
export type Band<T> = {
  min: T;
  max: T;
  includeMin: boolean;
  includeMax: boolean;
};
export type RuleVersion = {
  mode: "simple" | "compound";
  yearBasis: "contract-months";
  intervalMonths: 1 | 3 | 6 | 12 | null;
  rounding: "period-half-up";
  withholding: "period" | "maturity";
};
export type Withdrawal = {
  policy: Copy;
  rate: string;
  fee: string;
  treatment: "reprice-and-reconcile";
};
type OfferBase = {
  id: string;
  institutionId: string;
  name: Copy;
  status: "verified" | "pending" | "changed" | "disputed" | "suppressed";
  from: string;
  until: string;
  verified: string;
  eligibility: Fact<Eligibility>;
  catch: Fact<Copy>;
};
export type Deposit = OfferBase & {
  product: "fixed-deposits";
  principal: Fact<Band<string>>;
  months: Fact<Band<number>>;
  rate: Fact<string>;
  payout: Fact<Payout>;
  rule: Fact<RuleVersion>;
  tax?: Fact<string>;
  openingFee?: Fact<string>;
  withdrawal?: Fact<Copy | Withdrawal>;
};
export type FeeRule = {
  event: "issuance" | "renewal" | "top-up" | "transaction" | "cancellation";
  currency: string;
  fixed?: string;
  percent?: string;
  floor?: string;
  cap?: string;
  band?: Band<string>;
  waived?: boolean;
  startsInYear?: 1 | 2;
};
export type Card = OfferBase & {
  product: "dollar-cards";
  account: Fact<"yes" | "no">;
  form: Fact<"virtual" | "physical">;
  fees: {
    issuance?: Fact<FeeRule>;
    renewal?: Fact<FeeRule>;
    topUp: Partial<Record<"app" | "branch", Fact<FeeRule>>>;
  };
};
export type OfferVersion = Deposit | Card;
export type Release = {
  id: string;
  kind: "public" | "demo";
  revoked: boolean;
  institutions: readonly Institution[];
  sources: readonly SourceRegistry[];
  citations: readonly Citation[];
  offers: readonly OfferVersion[];
  corrections: readonly Correction[];
};
