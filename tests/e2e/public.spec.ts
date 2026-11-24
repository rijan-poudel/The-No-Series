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
  await page.getByRole("button", { name: "See the options" }).click();
  await expect(
    page.getByText("We haven’t verified an option for this choice yet."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Published bank notices" }),
  ).toHaveAttribute("href", "/en/money/notices?term=12");
  await expect(page.getByText(/fictional data|alder example/i)).toHaveCount(0);
  expect(page.url()).not.toContain("100000");
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  await page.goto("/en/money/dollar-cards?fee=issuance&form=virtual");
  await expect(
    page.getByRole("heading", { name: "Bank fee schedules and card terms" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "NMB tariff archive" }),
  ).toHaveAttribute("href", /standard-tariff-charges$/);
  await expect(
    page.getByText("We haven’t verified an option for this choice yet."),
  ).toHaveCount(0);
  await page.goto("/en/money?intent=existing");
  await page.getByRole("link", { name: "Choose your bank" }).click();
  await page.getByRole("searchbox").fill("NMB");
  await page.getByRole("button", { name: "Find", exact: true }).click();
  await page.getByRole("link", { name: "NMB Bank", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Check deposit rates" }),
  ).toHaveAttribute("href", "/en/money/notices?bank=nmb");
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
