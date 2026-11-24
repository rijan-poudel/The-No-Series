import { currentData } from "../../../../src/data/current";
import { releaseReadiness } from "../../../../src/data/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const { release, clock, unavailable } = await currentData();
  const status = releaseReadiness(release, clock, unavailable);
  return Response.json(
    { status },
    {
      status: status === "ready" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
