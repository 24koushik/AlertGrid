import { test, expect } from "@playwright/test";

test.describe("Debug Modal Opening", () => {
  test("check what happens when we click Broadcast Alert button", async ({
    page,
  }) => {
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

    // Check initial state - no dialogs
    let initialDialogs = await page.locator('div[role="dialog"]').all();
    console.log(`Initial dialogs: ${initialDialogs.length}`);

    // Click the Broadcast Alert button (should open modal)
    await page.click('button:has-text("Broadcast Alert")');
    await page.waitForTimeout(1000);

    // Check for dialogs after click
    let dialogsAfterClick = await page.locator('div[role="dialog"]').all();
    console.log(`Dialogs after click: ${dialogsAfterClick.length}`);

    if (dialogsAfterClick.length > 0) {
      const dialog = dialogsAfterClick[0];
      console.log(`Dialog visible: ${await dialog.isVisible()}`);

      // Check what's inside the dialog
      const dialogButtons = await dialog.locator("button").all();
      console.log(`Buttons in dialog: ${dialogButtons.length}`);
      for (let i = 0; i < dialogButtons.length; i++) {
        const button = dialogButtons[i];
        const text = await button.textContent();
        console.log(`  Dialog button ${i}: "${text.trim()}"`);
      }

      // Check form elements
      const textInputs = await dialog.locator('input[type="text"]').all();
      console.log(`Text inputs in dialog: ${textInputs.length}`);

      const textareas = await dialog.locator("textarea").all();
      console.log(`Textareas in dialog: ${textareas.length}`);
    }
  });
});
