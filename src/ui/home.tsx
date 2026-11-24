import { ChevronDown, ChevronRight } from "lucide-react";
import { BankSearch } from "./bank-search";
import { productPath, t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="intent-home container">
      <h1>{t(locale, "decodeTariff")}</h1>
      <BankSearch locale={locale} />
      <details className="feature-disclosure">
        <summary>
          {t(locale, "exploreFeatures")}
          <ChevronDown size={18} aria-hidden />
        </summary>
        <div className="intent-links">
          <a href={productPath(locale, "fixed-deposits")}>
            {t(locale, "fixed")}
            <ChevronRight size={17} aria-hidden />
          </a>
          <a href={productPath(locale, "dollar-cards")}>
            {t(locale, "dollarCardFees")}
            <ChevronRight size={17} aria-hidden />
          </a>
        </div>
      </details>
    </section>
  );
}
