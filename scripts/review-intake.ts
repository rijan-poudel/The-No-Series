import { open } from "node:fs/promises";
import { inspectIntake, parseIntake } from "../src/editorial/intake.ts";

async function load(path: string) {
  const file = await open(path, "r");
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      size += chunk.length;
      if (size > 64 * 1024)
        throw new Error("Intake file is larger than 64 KiB");
      chunks.push(chunk);
    }
    return parseIntake(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
  } finally {
    await file.close();
  }
}

try {
  const [current, previous, ...unexpected] = process.argv.slice(2);
  if (!current || unexpected.length)
    throw new Error(
      "Usage: npm run review:intake -- CURRENT.json [PREVIOUS.json]",
    );
  const [snapshot, baseline] = await Promise.all([
    load(current),
    previous ? load(previous) : undefined,
  ]);
  process.stdout.write(
    JSON.stringify(inspectIntake(snapshot, baseline), null, 2) + "\n",
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Could not inspect intake",
  );
  process.exitCode = 1;
}
