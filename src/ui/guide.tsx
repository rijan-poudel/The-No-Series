import { ChoiceField } from "./choice-field";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { payouts, type Product, type Release } from "../domain/model";
import {
  depositTerms,
  editorialPicks,
  feePriorities,
  priorityQuery,
  type Priority,
} from "../domain/picks";
import {
  amountText,
  local,
  moneyPath,
  numberText,
  productPath,
  t,
  titleFor,
  type Locale,
} from "./copy";

type Pick = ReturnType<typeof editorialPicks>["rows"][number];

function PickNote({
  row,
  locale,
  path,
  query,
}: {
  row: Pick;
  locale: Locale;
  path: string;
  query: string;
}) {
  const { offer, institution, evidence, value } = row;
  const keyIds = new Set(row.keyCitations);
  const keySources = evidence.filter((source) => keyIds.has(source.id));
  const otherSources = evidence.filter((source) => !keyIds.has(source.id));
  const sourceLinks = (sources: Pick["evidence"]) => (
    <ul>
      {sources.map((source) => (
        <li key={source.id}>
          <Link href={path + "/sources/" + source.id + query}>
            {local(locale, source.title)}
          </Link>
        </li>
      ))}
    </ul>
  );
  const deposit = offer.product === "fixed-deposits";
  return (
    <article className="pick-note">
      <div className="pick-line">
        <h3>{local(locale, institution.name)}</h3>
        <strong>
          {deposit
            ? numberText(locale, value, value.split(".")[1]?.length ?? 0) + "%"
            : amountText(locale, value)}
        </strong>
      </div>
      {deposit ? (
        <p className="pick-condition">
          {t(
            locale,
            offer.principal.value.includeMin ? "depositFrom" : "depositAbove",
          )}{" "}
          {amountText(locale, offer.principal.value.min)}
          {" · "}
          {t(
            locale,
            offer.principal.value.includeMax ? "depositUpTo" : "depositUnder",
          )}{" "}
          {amountText(locale, offer.principal.value.max)}
        </p>
      ) : (
        offer.account.value === "yes" && (
          <p className="pick-condition">{t(locale, "accountNeeded")}</p>
        )
      )}
      <p className="pick-catch">
        <strong>{t(locale, "catch")}</strong> {local(locale, offer.catch.value)}
      </p>
      <details className="paper-disclosure">
        <summary>
          {t(locale, "viewEvidence")} <ChevronDown size={16} aria-hidden />
        </summary>
        <p>{local(locale, offer.name)}</p>
        {sourceLinks(keySources)}
        {otherSources.length > 0 && (
          <details className="paper-disclosure">
            <summary>
              {t(locale, "otherSources")} <ChevronDown size={16} aria-hidden />
            </summary>
            {sourceLinks(otherSources)}
          </details>
        )}
        {!institution.fictional && institution.officialUrl && (
          <a
            className="official-bank"
            href={institution.officialUrl}
            rel="noreferrer"
          >
            {t(locale, "official")}
          </a>
        )}
      </details>
    </article>
  );
}

const cardSources = [
  [
    "NMB Bank",
    "https://nmb.com.np/en/products/cards/prepaid-card/nmb-visa-international-card",
    "nmbPublishedFees",
  ],
  [
    "Nabil iCard",
    "https://cdn.nabilbank.com/services-payments/services/nabil-icard",
    "accountNeeded",
  ],
  [
    "Global IME E-Com Card",
    "https://www.globalimebank.com/products/cards/e-com-card-usd-dollar-card-nepal/",
    "accountNeeded",
  ],
] as const;

function CardSources({
  locale,
  selected,
}: {
  locale: Locale;
  selected: boolean;
}) {
  return (
    <section className="card-sources" id={selected ? "picks" : "fees"}>
      <h2>{t(locale, "officialCardSources")}</h2>
      <ul className="card-source-list">
        {cardSources.map(([name, href, note]) => (
          <li key={href}>
            <a href={href} rel="noreferrer">
              {name}
            </a>
            <p>{t(locale, note)}</p>
          </li>
        ))}
      </ul>
      <a
        className="trust-link"
        href="https://nmb.com.np/np/download/standard-tariff-charges"
        rel="noreferrer"
      >
        {t(locale, "nmbTariff")}
      </a>
    </section>
  );
}

