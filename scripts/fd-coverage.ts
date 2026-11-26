import { readFile, readdir } from "node:fs/promises";
import { banks } from "../src/data/banks.ts";
import { parseIntake, intakeSources } from "../src/editorial/intake.ts";

export async function latestDepositChecks() {
  const reports = new Map<
    string,
    {
      date: string;
      status: "observed" | "missing" | "unavailable";
      url: string;
    }
  >();
  const files = (await readdir("evidence"))
    .filter((name) => /^fd-intake-\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();
  for (const file of files) {
    const snap = parseIntake(await readFile("evidence/" + file, "utf8"));
    if (file !== "fd-intake-" + snap.observedOn + ".json")
      throw new Error("Intake date disagrees with filename: " + file);
    for (const row of snap.captures) {
      const id = row.source === "nepal-bank" ? "nepal" : row.source;
      const previous = reports.get(id);
      // Multiple channels on one date can yield both a reading and a gap.
      if (previous?.date === snap.observedOn && previous.status === "observed")
        continue;
      reports.set(id, {
        date: snap.observedOn,
        status: row.status,
        url: intakeSources[row.source].url,
      });
    }
  }
  return Object.fromEntries(
    banks
      .filter((b) => reports.has(b.id))
      .map((b) => [b.id, reports.get(b.id)!]),
  );
}
if (import.meta.main)
  console.log(JSON.stringify(await latestDepositChecks(), null, 2));
