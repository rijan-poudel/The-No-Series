import { notFound, redirect } from "next/navigation";
import { isLocale, moneyPath } from "../../src/ui/copy";

export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(moneyPath(locale));
}
