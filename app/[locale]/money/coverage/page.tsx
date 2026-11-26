import depositChecks from "../../../../src/data/fd-bank-checks.json";
import { verificationDate } from "../../../../src/ui/verification-date";
import { pageMetadata } from "../../../../src/ui/page-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { banks } from "../../../../src/data/banks";
import {
  decodedCardTariffs,
  decodedMobileTariffs,
} from "../../../../src/data/tariffs";
import { tariffCatalog } from "../../../../src/data/tariff-catalog";
import { currentData } from "../../../../src/data/current";
import { nepalDate } from "../../../../src/domain/model";
import { isLocale, moneyPath, numberText, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "coverageTitle", "coverageDescription");
}

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
        <h2>{t(locale, "fdMarket")}</h2>
        <p>{t(locale, "fdMarketIntro")}</p>
        {(
          [
            ["observed", "pendingReview"],
            ["missing", "termUnconfirmed"],
            ["unavailable", "noticeUnavailable"],
          ] as const
        ).map(([status, label]) => {
          const group = banks.filter(
            (bank) => depositChecks[bank.id].status === status,
          );
          return (
            <details className="directory-group" key={status}>
              <summary>
                {t(locale, label)}{" "}
                <span>{numberText(locale, group.length)}</span>
              </summary>
              <ul className="bank-list">
                {group.map((bank) => (
                  <li key={bank.id}>
                    <a href={moneyPath(locale) + "/banks/" + bank.id}>
                      {bank.name}
                      <small>
                        {verificationDate(locale, depositChecks[bank.id].date)}
                      </small>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>
      <section>
        <h2>{t(locale, "availableBreakdowns")}</h2>
        <p>{t(locale, "coverageBreakdownIntro")}</p>
        {(
          [
            ["dollarCardFees", decodedCardTariffs, "dollarCardFees"],
            ["mobileBankingFees", decodedMobileTariffs, "mobileBankingFees"],
          ] as const
        ).map(([label, rows, product]) => (
          <details className="directory-group" key={label}>
            <summary>
              {t(locale, label)} <span>{numberText(locale, rows.length)}</span>
            </summary>
            <ul className="bank-list">
              {rows.map(({ id, reading }) => (
                <li key={id}>
                  <a
                    href={
                      moneyPath(locale) +
                      "/banks/compare?a=" +
                      id +
                      "&product=" +
                      product
                    }
                  >
                    {banks.find((bank) => bank.id === id)?.name}
                    <small>
                      {reading.product} · {reading.edition[locale]}
                    </small>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ))}
        <details className="directory-group">
          <summary>
            {t(locale, "officialSchedule")}{" "}
            <span>{numberText(locale, Object.keys(tariffCatalog).length)}</span>
          </summary>
          <ul className="bank-list">
            {banks
              .filter((bank) => tariffCatalog[bank.id])
              .map((bank) => (
                <li key={bank.id}>
                  <a href={tariffCatalog[bank.id]}>{bank.name}</a>
                </li>
              ))}
          </ul>
        </details>
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
