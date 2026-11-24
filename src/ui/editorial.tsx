import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { moneyPath, t, type Locale } from "./copy";

export function Editorial({
  locale,
  title,
  back,
  children,
}: {
  locale: Locale;
  title: string;
  back?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container editorial">
      <div className="trail">
        <Link href={back ?? moneyPath(locale)}>
          <ArrowLeft size={17} aria-hidden /> {t(locale, "back")}
        </Link>
      </div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
