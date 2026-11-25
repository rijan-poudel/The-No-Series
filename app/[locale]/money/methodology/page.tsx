import { pageMetadata } from "../../../../src/ui/page-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, moneyPath, t } from "../../../../src/ui/copy";
import { Editorial } from "../../../../src/ui/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "methodTitle", "methodDescription");
}

export default async function Methodology({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Editorial locale={locale} title={t(locale, "methodTitle")}>
      <ol className="method-steps">
        {(["verifySource", "matchChoice", "orderPicks"] as const).map(
          (step) => (
            <li key={step}>{t(locale, step)}</li>
          ),
        )}
      </ol>
      {(
        [
          "methodEditorialDeposit",
          "methodEditorialCard",
          "methodMobile",
          "methodFresh",
          "methodPrivacy",
        ] as const
      ).map((section) => (
        <section key={section}>
          <h2>{t(locale, section)}</h2>
          <p>{t(locale, `${section}Text`)}</p>
        </section>
      ))}
      <Link className="trust-link" href={moneyPath(locale) + "/coverage"}>
        {t(locale, "coverage")}
      </Link>
    </Editorial>
  );
}
