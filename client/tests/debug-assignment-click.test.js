import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Click", () => {
  test("check what happens when we click Assign button", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to Assistance Queue
    await page.click('.hidden.md\\:flex a:has-text("Assistance Queue")');
    await page.waitForURL("**/assistance", { timeout: 5000 });
    await expect(
      page.locator('h1:has-text("Assistance Response Queue")'),
    ).toBeVisible();

    // Let's first make sure we have at least one request
    const requestRows = await page.locator("tr").all();
    console.log(`Found ${requestRows.length} table rows`);

    // Look for any Assign buttons
    const assignButtons = page.locator('button:has-text("Assign")');
    const buttonCount = await assignButtons.count();
    console.log(`Found ${buttonCount} Assign buttons`);

    if (buttonCount > 0) {
      // Let's examine the first Assign button
      const firstButton = assignButtons.first();
      console.log("First Assign button:");
      console.log(`  Visible: ${await firstButton.isVisible()}`);
      console.log(`  Enabled: ${await firstButton.isEnabled()}`);

      // Let's see what row this button is in
      const buttonRow = firstButton.locator("xpath=ancestor::tr[1]");
      const rowText = await buttonRow.textContent();
      console.log(`  Button row text: "${rowText.substring(0, 100)}..."`);

      // Now let's click it and see what happens
      await firstButton.click();
      await page.waitForTimeout(2000);

      // Let's check if any new elements appeared
      const allDivsBefore = await page.locator("div").count();
      await page.waitForTimeout(1000);
      const allDivsAfter = await page.locator("div").count();
      console.log(`Div count before: ${allDivsBefore}, after: ${allDivsAfter}`);

      // Check for common modal selectors
      const modalSelectors = [
        'div[role="dialog"]',
        "div.fixed.inset-0.bg-black\\/50",
        "div.fixed.inset-0.z-50",
        "div.bg-white.rounded-xl.shadow-lg",
      ];

      for (const selector of modalSelectors) {
        const count = await page.locator(selector).count();
        console.log(`Selector "${selector}": ${count} elements`);
      }

      // Let's also check if there's any text that indicates a form or modal
      const pageContent = await page.content();
      if (pageContent.includes("Select Volunteer")) {
        console.log('Found "Select Volunteer" in page content after click');
      }
      if (pageContent.includes("Confirm Assignment")) {
        console.log('Found "Confirm Assignment" in page content after click');
      }
      if (pageContent.includes("Assign Volunteer")) {
        console.log('Found "Assign Volunteer" in page content after click');
      }
    } else {
      console.log("No Assign buttons found - let's see what's in the table");

      // Let's look at the first few rows to see what data we have
      const rows = await page.locator("tbody tr").all();
      for (let i = 0; i < Math.min(rows.length, 3); i++) {
        const row = rows[i];
        const text = await row.textContent();
        console.log(`Row ${i}: "${text.substring(0, 100)}..."`);
      }
    }
  });
});
