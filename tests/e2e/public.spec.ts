import { expect, test } from "@playwright/test";

test("production ignores the demo flag and stays private and unseeded", async ({
  page,
  request,
}) => {
  const readiness = await request.get("/api/v1/readiness");
  expect(readiness.status()).toBe(503);
  expect(readiness.headers()["cache-control"]).toBe("no-store");
  expect(await readiness.json()).toEqual({ status: "unseeded" });
  const refresh = await request.get("/api/v1/notices/refresh");
  expect(refresh.status()).toBe(401);
  expect(refresh.headers()["cache-control"]).toBe("no-store");
  const root = await request.get("/");
  expect(root.url()).toContain("/en/money");
  await page.goto("/en/money/fixed-deposits/compare");
  await expect(page).toHaveURL(/\/en\/money\/fixed-deposits$/);
  await page.getByRole("button", { name: "Compare deposit rates" }).click();
  await expect(
    page.getByRole("heading", { name: "Published annual rates" }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByText("We haven’t verified an option for this choice yet."),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Published bank notices" }),
  ).toHaveCount(0);
  await expect(page.getByText(/fictional data|alder example/i)).toHaveCount(0);
  expect(page.url()).not.toContain("100000");
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  await page.goto("/en/money/dollar-cards?fee=issuance&form=virtual");
  await expect(
    page.getByRole("heading", { name: "Dollar card fees by bank" }),
  ).toBeVisible();
  await page
    .locator(".decoded-card-list")
    .getByText("Everest Bank", { exact: true })
    .click();
  await expect(page.getByText("Each payment", { exact: true })).toBeVisible();
  await expect(
    page
      .locator(".decoded-card-list")
      .getByText("Minimum USD 1.00", { exact: true }),
  ).toBeVisible();
  await page.getByText("Compare charges", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByText("Reload", { exact: true }).click();
  await expect(page.getByText("Counter only", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Includes the first load", { exact: true }),
  ).toBeVisible();
  await page.getByText("Renewal", { exact: true }).click();
  await expect(
    page.getByText("Virtual · renewal or replacement", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/en/money/banks");
  const commercial = page.locator(".directory-group").first();
  await commercial.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(commercial.getByRole("link")).toHaveCount(20);
  await page.getByRole("searchbox").fill("NMB");
  const suggestion = page
    .locator(".bank-suggestions")
    .getByRole("link", { name: "NMB Bank" });
  await expect(suggestion).toBeVisible();
  await page.getByRole("searchbox").press("ArrowDown");
  await expect(suggestion).toBeFocused();
  await suggestion.press("Enter");
  await expect(page.getByText("Each time you add funds")).toBeVisible();
  await expect(
    page.getByText("Cross-border transaction", { exact: true }),
  ).toBeVisible();
  const evidence = page.locator("details").filter({
    has: page.locator("summary").filter({ hasText: "See sources" }),
  });
  await expect(
    evidence.getByRole("link", { name: /September 2026 tariff/ }),
  ).toHaveCount(0);
  await page.getByText("See sources", { exact: true }).click();
  await expect(
    evidence.getByRole("link", { name: /September 2026 tariff/ }),
  ).toBeVisible();
  await page.goto("/en/money/mobile-banking");
  const fees = page.getByRole("table", { name: "Mobile banking fees" });
  await expect(fees).toBeHidden();
  await page.getByText("Compare fees", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(fees).toBeVisible();
  await expect(
    fees.getByRole("row", { name: /Nepal Bank/ }).getByText("per account"),
  ).toHaveCount(2);
  await expect(
    fees
      .getByRole("row", { name: /Nepal SBI/ })
      .getByText("NPR 0.00", { exact: true }),
  ).toBeVisible();
  await expect(
    fees.getByRole("row", { name: /Everest/ }).getByText("Unconfirmed"),
  ).toHaveCount(2);
  const nepalBank = fees.getByRole("link", { name: "Nepal Bank", exact: true });
  await nepalBank.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#mobile-fees-nepal$/);
  await expect(page.locator("#mobile-fees-nepal")).toBeFocused();
  await expect(page.getByText("Renew one account for a year")).toBeVisible();
  await expect(page.getByText("Reset your PIN", { exact: true })).toBeVisible();
  await page
    .locator(".decoded-card-list")
    .getByText("Nepal SBI Bank", { exact: true })
    .click();
  await expect(page.getByText("Mobile banking each year")).toBeVisible();
  await page
    .locator(".decoded-card-list")
    .getByText("Everest Bank", { exact: true })
    .click();
  await expect(
    page.locator(".decoded-card-list").getByText("Reset your own PIN"),
  ).toBeVisible();
  await expect(
    page.locator(".decoded-card-list").getByText("Reset your PIN at a branch"),
  ).toBeVisible();
  const pinFees = page.locator("details").filter({
    has: page.getByText("Compare PIN reset fees", { exact: true }),
  });
  await expect(pinFees.getByText("Method unspecified")).toBeHidden();
  await pinFees.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(pinFees.getByText("Method unspecified")).toBeVisible();
  await expect(pinFees.getByText("NPR 0.00", { exact: true })).toBeVisible();
  await expect(pinFees.getByText("NPR 75.00", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ne/money/mobile-banking");
  await page.getByText("शुल्क तुलना गर्नुहोस्", { exact: true }).click();
  await expect(page.getByRole("columnheader", { name: "दर्ता" })).toBeVisible();
  await page
    .getByText("पिन रिसेट शुल्क तुलना गर्नुहोस्", { exact: true })
    .click();
  await expect(page.getByText("रिसेट गर्ने तरिका खुलाइएको छैन")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    360,
  );
  await page.goto("/ne/money/dollar-cards");
  await page.getByText("शुल्क तुलना गर्नुहोस्", { exact: true }).click();
  await page.getByText("रकम थप्दा", { exact: true }).click();
  await expect(
    page.getByText("काउन्टरमा मात्र", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    360,
  );
  const sample = await request.get(
    "/en/money/fixed-deposits/sources/alder-rate",
  );
  expect(sample.status()).toBe(404);
  const invalid = await request.post("/api/v1/compare/fixed-deposits", {
    data: { amount: "100000" },
  });
  expect(invalid.status()).toBe(400);
  const large = await request.post("/api/v1/compare/fixed-deposits", {
    data: { amount: "1".repeat(2200) },
  });
  expect(large.status()).toBe(413);
});

test("bank comparison preserves source scope, missing fees and the chosen banks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/money/banks/everest");
  await page
    .locator("main")
    .getByRole("link", { name: "Compare banks" })
    .click();
  await expect(page.getByLabel("First bank")).toHaveValue("everest");
  await page
    .getByLabel("What do you want to compare?")
    .selectOption("mobileBankingFees");
  await expect(page.locator(".pair-term")).toBeHidden();
  const second = page.getByLabel("Second bank");
  await expect(
    second.locator('optgroup[label="Banks with comparison data"] option'),
  ).toHaveCount(3);
  await expect(second.locator('option[value="everest"]')).toHaveJSProperty(
    "disabled",
    true,
  );
  await second.selectOption("nepal-sbi");
  await page.getByRole("button", { name: "Compare banks" }).press("Enter");
  const row = page.getByRole("row", {
    name: /Mobile banking fees · Compare PIN reset fees/,
  });
  await expect(row.getByText("Reset your PIN at a branch")).toBeVisible();
  await expect(row.getByText("NPR 75.00")).toBeVisible();
  await expect(
    page.getByRole("table").getByText("Unconfirmed").first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "नेपाली" }).click();
  await expect(page.getByRole("table")).toContainText(
    "शाखाबाट पिन रिसेट गर्दा",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    360,
  );
});

test("bank lookup supports arrow navigation and explains an empty search", async ({
  page,
}) => {
  await page.goto("/en/money");
  const search = page.getByRole("searchbox");
  await search.fill("Nepal");
  const matches = page.locator(".bank-suggestions a");
  await search.press("ArrowDown");
  await expect(matches.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(matches.nth(1)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).toBeFocused();
  await expect(matches).toHaveCount(0);
  await search.fill("unknown-bank");
  await expect(
    page.getByRole("status").filter({ hasText: "No matching bank" }),
  ).toBeVisible();
});

test("reader can reopen the same filtered comparison from its copied link", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard unavailable");
        },
      },
    }),
  );
  await page.goto(
    "/en/money/banks/compare?a=nmb&b=nic-asia&product=dollarCardFees",
  );
  await page.getByRole("link", { name: /Missing details/ }).click();
  await expect(page.getByRole("table")).toContainText("Renewal");
  await expect(page.getByRole("table")).not.toContainText("Issuance");
  await page.getByRole("button", { name: "Copy comparison link" }).click();
  const field = page.getByLabel("Select and copy this link");
  await expect(field).toBeFocused();
  await page.goto(await field.inputValue());
  await expect(
    page.getByRole("link", { name: /Missing details/ }),
  ).toHaveAttribute("aria-current", "page");
});

test("reader checks a savings minimum and estimates a year of fees", async ({
  page,
}) => {
  await page.goto("/en/money/savings?bank=nepal");
  await page.getByLabel("Planned balance in NPR (optional)").fill("४९९");
  await page.getByRole("button", { name: "Show accounts" }).click();
  await expect(
    page.getByRole("cell", { name: "Below the listed minimum" }),
  ).toBeVisible();
  await page.goto("/en/money/usage-cost?bank=nepal-sbi");
  await page.getByLabel("Include annual mobile banking renewal").check();
  await page.getByRole("button", { name: "Calculate fees" }).click();
  await expect(page.getByRole("cell", { name: "NPR 380.00" })).toBeVisible();
});

test("savings shortlist keeps the bank and balance on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/en/money/savings?balance=1000");
  await page
    .getByRole("navigation", { name: "Filter by minimum balance" })
    .getByRole("link", { name: /Meets the listed minimum/ })
    .click();
  const table = page.getByRole("table");
  await expect(
    table.getByRole("link", { name: "NMB Bank", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("link", { name: "Nepal SBI Bank", exact: true }),
  ).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    360,
  );
  await table
    .getByRole("link", { name: "Compare with NMB Bank", exact: true })
    .click();
  await expect(page.getByLabel("First bank")).toHaveValue("nmb");
  await expect(
    page.getByLabel("Planned balance in NPR (optional)"),
  ).toHaveValue("1000");
});
