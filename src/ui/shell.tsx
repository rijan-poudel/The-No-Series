"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Ellipsis } from "lucide-react";
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
            <span aria-hidden="true">No</span>
          </Link>
          <details className="utility-menu" key={current}>
            <summary aria-label={t(locale, "menu")}>
              <Ellipsis size={24} aria-hidden />
            </summary>
            <div>
              <Suspense>
                <LanguageLink target={target} other={other} />
              </Suspense>
              <Link href={home + "/coverage"}>{t(locale, "coverage")}</Link>
              <Link href={home + "/methodology"}>
                {t(locale, "methodology")}
              </Link>
            </div>
          </details>
        </div>
      </header>
      <main id="content">{children}</main>
    </>
  );
}
