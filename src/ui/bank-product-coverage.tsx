import type { BankEntry } from "../data/banks";
import { bankPublishers } from "../data/bank-publishers";
import checks from "../data/fd-bank-checks.json";
import { savingsReadings, savingsChecked } from "../data/savings";
import { readingsForBank } from "../data/tariffs";
import { tariffCatalog } from "../data/tariff-catalog";
import { type Locale, moneyPath, t } from "./copy";
import { verificationDate } from "./verification-date";

export function BankProductCoverage({
  bank,
  locale,
}: {
  bank: BankEntry;
  locale: Locale;
}) {
  const base = moneyPath(locale),
    id = bank.id;
  const reading = savingsReadings[id];
  const check = checks[id];
  const publisher = bankPublishers[id].url;
  return (
    <section>
      <h2>{t(locale, "bankProductCoverage")}</h2>
      <dl className="line-list">
        <div>
          <dt>
            <a href={base + "/savings?bank=" + id}>
              {t(locale, "savingsAccounts")}
            </a>
          </dt>
          <dd>
            {reading ? (
              <a href={reading.source}>
                {t(locale, "rateNotice")} ·{" "}
                {verificationDate(locale, savingsChecked)}
              </a>
            ) : (
              <a href={publisher}>{t(locale, "termsPending")}</a>
            )}
          </dd>
        </div>
        <div>
          <dt>{t(locale, "oneYearDeposit")}</dt>
          <dd>
            <a href={check.url}>
              {t(
                locale,
                check.status === "observed"
                  ? "pendingReview"
                  : check.status === "missing"
                    ? "termUnconfirmed"
                    : "noticeUnavailable",
              )}{" "}
              · {verificationDate(locale, check.date)}
            </a>
            {id === "rastriya-banijya" && check.status === "missing" && (
              <small>{t(locale, "rbbBoundary")}</small>
            )}
          </dd>
        </div>
        {(["dollarCardFees", "mobileBankingFees"] as const).map((product) => {
          const fee = readingsForBank(id).find(
            (row) =>
              (row.subject === "mobile-banking") ===
              (product === "mobileBankingFees"),
          );
          return (
            <div key={product}>
              <dt>{t(locale, product)}</dt>
              <dd>
                <a href={fee?.source ?? tariffCatalog[id] ?? publisher}>
                  {fee ? fee.edition[locale] : t(locale, "termsPending")}
                </a>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
