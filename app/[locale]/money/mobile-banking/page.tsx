import { pageMetadata } from "../../../../src/ui/page-metadata";
import { ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import { banks } from "../../../../src/data/banks";
import { decodedMobileTariffs } from "../../../../src/data/tariffs";
import {
  amountText,
  isLocale,
  local,
  moneyPath,
  t,
} from "../../../../src/ui/copy";
import { MobileBankLink } from "../../../../src/ui/mobile-bank-link";
import { Editorial } from "../../../../src/ui/editorial";
import { TariffDetails } from "../../../../src/ui/tariff-reading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "mobileBankingFees", "methodMobileText");
}

export default async function MobileBanking({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const bankNames = new Map<string, string>(
    banks.map(({ id, name }) => [id, name]),
  );

  return (
    <Editorial
      locale={locale}
      title={t(locale, "mobileBankingFees")}
      back={moneyPath(locale)}
    >
      <details className="paper-disclosure">
        <summary>
          {t(locale, "compareMobileFees")}
          <ChevronDown size={16} aria-hidden />
        </summary>
        <table
          className="mobile-fee-table"
          aria-label={t(locale, "mobileBankingFees")}
        >
          <thead>
            <tr>
              <th scope="col">{t(locale, "mobileFeeBank")}</th>
              <th scope="col">{t(locale, "mobileSignupFee")}</th>
              <th scope="col">{t(locale, "mobileAnnualFee")}</th>
            </tr>
          </thead>
          <tbody>
            {decodedMobileTariffs.map(({ id, reading }) => (
              <tr key={id}>
                <th scope="row">
                  <MobileBankLink id={id} name={bankNames.get(id) ?? id} />
                </th>
                {(["registrationBasis", "annualBasis"] as const).map(
                  (basis) => {
                    const fee = reading.charges.find(
                      (charge) => charge[basis] && charge.unit === "NPR",
                    );
                    return (
                      <td key={basis}>
                        {fee
                          ? amountText(locale, fee.value, "NPR")
                          : t(locale, "mobileFeeUnknown")}
                        {fee?.[basis] === "per-account" && (
                          <small>{t(locale, "feePerAccount")}</small>
                        )}
                      </td>
                    );
                  },
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <details className="paper-disclosure">
        <summary>
          {t(locale, "comparePinReset")}
          <ChevronDown size={16} aria-hidden />
        </summary>
        <dl className="line-list tariff-lines">
          {decodedMobileTariffs.map(({ id, reading }) => {
            const resets = reading.charges.filter(
              (charge) => charge.pinResetChannel && charge.unit === "NPR",
            );
            return (
              <div key={id}>
                <dt>
                  <MobileBankLink id={id} name={bankNames.get(id) ?? id} />
                </dt>
                <dd>
                  {resets.length === 0 && t(locale, "mobileFeeUnknown")}
                  {resets.map((fee) => (
                    <div key={fee.pinResetChannel}>
                      <small>
                        {fee.pinResetChannel === "unspecified"
                          ? t(locale, "pinResetChannelUnknown")
                          : local(locale, fee.event)}
                      </small>
                      <span>{amountText(locale, fee.value, "NPR")}</span>
                    </div>
                  ))}
                </dd>
              </div>
            );
          })}
        </dl>
      </details>
      <div className="decoded-card-list">
        {decodedMobileTariffs.map(({ id, reading }) => (
          <details key={id}>
            <summary className="mobile-fee-target" id={`mobile-fees-${id}`}>
              {bankNames.get(id)} <ChevronDown size={16} aria-hidden />
            </summary>
            <TariffDetails tariff={reading} locale={locale} />
          </details>
        ))}
      </div>
    </Editorial>
  );
}
