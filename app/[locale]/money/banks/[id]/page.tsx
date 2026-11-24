import { notFound } from "next/navigation";
import { banks } from "../../../../../src/data/banks";
import { tariffReadings } from "../../../../../src/data/tariffs";
import {
  amountText,
  isLocale,
  local,
  moneyPath,
  numberText,
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
  const tariff = tariffReadings[bank.id];
  return (
    <Editorial
      locale={locale}
      title={bank.name}
      back={moneyPath(locale) + "/banks"}
    >
      {tariff ? (
        <section>
          <h2>{tariff.product}</h2>
          <dl className="line-list tariff-lines">
            {tariff.charges.map(({ event, value, unit }) => (
              <div key={event.en}>
                <dt>{local(locale, event)}</dt>
                <dd>
                  {unit === "NPR"
                    ? amountText(locale, value)
                    : numberText(locale, value) + "%"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="tariff-catch">{local(locale, tariff.catch)}</p>
          <details className="paper-disclosure">
            <summary>{t(locale, "viewEvidence")}</summary>
            <a className="trust-link" href={tariff.source} rel="noreferrer">
              {local(locale, tariff.edition)} · § {tariff.section}
            </a>
            <br />
            <a
              className="trust-link"
              href={tariff.productPage}
              rel="noreferrer"
            >
              {t(locale, "cardTerms")}
            </a>
          </details>
        </section>
      ) : (
        <p>{t(locale, "tariffUnavailable")}</p>
      )}
    </Editorial>
  );
}
