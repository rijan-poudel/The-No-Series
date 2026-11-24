import { notFound } from "next/navigation";
import { bankCardSources } from "../../../../../src/data/bank-card-sources";
import { banks, registrySource } from "../../../../../src/data/banks";
import { noticeBanks } from "../../../../../src/editorial/live-notices";
import {
  isLocale,
  moneyPath,
  productPath,
  t,
} from "../../../../../src/ui/copy";
import { Editorial } from "../../../../../src/ui/editorial";

export default async function BankPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const bank = banks.find((entry) => entry.id === id);
  if (!isLocale(locale) || !bank) notFound();
  const home = moneyPath(locale);
  const depositNotices = Object.hasOwn(noticeBanks, bank.id);
  const bankCard = Object.entries(bankCardSources).find(
    ([id]) => id === bank.id,
  )?.[1];
  return (
    <Editorial locale={locale} title={bank.name} back={home + "/banks"}>
      <p>
        {t(
          locale,
          bank.kind === "commercial" ? "commercialBank" : "developmentBank",
        )}
      </p>
      <div className="intent-links">
        {depositNotices && (
          <a href={home + "/notices?bank=" + bank.id}>
            {t(locale, "bankRates")}
          </a>
        )}
        {bankCard && (
          <a href={bankCard[1]} rel="noreferrer">
            {t(locale, "cardTerms")}
          </a>
        )}
        <a href={registrySource}>{t(locale, "registry")}</a>
      </div>
      {!depositNotices && !bankCard && (
        <p className="pick-condition">{t(locale, "directoryOnly")}</p>
      )}
    </Editorial>
  );
}
