import { BankSearch } from "./bank-search";
import { t, type Locale } from "./copy";

export function MoneyHome({ locale }: { locale: Locale }) {
  return (
    <section className="intent-home container">
      <h1>{t(locale, "decodeTariff")}</h1>
      <BankSearch locale={locale} />
    </section>
  );
}
