import { notFound } from "next/navigation";
import { findBanks } from "../../../../src/data/banks";
import { BankSearch } from "../../../../src/ui/bank-search";
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
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const matches = findBanks(query).slice(0, 6);
  const path = moneyPath(locale) + "/banks";
  return (
    <section className="bank-directory container">
      <h1>{t(locale, "chooseBank")}</h1>
      <BankSearch locale={locale} query={query} />
      {matches.length ? (
        <ul className="bank-list">
          {matches.map((bank) => (
            <li key={bank.id}>
              <a href={path + "/" + bank.id}>{bank.name}</a>
            </li>
          ))}
        </ul>
      ) : query ? (
        <p>{t(locale, "noBanksFound")}</p>
      ) : null}
    </section>
  );
}
