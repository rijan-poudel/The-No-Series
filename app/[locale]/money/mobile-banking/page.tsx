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
          {t(locale, "annualMobileFees")}
          <ChevronDown size={16} aria-hidden />
        </summary>
        <dl className="line-list tariff-lines">
          {decodedMobileTariffs.map(({ id, reading }) => {
            const annual = reading.charges.find(
              (charge) => charge.annualBasis && charge.unit === "NPR",
            );
            return (
              <div key={id}>
                <dt>{banks.find((bank) => bank.id === id)?.name}</dt>
                <dd>
                  {annual
                    ? amountText(locale, annual.value, "NPR")
                    : t(locale, "annualFeeUnknown")}
                  {annual?.annualBasis === "per-account" && (
                    <small>{t(locale, "feePerAccount")}</small>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
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
