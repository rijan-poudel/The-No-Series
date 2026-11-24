import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
