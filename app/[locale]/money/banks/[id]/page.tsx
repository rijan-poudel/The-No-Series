import { serviceTerms } from "../../../../../src/data/service-terms";
import { verificationDate } from "../../../../../src/ui/verification-date";
import { BankProductCoverage } from "../../../../../src/ui/bank-product-coverage";
import { pageMetadata } from "../../../../../src/ui/page-metadata";
import { registerDetails } from "../../../../../src/data/bank-register-details";
import { notFound } from "next/navigation";
import { bankPublishers } from "../../../../../src/data/bank-publishers";
import { banks, registrySource } from "../../../../../src/data/banks";
import { tariffCatalog } from "../../../../../src/data/tariff-catalog";
import { noticeBanks } from "../../../../../src/editorial/live-notices";
import { readingsForBank } from "../../../../../src/data/tariffs";
import { isLocale, moneyPath, numberText, t } from "../../../../../src/ui/copy";
import { TariffDetails } from "../../../../../src/ui/tariff-reading";
import { Editorial } from "../../../../../src/ui/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const bank = banks.find((entry) => entry.id === id);
  if (!bank) notFound();
  return pageMetadata(locale, "bankFeesTitle", "searchHint", bank.name);
}

export default async function BankPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const bank = banks.find((entry) => entry.id === id);
  if (!isLocale(locale) || !bank) notFound();
  const facts = registerDetails[bank.id];
  const publisher = bankPublishers[bank.id];
  const [tariff, ...more] = readingsForBank(bank.id);
  return (
    <Editorial
      locale={locale}
      title={bank.name}
      back={moneyPath(locale) + "/banks"}
    >
      <p className="bank-class">
        {t(
          locale,
          bank.kind === "commercial" ? "commercialBank" : "developmentBank",
        )}
      </p>
      <dl className="profile-facts">
        <div>
          <dt>{t(locale, "headOffice")}</dt>
          <dd>{bank.office[locale]}</dd>
        </div>
        <div>
          <dt>{t(locale, "workingArea")}</dt>
          <dd>{bank.area[locale]}</dd>
        </div>
        <div>
          <dt>
            {t(
              locale,
              facts.jointOperation ? "jointOperationDate" : "operationDate",
            )}
          </dt>
          <dd>
            <time dateTime={facts.operationDate}>
              {new Intl.DateTimeFormat(
                locale === "ne" ? "ne-NP-u-ca-gregory" : "en-GB",
                { dateStyle: "long", timeZone: "UTC" },
              ).format(new Date(facts.operationDate))}
            </time>
          </dd>
        </div>
        <div>
          <dt>{t(locale, "paidUp")}</dt>
          <dd>{numberText(locale, facts.paidUpCrore, 2)}</dd>
        </div>
      </dl>
      <p className="registry-credit">
        <a href={registrySource}>{t(locale, "registry")}</a> ·{" "}
        {t(locale, "registryEdition")}
      </p>
      <nav className="profile-actions">
        <a href={moneyPath(locale) + "/usage-cost?bank=" + id}>
          {t(locale, "usageCost")}
        </a>
        <a href={moneyPath(locale) + "/savings?bank=" + id}>
          {t(locale, "savingsAccounts")}
        </a>
        <a href={moneyPath(locale) + "/branches?bank=" + bank.id}>
          {t(locale, "branchFinder")}
        </a>
        <a href={moneyPath(locale) + "/banks/compare?a=" + bank.id}>
          {t(locale, "intentCompare")}
        </a>
        <a href={publisher.url}>
          {t(
            locale,
            publisher.kind === "rates"
              ? "publisherRates"
              : publisher.kind === "deposits"
                ? "publisherDeposits"
                : "publisherSite",
          )}
        </a>
        {tariffCatalog[id] && (
          <a href={tariffCatalog[id]}>{t(locale, "officialSchedule")}</a>
        )}
        {Object.hasOwn(noticeBanks, id) && (
          <a href={moneyPath(locale) + "/notices?bank=" + id}>
            {t(locale, "bankRates")}
          </a>
        )}
      </nav>
      <BankProductCoverage bank={bank} locale={locale} />
      {serviceTerms[bank.id] && (
        <section>
          <h2>{t(locale, "otherBankTerms")}</h2>
          <dl className="line-list">
            {serviceTerms[bank.id]?.map((term) => (
              <div key={term.subject.en}>
                <dt>{term.subject[locale]}</dt>
                <dd>
                  {term.detail[locale]}{" "}
                  <a href={term.url}>{t(locale, "officialSource")}</a>
                </dd>
              </div>
            ))}
          </dl>
          <p>
            {t(locale, "savingsChecked")}{" "}
            {verificationDate(locale, "2026-11-26")}
          </p>
        </section>
      )}
      {tariff ? (
        <section>
          <h2>{tariff.product}</h2>
          <TariffDetails tariff={tariff} locale={locale} />
        </section>
      ) : (
        <p>{t(locale, "tariffUnavailable")}</p>
      )}
      {more.map((reading) => (
        <details className="paper-disclosure" key={reading.product}>
          <summary>{reading.product}</summary>
          <TariffDetails tariff={reading} locale={locale} />
        </details>
      ))}
    </Editorial>
  );
}
