import Link from "next/link";
import { depositTerms } from "../../../../src/domain/picks";
import { notFound } from "next/navigation";
import { liveNotices } from "../../../../src/data/live-notices";
import { noticeBanks } from "../../../../src/editorial/live-notices";
import { isLocale, moneyPath, numberText, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";

export const dynamic = "force-dynamic";

export default async function Notices({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ term?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [notices, query] = await Promise.all([liveNotices(), searchParams]);
  const term = depositTerms.find((value) => String(value) === query.term) ?? 12;
  const rows = notices.flatMap(({ bank, effective, rates }) => {
    const match = rates.find((row) => row.term === term);
    return match ? [{ bank, effective, rate: match.rate }] : [];
  });
  return (
    <Editorial
      locale={locale}
      title={t(locale, "bankNotices")}
      back={moneyPath(locale) + "/coverage"}
    >
      <section>
        <p>{t(locale, "noticeScope")}</p>
        <nav className="notice-terms" aria-label={t(locale, "term")}>
          {depositTerms.map((value) => (
            <Link
              aria-current={value === term ? "page" : undefined}
              href={moneyPath(locale) + "/notices?term=" + value}
              key={value}
            >
              {numberText(locale, value)} {t(locale, "months")}
            </Link>
          ))}
        </nav>
        {rows.length ? (
          <ul>
            {rows.map(({ bank, rate, effective }) => {
              const value = rate.slice(0, -1);
              return (
                <li key={bank}>
                  <a href={noticeBanks[bank].url} rel="noreferrer">
                    {noticeBanks[bank].name}
                  </a>
                  {" · "}
                  {numberText(locale, value, value.split(".")[1]?.length ?? 0)}%
                  {" · "}
                  <time dateTime={effective}>{effective}</time>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>{t(locale, "noBankNotices")}</p>
        )}
      </section>
    </Editorial>
  );
}
