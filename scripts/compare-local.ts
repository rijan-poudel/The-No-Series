import { stdin, stdout, stderr } from "node:process";
import { demoClock, demoRelease } from "../src/data/fixtures.ts";
import { publicRelease } from "../src/data/release.ts";
import { compare } from "../src/domain/engine.ts";
import { scenarioSchema } from "../src/domain/model.ts";

const mode = process.argv[2];
const maxRequestBytes = 2048;

async function main() {
  if (process.argv.length !== 3 || (mode !== "--demo" && mode !== "--empty")) {
    throw new Error("Specify --demo (fictional) or --empty (unseeded).");
  }

  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of stdin as AsyncIterable<Buffer>) {
    bytes += chunk.length;
    if (bytes > maxRequestBytes)
      throw new Error("Scenario exceeds 2048 bytes.");
    chunks.push(chunk);
  }
  const scenario = scenarioSchema.safeParse(
    JSON.parse(Buffer.concat(chunks).toString("utf8")),
  );
  if (!scenario.success) {
    const fields = [
      ...new Set(scenario.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error("Invalid scenario fields: " + fields.join(", "));
  }
  const result =
    mode === "--demo"
      ? compare(scenario.data, demoRelease(), demoClock())
      : compare(scenario.data, publicRelease, new Date());
  stdout.write(JSON.stringify(result, null, 2) + "\n");
}

main().catch((error: unknown) => {
  const message =
    error instanceof SyntaxError
      ? "Scenario must be valid JSON."
      : error instanceof Error
        ? error.message
        : "Comparison failed.";
  stderr.write(message + "\n");
  process.exitCode = 1;
});
