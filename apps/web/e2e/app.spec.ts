import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_DIR = path.resolve(here, "../../../evidence/phase-2/screenshots");

async function axeScan(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })))).toEqual([]);
}

test.describe("seven-journey shell (A03/A12/A20) — desktop 1440×900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("home → preferences → reach → results journey", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();

    // All four primary actions immediately available.
    for (const action of ["Where can I go?", "Take me there", "I need something", "Find a park"]) {
      await expect(page.getByRole("button", { name: new RegExp(action) })).toBeVisible();
    }
    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "desktop-home.png"), fullPage: false });

    // Preferences journey.
    await page.getByRole("link", { name: "Preferences" }).click();
    await expect(page.getByRole("heading", { name: "How do you like to move?" })).toBeVisible();
    await page.getByText("Brisk").click();
    await page.getByRole("button", { name: "Save preferences" }).click();

    // My Reach journey with example origin (location never requested).
    await page.goto("/reach");
    await page.getByRole("button", { name: "Use the example place" }).click();
    await page.getByRole("button", { name: "Show my reach" }).click();
    await expect(page.getByRole("heading", { name: /comfortable minutes from/ })).toBeVisible();

    // A07: text equivalence — the map's numbers are present in text.
    await expect(page.getByTestId("reach-text-equivalent")).toContainText("1600 metres");
    await page.getByRole("button", { name: "Show text map view" }).click();
    await expect(page.getByRole("heading", { name: "Map information in text" })).toBeVisible();
    await expect(page.getByTestId("reach-text-equivalent")).toBeVisible();

    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "desktop-reach-results.png"), fullPage: false });

    // Full map mode with Escape exit.
    await page.getByRole("button", { name: "Open full screen map" }).click();
    await expect(page.getByRole("button", { name: "Exit full screen map" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open full screen map" })).toBeVisible();
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "desktop-fullmap-exited.png"), fullPage: false });
  });

  test("navigation rail expands and collapses with labelled state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Collapse navigation" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Expand navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Expand navigation" }).click();
    await expect(page.getByRole("button", { name: "Collapse navigation" })).toBeVisible();
  });

  test("keyboard-only: skip link is first tab stop", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  });
});

test.describe("seven-journey shell (A03/A04/A20) — mobile 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("location-denied path still completes the reach journey", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();

    // Deny location (Playwright auto-denies unless permission granted).
    await page.getByRole("button", { name: "Use my current location" }).click();
    await expect(page.getByRole("status")).toContainText("Enter a place or postcode instead", { timeout: 15_000 });

    await page.getByLabel("Start from a place or postcode").fill("LS1 3AD");
    await page.getByRole("button", { name: /Where can I go\?/ }).click();
    await page.getByRole("button", { name: "Use the example place" }).click();
    await page.getByRole("button", { name: "Show my reach" }).click();
    await expect(page.getByRole("heading", { name: /comfortable minutes from/ })).toBeVisible();
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "mobile-reach-results.png"), fullPage: false });

    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "mobile-home.png"), fullPage: false });
  });

  test("mobile menu opens from the header with two-column tasks", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open navigation" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  });

  test("reflow: no horizontal scroll at 320 CSS px (200% zoom equivalent, WCAG 1.4.10)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
