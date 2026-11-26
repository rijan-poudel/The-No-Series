import {
  savingsReadings,
  savingsEdition,
  savingsChecked,
} from "../../../../../src/data/savings";
import {
  savingsBalance,
  minimumStatus,
} from "../../../../../src/domain/savings-balance";
import { verificationDate } from "../../../../../src/ui/verification-date";
import {
  BankPairForm,
  type PairProduct,
} from "../../../../../src/ui/bank-pair-form";
import { CopyComparisonLink } from "../../../../../src/ui/copy-comparison-link";
import { notFound } from "next/navigation";
import { bankPublishers } from "../../../../../src/data/bank-publishers";
import { tariffCatalog } from "../../../../../src/data/tariff-catalog";
import { banks, registrySource } from "../../../../../src/data/banks";
import {
  cardFeeEvents,
  decodedCardTariffs,
  decodedMobileTariffs,
  readingsForBank,
  type TariffReading,
} from "../../../../../src/data/tariffs";
import { depositTerms } from "../../../../../src/domain/picks";
import { liveNotices } from "../../../../../src/data/live-notices";
import { noticeBanks } from "../../../../../src/editorial/live-notices";
import { Editorial } from "../../../../../src/ui/editorial";
import { pageMetadata } from "../../../../../src/ui/page-metadata";
import {
  t,
  local,
  amountText,
  numberText,
  moneyPath,
  isLocale,
  type Locale,
  type Label,
} from "../../../../../src/ui/copy";

const options = banks.map(({ id, name }) => {
  const coverage: PairProduct[] = [];
  if (savingsReadings[id]) coverage.push("savingsAccounts");
  if (Object.hasOwn(noticeBanks, id)) coverage.push("fixed");
  if (decodedCardTariffs.some((row) => row.id === id))
    coverage.push("dollarCardFees");
  if (decodedMobileTariffs.some((row) => row.id === id))
    coverage.push("mobileBankingFees");
  return { id, name, coverage };
});
type Params = Promise<{ locale: string }>;
export async function generateMetadata({ params }: { params: Params }) {
  return pageMetadata((await params).locale, "intentCompare", "pairIntro");
}

type Charge = TariffReading["charges"][number];
const criteria: {
  label: Label;
  product: "mobileBankingFees" | "dollarCardFees";
  match: (fee: Charge) => boolean;
}[] = [
  {
    product: "mobileBankingFees",
    label: "mobileSignupFee",
    match: (fee) => !!fee.registrationBasis,
  },
  {
    product: "mobileBankingFees",
    label: "mobileAnnualFee",
    match: (fee) => !!fee.annualBasis,
  },
  {
    product: "mobileBankingFees",
    label: "comparePinReset",
    match: (fee) => !!fee.pinResetChannel,
  },
  ...cardFeeEvents.map((event) => ({
    product: "dollarCardFees" as const,
    label: (event === "renewal" ? "cardRenewal" : event) as Label,
    match: (fee: Charge) => fee.cardFee?.event === event,
  })),
];

function feeCell(
  locale: Locale,
  entries: { reading: TariffReading; fee: Charge }[],
) {
  if (!entries.length) return t(locale, "mobileFeeUnknown");
  return entries.map(({ reading, fee }) => (
    <div className="fee-cell" key={reading.product + fee.event.en}>
      <strong>
        {fee.unit === "percent"
          ? numberText(locale, fee.value) + "%"
          : amountText(locale, fee.value, fee.unit)}
      </strong>
      <span>{local(locale, fee.event)}</span>
      {(fee.registrationBasis === "per-account" ||
        fee.annualBasis === "per-account") && (
        <small>{t(locale, "feePerAccount")}</small>
      )}
      {fee.pinResetChannel === "unspecified" && (
        <small>{t(locale, "pinResetChannelUnknown")}</small>
      )}
      {fee.cardFee?.scope && <span>{t(locale, fee.cardFee.scope)}</span>}
      {fee.minimumUsd && (
        <span>
          {t(locale, "feeMinimum")} {amountText(locale, fee.minimumUsd, "USD")}
        </span>
      )}
      <small>
        {reading.product} ·{" "}
        <a href={reading.source}>
          {local(locale, reading.edition)} · {reading.section}
        </a>
      </small>
    </div>
  ));
}

