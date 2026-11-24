import assert from "node:assert/strict";
import { test } from "node:test";
import { parseNotice } from "../src/editorial/live-notices.ts";

const clock = new Date("2026-11-24T00:00:00Z");
const row =
  "<tr><td>2.1.1</td><td>Individual Fixed Deposit 3 Months to 1 Year</td><td>10000</td><td>2.50%</td></tr>";
const header = "<h2>Effective From Mangsir 01, 2083 (November 17, 2026)</h2>";

test("extracts a dated personal rate from the exact Nepal Bank row", () => {
  assert.deepEqual(
    parseNotice("nepal", header + "<table>" + row + "</table>", clock),
    {
      bank: "nepal",
      effective: "2026-11-17",
      rates: [3, 6, 12].map((term) => ({ term, rate: "2.50%" })),
    },
  );
  for (const data of [
    "<table>" + row + "</table>",
    header + "<table>" + row + row + "</table>",
    header.replace("November 17", "November 30") + "<table>" + row + "</table>",
    header.replace("November 17", "September 17") +
      "<table>" +
      row +
      "</table>",
  ])
    assert.equal(parseNotice("nepal", data, clock), null);
});

test("NMB requires a matching NPR individual table heading and exact term", () => {
  const rate =
    "<tr><td>1 Year to Below 3 Years</td><td>2.65%</td><td>2.40%</td></tr>";
  const segment =
    "<tr><th>Fixed Deposit (NPR)</th><th>Individual</th><th>Institution</th></tr>";
  assert.equal(
    parseNotice("nmb", header + "<table>" + segment + rate + "</table>", clock)
      ?.rates[0]?.rate,
    "2.65%",
  );
  assert.equal(
    parseNotice("nmb", header + "<table>" + rate + "</table>", clock),
    null,
  );
});
