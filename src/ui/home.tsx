import {
  ArrowUpRight,
  PiggyBank,
  Landmark,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { BankSearch } from "./bank-search";
import { moneyPath, productPath, t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="intent-home container">
      <h1>{t(locale, "decodeTariff")}</h1>
      <p className="home-intro">{t(locale, "homeIntro")}</p>
      <div className="lookup-panel">
        <BankSearch locale={locale} />
        <a href={moneyPath(locale) + "/banks"}>{t(locale, "allBanks")} ↗</a>
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
              PiggyBank,
            ],
            [
              "fixed",
              "depositGoal",
              productPath(locale, "fixed-deposits"),
              Landmark,
            ],
            [
              "dollarCardFees",
              "cardGoal",
              productPath(locale, "dollar-cards"),
              CreditCard,
            ],
            [
              "mobileBankingFees",
              "mobileGoal",
              moneyPath(locale) + "/mobile-banking",
              Smartphone,
            ],
          ] as const
        ).map(([title, description, href, Icon]) => (
          <a key={title} aria-label={t(locale, title)} href={href}>
            <Icon size={23} aria-hidden />
            <span>
              <strong>{t(locale, title)}</strong>
              <small>{t(locale, description)}</small>
            </span>
            <ArrowUpRight size={17} aria-hidden />
          </a>
        ))}
      </nav>
    </section>
  );
}
