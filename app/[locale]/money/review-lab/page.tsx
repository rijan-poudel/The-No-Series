import { pageMetadata } from "../../../../src/ui/page-metadata";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "reviewTitle", "reviewDescription");
}

export default async function ReviewLabRoute(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string | string[] }>;
}) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.MONEY_DEMO === "1" &&
    !process.env.VERCEL
  ) {
    const { ReviewLab } = await import("../../../../src/ui/review-lab");
    return ReviewLab(props);
  }
  notFound();
}
