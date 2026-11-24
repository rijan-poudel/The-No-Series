import { moneyPath, t, type Locale } from "./copy";

export function BankSearch({
  locale,
  query = "",
}: {
  locale: Locale;
  query?: string;
}) {
  return (
    <form action={moneyPath(locale) + "/banks"} className="bank-search">
      <label className="visually-hidden" htmlFor="bank-query">
        {t(locale, "searchBanks")}
      </label>
      <input
        id="bank-query"
        type="search"
        name="q"
        maxLength={100}
        required
        placeholder={t(locale, "searchBanks")}
        defaultValue={query}
      />
      <button type="submit">{t(locale, "bankSearchAction")}</button>
    </form>
  );
}
