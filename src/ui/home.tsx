import { ProductMark } from "./product-mark";
import { BankSearch } from "./bank-search";
import { moneyPath, productPath, t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="intent-home container">
      <h1>{t(locale, "decodeTariff")}</h1>
      <p className="home-intro">{t(locale, "homeIntro")}</p>
      <div className="lookup-panel">
        <BankSearch locale={locale} />
        <a href={moneyPath(locale) + "/banks"}>
          {t(locale, "allBanks")} <span aria-hidden="true">→</span>
        </a>
      </div>
      <nav
        className="intent-links feature-disclosure"
        aria-label={t(locale, "exploreFeatures")}
      >
        {(
          [
            [
              "savingsAccounts",
              "savingsGoal",
              moneyPath(locale) + "/savings",
              "passbook",
            ],
            [
              "fixed",
              "depositGoal",
              productPath(locale, "fixed-deposits"),
              "certificate",
            ],
            [
              "dollarCardFees",
              "cardGoal",
              productPath(locale, "dollar-cards"),
              "card",
            ],
            [
              "mobileBankingFees",
              "mobileGoal",
              moneyPath(locale) + "/mobile-banking",
              "receipt",
            ],
          ] as const
        ).map(([title, description, href, kind]) => (
          <a key={title} aria-label={t(locale, title)} href={href}>
            <ProductMark kind={kind} />
            <span>
              <strong>{t(locale, title)}</strong>
              <small>{t(locale, description)}</small>
            </span>
          </a>
        ))}
      </nav>
      <nav className="everyday-tools" aria-label={t(locale, "everydayTools")}>
        <h2>{t(locale, "everydayTools")}</h2>
        <a href={moneyPath(locale) + "/branches"}>
          {t(locale, "branchFinder")}
        </a>
        <a href={moneyPath(locale) + "/usage-cost"}>{t(locale, "usageCost")}</a>
      </nav>
    </section>
  );
}
