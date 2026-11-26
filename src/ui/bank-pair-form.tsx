"use client";

import { useState } from "react";
import { moneyPath, numberText, t, type Locale } from "./copy";

const pairProducts = [
  "all",
  "fixed",
  "savingsAccounts",
  "dollarCardFees",
  "mobileBankingFees",
] as const;
export type PairProduct = (typeof pairProducts)[number];
type BankOption = { id: string; name: string; coverage: PairProduct[] };

export function BankPairForm({
  locale,
  options,
  initialProduct,
  first,
  second,
  term,
  terms,
  balance,
}: {
  locale: Locale;
  options: BankOption[];
  initialProduct: PairProduct;
  first: string;
  second: string;
  term: number;
  terms: readonly number[];
  balance: string;
}) {
  const [product, setProduct] = useState(initialProduct);
  const [a, setA] = useState(first);
  const [b, setB] = useState(second);
  const covered = options.filter((bank) =>
    product === "all"
      ? bank.coverage.length > 0
      : bank.coverage.includes(product),
  );
  const other = options.filter((bank) => !covered.includes(bank));
  return (
    <form
      className="pair-form"
      action={moneyPath(locale) + "/banks/compare#results"}
    >
      <label>
        {t(locale, "focusProduct")}
        <select
          name="product"
          value={product}
          onChange={(e) => setProduct(e.target.value as PairProduct)}
        >
          {pairProducts.map((key) => (
            <option key={key} value={key}>
              {t(locale, key === "all" ? "allProducts" : key)}
            </option>
          ))}
        </select>
      </label>
      <label className="pair-term">
        {t(locale, "term")}
        <select name="term" defaultValue={term}>
          {terms.map((value) => (
            <option key={value} value={value}>
              {numberText(locale, value)} {t(locale, "months")}
            </option>
          ))}
        </select>
      </label>
      <label className="pair-balance">
        {t(locale, "myBalance")}
        <input
          name="balance"
          inputMode="decimal"
          maxLength={30}
          defaultValue={balance}
        />
      </label>
      {(["a", "b"] as const).map((side) => (
        <label key={side}>
          {t(locale, side === "a" ? "firstBank" : "secondBank")}
          <select
            name={side}
            required
            value={side === "a" ? a : b}
            onChange={(e) =>
              side === "a" ? setA(e.target.value) : setB(e.target.value)
            }
          >
            <option value="">{t(locale, "chooseBank")}</option>
            {(
              [
                [
                  product === "fixed" ? "trackedNotices" : "withCoverage",
                  covered,
                ],
                ["otherBanks", other],
              ] as const
            ).map(
              ([key, group]) =>
                group.length > 0 && (
                  <optgroup key={key} label={t(locale, key)}>
                    {group.map((bank) => (
                      <option
                        key={bank.id}
                        value={bank.id}
                        disabled={bank.id === (side === "a" ? b : a)}
                      >
                        {bank.name}
                      </option>
                    ))}
                  </optgroup>
                ),
            )}
          </select>
        </label>
      ))}
      <button>{t(locale, "intentCompare")}</button>
    </form>
  );
}
