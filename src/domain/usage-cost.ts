import { readingsForBank } from "../data/tariffs.ts";

// Published fee for a domestic debit card at another bank's ATM in Nepal.
const atmFee: Readonly<Record<string, number>> = {
  everest: 15,
  "nepal-sbi": 15,
};
export function usageCost(
  bank: string,
  withdrawals: number,
  includeMobile: boolean,
) {
  if (
    !Number.isSafeInteger(withdrawals) ||
    withdrawals < 0 ||
    withdrawals > 365
  )
    throw new RangeError("Invalid withdrawal count");
  const mobile = readingsForBank(bank).find(
    (reading) => reading.subject === "mobile-banking",
  );
  const annual = mobile?.charges.find((c) => c.unit === "NPR" && c.annualBasis);
  const atm =
    withdrawals === 0
      ? 0
      : atmFee[bank] === undefined
        ? null
        : withdrawals * atmFee[bank];
  const renewal = includeMobile ? (annual ? Number(annual.value) : null) : 0;
  return {
    atm,
    renewal,
    total: atm === null || renewal === null ? null : atm + renewal,
    source: mobile?.source,
  };
}
