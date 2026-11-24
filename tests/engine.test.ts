import { strict as assert } from "node:assert";
import { test } from "node:test";
import { demoClock, demoRelease } from "../src/data/fixtures.ts";
import { currentData } from "../src/data/current.ts";
import {
  compare,
  depositCalculation,
  feeFor,
  withdrawalCalculation,
} from "../src/domain/engine.ts";
import {
  nepalDate,
  normalizeAmount,
  scenarioSchema,
} from "../src/domain/model.ts";
import type { Deposit, Scenario } from "../src/domain/model.ts";

const release = demoRelease();
const clock = demoClock();
const fixed: Extract<Scenario, { product: "fixed-deposits" }> = {
  product: "fixed-deposits",
  amount: "100000",
  currency: "NPR",
  months: 12,
  payout: "any",
  customer: "individual",
};
const cards: Extract<Scenario, { product: "dollar-cards" }> = {
  product: "dollar-cards",
  channel: "app",
  form: "any",
  reloads: 5,
  years: 1,
  account: "yes",
  customer: "individual",
};
function deposit(id: string): Deposit {
  const offer = release.offers.find((offer) => offer.id === id + "-deposit");
  assert(offer?.product === "fixed-deposits");
  return offer;
}
const value = (result: ReturnType<typeof depositCalculation>, key: string) =>
  result.lines.find((line) => line.key === key)?.value;

test("individual NPR simple maturity returns the expected net, receipts and verified zero", () => {
  const result = depositCalculation(
    fixed.amount,
    12,
    "2026-11-23",
    deposit("alder"),
  );
  assert.equal(result.gross, "6000.00");
  assert.equal(result.primary, "5700.00");
  assert.equal(value(result, "tax"), "300.00");
  assert.equal(value(result, "fees"), "0.00");
  assert.equal(value(result, "maturityPayment"), "105700.00");
  assert.equal(value(result, "receipts"), "105700.00");
});

test("quarterly payments stay separate from compounding and maturity receipts", () => {
  const result = depositCalculation(
    fixed.amount,
    12,
    "2026-11-23",
    deposit("dune"),
  );
  assert.equal(result.gross, "6200.00");
  assert.deepEqual(
    result.ledger.map((row) => row.paid),
    Array(4).fill("1472.50"),
  );
  assert.equal(result.primary, "5890.00");
  assert.equal(value(result, "maturityPayment"), "101472.50");
  assert.equal(value(result, "receipts"), "105890.00");
});

test("period withholding and maturity withholding capitalize different balances", () => {
  const offer = deposit("basin");
  const periodic = depositCalculation(fixed.amount, 12, "2026-11-23", offer);
  const settlement = depositCalculation(fixed.amount, 12, "2026-11-23", {
    ...offer,
    rule: {
      ...offer.rule,
      value: { ...offer.rule.value, withholding: "maturity" },
    },
  });
  assert.deepEqual(
    periodic.ledger.map((row) => row.gross),
    ["1450.00", "1469.97", "1490.22", "1510.75"],
  );
  assert.equal(periodic.primary, "5624.89");
  assert.equal(settlement.primary, "5631.00");
});

test("unknown tax and unknown fees preserve estimate boundaries", () => {
  const unknownTax = depositCalculation(
    "100000",
    12,
    "2026-11-23",
    deposit("ember"),
  );
  assert.equal(unknownTax.gross, "6400.00");
  assert.equal(unknownTax.primary, null);
  assert.equal(value(unknownTax, "tax"), null);
  assert.equal(value(unknownTax, "maturityPayment"), null);
  const unknownFee = depositCalculation("100000", 12, "2026-11-23", {
    ...deposit("alder"),
    openingFee: undefined,
  });
  assert.equal(unknownFee.primary, null);
  assert.equal(value(unknownFee, "maturityPayment"), "105700.00");
});

