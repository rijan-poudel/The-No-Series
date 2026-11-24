import {
  discoverSources,
  sourceSeeds,
  type DiscoveryBank,
} from "../src/editorial/discovery.ts";

const maxBytes = 2 * 1024 * 1024;

async function scan(bank: DiscoveryBank, seed: string) {
  try {
    const response = await fetch(seed, {
      redirect: "error",
      signal: AbortSignal.timeout(7000),
    });
    if (
      !response.ok ||
      !response.body ||
      !response.headers.get("content-type")?.startsWith("text/html")
    )
      return { bank, seed, status: "unavailable", candidates: [] };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let html = "";
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return { bank, seed, status: "too-large", candidates: [] };
      }
      html += decoder.decode(chunk.value, { stream: true });
    }
    return {
      bank,
      seed,
      status: "observed",
      candidates: discoverSources(bank, seed, html + decoder.decode()),
    };
  } catch {
    return { bank, seed, status: "unavailable", candidates: [] };
  }
}

const seeds = Object.keys(sourceSeeds) as DiscoveryBank[];
const results = await Promise.all(
  seeds.flatMap((bank) => sourceSeeds[bank].map((seed) => scan(bank, seed))),
);
console.log(
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
