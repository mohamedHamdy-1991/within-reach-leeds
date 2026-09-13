import { test } from "@playwright/test";
test("mobile geometry", async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 871 });
  await page.goto("/");
  await page.getByRole("heading", { name: "Explore Leeds" }).waitFor();
  const geo = await page.evaluate(() => {
    const rail = document.querySelector(".rail-float")!.getBoundingClientRect();
    const panel = document.querySelector(".control-panel")!.getBoundingClientRect();
    return {
      rail: { top: Math.round(rail.top), w: Math.round(rail.width), h: Math.round(rail.height) },
      panel: { left: Math.round(panel.left), bottomGap: Math.round(window.innerHeight - panel.bottom) },
      overlap: rail.bottom > panel.top && rail.right > panel.left,
    };
  });
  console.log("MOBILE_GEO:", JSON.stringify(geo));
});
