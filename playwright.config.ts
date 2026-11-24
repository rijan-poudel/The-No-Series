import { defineConfig } from "@playwright/test";

const demo = !process.env.MONEY_E2E_PUBLIC;
const port = demo ? 3210 : 3211;
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: demo ? "**/journey.spec.ts" : "**/public.spec.ts",
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:" + port,
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: demo
      ? "npm run dev -- --hostname 127.0.0.1 -p " + port
      : "npm run start -- --hostname 127.0.0.1 -p " + port,
    url: "http://127.0.0.1:" + port + "/en/money",
    env: { MONEY_DEMO: "1", NEXT_TELEMETRY_DISABLED: "1" },
    timeout: 120000,
  },
});
