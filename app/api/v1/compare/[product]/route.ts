import { currentData } from "../../../../../src/data/current";
import { compare } from "../../../../../src/domain/engine";
import { productSchema, scenarioSchema } from "../../../../../src/domain/model";

const headers = { "Cache-Control": "no-store" };
const maxRequest = 2048;

export async function POST(
  request: Request,
  context: { params: Promise<{ product: string }> },
) {
  const { product } = await context.params;
  if (!productSchema.safeParse(product).success)
    return Response.json({ code: "not-found" }, { status: 404, headers });
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return Response.json({ code: "invalid" }, { status: 415, headers });
  }
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ code: "invalid" }, { status: 400, headers });
  let input = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxRequest) {
        await reader.cancel();
        return Response.json({ code: "too-large" }, { status: 413, headers });
      }
      input += decoder.decode(chunk.value, { stream: true });
    }
    const scenario = scenarioSchema.safeParse(
      JSON.parse(input + decoder.decode()),
    );
    if (!scenario.success || scenario.data.product !== product) {
      return Response.json({ code: "invalid" }, { status: 400, headers });
    }
    const { release, clock, unavailable } = await currentData();
    if (unavailable)
      return Response.json({ code: "unavailable" }, { status: 503, headers });
    return Response.json(compare(scenario.data, release, clock), { headers });
  } catch (error) {
    const invalid = error instanceof SyntaxError;
    return Response.json(
      { code: invalid ? "invalid" : "unavailable" },
      { status: invalid ? 400 : 503, headers },
    );
  }
}
