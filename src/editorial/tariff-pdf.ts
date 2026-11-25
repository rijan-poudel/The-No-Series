import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export async function readTariffPdf<T>(
  path: string,
  extract: (text: string) => T,
) {
  try {
    const { stdout } = await run("pdftotext", ["-layout", path, "-"], {
      timeout: 5_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    return extract(stdout);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      process.stderr.write(
        "Install Poppler (pdftotext) to read tariff PDFs.\n",
      );
    return null;
  }
}
