import { appendFile, readFile } from "node:fs/promises";
import {
  archiveIndex,
  tariffReview,
  tariffReviewSummary,
} from "../src/editorial/tariff-review.ts";

const [previous, current, summary] = process.argv.slice(2);
if (!previous || !current) {
  process.stderr.write(
    "Usage: npm run --silent review:tariffs -- previous.json current.json [summary.md]\n",
  );
  process.exitCode = 1;
} else {
  try {
    const [before, after] = await Promise.all(
      [previous, current].map(async (file) =>
        archiveIndex.parse(JSON.parse(await readFile(file, "utf8"))),
      ),
    );
    const report = tariffReview(before, after);
    if (summary) await appendFile(summary, tariffReviewSummary(report));
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } catch {
    process.stderr.write(
      "Could not generate the tariff review. Check the input indexes and summary path.\n",
    );
    process.exitCode = 1;
  }
}
