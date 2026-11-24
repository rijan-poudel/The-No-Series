type EvidenceKind = "rate" | "tariff" | "terms";

export const sourceSeeds = {
  nepal: ["https://www.nepalbank.com.np/index.php/digital/interest-rate"],
  nmb: [
    "https://nmb.com.np/en/interest-rate",
    "https://nmb.com.np/np/download/standard-tariff-charges",
  ],
  nabil: ["https://cdn.nabilbank.com/interest-rate"],
  "global-ime": [
    "https://www.globalimebank.com/products/cards/e-com-card-usd-dollar-card-nepal/",
  ],
} as const;

export type DiscoveryBank = keyof typeof sourceSeeds;
export type SourceCandidate = {
  bank: DiscoveryBank;
  kind: EvidenceKind;
  url: string;
  discoveredOn: string;
  priority: number;
};

const signals: [EvidenceKind, RegExp][] = [
  ["tariff", /tariff|charge sheet|service charge|fee schedule/i],
  ["rate", /interest.rate|deposit.rate|roi.effective/i],
  [
    "terms",
    /terms.and.conditions|fixed.deposit|dollar.card|prepaid.card|e.com.card/i,
  ],
];

export function discoverSources(
  bank: DiscoveryBank,
  seed: string,
  html: string,
) {
  if (!(sourceSeeds[bank] as readonly string[]).includes(seed)) return [];
  const origin = new URL(seed).origin;
  const candidates = new Map<string, SourceCandidate>();
  const document = html.replace(
    /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );
  for (const match of document.matchAll(
    /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    let url: URL;
    try {
      url = new URL(match[1], seed);
    } catch {
      continue;
    }
    if (
      url.origin !== origin ||
      url.username ||
      url.password ||
      url.href.length > 500
    )
      continue;
    url.hash = "";
    const text = match[2].replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ");
    const kind = signals.find(
      ([, pattern]) => pattern.test(text) || pattern.test(url.pathname),
    )?.[0];
    if (!kind) continue;
    const priority =
      (url.pathname.toLowerCase().endsWith(".pdf") ? 2 : 0) +
      (signals.some(([type, pattern]) => type === kind && pattern.test(text))
        ? 1
        : 0);
    const previous = candidates.get(url.href);
    if (!previous || previous.priority < priority)
      candidates.set(url.href, {
        bank,
        kind,
        url: url.href,
        discoveredOn: seed,
        priority,
      });
  }
  return [...candidates.values()]
    .sort((a, b) => b.priority - a.priority || a.url.localeCompare(b.url, "en"))
    .slice(0, 25);
}
