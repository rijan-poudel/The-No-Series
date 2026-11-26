import { pageMetadata } from "../../../../src/ui/page-metadata";
import { notFound } from "next/navigation";
import { banks, registrySource, findBanks } from "../../../../src/data/banks";
import { BankSearch } from "../../../../src/ui/bank-search";
import { isLocale, moneyPath, numberText, t } from "../../../../src/ui/copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "chooseBank", "searchHint");
}

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
  const matches = findBanks(query);
  const path = moneyPath(locale) + "/banks";
  return (
    <section className="bank-directory container">
      <h1>{t(locale, "chooseBank")}</h1>
      <p>{t(locale, "directoryIntro")}</p>
      <a className="trust-link" href={moneyPath(locale) + "/branches"}>
        {t(locale, "branchFinder")} →
      </a>
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
      ) : (
        (["commercial", "development"] as const).map((kind) => {
          const group = banks.filter((bank) => bank.kind === kind);
          return (
            <details className="directory-group" key={kind}>
              <summary>
                {t(
                  locale,
                  kind === "commercial" ? "commercialBank" : "developmentBank",
                )}{" "}
                <span>{numberText(locale, group.length)}</span>
              </summary>
              <ul className="bank-list">
                {group.map((bank) => (
                  <li key={bank.id}>
                    <a href={path + "/" + bank.id}>
                      {bank.name}
                      <small>{bank.office[locale]}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          );
        })
      )}
      <p className="registry-credit">
        <a href={registrySource}>{t(locale, "registry")}</a> ·{" "}
        {t(locale, "registryEdition")}
      </p>
    </section>
  );
}
