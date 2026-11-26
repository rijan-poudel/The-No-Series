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
  const suggestions = useRef<HTMLUListElement>(null);
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
        if (event.key === "Escape" && open && value.trim()) {
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
          const first = suggestions.current?.querySelector("a");
          if (event.key === "ArrowDown" && first) {
            event.preventDefault();
            first.focus();
          }
        }}
      />
      <button type="submit">{t(locale, "bankSearchAction")}</button>
      <div role="status" className="bank-search-status">
        {open && value.trim() && !matches.length
          ? t(locale, "noBanksFound")
          : ""}
      </div>
      {matches.length > 0 && (
        <ul
          className="bank-suggestions"
          ref={suggestions}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            const links = Array.from(event.currentTarget.querySelectorAll("a"));
            const index = links.findIndex((link) => link === event.target);
            if (index < 0) return;
            event.preventDefault();
            if (event.key === "ArrowUp" && index === 0) input.current?.focus();
            else
              links[
                Math.min(
                  links.length - 1,
                  index + (event.key === "ArrowUp" ? -1 : 1),
                )
              ]?.focus();
          }}
        >
          {matches.map(({ id, name }) => (
            <li key={id}>
              <a href={path + "/" + id}>{name}</a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
