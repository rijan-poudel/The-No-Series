import { liveNotices } from "../../../../../src/data/live-notices";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== "Bearer " + secret)
    return new Response(null, { status: 401, headers });
  const notices = await liveNotices();
  return Response.json(
    { available: notices.length },
    {
      status: notices.length ? 200 : 503,
      headers,
    },
  );
}
