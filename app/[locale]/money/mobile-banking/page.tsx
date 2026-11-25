import { ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import { banks } from "../../../../src/data/banks";
import { decodedMobileTariffs } from "../../../../src/data/tariffs";
import { amountText, isLocale, moneyPath, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";
import { TariffDetails } from "../../../../src/ui/tariff-reading";

export default async function MobileBanking({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

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
                  {banks.find((bank) => bank.id === id)?.name}
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
      <div className="decoded-card-list">
        {decodedMobileTariffs.map(({ id, reading }) => (
          <details key={id}>
            <summary>
              {banks.find((bank) => bank.id === id)?.name}{" "}
              <ChevronDown size={16} aria-hidden />
            </summary>
            <TariffDetails tariff={reading} locale={locale} />
          </details>
        ))}
      </div>
    </Editorial>
  );
}
