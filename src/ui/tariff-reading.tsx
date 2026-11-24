import type { TariffReading } from "../data/tariffs";
import { amountText, local, numberText, t, type Locale } from "./copy";

export function TariffDetails({
  tariff,
  locale,
}: {
  tariff: TariffReading;
  locale: Locale;
}) {
  return (
    <>
      <dl className="line-list tariff-lines">
        {tariff.charges.map(({ event, value, unit, minimumUsd }) => (
          <div key={event.en}>
            <dt>{local(locale, event)}</dt>
            <dd>
              {unit === "percent"
                ? numberText(locale, value) + "%"
                : amountText(locale, value, unit)}
              {minimumUsd && (
                <small>
                  {t(locale, "feeMinimum")}{" "}
                  {amountText(locale, minimumUsd, "USD")}
                </small>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="tariff-catch">{local(locale, tariff.catch)}</p>
      <details className="paper-disclosure">
        <summary>{t(locale, "viewEvidence")}</summary>
        <a className="trust-link" href={tariff.source} rel="noreferrer">
          {local(locale, tariff.edition)} · {tariff.section}
        </a>
        {tariff.productPage && (
          <>
            <br />
            <a
              className="trust-link"
              href={tariff.productPage}
              rel="noreferrer"
            >
              {t(locale, "cardTerms")}
            </a>
          </>
        )}
      </details>
    </>
  );
}
