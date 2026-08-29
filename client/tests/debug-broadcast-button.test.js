import { test, expect } from "@playwright/test";

test.describe("Debug Broadcast Alert Button", () => {
  test("check broadcast alert button and modal", async ({ page }) => {
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

    // Check what buttons are present
    const buttons = await page.locator("button").all();
    console.log(`Found ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      console.log(`  Button ${i}: "${text.trim()}"`);
    }

    // Check for the Broadcast Alert button specifically
    const broadcastButton = page.locator('button:has-text("Broadcast Alert")');
    const count = await broadcastButton.count();
    console.log(`Found ${count} buttons with text "Broadcast Alert"`);

    if (count > 0) {
      // Check the first one
      const first = broadcastButton.first();
      console.log("First Broadcast Alert button:");
      console.log(`  Visible: ${await first.isVisible()}`);
      console.log(`  Enabled: ${await first.isEnabled()}`);
      console.log(
        `  Bounding box: ${JSON.stringify(await first.boundingBox())}`,
      );

      // Try to click it and see what happens
      await first.click();
      await page.waitForTimeout(2000);

      // Check if any dialogs appeared
      const dialogs = await page.locator('div[role="dialog"]').all();
      console.log(`Found ${dialogs.length} dialogs after click:`);
      for (let i = 0; i < dialogs.length; i++) {
        const dialog = dialogs[i];
        console.log(`  Dialog ${i}: visible=${await dialog.isVisible()}`);
      }
    }
  });
});
