"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { moneyPath, t, type Locale } from "./copy";

function LanguageLink({ target, other }: { target: string; other: Locale }) {
  const query = useSearchParams().toString();
  return (
    <a href={target + (query ? "?" + query : "")} lang={other} hrefLang={other}>
      {other === "ne" ? "नेपाली" : "English"}
    </a>
  );
}

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const current = usePathname();
  const other = locale === "en" ? "ne" : "en";
  const home = moneyPath(locale);
  const target =
    current?.replace(/^\/(en|ne)(?=\/|$)/, "/" + other) ?? moneyPath(other);

  return (
    <>
      <a className="skip" href="#content">
        {t(locale, "skip")}
      </a>
      <header className="site-header quiet-header">
        <div className="container masthead">
          <Link
            href={home}
            className="quiet-brand"
            aria-label={t(locale, "home")}
          >
            <span className="no-wordmark" aria-hidden="true">
              No
            </span>
          </Link>
          <Suspense
            fallback={
              <a href={target} lang={other}>
                {other === "ne" ? "नेपाली" : "English"}
              </a>
            }
          >
            <LanguageLink target={target} other={other} />
          </Suspense>
        </div>
      </header>
      <main id="content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-row">
          <p>{t(locale, "independence")}</p>
          <div className="footer-links">
            <Link href={home + "/coverage"}>{t(locale, "coverage")}</Link>
            <Link href={home + "/methodology"}>{t(locale, "methodology")}</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
