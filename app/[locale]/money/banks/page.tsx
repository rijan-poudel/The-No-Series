import { notFound } from "next/navigation";
import { findBanks, registrySource } from "../../../../src/data/banks";
import { isLocale, moneyPath, t } from "../../../../src/ui/copy";

export default async function BanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 100) : "";
  const matches = findBanks(query);
  const path = moneyPath(locale) + "/banks";
  return (
    <section className="bank-directory container">
      <h1>{t(locale, "chooseBank")}</h1>
      <form action={path} className="bank-search">
        <label className="visually-hidden" htmlFor="bank-query">
          {t(locale, "searchBanks")}
        </label>
        <input
          id="bank-query"
          type="search"
          name="q"
          maxLength={100}
          placeholder={t(locale, "searchBanks")}
          defaultValue={query}
        />
        <button type="submit">{t(locale, "bankSearchAction")}</button>
      </form>
      {matches.length ? (
        <ul className="bank-list">
          {matches.map((bank) => (
            <li key={bank.id}>
              <a href={path + "/" + bank.id}>{bank.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t(locale, "noBanksFound")}</p>
      )}
      <a className="trust-link" href={registrySource}>
        {t(locale, "registry")}
      </a>
    </section>
  );
}
