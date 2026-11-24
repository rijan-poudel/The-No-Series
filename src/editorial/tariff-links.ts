const evidenceLabel =
  /tariff|schedule of (?:service )?charges|(?:service )?fees and charges|\bstc\b/i;

export function tariffDocumentCandidates(source: string, html: string) {
  const origin = new URL(source).origin;
  const documents = new Map<string, string>();
  for (const [, href, title] of html.matchAll(
    /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    try {
      const link = new URL(href.replace(/&amp;/g, "&"), source);
      const label = title
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (
        link.origin !== origin ||
        link.username ||
        link.password ||
        link.search ||
        !/\.pdf$/i.test(link.pathname)
      )
        continue;
      if (
        !evidenceLabel.test(label) &&
        !evidenceLabel.test(
          decodeURIComponent(link.pathname).replace(/[_-]/g, " "),
        )
      )
        continue;
      link.hash = "";
      documents.set(link.href, label.slice(0, 120));
      if (documents.size === 8) break;
    } catch {
      continue;
    }
  }
  return [...documents].map(([url, label]) => ({ url, label }));
}

export function nmbLatestArchiveLink(html: string) {
  const months =
    "january february march april may june july august september october november december".split(
      " ",
    );
  const entries = new Map<string, { url: string; date: number }>();
  for (const [, href, title] of html.matchAll(
    /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const label = title
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const edition = /^stc-nmb bank\s*-\s*([a-z]+)\s*-?\s*(20\d{2})$/i.exec(
      label,
    );
    if (!edition) continue;
    const month = months.indexOf(edition[1].toLowerCase());
    if (month < 0) continue;
    try {
      const link = new URL(href.replace(/&amp;/g, "&"));
      if (
        link.origin !== "https://media.nmb.com.np" ||
        link.username ||
        link.password ||
        !/^\/nmbcms\/downloads\/[0-9A-Z]+\.pdf$/.test(link.pathname)
      )
        continue;
      const date = Number(edition[2]) * 12 + month;
      entries.set(link.pathname, { url: link.href, date });
    } catch {
      continue;
    }
  }
  const [newest, runnerUp] = [...entries.values()].sort(
    (a, b) => b.date - a.date,
  );
  return newest && newest.date !== runnerUp?.date ? newest.url : undefined;
}
