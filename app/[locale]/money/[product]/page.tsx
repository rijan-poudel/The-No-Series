import { notFound } from "next/navigation";
import { liveNotices } from "../../../../src/data/live-notices";
import { currentData } from "../../../../src/data/current";
import { productSchema } from "../../../../src/domain/model";
import { editorialPicks, readPriority } from "../../../../src/domain/picks";
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
  const choice = readPriority(parsed.data, query);
  const results = choice
    ? editorialPicks(choice, data.release, data.clock)
    : null;
  const notices =
    choice?.product === "fixed-deposits" &&
    data.release.kind === "public" &&
    !data.release.revoked &&
    !results?.rows.length
      ? (await liveNotices()).flatMap(({ bank, effective, rates }) => {
          const match = rates.find(({ term }) => term === choice.term);
          return match ? [{ bank, effective, rate: match.rate }] : [];
        })
      : null;
  return (
    <CategoryGuide
      locale={locale}
      product={parsed.data}
      choice={choice}
      results={results}
      notices={notices}
      release={data.release}
      unavailable={data.unavailable}
    />
  );
}
