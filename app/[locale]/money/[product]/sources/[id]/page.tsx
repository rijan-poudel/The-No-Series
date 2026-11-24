import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { currentData } from "../../../../../../src/data/current";
import {
  priorityQuery,
  readPriority,
} from "../../../../../../src/domain/picks";
import {
  offerEvidence,
  reviewedOffers,
} from "../../../../../../src/domain/engine";
import { nepalDate, productSchema } from "../../../../../../src/domain/model";
import { isLocale, local, productPath, t } from "../../../../../../src/ui/copy";
import { Editorial } from "../../../../../../src/ui/editorial";

export const dynamic = "force-dynamic";

export default async function SourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; product: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, product, id } = await params;
  const parsed = productSchema.safeParse(product);
  if (!isLocale(locale) || !parsed.success) notFound();
  const { release, clock } = await currentData();
  const productOffers = release.offers.filter(
    (offer) => offer.product === parsed.data,
  );
  const date = nepalDate(clock);
  const references = reviewedOffers(productOffers, release, date).filter(
    ({ offer }) => offerEvidence(offer).includes(id),
  );
  const citation = release.citations.find((entry) => entry.id === id);
  const source =
    citation && release.sources.find((entry) => entry.id === citation.sourceId);
  if (
    !references.length ||
    !citation ||
    !source ||
    release.revoked ||
    (release.kind === "public" && (source.kind === "fixture" || source.fixture))
  )
    notFound();
  const priority = readPriority(parsed.data, await searchParams);
  const query = priority ? priorityQuery(priority) + "#picks" : "";
  return (
    <Editorial
      locale={locale}
      title={local(locale, citation.title)}
      back={productPath(locale, parsed.data) + query}
    >
      {release.kind === "demo" && (
        <div className="demo-banner">{t(locale, "demo")}</div>
      )}
      {references.every(({ reason }) => reason !== undefined) && (
        <div className="demo-banner">{t(locale, "referenceOnly")}</div>
      )}
      <section>
        <dl className="line-list">
          <div>
            <dt>{t(locale, "publisher")}</dt>
            <dd>{local(locale, source.publisher)}</dd>
          </div>
          <div>
            <dt>{t(locale, "locator")}</dt>
            <dd>{local(locale, citation.locator)}</dd>
          </div>
          <div>
            <dt>{t(locale, "effective")}</dt>
            <dd>
              <time dateTime={citation.effective}>{citation.effective}</time>
            </dd>
          </div>
          <div>
            <dt>{t(locale, "verified")}</dt>
            <dd>
              <time dateTime={citation.verified}>{citation.verified}</time>
            </dd>
          </div>
        </dl>
        <blockquote>{local(locale, citation.excerpt)}</blockquote>
        {source.url?.startsWith("https://") && (
          <a className="trust-link" href={source.url} rel="noreferrer">
            {t(locale, "officialSource")} <ArrowUpRight size={16} aria-hidden />
          </a>
        )}
      </section>
    </Editorial>
  );
}
