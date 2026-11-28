import entries from "./ips-branches.json" with { type: "json" };
import { banks } from "./banks.ts";

export const ipsSource =
  "https://nchl.com.np/wp-content/uploads/2026/01/IPS_Branches.pdf";
type Entry = {
  code: string;
  sourceName: string;
  branches: Record<string, string>;
};
const index: Readonly<Partial<Record<string, Entry>>> = entries;
function normalize(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[०-९]/g, (c) => String(c.charCodeAt(0) - 0x966))
    .replace(/[^\p{L}\p{M}\d]+/gu, " ")
    .trim();
}
const rows = banks.flatMap((bank) => {
  const entry = index[bank.id];
  if (!entry) return [];
  const bankWords = normalize(bank.name + " " + bank.aliases).split(" ");
  return Object.entries(entry.branches)
    .map(([code, name]) => ({
      bank,
      code,
      name,
      bankCode: entry.code,
      bankWords,
      search: normalize(name),
    }))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, "en") ||
        a.code.localeCompare(b.code, "en"),
    );
});

export function searchBranches(id: string, query: string, page: number) {
  const terms = normalize(query).split(" ").filter(Boolean);
  const filtered =
    query.trim() && !terms.length
      ? []
      : rows.filter(
          (row) =>
            (!id || row.bank.id === id) &&
            terms.every((word) =>
              /^\d+$/.test(word)
                ? row.code === word ||
                  row.bankCode === word ||
                  row.search.split(" ").includes(word)
                : row.search.includes(word) ||
                  row.bankWords.some((part) => part.startsWith(word)),
            ),
        );
  const pages = Math.max(1, Math.ceil(filtered.length / 25));
  const current = Number.isSafeInteger(page)
    ? Math.max(1, Math.min(page, pages))
    : 1;
  return {
    total: filtered.length,
    pages,
    current,
    rows: filtered.slice((current - 1) * 25, current * 25),
  };
}
