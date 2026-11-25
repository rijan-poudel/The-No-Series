import { ChevronRight } from "lucide-react";
import { BankSearch } from "./bank-search";
import { moneyPath, productPath, t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="intent-home container">
      <h1>{t(locale, "decodeTariff")}</h1>
      <p className="home-intro">{t(locale, "homeIntro")}</p>
      <BankSearch locale={locale} />
      <nav
        className="intent-links feature-disclosure"
        aria-label={t(locale, "exploreFeatures")}
      >
        <a href={productPath(locale, "fixed-deposits")}>
          {t(locale, "fixed")}
          <ChevronRight size={17} aria-hidden />
        </a>
        <a href={productPath(locale, "dollar-cards")}>
          {t(locale, "dollarCardFees")}
          <ChevronRight size={17} aria-hidden />
        </a>
        <a href={moneyPath(locale) + "/mobile-banking"}>
          {t(locale, "mobileBankingFees")}
          <ChevronRight size={17} aria-hidden />
        </a>
      </nav>
    </section>
  );
}