export default async function CompareBanks({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{
    a?: string;
    b?: string;
    term?: string;
    product?: string;
    fees?: string;
    balance?: string | string[];
  }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const {
    a,
    b,
    term: requestedTerm,
    product,
    fees,
    balance,
  } = await searchParams;
  const focus: PairProduct =
    product === "fixed" ||
    product === "savingsAccounts" ||
    product === "mobileBankingFees" ||
    product === "dollarCardFees"
      ? product
      : "all";
  const showSavings = focus === "all" || focus === "savingsAccounts";
  const planned = savingsBalance(showSavings ? balance : undefined);
  const showDeposits = focus === "all" || focus === "fixed";
  const term =
    depositTerms.find((value) => String(value) === requestedTerm) ?? 12;
  const left = banks.find((bank) => bank.id === a),
    right = banks.find((bank) => bank.id === b);
  const selected = left && right && left !== right ? [left, right] : [];
  const path = moneyPath(locale) + "/banks";
  const notices =
    showDeposits && selected.some((bank) => Object.hasOwn(noticeBanks, bank.id))
      ? await liveNotices()
      : [];
  const feeRows = criteria
    .filter((row) => focus === "all" || row.product === focus)
    .map((row) => {
      const cells = selected.map((bank) =>
        readingsForBank(bank.id).flatMap((reading) =>
          reading.charges.filter(row.match).map((fee) => ({ reading, fee })),
        ),
      );
      return {
        ...row,
        cells,
        both: cells.length === 2 && cells.every((cell) => cell.length > 0),
      };
    });
  const filter = fees === "both" || fees === "gaps" ? fees : "all";
  const shownFees = feeRows.filter(
    (row) => filter === "all" || row.both === (filter === "both"),
  );
  function filterHref(value: string) {
    const query = new URLSearchParams({
      a: left?.id ?? "",
      b: right?.id ?? "",
      product: focus,
      term: String(term),
    });
    if (planned.text) query.set("balance", planned.text);
    if (value !== "all" && feeRows.length) query.set("fees", value);
    return path + "/compare?" + query + "#results";
  }
  return (
    <Editorial locale={locale} title={t(locale, "intentCompare")} back={path}>
      <p>{t(locale, "pairIntro")}</p>
      <BankPairForm
        key={[focus, left?.id, right?.id, term, planned.text].join("/")}
        locale={locale}
        options={options}
        initialProduct={focus}
        first={left?.id ?? ""}
        second={left === right ? "" : (right?.id ?? "")}
        term={term}
        terms={depositTerms}
        balance={planned.text}
      />
      {planned.invalid && <p role="alert">{t(locale, "balanceInvalid")}</p>}
      {a && b && !selected.length && (
        <p role="status">{t(locale, "differentBanks")}</p>
      )}
      {selected.length > 0 && (
        <section
          id="results"
          tabIndex={-1}
          aria-label={t(locale, "intentCompare")}
        >
          {feeRows.length > 0 && <p>{t(locale, "feeContext")}</p>}
          {showDeposits && <p>{t(locale, "noticeScope")}</p>}
          {feeRows.length > 0 && (
            <nav className="fee-view" aria-label={t(locale, "filterFeeRows")}>
              {(
                [
                  ["all", "allFeeRows", feeRows.length],
                  [
                    "both",
                    "bothFeeRows",
                    feeRows.filter((row) => row.both).length,
                  ],
                  [
                    "gaps",
                    "gapFeeRows",
                    feeRows.filter((row) => !row.both).length,
                  ],
                ] as const
              ).map(([value, label, count]) => (
                <a
                  key={value}
                  href={filterHref(value)}
                  aria-current={value === filter ? "page" : undefined}
                >
                  {t(locale, label)} <span>{numberText(locale, count)}</span>
                </a>
              ))}
            </nav>
          )}
          <table className="mobile-fee-table pair-table">
            <caption>{t(locale, "intentCompare")}</caption>
            <thead>
              <tr>
                <th scope="col">{t(locale, "mobileFeeBank")}</th>
                {selected.map((bank) => (
                  <th scope="col" key={bank.id}>
                    <a href={path + "/" + bank.id}>{bank.name}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <a href={registrySource}>{t(locale, "workingArea")}</a>
                  <small>{t(locale, "registryEdition")}</small>
                </th>
                {selected.map((bank) => (
                  <td key={bank.id}>{local(locale, bank.area)}</td>
                ))}
              </tr>
              {showSavings && (
                <>
                  <tr>
                    <th scope="row">
                      {t(locale, "savingsAccounts")}
                      <small>
                        {savingsEdition[locale]} ·{" "}
                        {verificationDate(locale, savingsChecked)}
                      </small>
                    </th>
                    {selected.map((bank) => {
                      const reading = savingsReadings[bank.id];
                      return (
                        <td key={bank.id}>
                          {reading ? (
                            <a href={reading.source}>{reading.account}</a>
                          ) : (
                            t(locale, "noSavingsReading")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th scope="row">{t(locale, "yearlyRate")}</th>
                    {selected.map((bank) => {
                      const reading = savingsReadings[bank.id];
                      return (
                        <td key={bank.id}>
                          {reading
                            ? numberText(locale, reading.annualPercent, 2) + "%"
                            : t(locale, "unknown")}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th scope="row">{t(locale, "savingsMinimum")}</th>
                    {selected.map((bank) => {
                      const reading = savingsReadings[bank.id];
                      const minimum = reading?.minimumNpr;
                      return (
                        <td key={bank.id}>
                          {minimum == null
                            ? t(locale, "balanceUnknown")
                            : amountText(locale, minimum)}
                          {reading?.minimumSource && (
                            <small>
                              <a href={reading.minimumSource}>
                                {t(locale, "accountTerms")}
                              </a>
                            </small>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {planned.amount && (
                    <tr>
                      <th scope="row">
                        {t(locale, "balanceStatus")}
                        <small>{amountText(locale, planned.amount)}</small>
                      </th>
                      {selected.map((bank) => (
                        <td key={bank.id}>
                          {t(
                            locale,
                            minimumStatus(
                              planned.amount!,
                              savingsReadings[bank.id]?.minimumNpr,
                            ),
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </>
              )}
              {showDeposits && (
                <tr>
                  <th scope="row">
                    {t(locale, "fixed")} · {numberText(locale, term)}{" "}
                    {t(locale, "months")}
                  </th>
                  {selected.map((bank) => {
                    const notice = notices.find(
                      (entry) => entry.bank === bank.id,
                    );
                    const rate = notice?.rates.find((row) => row.term === term);
                    return (
                      <td key={bank.id}>
                        {notice && rate ? (
                          <>
                            <strong>
                              {numberText(locale, rate.rate.slice(0, -1))}%
                            </strong>
                            <small>
                              <a href={noticeBanks[notice.bank].url}>
                                {notice.effective}
                              </a>
                            </small>
                          </>
                        ) : (
                          t(locale, "mobileFeeUnknown")
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}
              {feeRows.length > 0 && shownFees.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    {t(
                      locale,
                      filter === "both" ? "noSharedFeeRows" : "noGapFeeRows",
                    )}
                  </td>
                </tr>
              )}
              {shownFees.map(({ label, product, cells }) => (
                <tr key={label}>
                  <th scope="row">
                    {t(locale, product)} · {t(locale, label)}
                  </th>
                  {selected.map((bank, index) => (
                    <td key={bank.id}>{feeCell(locale, cells[index])}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">{t(locale, "officialSources")}</th>
                {selected.map((bank) => {
                  const publisher = bankPublishers[bank.id];
                  const tariff = tariffCatalog[bank.id];
                  return (
                    <td key={bank.id}>
                      {(showDeposits || showSavings || !tariff) && (
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
                      )}
                      {feeRows.length > 0 && tariff && (
                        <div>
                          <a href={tariff}>{t(locale, "officialSchedule")}</a>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          <CopyComparisonLink
            key={filterHref(filter)}
            locale={locale}
            path={filterHref(filter)}
          />
        </section>
      )}
    </Editorial>
  );
}