test("whole contract months clamp leap-month payout dates and reject unsupported stubs", () => {
  const result = depositCalculation("100000", 6, "2027-11-30", deposit("dune"));
  assert.equal(result.ledger[0].date, "2028-02-29");
  assert.equal(result.ledger[1].date, "2028-05-30");
  assert.equal(
    depositCalculation("100000", 7, "2027-11-30", deposit("dune")).unsupported,
    "stub",
  );
});

test("explicit inclusive and exclusive amount boundaries and term rules are respected", () => {
  assert.equal(
    compare({ ...fixed, amount: "10000", months: 6 }, release, clock).eligible,
    5,
  );
  assert.equal(
    compare({ ...fixed, amount: "10000000", months: 24 }, release, clock)
      .eligible,
    5,
  );
  assert.equal(
    compare({ ...fixed, amount: "9999.99" }, release, clock).eligible,
    0,
  );
  assert.equal(compare({ ...fixed, months: 25 }, release, clock).eligible, 0);
  const offer = deposit("alder");
  const narrow = {
    ...offer,
    principal: {
      ...offer.principal,
      value: { ...offer.principal.value, includeMin: false },
    },
  };
  assert.equal(
    compare(
      { ...fixed, amount: "10000" },
      { ...release, offers: [narrow] },
      clock,
    ).eligible,
    0,
  );
});

test("Nepal date limits include the first effective day and exclude the closing date", () => {
  assert.equal(nepalDate(new Date("2026-11-22T18:15:00Z")), "2026-11-23");
  const offer = deposit("alder");
  const dataset = {
    ...release,
    offers: [{ ...offer, from: "2026-11-23", until: "2026-11-24" }],
  };
  assert.equal(
    compare(fixed, dataset, new Date("2026-11-22T18:14:59Z")).exclusions.future,
    1,
  );
  assert.equal(
    compare(fixed, dataset, new Date("2026-11-22T18:15:00Z")).eligible,
    1,
  );
  assert.equal(
    compare(fixed, dataset, new Date("2026-11-23T18:15:00Z")).exclusions
      .expired,
    1,
  );
});

test("changed, disputed, stale, overlapping and revoked offers cannot rank", () => {
  const offer = deposit("alder");
  const compareOffers = (...offers: Deposit[]) =>
    compare(fixed, { ...release, offers }, clock);
  assert.equal(
    compareOffers({ ...offer, status: "changed" }).exclusions.changed,
    1,
  );
  assert.equal(
    compareOffers({ ...offer, status: "disputed" }).exclusions.disputed,
    1,
  );
  assert.equal(
    compareOffers({ ...offer, verified: "2026-10-01" }).exclusions.stale,
    1,
  );
  assert.equal(
    compareOffers(offer, { ...offer, id: "duplicate" }).exclusions.overlap,
    2,
  );
  assert.equal(
    compare(fixed, { ...release, revoked: true }, clock).status,
    "revoked",
  );
  assert.equal(
    compare(fixed, { ...release, kind: "public" }, clock).eligible,
    0,
  );
});

test("the public data provider fails closed without a released dataset", async () => {
  const { release: data } = await currentData();
  assert.equal(data.kind, "public");
  assert.deepEqual(data.offers, []);
});

test("currency and holder scope are isolated and mixed payouts never share rank", () => {
  assert.equal(
    compare({ ...fixed, currency: "USD" }, release, clock).status,
    "unsupported",
  );
  assert.equal(
    compare({ ...fixed, customer: "institutional" }, release, clock).status,
    "unsupported",
  );
  const result = compare(fixed, release, clock);
  assert.deepEqual(
    result.groups.map((group) => [group.key, group.rows.length]),
    [
      ["maturity", 3],
      ["quarterly", 1],
      ["unranked", 1],
    ],
  );
  assert.deepEqual(
    compare(
      fixed,
      { ...release, offers: [...release.offers].reverse() },
      clock,
    ),
    result,
  );
});

