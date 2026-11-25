import { pageMetadata } from "../../../src/ui/page-metadata";
import { notFound } from "next/navigation";
import { MoneyHome } from "../../../src/ui/home";
import { isLocale } from "../../../src/ui/copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "homeTitle", "homeIntro");
}

export default async function Money({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <MoneyHome locale={locale} />;
}
