"use client";

import { useId, useRef, useState } from "react";
import { findBanks } from "../data/banks";
import { moneyPath, t, type Locale } from "./copy";

export function BankSearch({
  locale,
  query = "",
}: {
  locale: Locale;
  query?: string;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const [value, setValue] = useState(query);
  const [open, setOpen] = useState(false);
  const path = moneyPath(locale) + "/banks";
  const matches = open ? findBanks(value).slice(0, 5) : [];

  return (
    <form
      action={path}
      className="bank-search bank-search-live"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && matches.length) {
          event.preventDefault();
          input.current?.focus();
          setOpen(false);
        }
      }}
    >
      <label className="search-prompt" htmlFor={inputId}>
        {t(locale, "searchHint")}
      </label>
      <input
        id={inputId}
        ref={input}
        type="search"
        name="q"
        maxLength={100}
        required
        placeholder={t(locale, "searchExample")}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && first.current) {
            event.preventDefault();
            first.current.focus();
          }
        }}
      />
      <button type="submit">{t(locale, "bankSearchAction")}</button>
      {matches.length > 0 && (
        <ul className="bank-suggestions">
          {matches.map(({ id, name }, index) => (
            <li key={id}>
              <a ref={index === 0 ? first : undefined} href={path + "/" + id}>
                {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
