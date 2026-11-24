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
  searchParams: Promise<{ term?: string | string[]; bank?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const banks = Object.entries(noticeBanks);
  const singleBank = banks.find(([id]) => id === query.bank)?.[0];
  const chooseBank = query.bank === "choose";
  const notices = chooseBank ? [] : await liveNotices();
  const bankScope = singleBank ? "&bank=" + singleBank : "";

  const term = depositTerms.find((value) => String(value) === query.term) ?? 12;
  const rows = notices.flatMap(({ bank, effective, rates }) => {
    if (singleBank && bank !== singleBank) return [];
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
        {(chooseBank || singleBank) && (
          <nav className="notice-terms" aria-label={t(locale, "chooseBank")}>
            {banks.map(([id, { name }]) => (
              <Link
                key={id}
                aria-current={id === singleBank ? "page" : undefined}
                href={
                  moneyPath(locale) + "/notices?term=" + term + "&bank=" + id
                }
              >
                {name}
              </Link>
            ))}
          </nav>
        )}
        {!chooseBank && (
          <>
            <p>{t(locale, "noticeScope")}</p>
            <nav className="notice-terms" aria-label={t(locale, "term")}>
              {depositTerms.map((value) => (
                <Link
                  aria-current={value === term ? "page" : undefined}
                  href={
                    moneyPath(locale) + "/notices?term=" + value + bankScope
                  }
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
                      {numberText(
                        locale,
                        value,
                        value.split(".")[1]?.length ?? 0,
                      )}
                      %{" · "}
                      <time dateTime={effective}>{effective}</time>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{t(locale, "noBankNotices")}</p>
            )}
          </>
        )}
      </section>
    </Editorial>
  );
}
