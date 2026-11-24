import { ArrowUpRight, CreditCard, Landmark } from "lucide-react";
import { productPath, t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="paper-home container">
      <div className="paper-intro">
        <h1>{t(locale, "beforeChoose")}</h1>
        <p>{t(locale, "pickCategory")}</p>
      </div>
      <div className="paper-choices">
        <a
          href={productPath(locale, "fixed-deposits")}
          className="paper-choice deposit-paper"
        >
          <Landmark size={23} aria-hidden />
          <h2>{t(locale, "fixed")}</h2>
          <ArrowUpRight size={23} aria-hidden />
        </a>
        <a
          href={productPath(locale, "dollar-cards")}
          className="paper-choice card-paper"
        >
          <CreditCard size={23} aria-hidden />
          <h2>{t(locale, "cards")}</h2>
          <ArrowUpRight size={23} aria-hidden />
        </a>
      </div>
    </section>
  );
}
