import Link from "next/link";
import {
  ArrowUpRight,
  BadgeInfo,
  ChevronDown,
  CircleHelp,
  Pin,
} from "lucide-react";
import { useState } from "react";
import type { Comparison, Row } from "../domain/engine";
import type { Product } from "../domain/model";
import {
  amountText,
  intlLocale,
  local,
  moneyPath,
  numberText,
  productPath,
  t,
  type Label,
  type Locale,
} from "./copy";

function figure(locale: Locale, value: string | null) {
  return value === null ? t(locale, "unknown") : amountText(locale, value);
}

function ResultRow({
  locale,
  row,
  pins,
  togglePin,
}: {
  locale: Locale;
  row: Row;
  pins: string[];
  togglePin: (id: string) => void;
}) {
  const { offer, calculation, institution } = row;
  const path = productPath(locale, offer.product);
  const pinned = pins.includes(offer.id);
  const withdrawal =
    offer.product === "fixed-deposits" ? offer.withdrawal?.value : undefined;
  return (
    <article className="result-card">
      <div className="result-head">
        <div>
          <h3>{local(locale, institution.name)}</h3>
          <p>
            {local(locale, offer.name)}{" "}
            {institution.fictional && (
              <span className="fiction-tag">{t(locale, "fictional")}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          className="pin-button"
          aria-pressed={pinned}
          disabled={!pinned && pins.length === 3}
          onClick={() => togglePin(offer.id)}
        >
          <Pin size={17} aria-hidden />
          <span>{t(locale, pinned ? "remove" : "pin")}</span>
        </button>
      </div>
      <dl className="result-figures">
        {offer.product === "fixed-deposits" && (
          <>
            <div>
              <dt>{t(locale, "annualRate")}</dt>
              <dd>
                {numberText(
                  locale,
                  offer.rate.value,
                  Math.max(2, offer.rate.value.split(".")[1]?.length ?? 0),
                )}
                %
              </dd>
            </div>
            <div>
              <dt>{t(locale, "payout")}</dt>
              <dd className="figure-small">{t(locale, offer.payout.value)}</dd>
            </div>
          </>
        )}
        <div>
          <dt>
            {t(
              locale,
              offer.product === "fixed-deposits" ? "net" : "totalCost",
            )}
          </dt>
          <dd>{figure(locale, calculation.primary)}</dd>
        </div>
      </dl>
      <div className="result-catch">
        <BadgeInfo size={19} aria-hidden />
        <div>
          <strong>{t(locale, "catch")}</strong>
          <p>{local(locale, offer.catch.value)}</p>
        </div>
      </div>
      <details className="result-details">
        <summary>
          <span>{t(locale, "breakdown")}</span>
          <ChevronDown size={17} aria-hidden />
        </summary>
        {calculation.unsupported && <p>{t(locale, "unsupportedEstimate")}</p>}
        <dl className="line-list">
          {calculation.lines.map(({ key, value, citations }) => (
            <div key={key}>
              <dt>
                {t(locale, key as Label)}{" "}
                {citations.slice(0, 1).map((id) => (
                  <Link
                    key={id}
                    className="source-link"
                    href={path + "/sources/" + id}
                    aria-label={
                      t(locale, "evidence") + " · " + t(locale, key as Label)
                    }
                  >
                    <ArrowUpRight size={15} aria-hidden />
                  </Link>
                ))}
              </dt>
              <dd>{figure(locale, value)}</dd>
            </div>
          ))}
        </dl>
        {calculation.ledger.length > 0 && (
          <>
            <h4>{t(locale, "payoutSchedule")}</h4>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {(["date", "gross", "tax", "paid"] as const).map(
                      (label) => (
                        <th key={label}>{t(locale, label)}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {calculation.ledger.map((entry) => (
                    <tr key={entry.month}>
                      <th scope="row">
                        <time dateTime={entry.date}>{entry.date}</time>
                      </th>
                      <td>{figure(locale, entry.gross)}</td>
                      <td>{figure(locale, entry.tax)}</td>
                      <td>{figure(locale, entry.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {offer.product === "fixed-deposits" && (
          <>
            <h4>{t(locale, "withdrawal")}</h4>
            {withdrawal && (
              <p>
                {local(
                  locale,
                  "policy" in withdrawal ? withdrawal.policy : withdrawal,
                )}
              </p>
            )}
            <p>{t(locale, "withdrawalUnknown")}</p>
          </>
        )}
        <h4>{t(locale, "evidence")}</h4>
        <ul className="evidence-list">
          {row.evidence.map(({ id, title }) => (
            <li key={id}>
              <Link href={path + "/sources/" + id}>
                {local(locale, title)} <ArrowUpRight size={15} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        {row.corrections.map((correction) => (
          <div className="result-catch" key={correction.id}>
            <BadgeInfo size={19} aria-hidden />
            <div>
              <strong>
                {t(locale, "correction")} ·{" "}
                <time dateTime={correction.date}>{correction.date}</time>
              </strong>
              <p>{local(locale, correction.note)}</p>
            </div>
          </div>
        ))}
        <div className="row-links">
          {institution.officialUrl && (
            <a href={institution.officialUrl} rel="noreferrer">
              {t(locale, "official")} <ArrowUpRight size={16} aria-hidden />
            </a>
          )}
          <Link href={path + "/report?offer=" + encodeURIComponent(offer.id)}>
            {t(locale, "report")} <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
      </details>
    </article>
  );
}

export function ComparisonResults({
  locale,
  product,
  result,
  pins,
  togglePin,
}: {
  locale: Locale;
  product: Product;
  result: Comparison;
  pins: string[];
  togglePin: (id: string) => void;
}) {
  const [sort, setSort] = useState("estimate");
  const collator = new Intl.Collator(intlLocale(locale));
  const ordered =
    sort === "institution"
      ? result.groups.map((group) => ({
          ...group,
          rows: [...group.rows].sort((a, b) =>
            collator.compare(
              local(locale, a.institution.name),
              local(locale, b.institution.name),
            ),
          ),
        }))
      : result.groups;
  const pinned = result.groups
    .flatMap(({ rows }) => rows)
    .filter(({ offer }) => pins.includes(offer.id));
  const isDeposit = product === "fixed-deposits";
  const synopsis =
    numberText(locale, result.eligible) +
    " " +
    t(locale, "offers").toLowerCase();
  return (
    <div className="results-body">
      <section aria-label={t(locale, "coverage")} className="coverage-strip">
        <div role="status">
          <strong>{synopsis}</strong>
          <span>
            {numberText(locale, result.reviewed)}{" "}
            {t(locale, "reviewed").toLowerCase()}
          </span>
        </div>
        <Link href={moneyPath(locale) + "/coverage"}>
          {t(locale, "coverage")} <ArrowUpRight size={16} aria-hidden />
        </Link>
      </section>
      {Object.keys(result.exclusions).length > 0 && (
        <details className="exclusions">
          <summary>
            {t(locale, "coverage")} <ChevronDown size={16} aria-hidden />
          </summary>
          <dl className="line-list">
            {Object.entries(result.exclusions).map(([key, count]) => (
              <div key={key}>
                <dt>{t(locale, key as Label)}</dt>
                <dd>{numberText(locale, count)}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      {result.status !== "ready" && (
        <section className="empty">
          <div className="intent-icon">
            <CircleHelp size={24} aria-hidden />
          </div>
          <h2>{t(locale, result.status)}</h2>
          <p>{t(locale, (result.status + "Body") as Label)}</p>
          <Link className="trust-link" href={moneyPath(locale) + "/coverage"}>
            {t(locale, "coverage")} <ArrowUpRight size={16} aria-hidden />
          </Link>
        </section>
      )}
      {result.status === "ready" && (
        <>
          <div className="result-toolbar">
            <p className="result-policy">
              {t(locale, isDeposit ? "netSort" : "card")} ·{" "}
              <time dateTime={result.date}>{result.date}</time>
            </p>
            <label className="field">
              <span>{t(locale, "sort")}</span>
              <span className="select-wrap">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="estimate">{t(locale, "sortEstimate")}</option>
                  <option value="institution">
                    {t(locale, "sortInstitution")}
                  </option>
                </select>
                <ChevronDown size={16} aria-hidden />
              </span>
            </label>
          </div>
          {ordered.map(({ key, rows }) => (
            <section className="result-group" key={key}>
              <h2>{t(locale, key)}</h2>
              {rows.map((row) => (
                <ResultRow
                  key={row.offer.id}
                  row={row}
                  locale={locale}
                  pins={pins}
                  togglePin={togglePin}
                />
              ))}
            </section>
          ))}
          {pinned.length > 0 && (
            <section className="pinned-board">
              <h2>{t(locale, "pinned")}</h2>
              <p>{t(locale, "pinnedLimit")}</p>
              <div className="pinned-grid">
                {pinned.map(({ offer, institution, calculation }) => (
                  <div key={offer.id}>
                    <h3>{local(locale, institution.name)}</h3>
                    {institution.fictional && (
                      <span className="fiction-tag">
                        {t(locale, "fictional")}
                      </span>
                    )}
                    <dl>
                      <div>
                        <dt>{t(locale, isDeposit ? "net" : "totalCost")}</dt>
                        <dd>{figure(locale, calculation.primary)}</dd>
                      </div>
                      {offer.product === "fixed-deposits" && (
                        <div>
                          <dt>{t(locale, "payout")}</dt>
                          <dd>{t(locale, offer.payout.value)}</dd>
                        </div>
                      )}
                    </dl>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => togglePin(offer.id)}
                    >
                      {t(locale, "remove")}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
