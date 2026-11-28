import { readFile } from "node:fs/promises";
import { z } from "zod";
import {
  observeSavingsSources,
  savingsObservationChanges,
} from "../src/editorial/savings-monitor.ts";

const baselineSchema = z.record(z.string().regex(/^[a-f0-9]{64}$/));

async function main() {
  const [path, ...extra] = process.argv.slice(2);
  if (extra.length)
    throw new Error("Usage: monitor:savings -- [baseline.json]");
  const baseline = path
    ? baselineSchema.parse(JSON.parse(await readFile(path, "utf8")))
    : {};
  const sources = savingsObservationChanges(
    await observeSavingsSources(),
    baseline,
  );
  process.stdout.write(
    JSON.stringify({ checkedAt: new Date().toISOString(), sources }, null, 2) +
      "\n",
  );
  if (sources.some(({ status }) => status === "unavailable"))
    process.exitCode = 2;
}

main().catch(() => {
  process.stderr.write(
    "Could not read the savings monitoring baseline. Use a JSON object mapping source IDs to SHA-256 fingerprints.\n",
  );
  process.exitCode = 1;
});
