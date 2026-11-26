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
  searchParams: Promise<{ bank?: string; balance?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { bank: id, balance: value } = await searchParams;
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
  return (
    <Editorial locale={locale} title={t(locale, "savingsAccounts")}>
      <p>
        {t(locale, "savingsGoal")} {t(locale, "savingsCoverage")}{" "}
        {numberText(locale, Object.keys(savingsReadings).length)} /{" "}
        {numberText(locale, banks.length)}.
      </p>
      <form className="pair-form" action={base + "/savings"}>
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
      <table className="mobile-fee-table">
        <caption>{t(locale, "accountTerms")}</caption>
        <thead>
          <tr>
            <th scope="col">{t(locale, "mobileFeeBank")}</th>
            <th scope="col">{t(locale, "yearlyRate")}</th>
            <th scope="col">{t(locale, "savingsMinimum")}</th>
            {normalized && <th scope="col">{t(locale, "balanceStatus")}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((bank) => {
            const reading = savingsReadings[bank.id];
            return (
              <tr key={bank.id}>
                <th scope="row">
                  <a href={base + "/banks/" + bank.id}>{bank.name}</a>
                  {reading && <small>{reading.account}</small>}
                </th>
                {reading ? (
                  <>
                    <td>
                      {numberText(locale, reading.annualPercent, 2)}%
                      <small>
                        <a href={reading.source}>{t(locale, "rateNotice")}</a>
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