export function CategoryGuide({
  locale,
  product,
  choice,
  release,
  clock,
  unavailable,
}: {
  locale: Locale;
  product: Product;
  choice: Priority | null;
  release: Release;
  clock: Date;
  unavailable: boolean;
}) {
  const path = productPath(locale, product);
  const deposit = product === "fixed-deposits";
  const results = choice && editorialPicks(choice, release, clock);
  const query = priorityQuery(choice);
  const rows = results ? results.rows : [];
  const first = rows[0];
  const tied = results ? results.leaders : [];
  const form = (
    <form action={path + "#picks"} className="priority-form guide-form">
      {deposit ? (
        <>
          <ChoiceField
            name="term"
            label={t(locale, "term")}
            value={choice?.product === "fixed-deposits" ? choice.term : 12}
            options={depositTerms.map((term) => [
              term,
              numberText(locale, term) + " " + t(locale, "months"),
            ])}
          />
          <ChoiceField
            name="payout"
            label={t(locale, "payout")}
            value={
              choice?.product === "fixed-deposits" ? choice.payout : "maturity"
            }
            options={payouts.map((payout) => [payout, t(locale, payout)])}
          />
        </>
      ) : (
        <>
          <ChoiceField
            name="fee"
            label={t(locale, "chooseFee")}
            value={choice?.product === "dollar-cards" ? choice.fee : "issuance"}
            options={feePriorities.map((fee) => [
              fee,
              t(
                locale,
                fee === "issuance"
                  ? fee
                  : fee === "app"
                    ? "appFee"
                    : "branchFee",
              ),
            ])}
          />
          <ChoiceField
            name="form"
            label={t(locale, "cardFormat")}
            value={choice?.product === "dollar-cards" ? choice.form : "virtual"}
            options={[
              ["virtual", t(locale, "virtual")],
              ["physical", t(locale, "physical")],
            ]}
          />
        </>
      )}
      <button type="submit">{t(locale, "seePicks")}</button>
    </form>
  );
  return (
    <div className="paper-guide container">
      <h1>{t(locale, titleFor(product))}</h1>
      <section className="catch-paper">
        <h2>{t(locale, "catch")}</h2>
        <p>{t(locale, deposit ? "depositCatchLead" : "cardCatchLead")}</p>
      </section>
      {!deposit && !first && (
        <CardSources locale={locale} selected={choice !== null} />
      )}
      {!choice && deposit ? (
        <div className="priority-sheet">{form}</div>
      ) : (
        <details className="priority-sheet">
          <summary>
            {t(locale, choice ? "changePriority" : "guideOptions")}{" "}
            <ChevronDown size={16} aria-hidden />
          </summary>
          {form}
        </details>
      )}
      {results && choice && (deposit || first) && (
        <section className="paper-picks" id="picks">
          <h2>
            {t(
              locale,
              !first
                ? "yourOptions"
                : choice.product === "fixed-deposits"
                  ? "highestRate"
                  : "lowestFee",
            )}
          </h2>
          <p className="pick-condition">
            {choice.product === "fixed-deposits"
              ? [
                  numberText(locale, choice.term) + " " + t(locale, "months"),
                  t(locale, choice.payout),
                  "NPR",
                ].join(" · ")
              : [
                  t(locale, choice.form),
                  t(
                    locale,
                    choice.fee === "issuance"
                      ? "issuance"
                      : choice.fee === "app"
                        ? "appFee"
                        : "branchFee",
                  ),
                ].join(" · ")}
            {" · "}
            {t(locale, "individual")}
          </p>
          {release.kind === "demo" && (
            <p className="demo-banner">{t(locale, "demo")}</p>
          )}
          {first ? (
            <>
              {tied.map((row) => (
                <PickNote
                  key={row.offer.id}
                  row={row}
                  locale={locale}
                  path={path}
                  query={query}
                />
              ))}
              {rows.length > tied.length && (
                <details className="paper-disclosure">
                  <summary>
                    {t(locale, "otherOptions")}{" "}
                    <ChevronDown size={16} aria-hidden />
                  </summary>
                  {rows.slice(tied.length).map((row) => (
                    <PickNote
                      key={row.offer.id}
                      row={row}
                      locale={locale}
                      path={path}
                      query={query}
                    />
                  ))}
                </details>
              )}
            </>
          ) : (
            <>
              <p className="empty-note">
                {t(
                  locale,
                  unavailable
                    ? "unavailablePicks"
                    : release.revoked
                      ? "revoked"
                      : "noVerifiedPicks",
                )}
              </p>
              {release.kind === "public" &&
                choice.product === "fixed-deposits" && (
                  <Link
                    className="trust-link"
                    href={moneyPath(locale) + "/notices?term=" + choice.term}
                  >
                    {t(locale, "bankNotices")}
                  </Link>
                )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
