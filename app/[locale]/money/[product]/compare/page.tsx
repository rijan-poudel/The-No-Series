import { notFound, redirect } from "next/navigation";
import { productSchema } from "../../../../../src/domain/model";
import { isLocale, productPath } from "../../../../../src/ui/copy";

export default async function LegacyComparison({
  params,
}: {
  params: Promise<{ locale: string; product: string }>;
}) {
  const { locale, product } = await params;
  const parsed = productSchema.safeParse(product);
  if (!isLocale(locale) || !parsed.success) notFound();
  redirect(productPath(locale, parsed.data));
}
