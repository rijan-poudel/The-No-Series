import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const axe = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

async function accessibility(page: Page) {
  await page.addScriptTag({ path: axe });
  const violations = await page.evaluate(async () => {
    const tool = (
      window as unknown as {
        axe: {
          run: (options: unknown) => Promise<{ violations: { id: string }[] }>;
        };
      }
    ).axe;
    return (
      await tool.run({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      })
    ).violations.map(({ id }) => id);
  });
  expect(violations).toEqual([]);
}

test("discovery leads to the catch, a scoped deposit pick, then evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/money");
  await expect(
    page.getByRole("heading", {
      name: "Compare bank rates and fees in Nepal.",
    }),
  ).toBeVisible();
  await expect(page.locator("main").getByRole("link")).toHaveCount(3);
  await accessibility(page);
  await expect(page.locator(".quiet-brand")).toHaveText("No");
  await expect(
    page.getByRole("link", { name: "Dollar card fees" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Fixed deposits" }).click();
  await expect(page.getByRole("heading", { name: /The catch/i })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Compare deposit rates" }).click();
  await expect(
    page.getByRole("heading", { name: "Highest advertised rate" }),
  ).toBeVisible();
  await expect(page.locator(".paper-picks > article")).toHaveCount(1);
  await expect(page.locator(".runners > article").first()).toBeVisible();
  const top = page.getByRole("article").filter({ visible: true }).first();
  await expect(top.getByText(/fictional data/i)).toBeVisible();
  await expect(top.locator("time[datetime]")).toBeVisible();
  await expect(top.getByText(/Deposit from.*Up to/)).toBeVisible();
  await expect(
    top.getByRole("link", { name: "Visit official institution site" }),
  ).toHaveCount(0);
  await top.getByText("See sources").click();
  await expect(
    top.getByRole("link", { name: "Eligibility", exact: true }),
  ).toHaveCount(0);
  await top.getByText("Other terms and sources").click();
  await expect(
    top.getByRole("link", { name: "Eligibility", exact: true }),
  ).toBeVisible();
  await top.getByRole("link", { name: "Annual interest rate" }).click();
  await expect(
    page.getByRole("heading", { name: "Annual interest rate" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back" }).click();
  await expect(
    page.getByRole("heading", { name: "Highest advertised rate" }),
  ).toBeVisible();
});

test("Nepali mobile retains the selected term and offers a clear empty state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ne/money/fixed-deposits");
  await page.getByText("३ महिना", { exact: true }).click();
  await page
    .getByRole("button", { name: "निक्षेपका ब्याजदर तुलना गर्नुहोस्" })
    .click();
  await expect(
    page.getByText("यो छनोटका लागि कुनै विकल्प अझै पुष्टि भएको छैन।"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "तपाईंको छनोटका विकल्पहरू" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/money\/fixed-deposits\?term=3/);
  await page.getByText("Change your choice").click();
  await expect(
    page.getByRole("radio", { name: "3 months", exact: true }),
  ).toBeChecked();
  await accessibility(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("dollar card picks distinguish app reload fees from branch reload fees", async ({
  page,
}) => {
  await page.goto("/en/money/dollar-cards");
  await expect(
    page.getByText("App and branch fees can differ.", { exact: false }),
  ).toBeVisible();
  await page.getByText("Options", { exact: true }).click();
  await page.getByText("App reload fee", { exact: true }).click();
  await page.getByRole("button", { name: "Compare card fees" }).click();
  await expect(
    page.getByRole("heading", { name: "Lowest verified fee" }),
  ).toBeVisible();
  const leaders = page.locator(".paper-picks > article h3");
  const appPick = await leaders.first().textContent();
  await page.getByText("Change your choice").click();
  await page.getByText("Branch reload fee", { exact: true }).click();
  await page.getByRole("button", { name: "Compare card fees" }).click();
  await expect(leaders.first()).not.toHaveText(appPick!);
});

test("local review walkthrough shows changed and disputed outcomes", async ({
  page,
}) => {
  await page.goto("/en/money/coverage");
  await page.getByRole("link", { name: "Source review walkthrough" }).click();
  await expect(
    page.getByRole("heading", { name: "Candidate ready" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Simulate first review" }).click();
  await page.getByRole("link", { name: "Simulate independent review" }).click();
  await page.getByRole("link", { name: "Publish demo release" }).click();
  await expect(
    page.getByRole("heading", { name: /published/i }).first(),
  ).toBeVisible();
});

test("capture the homepage, fictional deposit result and Nepali mobile form", async ({
  page,
}, info) => {
  async function capture(name: string) {
    await page.evaluate(() => document.fonts.ready);
    const font = await page.locator("h1").evaluate((heading) => {
      const family = getComputedStyle(heading)
        .fontFamily.split(",")[0]
        .replace(/["']/g, "")
        .trim();
      return {
        family,
        loaded: [...document.fonts].some(
          (face) =>
            face.family.replace(/["']/g, "") === family &&
            face.status === "loaded",
        ),
      };
    });
    expect(font).toEqual({
      family:
        (await page.locator("html").getAttribute("lang")) === "ne"
          ? "Tiro Devanagari Hindi"
          : "Instrument Serif",
      loaded: true,
    });
    await page.screenshot({ path: info.outputPath(name + ".png") });
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/en/money");
  for (const width of [1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const bounds = await page
      .locator(".masthead,.intent-home,.footer-row")
      .evaluateAll((elements) =>
        elements.map((el) => {
          const { x, width } = el.getBoundingClientRect();
          return [x, width];
        }),
      );
    expect(bounds).toEqual(Array(3).fill([(width - 690) / 2, 690]));
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await capture("home");
  await page.goto("/ne/money");
  await capture("desktop-ne-home");
  await page.goto("/en/money/fixed-deposits?term=12&payout=maturity");
  await expect(page.getByText(/fictional data/i).first()).toBeVisible();
  await capture("demo-fd-results");
  await page
    .locator(".paper-picks > article")
    .first()
    .screenshot({ path: info.outputPath("demo-fd-card.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ne/money/fixed-deposits");
  await expect(
    page.locator('input[name="term"]:checked + span'),
  ).toBeInViewport();
  await expect(
    page.locator('input[name="payout"]:checked + span'),
  ).toBeInViewport();
  const term = page.locator('input[name="term"][value="12"]');
  const payout = page.locator('input[name="payout"][value="maturity"]');
  const submit = page.locator('.guide-form button[type="submit"]');
  await expect(term).toBeChecked();
  await expect(payout).toBeChecked();
  await expect(submit).toBeInViewport({ ratio: 1 });
  await capture("mobile-ne");
  await page.locator("header a[hreflang]").focus();
  await page.keyboard.press("Tab");
  await expect(term).toBeFocused();
  await expect(term.locator("+ span")).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('input[value="24"]')).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(payout).toBeFocused();
  await expect(payout.locator("+ span")).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('input[value="quarterly"]')).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();
  await page.goto("/ne/money");
  await capture("mobile-ne-home");
  await page.goto("/en/money");
  await capture("mobile-en-home");
  await page.goto("/ne/money/fixed-deposits?term=12&payout=maturity");
  await expect(
    page.locator(".paper-picks > article time").first(),
  ).toHaveAttribute("datetime", "2026-11-23");
  await expect(
    page.locator(".paper-picks > article time").first(),
  ).toContainText("२०८३");
  await capture("mobile-ne-results");
});
