import { digits, normalizeAmount } from "./model.ts";

export function savingsBalance(value: string | string[] | undefined) {
  const text = typeof value === "string" ? value.trim() : "";
  const amount = /^0+(\.0{1,2})?$/.test(digits(text))
    ? "0"
    : normalizeAmount(text);
  return {
    text,
    amount,
    invalid: Array.isArray(value) || Boolean(text && !amount),
  };
}

export function minimumStatus(
  balance: string,
  minimum: string | null | undefined,
) {
  if (minimum == null) return "balanceUnknown";
  return Number(balance) >= Number(minimum) ? "balanceFits" : "balanceShort";
}
