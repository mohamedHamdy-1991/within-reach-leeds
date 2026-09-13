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
  expect(
    results.violations,
    JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.length }))),
  ).toEqual([]);
}

test.describe("full-screen real map shell (A03/A12/A20) — desktop 1440×900", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("map is full-screen with real tiles canvas and floating panels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();
    // The map canvas takes the whole viewport.
    const canvas = page.locator(".maplibregl-canvas");
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(1200);
    expect(box?.height).toBeGreaterThan(800);
    // Panels float: rail + task panel + toolbar all present over the map.
    await expect(page.locator(".rail-float")).toBeVisible();
    await expect(page.locator(".map-topbar")).toBeVisible();

    for (const action of ["Where can I go?", "Take me there", "I need something", "Find a park"]) {
      await expect(page.getByRole("button", { name: new RegExp(action) })).toBeVisible();
    }
    await expect(
      page.getByText(/Live API connected|Leeds source register loaded/).first(),
    ).toBeVisible({ timeout: 15_000 });

    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "desktop-home.png"), fullPage: false });
  });

  test("home → preferences → reach → results journey with real rings", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Preferences" }).click();
    await expect(page.getByRole("heading", { name: "How do you like to move?" })).toBeVisible();
    await page.getByText("Brisk").click();
    await page.getByRole("button", { name: "Save preferences" }).click();

    // Real isochrone requests go out as soon as the reach view mounts.
    const reachResponse = page.waitForResponse((response) => response.url().includes("/api/v1/reach"));
    await page.goto("/reach");
    await page.getByRole("button", { name: "use Park Square" }).click();
    await reachResponse;
    await page.getByRole("button", { name: "Show my reach" }).click();

    await expect(page.getByRole("heading", { name: /comfortable minutes from/ })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("reach-text-equivalent")).toBeVisible();
    await expect(page.getByText(/of the standard/).first()).toBeVisible();

    // Journey tabs are clickable: Confidence tab shows the calculation detail.
    await page.getByRole("tab", { name: "Confidence" }).click();
    await expect(page.getByRole("heading", { name: "How this was calculated" })).toBeVisible();
    await page.getByRole("button", { name: "Show the detail" }).click();
    await expect(page.getByText(/real isochrones on the walking network/i)).toBeVisible();

    // Map/text parity (A07): the global text view mirrors the results.
    await page.getByRole("button", { name: "Show text map view" }).click();
    await expect(page.getByRole("heading", { name: "Map information in text" })).toBeVisible();
    await page.getByRole("button", { name: "Close text view" }).click();

    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "desktop-reach-results.png"), fullPage: false });
  });

  test("panel minimises to the dock and restores", async ({ page }) => {
    await page.goto("/reach");
    await expect(page.getByText("How far can you go?")).toBeVisible();
    await page.getByRole("button", { name: "Minimise My Reach" }).click();
    await expect(page.getByRole("button", { name: "My Reach" })).toBeVisible(); // dock chip
    await page.getByRole("button", { name: "My Reach" }).click();
    await expect(page.getByText("How far can you go?")).toBeVisible();
  });

  test("full map mode with Escape exit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open full screen map" }).click();
    await expect(page.getByRole("button", { name: "Exit full screen map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open full screen map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();
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

test.describe("PWA offline shell (A16)", () => {
  test("shell loads from the service worker when the network is cut", async ({ page, context }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();
    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe("Phase 5 feature journeys on the real map", () => {
  test("find need lists provenance-carrying results and opens map popup", async ({ page }) => {
    await page.goto("/find");
    await page.getByRole("button", { name: /^Seat/ }).click();
    await expect(page.locator(".place-results li").first()).toBeVisible({ timeout: 15_000 });
    const first = page.locator(".place-results li").first();
    await expect(first).toContainText(/verified|mapped|community verified|inferred|unknown/i);
    await first.getByRole("button").click();
    await expect(page.locator(".maplibregl-popup").first()).toBeVisible({ timeout: 10_000 });
  });

  test("route comparison draws real lines and discloses unknowns (A06)", async ({ page }) => {
    await page.goto("/route");
    await page.getByLabel("Destination").fill("Kirkgate");
    await page.getByRole("button", { name: "Compare routes" }).click();
    await expect(page.getByRole("heading", { name: "Fastest" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Unknown —/).first()).toBeVisible();
    await expect(page.getByText("Plan, don't navigate")).toBeVisible();
  });

  test("ParkMatch separates unknown evidence honestly (A09)", async ({ page }) => {
    await page.goto("/parks");
    await page.getByText("Regular benches").click();
    await page.getByRole("button", { name: "Show park matches" }).click();
    await expect(page.getByRole("heading", { name: /.+/, level: 2 }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("We don't have evidence for this yet.").first()).toBeVisible();
    await expect(page.getByText("Never inferred", { exact: true })).toBeVisible();
  });
});

test.describe("full-screen map shell — mobile 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("location-denied path still completes the reach journey", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Explore Leeds" })).toBeVisible();

    await page.getByRole("button", { name: "Use my current location" }).click();
    await expect(page.getByRole("status")).toContainText("Enter a place or postcode instead", { timeout: 15_000 });

    await page.getByLabel("Start from a place or postcode").fill("LS1 3AD");
    await page.getByRole("button", { name: /Where can I go\?/ }).click();
    await page.getByRole("button", { name: "use Park Square" }).click();
    await page.getByRole("button", { name: "Show my reach" }).click();
    await expect(page.getByRole("heading", { name: /comfortable minutes from/ })).toBeVisible({ timeout: 25_000 });
    await expect(page.locator(".maplibregl-canvas")).toBeVisible();
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "mobile-reach-results.png"), fullPage: false });

    await axeScan(page);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, "mobile-home.png"), fullPage: false });
  });

  test("mobile menu opens from the header", async ({ page }) => {
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
