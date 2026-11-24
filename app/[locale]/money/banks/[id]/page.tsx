import { notFound } from "next/navigation";
import { banks } from "../../../../../src/data/banks";
import { readingsForBank } from "../../../../../src/data/tariffs";
import { isLocale, moneyPath, t } from "../../../../../src/ui/copy";
import { TariffDetails } from "../../../../../src/ui/tariff-reading";
import { Editorial } from "../../../../../src/ui/editorial";

export default async function BankPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const bank = banks.find((entry) => entry.id === id);
  if (!isLocale(locale) || !bank) notFound();
  const [tariff, ...more] = readingsForBank(bank.id);
  return (
    <Editorial
      locale={locale}
      title={bank.name}
      back={moneyPath(locale) + "/banks"}
    >
      {tariff ? (
        <section>
          <h2>{tariff.product}</h2>
          <TariffDetails tariff={tariff} locale={locale} />
        </section>
      ) : (
        <p>{t(locale, "tariffUnavailable")}</p>
      )}
      {more.map((reading) => (
        <details className="paper-disclosure" key={reading.product}>
          <summary>{reading.product}</summary>
          <TariffDetails tariff={reading} locale={locale} />
        </details>
      ))}
    </Editorial>
  );
}