test("locale input supports both grouping conventions and rejects ambiguous prices", () => {
  assert.equal(normalizeAmount("१,००,०००.२५"), "100000.25");
  assert.equal(normalizeAmount("100,000.25"), "100000.25");
  assert.equal(normalizeAmount("10,00.25"), undefined);
  assert.equal(normalizeAmount("0.00"), undefined);
  assert.equal(normalizeAmount("20.001"), undefined);
  assert.deepEqual(
    scenarioSchema.parse({ ...fixed, amount: "१,००,०००" }),
    fixed,
  );
});

test("card channel and frequency affect cost; unknown charge stays unranked", () => {
  const result = compare(cards, release, clock);
  assert.deepEqual(
    result.groups[0].rows.map((row) => row.calculation.primary),
    ["700.00", "1000.00"],
  );
  assert.equal(result.groups[1].rows[0].calculation.primary, null);
  assert.equal(
    result.groups[1].rows[0].calculation.lines.at(-1)?.value,
    "500.00",
  );
  const branch = compare(
    { ...cards, channel: "branch", years: 2, account: "no" },
    release,
    clock,
  );
  assert.deepEqual(
    branch.groups[0].rows.map((row) => row.calculation.primary),
    ["1900.00", "2500.00"],
  );
  assert.equal(
    compare({ ...cards, reloads: 0 }, release, clock).groups.length,
    1,
  );
});

test("fee floors, caps, waivers and currencies are explicit", () => {
  const rule = {
    event: "transaction" as const,
    currency: "NPR",
    percent: "2",
    floor: "10",
    cap: "50",
  };
  assert.equal(feeFor(rule, "NPR", "100"), "10.00");
  assert.equal(feeFor(rule, "NPR", "1000"), "20.00");
  assert.equal(feeFor(rule, "NPR", "10000"), "50.00");
  assert.equal(feeFor(rule, "USD", "100"), null);
  assert.equal(feeFor({ ...rule, waived: true }, "NPR"), "0.00");
});

test("early withdrawal reconciles already paid amounts only with a supported rule", () => {
  const offer = deposit("dune");
  assert.equal(
    withdrawalCalculation("100000", 6, "1000", offer).status,
    "unsupported",
  );
  const result = withdrawalCalculation("100000", 6, "1000", {
    ...offer,
    withdrawal: {
      citations: ["synthetic"],
      value: {
        policy: { en: "Reprice", ne: "दर बदल्नुहोस्" },
        rate: "3",
        fee: "100",
        treatment: "reprice-and-reconcile",
      },
    },
  });
  assert.equal(result.status, "estimated");
  assert.equal(result.settlement, "100325.00");
  assert.equal(result.netGain, "1325.00");
});

test("generated deposit ledgers reconcile to total net interest across supported schedules", () => {
  for (const id of ["alder", "basin", "dune"]) {
    for (const amount of ["10000.01", "100000", "426832.67", "9999999.09"]) {
      for (const month of [6, 9, 12, 15, 18, 21, 24]) {
        const result = depositCalculation(
          amount,
          month,
          "2026-11-23",
          deposit(id),
        );
        const cents = (text: string) => BigInt(text.replace(".", ""));
        assert.equal(
          result.ledger.reduce((sum, entry) => sum + cents(entry.paid!), 0n),
          cents(result.primary!),
        );
      }
    }
  }
});

test("first-year annual fees apply only when the reviewed rule says they begin in year one", () => {
  const issuer = release.offers.find((offer) => offer.id === "alder-card");
  assert(issuer?.product === "dollar-cards" && issuer.fees.renewal);
  const delayed = {
    ...issuer,
    fees: {
      ...issuer.fees,
      renewal: {
        ...issuer.fees.renewal,
        value: { ...issuer.fees.renewal.value, startsInYear: 2 as const },
      },
    },
  };
  const data = { ...release, offers: [delayed] };
  assert.equal(
    compare(cards, data, clock).groups[0].rows[0].calculation.primary,
    "500.00",
  );
  assert.equal(
    compare({ ...cards, years: 2 }, data, clock).groups[0].rows[0].calculation
      .primary,
    "1000.00",
  );
});
