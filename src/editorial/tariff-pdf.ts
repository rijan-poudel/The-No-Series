import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { extractSbiMobileFees } from "./tariff-extraction.ts";

const run = promisify(execFile);

export async function readSbiMobilePdf(path: string) {
  try {
    const { stdout } = await run("pdftotext", ["-layout", path, "-"], {
      timeout: 5_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    return extractSbiMobileFees(stdout);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      process.stderr.write(
        "Install Poppler (pdftotext) to read Nepal SBI tariff PDFs.\n",
      );
    return null;
  }
}
