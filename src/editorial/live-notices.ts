import { calendarDate, nepalDate } from "../domain/model.ts";
import { depositTerms } from "../domain/picks.ts";
import { pilotSources } from "./pilot-sources.ts";

export const noticeBanks = {
  nepal: { name: "Nepal Bank", url: pilotSources["nepal-bank"].url },
  nmb: { name: "NMB Bank", url: "https://nmb.com.np/en/interest-rate" },
} as const;
type Bank = keyof typeof noticeBanks;
const monthNames = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const dayMs = 86_400_000;

export function parseNotice(bank: Bank, html: string, clock: Date) {
  const clean = (text: string) =>
    text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  const text = clean(
    html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ""),
  );
  const dates = [
    ...text.matchAll(
      /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),\s+(20\d{2})\b/gi,
    ),
  ].filter((match) =>
    /effective(?:\s+from)?[^.]{0,55}$/i.test(
      text.slice(Math.max(0, match.index - 70), match.index),
    ),
  );
  const normalized = new Set(
    dates.map(([label, day, year]) => {
      const month =
        monthNames.findIndex((name) =>
          label.toLowerCase().startsWith(name.toLowerCase()),
        ) + 1;
      return (
        year + "-" + String(month).padStart(2, "0") + "-" + day.padStart(2, "0")
      );
    }),
  );
  const [effective] = normalized;
  const age = (Date.parse(nepalDate(clock)) - Date.parse(effective)) / dayMs;
  if (
    normalized.size !== 1 ||
    !calendarDate.safeParse(effective).success ||
    age < 0 ||
    age > 31
  )
    return null;

  const groups = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(
    ([, table]) =>
      [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(([, row]) =>
        [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
          ([, cell]) => clean(cell),
        ),
      ),
  );
  const candidates =
    bank === "nepal"
      ? groups.flat().flatMap(([id, label, , rate]) => {
          if (
            id === "2.1.1" &&
            /^individual fixed deposit 3 months to 1 year$/i.test(label)
          )
            return [{ from: 3, to: 12, rate }];
          if (
            id === "2.1.3" &&
            /^individual fixed deposit \(above 1 years?- upto 2 years?\)$/i.test(
              label,
            )
          )
            return [{ from: 13, to: 24, rate }];
          return [];
        })
      : groups.flatMap((rows) =>
          rows.flatMap(([label, individual], index) => {
            if (
              !/^fixed deposit \(npr\)$/i.test(label) ||
              !/^individual$/i.test(individual)
            )
              return [];
            return rows.slice(index + 1, index + 8).flatMap(([term, rate]) => {
              if (/^3 months to below 1 year$/i.test(term))
                return [{ from: 3, to: 11, rate }];
              if (/^1 year to below 3 years$/i.test(term))
                return [{ from: 12, to: 35, rate }];
              return [];
            });
          }),
        );

  const rates = depositTerms.flatMap((term) => {
    const eligible = candidates.filter(
      ({ from, to }) => from <= term && term <= to,
    );
    const rate = eligible[0]?.rate;
    return eligible.length === 1 && /^\d{1,2}(?:\.\d{1,4})?%$/.test(rate)
      ? [{ term, rate }]
      : [];
  });
  return rates.length ? { bank, effective, rates } : null;
}
