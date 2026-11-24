import { notFound } from "next/navigation";
import { intents, MoneyHome } from "../../../src/ui/home";
import { isLocale } from "../../../src/ui/copy";

export default async function Money({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { intent } = await searchParams;
  return (
    <MoneyHome locale={locale} intent={intents.find((key) => key === intent)} />
  );
}
