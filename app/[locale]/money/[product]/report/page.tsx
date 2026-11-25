import { pageMetadata } from "../../../../../src/ui/page-metadata";
import { notFound } from "next/navigation";
import { productSchema } from "../../../../../src/domain/model";
import { isLocale, productPath, t } from "../../../../../src/ui/copy";
import { Editorial } from "../../../../../src/ui/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; product: string }>;
}) {
  const { locale, product } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(
    locale,
    "report",
    "reportBody",
    t(locale, product === "fixed-deposits" ? "fixed" : "dollarCardFees"),
  );
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; product: string }>;
  searchParams: Promise<{ offer?: string | string[] }>;
}) {
  const { locale, product } = await params;
  const parsed = productSchema.safeParse(product);
  if (!isLocale(locale) || !parsed.success) notFound();
  const { offer } = await searchParams;
  const reference =
    typeof offer === "string" && /^[a-z\d-]{1,80}$/.test(offer)
      ? offer
      : undefined;
  return (
    <Editorial
      locale={locale}
      title={t(locale, "report")}
      back={productPath(locale, parsed.data)}
    >
      {reference && <div className="editorial-meta">{reference}</div>}
      <section>
        <h2>{t(locale, "reportStatus")}</h2>
        <p>{t(locale, "reportBody")}</p>
      </section>
    </Editorial>
  );
}
