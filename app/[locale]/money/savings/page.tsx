import {
  savingsBalance,
  minimumStatus,
} from "../../../../src/domain/savings-balance";
import { verificationDate } from "../../../../src/ui/verification-date";
import { notFound } from "next/navigation";
import { banks } from "../../../../src/data/banks";
import { bankPublishers } from "../../../../src/data/bank-publishers";
import {
  savingsReadings,
  savingsChecked,
  savingsEdition,
} from "../../../../src/data/savings";
import {
  amountText,
  isLocale,
  moneyPath,
  numberText,
  t,
} from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";
import { pageMetadata } from "../../../../src/ui/page-metadata";

type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }) {
  return pageMetadata((await params).locale, "savingsAccounts", "savingsGoal");
}
export default async function Savings({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{
    bank?: string;
    balance?: string | string[];
    view?: string;
  }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { bank: id, balance: value, view } = await searchParams;
  const {
    text: balanceText,
    amount: normalized,
    invalid: invalidBalance,
  } = savingsBalance(value);
  const selected = banks.find((bank) => bank.id === id);
  if (id && !selected) notFound();
  const rows = selected
    ? [selected]
    : banks.filter((bank) => savingsReadings[bank.id]);
  const base = moneyPath(locale);
  const comparison = new URLSearchParams({ product: "savingsAccounts" });
  if (selected) comparison.set("a", selected.id);
  if (normalized) comparison.set("balance", normalized);
  const baseQuery = new URLSearchParams();
  if (selected) baseQuery.set("bank", selected.id);
  if (normalized) baseQuery.set("balance", normalized);
  const currentView =
    normalized &&
    !selected &&
    (view === "balanceFits" ||
      view === "balanceShort" ||
      view === "balanceUnknown")
      ? view
      : "allAccounts";
  function filterLink(key: string) {
    const q = new URLSearchParams(baseQuery);
    if (key !== "allAccounts") q.set("view", key);
    return base + "/savings?" + q + "#accounts";
  }
  const statusFor = (bank: (typeof rows)[number]) =>
    minimumStatus(normalized ?? "0", savingsReadings[bank.id]?.minimumNpr);
  const visible =
    currentView === "allAccounts"
      ? rows
      : rows.filter((bank) => statusFor(bank) === currentView);
  return (
    <Editorial locale={locale} title={t(locale, "savingsAccounts")}>
      <p>
        {t(locale, "savingsGoal")} {t(locale, "savingsCoverage")}{" "}
        {numberText(locale, Object.keys(savingsReadings).length)} /{" "}
        {numberText(locale, banks.length)}.
      </p>
      <form className="pair-form" action={base + "/savings#accounts"}>
        <label>
          {t(locale, "mobileFeeBank")}
          <select name="bank" defaultValue={selected?.id ?? ""}>
            <option value="">{t(locale, "availableAccounts")}</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(locale, "myBalance")}
          <input
            name="balance"
            inputMode="decimal"
            maxLength={30}
            defaultValue={balanceText}
          />
        </label>
        <button>{t(locale, "showAccounts")}</button>
      </form>
      <p>
        {savingsEdition[locale]} · {t(locale, "savingsChecked")}{" "}
        <time dateTime={savingsChecked}>
          {verificationDate(locale, savingsChecked)}
        </time>
      </p>
      {invalidBalance && <p role="alert">{t(locale, "balanceInvalid")}</p>}
      <section
        id="accounts"
        tabIndex={-1}
        aria-label={t(locale, "savingsAccounts")}
      >
        {normalized && !selected && (
          <nav className="fee-view" aria-label={t(locale, "balanceFilters")}>
            {(
              [
                "allAccounts",
                "balanceFits",
                "balanceShort",
                "balanceUnknown",
              ] as const
            ).map((key) => (
              <a
                key={key}
                aria-current={key === currentView ? "page" : undefined}
                href={filterLink(key)}
              >
                {t(locale, key)}{" "}
                <span>
                  {numberText(
                    locale,
                    key === "allAccounts"
                      ? rows.length
                      : rows.filter((bank) => statusFor(bank) === key).length,
                  )}
                </span>
              </a>
            ))}
          </nav>
        )}
        {visible.length === 0 ? (
          <p>
            {t(locale, "emptyBalanceGroup")}{" "}
            <a href={filterLink("allAccounts")}>{t(locale, "allAccounts")}</a>
          </p>
        ) : (
          <div
            className="savings-scroll"
            tabIndex={0}
            role="region"
            aria-label={t(locale, "accountTerms")}
          >
            <table className="mobile-fee-table">
              <caption>{t(locale, "accountTerms")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t(locale, "mobileFeeBank")}</th>
                  <th scope="col">{t(locale, "yearlyRate")}</th>
                  <th scope="col">{t(locale, "savingsMinimum")}</th>
                  {normalized && (
                    <th scope="col">{t(locale, "balanceStatus")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((bank) => {
                  const reading = savingsReadings[bank.id];
                  return (
                    <tr key={bank.id}>
                      <th scope="row">
                        <a href={base + "/banks/" + bank.id}>{bank.name}</a>
                        {reading && <small>{reading.account}</small>}
                        {!selected && (
                          <small>
                            <a
                              aria-label={
                                t(locale, "compareWithBank") + " " + bank.name
                              }
                              href={
                                base +
                                "/banks/compare?" +
                                new URLSearchParams({
                                  ...Object.fromEntries(comparison),
                                  a: bank.id,
                                })
                              }
                            >
                              {t(locale, "intentCompare")}
                            </a>
                          </small>
                        )}
                      </th>
                      {reading ? (
                        <>
                          <td>
                            {numberText(locale, reading.annualPercent, 2)}%
                            <small>
                              <a href={reading.source}>
                                {t(locale, "rateNotice")}
                              </a>
                            </small>
                          </td>
                          <td>
                            {reading.minimumNpr === null
                              ? t(locale, "mobileFeeUnknown")
                              : amountText(locale, reading.minimumNpr)}
                            {reading.minimumSource && (
                              <small>
                                <a href={reading.minimumSource}>
                                  {t(locale, "accountTerms")}
                                  {reading.minimumChecked &&
                                    " · " +
                                      verificationDate(
                                        locale,
                                        reading.minimumChecked,
                                      )}
                                </a>
                              </small>
                            )}
                          </td>
                          {normalized && (
                            <td>
                              {t(
                                locale,
                                minimumStatus(normalized, reading.minimumNpr),
                              )}
                            </td>
                          )}
                        </>
                      ) : (
                        <td colSpan={normalized ? 3 : 2}>
                          {t(locale, "noSavingsReading")}{" "}
                          <a href={bankPublishers[bank.id].url}>
                            {t(locale, "publisherSite")}
                          </a>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <a className="trust-link" href={base + "/banks/compare?" + comparison}>
        {t(locale, "compareSavings")} →
      </a>
      {selected?.id === "nepal" && (
        <section>
          <h2>{t(locale, "openingDocs")}</h2>
          <p>{t(locale, "nepalOpening")}</p>
          <a href="https://nepalbank.com.np/personal/products/saving-account/normal-saving-account">
            {t(locale, "accountRequirements")}
          </a>
        </section>
      )}
    </Editorial>
  );
}
