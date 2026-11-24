import { readFile } from "node:fs/promises";
import { archiveIndex, tariffReview } from "../src/editorial/tariff-review.ts";

const [previous, current] = process.argv.slice(2);
if (!previous || !current) {
  process.stderr.write(
    "Usage: npm run --silent review:tariffs -- previous.json current.json\n",
  );
  process.exitCode = 1;
} else {
  try {
    const [before, after] = await Promise.all(
      [previous, current].map(async (file) =>
        archiveIndex.parse(JSON.parse(await readFile(file, "utf8"))),
      ),
    );
    process.stdout.write(
      JSON.stringify(tariffReview(before, after), null, 2) + "\n",
    );
  } catch {
    process.stderr.write("Could not read two valid tariff archive indexes.\n");
    process.exitCode = 1;
  }
}
