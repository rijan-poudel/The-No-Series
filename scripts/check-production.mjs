import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { gzipSync } from "node:zlib";

process.env.NODE_ENV = "production";
process.env.MONEY_DEMO = "1";
const require = createRequire(import.meta.url);
require("next/dist/server/node-environment");
const {
  routeModule,
} = require("../.next/server/app/api/v1/compare/[product]/route.js");
const { POST } = routeModule.userland;
const base = "https://money.invalid/api/v1/compare/";
const scenario = {
  product: "fixed-deposits",
  amount: "१,००,०००",
  currency: "NPR",
  months: 12,
  payout: "any",
  customer: "individual",
};
function post(product, body, contentType = "application/json") {
  return POST(
    new Request(base + product, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": contentType },
    }),
    { params: Promise.resolve({ product }) },
  );
}

test("built API serves empty coverage even when demo is requested", async () => {
  const response = await post("fixed-deposits", scenario);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const result = await response.json();
  assert.equal(result.status, "unavailable");
  assert.equal(result.demo, false);
  assert.equal(result.reviewed, 0);
  assert.deepEqual(result.groups, []);
  const cardResult = await post("dollar-cards", {
    product: "dollar-cards",
    channel: "app",
    reloads: 5,
    customer: "individual",
    account: "yes",
    years: 1,
    form: "any",
  });
  assert.equal((await cardResult.json()).status, "unavailable");
});

test("built API rejects malformed scenarios, wrong product, MIME and oversized bodies", async () => {
  assert.equal((await post("unknown", scenario)).status, 404);
  assert.equal(
    (await post("fixed-deposits", { ...scenario, months: 999 })).status,
    400,
  );
  assert.equal((await post("dollar-cards", scenario)).status, 400);
  assert.equal(
    (await post("fixed-deposits", scenario, "text/plain")).status,
    415,
  );
  assert.equal(
    (await post("fixed-deposits", { ...scenario, amount: "1".repeat(2200) }))
      .status,
    413,
  );
  const invalid = new Request(base + "fixed-deposits", {
    method: "POST",
    body: "{",
    headers: { "Content-Type": "application/json" },
  });
  assert.equal(
    (
      await POST(invalid, {
        params: Promise.resolve({ product: "fixed-deposits" }),
      })
    ).status,
    400,
  );
});

test("production JavaScript omits fixture and staged intake records", async () => {
  for (const directory of [".next/server", ".next/static"]) {
    const files = await readdir(directory, { recursive: true });
    for (const file of files.filter((name) => name.endsWith(".js"))) {
      const content = await readFile(join(directory, file), "utf8");
      const editorialRecord = content.match(
        /Alder Example|Basin Example|demo-2026-11-23-v1|Fictional withholding of|individual-normal-npr-12-months|Individual Fixed Deposit 3 Months to 1 Year/,
      );
      assert(
        !editorialRecord,
        "Unpublished record in " +
          join(directory, file) +
          ": " +
          (editorialRecord?.[0] ?? ""),
      );
    }
  }
});

test("built bilingual pages render through Next's server without a listening port", async () => {
  const NextNodeServer = require("next/dist/server/next-server").default;
  const loadConfig = require("next/dist/server/config").default;
  const { PHASE_PRODUCTION_SERVER } = require("next/constants");
  const {
    createRequestResponseMocks,
  } = require("next/dist/server/lib/mock-request");
  const conf = await loadConfig(PHASE_PRODUCTION_SERVER, process.cwd());
  const server = new NextNodeServer({
    conf,
    dir: process.cwd(),
    dev: false,
    hostname: "localhost",
    port: 3000,
    customServer: false,
  });
  await server.prepare();
  const handler = server.getRequestHandler();
  async function render(url) {
    const chunks = [];
    const { req, res } = createRequestResponseMocks({
      url,
      method: "GET",
      headers: { host: "localhost:3000" },
      resWriter: (chunk) => {
        chunks.push(Buffer.from(chunk));
        return true;
      },
    });
    await handler(req, res);
    return {
      status: res.statusCode,
      html: Buffer.concat(chunks).toString("utf8"),
    };
  }
  const en = await render("/en/money");
  const ne = await render("/ne/money");
  assert.equal(en.status, 200);
  assert.match(en.html, /<html lang="en"/);
  assert.match(en.html, /Know before you choose/);
  assert.equal(ne.status, 200);
  assert.match(ne.html, /<html lang="ne"/);
  assert.match(ne.html, /छान्नुअघि थाहा पाउनुहोस्/);
  const comparison = await render(
    "/ne/money/fixed-deposits?term=12&payout=maturity",
  );
  assert.equal(comparison.status, 200);
  assert.match(comparison.html, /मुद्दती निक्षेप/);
  assert.doesNotMatch(
    comparison.html,
    /Fictional data|काल्पनिक तथ्याङ्क|Alder Example/,
  );
  const fixtureEvidence = await render(
    "/en/money/fixed-deposits/sources/alder-rate",
  );
  // Next streams not-found responses from async routes. Verify that no fixture record is rendered in either case.
  assert.doesNotMatch(fixtureEvidence.html, /Alder Example|6\.00% per year/);
  const lab = await render("/en/money/review-lab");
  assert.doesNotMatch(
    lab.html,
    /Fictional rate notice|Simulate first review|6\.35%/,
  );
  await server.close();
});

test("first-party compressed route JavaScript stays within the 180 KiB budget", async () => {
  const { pages } = JSON.parse(
    await readFile(".next/app-build-manifest.json", "utf8"),
  );
  for (const route of [
    "/[locale]/money/page",
    "/[locale]/money/[product]/page",
  ]) {
    assert(pages[route]?.length);
    const files = [
      ...new Set([...pages[route], ...pages["/[locale]/layout"]]),
    ].filter((file) => file.endsWith(".js"));
    const compressedBytes = (
      await Promise.all(
        files.map(
          async (file) =>
            gzipSync(await readFile(join(".next", file))).byteLength,
        ),
      )
    ).reduce((sum, bytes) => sum + bytes, 0);
    console.log(
      route + " " + (compressedBytes / 1024).toFixed(1) + " KiB gzip",
    );
    assert(compressedBytes <= 180 * 1024);
  }
});
