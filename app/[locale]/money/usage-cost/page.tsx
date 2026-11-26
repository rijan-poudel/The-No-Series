import { digits } from "../../../../src/domain/model";
import { notFound } from "next/navigation";
import { banks } from "../../../../src/data/banks";
import { bankPublishers } from "../../../../src/data/bank-publishers";
import { usageCost } from "../../../../src/domain/usage-cost";
import { amountText, isLocale, moneyPath, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";
import { pageMetadata } from "../../../../src/ui/page-metadata";
type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }) {
  return pageMetadata((await params).locale, "usageCost", "usageScope");
}
export default async function Usage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fields = await searchParams;
  const input = fields.atm ?? "12";
  const normalized = typeof input === "string" ? digits(input) : "";
  const count = Number(normalized);
  const valid = /^\d{1,3}$/.test(normalized) && count <= 365;
  const mobile = fields.mobile === "yes";
  const selected = banks.find((b) => b.id === fields.bank);
  if (fields.bank && !selected) notFound();
  const rows = selected
    ? [selected]
    : banks.filter((b) => ["nepal", "everest", "nepal-sbi"].includes(b.id));
  const base = moneyPath(locale);
  const price = (n: number | null) =>
    n === null ? t(locale, "mobileFeeUnknown") : amountText(locale, String(n));
  return (
    <Editorial locale={locale} title={t(locale, "usageCost")}>
      <p>{t(locale, "usageScope")}</p>
      <form className="pair-form" action={base + "/usage-cost"}>
        <label>
          {t(locale, "mobileFeeBank")}
          <select name="bank" defaultValue={selected?.id ?? ""}>
            <option value="">{t(locale, "costBanks")}</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(locale, "domesticWithdrawals")}
          <input
            name="atm"
            inputMode="numeric"
            required
            maxLength={3}
            defaultValue={typeof input === "string" ? input : ""}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="mobile"
            value="yes"
            defaultChecked={mobile}
          />{" "}
          {t(locale, "includeRenewal")}
        </label>
        <button>{t(locale, "calculateCost")}</button>
      </form>
      {valid ? (
        <table className="mobile-fee-table">
          <caption>{t(locale, "selectedCosts")}</caption>
          <thead>
            <tr>
              <th scope="col">{t(locale, "mobileFeeBank")}</th>
              <th scope="col">ATM</th>
              {mobile && <th scope="col">{t(locale, "mobileAnnualFee")}</th>}
              <th scope="col">{t(locale, "costTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const fees = usageCost(b.id, count, mobile);
              return (
                <tr key={b.id}>
                  <th scope="row">
                    <a href={base + "/banks/" + b.id}>{b.name}</a>
                    <small>
                      <a href={fees.source ?? bankPublishers[b.id].url}>
                        {t(
                          locale,
                          fees.source ? "officialSchedule" : "publisherSite",
                        )}
                      </a>
                    </small>
                  </th>
                  <td>{price(fees.atm)}</td>
                  {mobile && <td>{price(fees.renewal)}</td>}
                  <td>
                    {fees.total === null
                      ? t(locale, "costIncomplete")
                      : price(fees.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p role="alert">{t(locale, "withdrawalError")}</p>
      )}
    </Editorial>
  );
}
