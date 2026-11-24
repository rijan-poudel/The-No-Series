"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { moneyPath, t, type Locale } from "./copy";

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const current = usePathname();
  const router = useRouter();
  const other = locale === "en" ? "ne" : "en";
  const target =
    current?.replace(/^\/(en|ne)(?=\/|$)/, "/" + other) ?? moneyPath(other);
  const home = moneyPath(locale);
  const category = /^\/(en|ne)\/money\/(fixed-deposits|dollar-cards)$/.test(
    current,
  );
  return (
    <>
      <a className="skip" href="#content">
        {t(locale, "skip")}
      </a>
      <header className="site-header">
        <div className="container masthead">
          <Link href={home} className="brand">
            <span className="brand-mark" aria-hidden="true">
              no<span>.</span>
            </span>
            <span className="brand-text">
              <span>{t(locale, "series")}</span>
              <strong>{t(locale, "money")}</strong>
            </span>
          </Link>
          {!category && (
            <Link
              prefetch={false}
              className="switch"
              href={target}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                if (location.search || location.hash) {
                  event.preventDefault();
                  router.push(target + location.search + location.hash);
                }
              }}
              hrefLang={other}
              lang={other}
            >
              {other === "ne" ? "नेपाली" : "English"}
            </Link>
          )}
        </div>
      </header>
      <main id="content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-row">
          <Link href={home} className="footer-brand">
            <span aria-hidden="true">no.</span> {t(locale, "series")}
          </Link>
          <div className="footer-links">
            <Link href={home + "/methodology"}>
              {t(locale, "methodology")} <ArrowUpRight size={14} aria-hidden />
            </Link>
            <Link href={home + "/coverage"}>
              {t(locale, "coverage")} <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
