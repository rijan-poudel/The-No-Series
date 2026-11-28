export type SavingsMinimumCandidate = {
  minimumNpr: string;
};

function text(html: string) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(?:8211|8212);/g, "-")
    .replace(/\s+/g, " ");
}

function npr(value: string) {
  return value.replace(/,/g, "").replace(/\.00$/, "");
}

export function extractEverestGeneralSavingsMinimum(html: string) {
  const match = text(html).match(
    /Minimum balance:\s*Rs\.\s*([\d,]+(?:\.00)?)/i,
  );
  return match
    ? ({ minimumNpr: npr(match[1]) } satisfies SavingsMinimumCandidate)
    : null;
}

export function extractNmbGoGreenMinimum(html: string) {
  const match = text(html).match(
    /Minimum Balance:\s*Rs\.\s*([\d,]+(?:\.00)?)/i,
  );
  return match
    ? ({ minimumNpr: npr(match[1]) } satisfies SavingsMinimumCandidate)
    : null;
}

export function extractLaxmiSunriseSavingsMinimum(html: string) {
  return /No minimum balance is required to open the account\./i.test(
    text(html),
  )
    ? ({ minimumNpr: "0" } satisfies SavingsMinimumCandidate)
    : null;
}
