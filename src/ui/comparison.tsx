"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Comparison } from "../domain/engine";
import {
  digits,
  scenarioSchema,
  type Scenario,
  type Product,
} from "../domain/model";
import {
  amountText,
  numberText,
  productPath,
  t,
  titleFor,
  type Label,
  type Locale,
} from "./copy";
import { ComparisonResults } from "./results";

type Draft = Record<string, string>;
type Visit = {
  draft: Draft;
  result?: Comparison;
  scenario?: Scenario;
  pins: string[];
};
const visit = new Map<Product, Visit>();
const defaults = {
  "fixed-deposits": {
    amount: "",
    months: "12",
    currency: "NPR",
    payout: "any",
    customer: "individual",
  },
  "dollar-cards": {
    reloads: "5",
    channel: "app",
    form: "any",
    account: "yes",
    years: "1",
    customer: "individual",
  },
} satisfies Record<Product, Draft>;

const presetTerms = [3, 6, 12, 24] as const;

function whole(text: string) {
  const input = digits(text.trim());
  return /^\d{1,3}$/.test(input) ? Number(input) : NaN;
}

export function ComparisonFlow({
  product,
  locale,
  date,
  demo,
}: {
  product: Product;
  locale: Locale;
  date: string;
  demo: boolean;
}) {
  const deposit = product === "fixed-deposits";
  const [state, setState] = useState<Visit>({
    draft: defaults[product],
    pins: [],
  });
  const [errors, setErrors] = useState<Record<string, Label>>({});
  const [error, setError] = useState<Label>();
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const current = useRef(state);
  const controller = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLParagraphElement>(null);
  const focusAfterRender = useRef(false);

  useEffect(() => {
    const remembered = visit.get(product);
    if (remembered) {
      current.current = remembered;
      setState(remembered);
    }
    const onHash = () => setShowResult(location.hash === "#results");
    onHash();
    window.addEventListener("popstate", onHash);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("popstate", onHash);
      window.removeEventListener("hashchange", onHash);
      controller.current?.abort();
    };
  }, [product]);

  const displayingResult = !!(showResult && state.result && state.scenario);
  useEffect(() => {
    if (focusAfterRender.current) heading.current?.focus();
    focusAfterRender.current = false;
  }, [displayingResult]);

  function remember(value: Visit) {
    current.current = value;
    visit.set(product, value);
    setState(value);
  }

  function setField(name: string, value: string) {
    remember({
      ...current.current,
      draft: { ...current.current.draft, [name]: value },
    });
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
    setError(undefined);
  }

  function step(results: boolean) {
    focusAfterRender.current = true;
    if (location.hash !== (results ? "#results" : "")) {
      history.pushState(
        null,
        "",
        location.pathname + (results ? "#results" : ""),
      );
    }
    setShowResult(results);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (controller.current) return;
    setError(undefined);
    const draft = current.current.draft;
    const parsed = scenarioSchema.safeParse(
      deposit
        ? { product, ...draft, months: whole(draft.months) }
        : {
            product,
            ...draft,
            years: whole(draft.years),
            reloads: whole(draft.reloads),
          },
    );
    if (!parsed.success) {
      const labels: Record<string, Label> = {
        amount: "amountError",
        months: "termError",
        reloads: "reloadError",
      };
      const invalidFields = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          labels[String(issue.path[0])] ?? "invalid",
        ]),
      );
      setErrors(invalidFields);
      const first = Object.keys(invalidFields)[0];
      requestAnimationFrame(() =>
        (
          form.current?.elements.namedItem(first) as HTMLElement | null
        )?.focus?.(),
      );
      return;
    }
    setErrors({});
    setLoading(true);
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await fetch("/api/v1/compare/" + product, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(10000)]),
      });
      if (!response.ok) throw new Error("Comparison request failed");
      const result = (await response.json()) as Comparison;
      if (request.signal.aborted) return;
      remember({ ...current.current, result, scenario: parsed.data, pins: [] });
      step(true);
    } catch {
      if (!request.signal.aborted) {
        setError(navigator.onLine ? "failure" : "offline");
        requestAnimationFrame(() => feedback.current?.focus());
      }
    } finally {
      if (controller.current === request) controller.current = null;
      if (!request.signal.aborted) setLoading(false);
    }
  }

  function options(
    name: string,
    label: Label,
    items: readonly (readonly [string, Label | null])[],
  ) {
    return (
      <label className="field">
        <span>{t(locale, label)}</span>
        <span className="select-wrap">
          <select
            name={name}
            value={state.draft[name]}
            onChange={(event) => setField(name, event.target.value)}
          >
            {items.map(([value, title]) => (
              <option value={value} key={value}>
                {title ? t(locale, title) : value}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden />
        </span>
      </label>
    );
  }

  function field(name: string, label: Label, placeholder?: string) {
    const fieldError = errors[name];
    return (
      <label className="field">
        <span>{t(locale, label)}</span>
        <input
          name={name}
          type="text"
          inputMode={name === "amount" ? "decimal" : "numeric"}
          autoComplete="off"
          spellCheck={false}
          maxLength={name === "amount" ? 30 : 3}
          value={state.draft[name]}
          placeholder={placeholder}
          aria-invalid={!!fieldError}
          aria-describedby={fieldError ? name + "-error" : undefined}
          onChange={(event) => setField(name, event.target.value)}
        />
        {fieldError && (
          <span id={name + "-error"} className="field-error">
            {t(locale, fieldError)}
          </span>
        )}
      </label>
    );
  }

  function togglePin(id: string) {
    const pins = current.current.pins;
    if (!pins.includes(id) && pins.length === 3) return;
    remember({
      ...current.current,
      pins: pins.includes(id)
        ? pins.filter((pin) => pin !== id)
        : [...pins, id],
    });
  }

  const scenario = state.scenario;
  const result = state.result;
  return (
    <div className="container flow">
      <div className="trail">
        {displayingResult ? (
          <button className="text-button" onClick={() => step(false)}>
            <ArrowLeft size={17} aria-hidden /> {t(locale, "edit")}
          </button>
        ) : (
          <Link href={productPath(locale, product)}>
            <ArrowLeft size={17} aria-hidden /> {t(locale, titleFor(product))}
          </Link>
        )}
      </div>
      {demo && (
        <div className="demo-banner">
          <Info size={18} aria-hidden />
          {t(locale, "demo")}
        </div>
      )}
      <div className="flow-title">
        <div className="step-title">
          <span aria-current={!displayingResult ? "step" : undefined}>
            {t(locale, "setup")}
          </span>
          <ChevronRight size={15} aria-hidden />
          <span aria-current={displayingResult ? "step" : undefined}>
            {t(locale, "outcome")}
          </span>
        </div>
        <h1 tabIndex={-1} ref={heading}>
          {t(
            locale,
            displayingResult ? "results" : deposit ? "fdSetup" : "cardSetup",
          )}
        </h1>
        {!displayingResult && <p>{t(locale, "setupIntro")}</p>}
      </div>
      {displayingResult && result && scenario ? (
        <>
          <div className="scenario-chips" aria-label={t(locale, "setup")}>
            {scenario.product === "fixed-deposits" ? (
              <>
                <span>
                  {amountText(locale, scenario.amount, scenario.currency)}
                </span>
                <span>
                  {numberText(locale, scenario.months)} {t(locale, "months")}
                </span>
                <span>
                  {t(
                    locale,
                    scenario.payout === "any" ? "anyPayout" : scenario.payout,
                  )}
                </span>
              </>
            ) : (
              <>
                <span>{t(locale, scenario.channel)}</span>
                <span>
                  {numberText(locale, scenario.reloads)} {t(locale, "perYear")}
                </span>
                <span>
                  {t(locale, scenario.years === 1 ? "oneYear" : "twoYears")}
                </span>
              </>
            )}
            <span>{t(locale, scenario.customer)}</span>
          </div>
          <ComparisonResults
            locale={locale}
            product={product}
            result={result}
            pins={state.pins}
            togglePin={togglePin}
          />
        </>
      ) : (
        <form
          ref={form}
          onSubmit={submit}
          noValidate
          className="setup-grid"
          aria-busy={loading}
        >
          <fieldset className="form-panel" disabled={loading}>
            <legend className="visually-hidden">
              {t(locale, deposit ? "fdDetails" : "cardDetails")}
            </legend>
            <h2>{t(locale, deposit ? "fdDetails" : "cardDetails")}</h2>
            <div className="field-grid">
              {deposit ? (
                <>
                  {field(
                    "amount",
                    "deposit",
                    locale === "en" ? "1,00,000" : "१,००,०००",
                  )}
                  {options("currency", "currency", [
                    ["NPR", null],
                    ["USD", null],
                    ["EUR", null],
                    ["GBP", null],
                  ])}
                  <div className="term-field">
                    {field("months", "term")}
                    <div
                      role="group"
                      aria-label={t(locale, "commonTerms")}
                      className="term-presets"
                    >
                      {presetTerms.map((months) => (
                        <button
                          key={months}
                          type="button"
                          aria-pressed={whole(state.draft.months) === months}
                          onClick={() => setField("months", String(months))}
                        >
                          {numberText(locale, months)} {t(locale, "months")}
                        </button>
                      ))}
                    </div>
                  </div>
                  {options("payout", "payout", [
                    ["any", "anyPayout"],
                    ["maturity", "maturity"],
                    ["quarterly", "quarterly"],
                  ])}
                </>
              ) : (
                <>
                  {options("channel", "channel", [
                    ["app", "app"],
                    ["branch", "branch"],
                  ])}
                  {field("reloads", "reloads")}
                  {options("form", "form", [
                    ["any", "any"],
                    ["virtual", "virtual"],
                    ["physical", "physical"],
                  ])}
                  {options("years", "years", [
                    ["1", "oneYear"],
                    ["2", "twoYears"],
                  ])}
                  {options("account", "account", [
                    ["yes", "yes"],
                    ["no", "no"],
                  ])}
                </>
              )}
              {options("customer", "customer", [
                ["individual", "individual"],
                ["institutional", "institutional"],
              ])}
            </div>
            <div className="form-actions">
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  remember({ draft: defaults[product], pins: [] });
                  setErrors({});
                  setError(undefined);
                }}
              >
                {t(locale, "reset")}
              </button>
              <button className="button primary" type="submit">
                {t(locale, loading ? "checking" : "seeResults")}{" "}
                <ArrowRight size={20} aria-hidden />
              </button>
            </div>
            {error && (
              <p
                role="alert"
                tabIndex={-1}
                ref={feedback}
                className="field-error"
              >
                {t(locale, error)}
              </p>
            )}
          </fieldset>
          <aside className="assumption-panel">
            <details open>
              <summary>
                <Info size={19} aria-hidden />
                <span>{t(locale, "assumptions")}</span>
                <ChevronDown size={16} aria-hidden />
              </summary>
              <div className="assumption-copy">
                <span>{t(locale, "asOf")}</span>
                <strong>
                  <time dateTime={date}>{date}</time>
                </strong>
                <p>
                  {t(
                    locale,
                    deposit ? "depositAssumptions" : "cardAssumptions",
                  )}
                </p>
              </div>
            </details>
          </aside>
        </form>
      )}
    </div>
  );
}
