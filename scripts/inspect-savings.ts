import {
  extractEverestGeneralSavingsMinimum,
  extractLaxmiSunriseSavingsMinimum,
  extractNepalBankBelowMinimumFee,
  extractNmbGoGreenMinimum,
} from "../src/editorial/savings-extraction.ts";

const maxBytes = 2 * 1024 * 1024;
const targets = [
  {
    bank: "everest",
    account: "Saving General (Normal Deposit)",
    url: "https://everestbankltd.com/product-and-services/deposit/savings-account/general-saving/",
    extract: extractEverestGeneralSavingsMinimum,
  },
  {
    bank: "nmb",
    account: "NMB Go-Green Savings Account",
    url: "https://nmb.com.np/en/products/saving-accounts/individual/nmb-go-green-savings-account",
    extract: extractNmbGoGreenMinimum,
  },
  {
    bank: "laxmi-sunrise",
    account: "Sunrise Savings",
    url: "https://www.laxmisunrise.com/deposit/sunrise-savings/",
    extract: extractLaxmiSunriseSavingsMinimum,
  },
  {
    bank: "nepal",
    account: "Normal Saving",
    field: "belowMinimumFeeNpr",
    url: "https://www.nepalbank.com.np/investor-relations/service-charge",
    extract: extractNepalBankBelowMinimumFee,
  },
] as const;

async function readHtml(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "text/html" },
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok || !response.body) throw new Error("Source unavailable");
  if (response.headers.get("content-type")?.split(";")[0] !== "text/html") {
    await response.body.cancel();
    throw new Error("Unsupported source format");
  }
  let size = 0;
  let html = "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Source size exceeded");
    }
    html += decoder.decode(chunk.value, { stream: true });
  }
  if (!size) throw new Error("Empty source");
  return html + decoder.decode();
}

const observedAt = new Date().toISOString();
const results = await Promise.all(
  targets.map(async ({ extract, ...target }) => {
    try {
      const candidate = extract(await readHtml(target.url));
      return {
        ...target,
        status: candidate ? "extracted" : "unconfirmed",
        candidate,
      };
    } catch {
      return { ...target, status: "unavailable", candidate: null };
    }
  }),
);
process.stdout.write(
  JSON.stringify(
    {
      observedAt,
      reviewRequired: true,
      notice:
        "Candidates are not public facts. Confirm the account, edition and wording against the official page before updating a reviewed release.",
      results,
    },
    null,
    2,
  ) + "\n",
);
