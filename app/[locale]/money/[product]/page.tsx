import { notFound } from "next/navigation";
import { currentData } from "../../../../src/data/current";
import { productSchema } from "../../../../src/domain/model";
import { readPriority } from "../../../../src/domain/picks";
import { CategoryGuide } from "../../../../src/ui/guide";
import { isLocale } from "../../../../src/ui/copy";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; product: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, product } = await params;
  const parsed = productSchema.safeParse(product);
  if (!isLocale(locale) || !parsed.success) notFound();
  const [query, data] = await Promise.all([searchParams, currentData()]);
  return (
    <CategoryGuide
      locale={locale}
      product={parsed.data}
      choice={readPriority(parsed.data, query)}
      {...data}
    />
  );
}
