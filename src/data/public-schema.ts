import { z } from "zod";
import Decimal from "decimal.js-light";
import { calendarDate } from "../domain/model.ts";

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const copy = z
  .object({ en: z.string().min(1).max(800), ne: z.string().min(1).max(800) })
  .strict();
const url = z
  .string()
  .max(2048)
  .url()
  .refine((value) => {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port
    );
  });
const decimal = z.string().regex(/^(0|[1-9]\d{0,10})(\.\d{1,6})?$/);
const money = decimal.refine(
  (value) => (value.split(".")[1]?.length ?? 0) <= 2,
);
const percent = decimal.pipe(
  z.string().refine((value) => new Decimal(value).lte(100)),
);
const term = z.number().int().min(1).max(120);
const band = <T extends z.ZodType<string | number>>(scalar: T) =>
  z
    .object({
      min: scalar,
      max: scalar,
      includeMin: z.boolean(),
      includeMax: z.boolean(),
    })
    .strict()
    .refine((value) => {
      const { min, max } = value;
      const valid = (bound: unknown): bound is number | string =>
        typeof bound === "number"
          ? Number.isFinite(bound)
          : typeof bound === "string" && /^\d+(\.\d+)?$/.test(bound);
      if (!valid(min) || !valid(max)) return false;
      const order = new Decimal(min).cmp(max);
      return order < 0 || (order === 0 && value.includeMin && value.includeMax);
    });
const fact = <T extends z.ZodTypeAny>(value: T) =>
  z.object({ value, citations: z.array(id).min(1).max(12) }).strict();
const source = z
  .object({
    id,
    publisher: copy,
    url,
    kind: z.enum(["rate", "terms", "tariff", "tax"]),
    fixture: z.literal(false).optional(),
  })
  .strict();
const institution = z
  .object({ id, name: copy, officialUrl: url, fictional: z.literal(false) })
  .strict();
const citation = z
  .object({
    id,
    sourceId: id,
    title: copy,
    locator: copy,
    excerpt: copy,
    effective: calendarDate,
    originalDate: z.string().max(80).optional(),
    verified: calendarDate,
  })
  .strict();
const base = {
  id,
  institutionId: id,
  name: copy,
  from: calendarDate,
  until: calendarDate,
  verified: calendarDate,
  status: z.enum(["verified", "pending", "changed", "disputed", "suppressed"]),
  eligibility: fact(
    z
      .object({
        customer: z.enum(["individual", "institutional"]),
        currency: z.enum(["NPR", "USD", "EUR", "GBP"]),
      })
      .strict(),
  ),
  catch: fact(copy),
};
const fee = <T extends "issuance" | "renewal" | "top-up">(event: T) =>
  fact(
    z
      .object({
        event: z.literal(event),
        currency: z.enum(["NPR", "USD"]),
        fixed: money.optional(),
        percent: percent.optional(),
        floor: money.optional(),
        cap: money.optional(),
        band: band(decimal).optional(),
        waived: z.boolean().optional(),
        startsInYear:
          event === "renewal"
            ? z.union([z.literal(1), z.literal(2)])
            : z.never().optional(),
      })
      .strict()
      .refine(
        (rule) =>
          rule.floor === undefined ||
          rule.cap === undefined ||
          (money.safeParse(rule.floor).success &&
            money.safeParse(rule.cap).success &&
            new Decimal(rule.floor).lte(rule.cap)),
      ),
  );
const offer = z.discriminatedUnion("product", [
  z
    .object({
      ...base,
      product: z.literal("fixed-deposits"),
      principal: fact(band(money)),
      months: fact(band(term)),
      rate: fact(percent),
      payout: fact(z.enum(["maturity", "quarterly"])),
      rule: fact(
        z
          .object({
            mode: z.enum(["simple", "compound"]),
            yearBasis: z.literal("contract-months"),
            intervalMonths: z.union([
              z.literal(1),
              z.literal(3),
              z.literal(6),
              z.literal(12),
              z.null(),
            ]),
            rounding: z.literal("period-half-up"),
            withholding: z.enum(["period", "maturity"]),
          })
          .strict(),
      ),
      tax: fact(percent).optional(),
      openingFee: fact(money).optional(),
      withdrawal: fact(
        z.union([
          copy,
          z
            .object({
              policy: copy,
              rate: percent,
              fee: money,
              treatment: z.literal("reprice-and-reconcile"),
            })
            .strict(),
        ]),
      ).optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      product: z.literal("dollar-cards"),
      account: fact(z.enum(["yes", "no"])),
      form: fact(z.enum(["virtual", "physical"])),
      fees: z
        .object({
          issuance: fee("issuance").optional(),
          renewal: fee("renewal").optional(),
          topUp: z
            .object({
              app: fee("top-up").optional(),
              branch: fee("top-up").optional(),
            })
            .strict(),
        })
        .strict(),
    })
    .strict(),
]);

export const publicManifest = z
  .object({
    id,
    kind: z.literal("public"),
    revoked: z.literal(false),
    institutions: z.array(institution).max(250),
    sources: z.array(source).max(1200),
    citations: z.array(citation).max(3000),
    offers: z.array(offer).max(500),
    corrections: z
      .array(
        z.object({ id, offerId: id, note: copy, date: calendarDate }).strict(),
      )
      .max(1000),
  })
  .strict()
  .superRefine((release, ctx) => {
    const unique = (items: { id: string }[], path: string) => {
      const ids = new Set(items.map((item) => item.id));
      if (ids.size !== items.length)
        ctx.addIssue({
          code: "custom",
          path: [path],
          message: "Duplicate identifier",
        });
      return ids;
    };
    const institutions = unique(release.institutions, "institutions");
    const sources = unique(release.sources, "sources");
    const citations = unique(release.citations, "citations");
    unique(release.offers, "offers");
    unique(release.corrections, "corrections");
    if (release.citations.some((item) => !sources.has(item.sourceId))) {
      ctx.addIssue({
        code: "custom",
        path: ["citations"],
        message: "Unknown source",
      });
    }
    function missingReference(value: unknown): boolean {
      if (!value || typeof value !== "object") return false;
      if ("citations" in value && Array.isArray(value.citations))
        return value.citations.some((key) => !citations.has(key));
      return Object.values(value).some(missingReference);
    }
    if (
      release.offers.some(
        (record) =>
          !institutions.has(record.institutionId) ||
          record.until <= record.from ||
          missingReference(record),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["offers"],
        message: "Invalid offer interval, institution or citation",
      });
    }
  });

export const pointerResponse = z
  .array(
    z
      .object({
        id,
        methodology: z.string().max(30),
        fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
        revoked: z.boolean(),
        manifest: z.unknown(),
      })
      .strict(),
  )
  .max(1);
