import { test, expect } from "@playwright/test";

test.describe("Debug Click Handler", () => {
  test("check if clicking button triggers state change", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to Alerts
    await page.click('.hidden.md\\:flex a:has-text("Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Alert Management")')).toBeVisible();

    // Screenshot before click
    await page.screenshot({ path: "before-click.png" });

    // Check for any elements that might indicate modal state
    const modalOverlayBefore = await page
      .locator("div.fixed.inset-0.bg-black\\/50")
      .count();
    console.log(`Modal overlay elements before click: ${modalOverlayBefore}`);

    // Click the Broadcast Alert button
    await page.click('button:has-text("Broadcast Alert")');
    await page.waitForTimeout(1000);

    // Screenshot after click
    await page.screenshot({ path: "after-click.png" });

    // Check for any elements that might indicate modal state
    const modalOverlayAfter = await page
      .locator("div.fixed.inset-0.bg-black\\/50")
      .count();
    console.log(`Modal overlay elements after click: ${modalOverlayAfter}`);

    // Also check for the modal content from the AlertManagement.tsx
    const modalContent = await page
      .locator("div.bg-white.rounded-xl.shadow-lg")
      .count();
    console.log(`Modal content elements: ${modalContent}`);

    // Check for any new divs that appeared
    const allDivsBefore = await page.locator("div").count();
    await page.waitForTimeout(1000);
    const allDivsAfter = await page.locator("div").count();
    console.log(`Div count before: ${allDivsBefore}, after: ${allDivsAfter}`);

    // Let's also check if there are any React devtools hints or data attributes
    const pageContent = await page.content();
    if (pageContent.includes("createModalOpen")) {
      console.log("Found createModalOpen reference in HTML");
    }

    // Let's look for the specific modal structure from the AlertManagement.tsx
    const broadcastModal = await page
      .locator("text=Broadcast New Alert")
      .count();
    console.log(`Elements with text "Broadcast New Alert": ${broadcastModal}`);
  });
});
