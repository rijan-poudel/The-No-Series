import { createHash } from "node:crypto";
import { pilotSources } from "./pilot-sources.ts";

type Source = keyof typeof pilotSources;
const limit = 2 * 1024 * 1024;

export async function observeSources(request: typeof fetch = fetch) {
  const observations = [];
  for (const source of Object.keys(pilotSources) as Source[]) {
    try {
      const response = await request(pilotSources[source].url, {
        headers: { Accept: "text/html, application/pdf" },
        redirect: "error",
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok || !response.body) throw new Error("Source unavailable");
      const type = response.headers.get("content-type")?.split(";")[0];
      if (type !== "text/html" && type !== "application/pdf") {
        await response.body.cancel();
        throw new Error("Unsupported source format");
      }
      const digest = createHash("sha256");
      let size = 0;
      const reader = response.body.getReader();
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > limit) {
          await reader.cancel();
          throw new Error("Source size exceeded");
        }
        digest.update(chunk.value);
      }
      if (!size) throw new Error("Empty source");
      observations.push({ source, hash: digest.digest("hex") });
    } catch {
      observations.push({ source, hash: null });
    }
  }
  return observations;
}

export function observationChanges(
  observations: Awaited<ReturnType<typeof observeSources>>,
  baseline: Readonly<Record<string, string>>,
) {
  return observations.map(({ source, hash }) => ({
    source,
    hash,
    status: !hash
      ? "unavailable"
      : baseline[source] === undefined
        ? "new"
        : baseline[source] === hash
          ? "unchanged"
          : "changed",
  }));
}
