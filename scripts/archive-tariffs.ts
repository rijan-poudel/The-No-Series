import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { banks, type BankEntry } from "../src/data/banks.ts";
import {
  nmbLatestArchiveLink,
  tariffDocumentCandidates,
} from "../src/editorial/tariff-links.ts";
import {
  extractEverestCardFees,
  extractGlobalImeCardFees,
  extractSbiMobileFees,
  extractNepalMobileFees,
} from "../src/editorial/tariff-extraction.ts";
import {
  supplementalTariffs,
  tariffCatalog,
} from "../src/data/tariff-catalog.ts";

import { readTariffPdf } from "../src/editorial/tariff-pdf.ts";

const directory = "evidence/stc-archive";
const maxBytes = 12 * 1024 * 1024;

type Capture =
  | { bank: BankEntry["id"]; status: "needs-source" }
  | {
      bank: BankEntry["id"];
      url: string;
      status: "unavailable" | "too-large" | "invalid-document";
    }
  | {
      bank: BankEntry["id"];
      url: string;
      status: "captured";
      mime: string;
      hash: string;
      size: number;
      candidate?:
        | ReturnType<typeof extractEverestCardFees>
        | ReturnType<typeof extractGlobalImeCardFees>;
      mobileCandidate?:
        | ReturnType<typeof extractNepalMobileFees>
        | ReturnType<typeof extractSbiMobileFees>;
      documentCandidates?: ReturnType<typeof tariffDocumentCandidates>;
    };

async function archive(
  bank: BankEntry,
  url = tariffCatalog[bank.id],
): Promise<Capture> {
  if (!url) return { bank: bank.id, status: "needs-source" };
  const reportedUrl = new URL(url);
  if (reportedUrl.origin === "https://media.nmb.com.np")
    reportedUrl.search = "";
  const record = { bank: bank.id, url: reportedUrl.href };
  try {
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(12_000),
    });
    const mime = response.headers.get("content-type")?.split(";")[0];
    if (
      !response.ok ||
      !response.body ||
      !mime ||
      !["application/pdf", "text/html"].includes(mime)
    )
      return { ...record, status: "unavailable" };

    const chunks: Uint8Array[] = [];
    const reader = response.body.getReader();
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { ...record, status: "too-large" };
      }
      chunks.push(chunk.value);
    }
    const data = Buffer.concat(chunks);
    if (
      !size ||
      (mime === "application/pdf" &&
        !data.subarray(0, 5).equals(Buffer.from("%PDF-")))
    )
      return { ...record, status: "invalid-document" };

    const hash = createHash("sha256").update(data).digest("hex");
    const file = join(
      directory,
      hash + (mime === "application/pdf" ? ".pdf" : ".html"),
    );
    try {
      await writeFile(file, data, { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    const documentCandidates =
      mime === "text/html"
        ? tariffDocumentCandidates(url, data.toString("utf8"))
        : undefined;
    const candidate =
      url === supplementalTariffs.everest && mime === "text/html"
        ? extractEverestCardFees(data.toString("utf8"))
        : url === supplementalTariffs["global-ime"] &&
            mime === "application/pdf"
          ? await readTariffPdf(file, extractGlobalImeCardFees)
          : undefined;
    return {
      ...record,
      mime,
      hash,
      size,
      status: "captured",
      candidate,
      mobileCandidate:
        bank.id === "nepal" && mime === "text/html"
          ? extractNepalMobileFees(data.toString("utf8"))
          : url === supplementalTariffs["nepal-sbi"] &&
              mime === "application/pdf"
            ? await readTariffPdf(file, extractSbiMobileFees)
            : undefined,
      documentCandidates,
    };
  } catch {
    return { ...record, status: "unavailable" };
  }
}

await mkdir(directory, { recursive: true });
const results = [];
for (let start = 0; start < banks.length; start += 4) {
  results.push(
    ...(await Promise.all(
      banks.slice(start, start + 4).map((bank) => archive(bank)),
    )),
  );
}
const supplemental = await Promise.all(
  Object.entries(supplementalTariffs).flatMap(([id, url]) => {
    const bank = banks.find((item) => item.id === id);
    return bank ? [archive(bank, url)] : [];
  }),
);
const nmb = banks.find((bank) => bank.id === "nmb");
const nmbIndex = results.find(
  (row) =>
    row.bank === "nmb" && row.status === "captured" && row.mime === "text/html",
);
if (nmb && nmbIndex?.status === "captured") {
  const html = await readFile(join(directory, nmbIndex.hash + ".html"), "utf8");
  const document = nmbLatestArchiveLink(html);
  if (document) supplemental.push(await archive(nmb, document));
}
const edition = { observedAt: new Date().toISOString(), results, supplemental };
const report = JSON.stringify(edition, null, 2) + "\n";
await writeFile(
  join(directory, edition.observedAt.replace(/[:.]/g, "-") + ".json"),
  report,
  { flag: "wx" },
);
process.stdout.write(report);
