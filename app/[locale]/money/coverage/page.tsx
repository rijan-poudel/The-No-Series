import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { currentData } from "../../../../src/data/current";
import { nepalDate } from "../../../../src/domain/model";
import { isLocale, moneyPath, numberText, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";

export const dynamic = "force-dynamic";

export default async function Coverage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { release, clock, unavailable } = await currentData();
  const demo = release.kind === "demo";
  const date = nepalDate(clock);
  return (
    <Editorial locale={locale} title={t(locale, "coverageTitle")}>
      {demo && <div className="demo-banner">{t(locale, "demo")}</div>}
      {demo && (
        <Link className="trust-link" href={moneyPath(locale) + "/review-lab"}>
          {locale === "ne"
            ? "स्रोत समीक्षा अभ्यास"
            : "Source review walkthrough"}{" "}
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      )}
      <section>
        <h2>{t(locale, "scope")}</h2>
        <p>
          {t(
            locale,
            unavailable
              ? "coverageOffline"
              : release.revoked
                ? "revoked"
                : demo
                  ? "demoScope"
                  : release.offers.length
                    ? "approvedScope"
                    : "publicScope",
          )}
        </p>
        <dl className="line-list">
          <div>
            <dt>{t(locale, "reviewed")}</dt>
            <dd>{numberText(locale, release.institutions.length)}</dd>
          </div>
          <div>
            <dt>{t(locale, "asOf")}</dt>
            <dd>
              <time dateTime={date}>{date}</time>
            </dd>
          </div>
        </dl>
        <p>{t(locale, "furtherScope")}</p>
      </section>
      <section>
        <h2>{t(locale, "evidence")}</h2>
        <p>{t(locale, "sourcePolicy")}</p>
        {!demo && (
          <Link href={moneyPath(locale) + "/notices"} className="trust-link">
            {t(locale, "bankNotices")}
          </Link>
        )}
        <a
          className="trust-link"
          href="https://www.nrb.org.np/departments/bfr/"
          rel="noreferrer"
        >
          {t(locale, "banks")} <ArrowUpRight size={16} aria-hidden />
        </a>
      </section>
    </Editorial>
  );
}
