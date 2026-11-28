import { createHash } from "node:crypto";
import { savingsReadings } from "../data/savings.ts";

const limit = 2 * 1024 * 1024;

export function savingsFingerprint(content: Uint8Array, type: string) {
  const digest = createHash("sha256");
  if (type === "text/html") {
    const visibleText = new TextDecoder()
      .decode(content)
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[^]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
    digest.update(visibleText, "utf8");
  } else {
    digest.update(content);
  }
  return digest.digest("hex");
}

export type SavingsSource = {
  id: string;
  bank: string;
  kind: "rate" | "account-terms" | "tariff";
  url: string;
};

// This is a source registry, not a publication manifest. A changed source must
// be read and reviewed before any public amount is changed.
export const savingsSources: readonly SavingsSource[] = Object.entries(
  savingsReadings,
).flatMap(([bank, reading]) => {
  if (!reading) return [];
  const sources: SavingsSource[] = [
    { id: `${bank}:rate`, bank, kind: "rate", url: reading.source },
  ];
  if (reading.minimumSource && reading.minimumSource !== reading.source) {
    sources.push({
      id: `${bank}:account-terms`,
      bank,
      kind: "account-terms",
      url: reading.minimumSource,
    });
  }
  if (
    reading.belowMinimumFeeSource &&
    reading.belowMinimumFeeSource !== reading.source &&
    reading.belowMinimumFeeSource !== reading.minimumSource
  ) {
    sources.push({
      id: `${bank}:below-minimum-fee`,
      bank,
      kind: "tariff",
      url: reading.belowMinimumFeeSource,
    });
  }
  return sources;
});

export type SavingsObservation = {
  id: string;
  bank: string;
  kind: SavingsSource["kind"];
  url: string;
  hash: string | null;
};

async function observeSavingsSource(
  source: SavingsSource,
  request: typeof fetch,
): Promise<SavingsObservation> {
  try {
    const response = await request(source.url, {
      headers: { Accept: "text/html, application/pdf, image/*" },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok || !response.body) throw new Error("Source unavailable");
    const type = response.headers.get("content-type")?.split(";")[0];
    if (
      type !== "text/html" &&
      type !== "application/pdf" &&
      !type?.startsWith("image/")
    ) {
      await response.body.cancel();
      throw new Error("Unsupported source format");
    }
    let size = 0;
    const chunks: Uint8Array[] = [];
    const reader = response.body.getReader();
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("Source size exceeded");
      }
      chunks.push(chunk.value);
    }
    if (!size) throw new Error("Empty source");
    const content = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      content.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { ...source, hash: savingsFingerprint(content, type) };
  } catch {
    return { ...source, hash: null };
  }
}

export async function observeSavingsSources(request: typeof fetch = fetch) {
  const observations = new Array<SavingsObservation>(savingsSources.length);
  let next = 0;
  // A small pool keeps scheduled checks bounded without sending a burst to every
  // bank at once. Results retain registry order for stable baseline reviews.
  await Promise.all(
    Array.from({ length: Math.min(4, savingsSources.length) }, async () => {
      for (;;) {
        const index = next++;
        if (index >= savingsSources.length) return;
        observations[index] = await observeSavingsSource(
          savingsSources[index],
          request,
        );
      }
    }),
  );
  return observations;
}

export function savingsObservationChanges(
  observations: readonly SavingsObservation[],
  baseline: Readonly<Record<string, string>>,
) {
  return observations.map(({ id, hash, ...source }) => ({
    ...source,
    id,
    hash,
    status: !hash
      ? "unavailable"
      : baseline[id] === undefined
        ? "new"
        : baseline[id] === hash
          ? "unchanged"
          : "changed",
  }));
}
