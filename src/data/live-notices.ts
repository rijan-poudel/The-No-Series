import { unstable_cache } from "next/cache";
import { noticeBanks, parseNotice } from "../editorial/live-notices";

const maxBytes = 2 * 1024 * 1024;

async function readNotice(bank: keyof typeof noticeBanks, clock: Date) {
  try {
    const response = await fetch(noticeBanks[bank].url, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "text/html" },
    });
    if (
      !response.ok ||
      !response.body ||
      !response.headers.get("content-type")?.startsWith("text/html")
    )
      return null;
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
        return null;
      }
      html += decoder.decode(chunk.value, { stream: true });
    }
    return parseNotice(bank, html + decoder.decode(), clock);
  } catch {
    return null;
  }
}

const readCached = unstable_cache(
  async () => {
    const checkedAt = new Date();
    const rows = await Promise.all(
      (Object.keys(noticeBanks) as (keyof typeof noticeBanks)[]).map((bank) =>
        readNotice(bank, checkedAt),
      ),
    );
    return {
      checks: rows.filter((row) => row !== null),
      time: checkedAt.getTime(),
    };
  },
  ["money-official-notices-v2"],
  { revalidate: 3600 },
);

export async function liveNotices() {
  const snapshot = await readCached();
  if (Date.now() - snapshot.time > 2 * 3600_000) return [];
  return snapshot.checks;
}
