import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Process", () => {
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

    // Screenshot before clicking Assign
    await page.screenshot({ path: "before-assign.png" });

    // Find a request with SUBMITTED status and click its Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const buttonCount = await assignButtons.count();
    console.log(`Found ${buttonCount} Assign buttons`);

    if (buttonCount > 0) {
      // Click the first Assign button
      await assignButtons.first().click();
      await page.waitForTimeout(2000);

      // Screenshot after clicking Assign
      await page.screenshot({ path: "after-assign.png" });

      // Check for any modals or dialogs
      const dialogs = page.locator('div[role="dialog"]').all();
      const dialogCount = (await dialogs).length;
      console.log(`Dialogs after click: ${dialogCount}`);

      // Check for fixed positioning elements (common for modals)
      const fixedElements = page.locator("div.fixed.inset-0").all();
      const fixedCount = (await fixedElements).length;
      console.log(`Fixed inset-0 elements: ${fixedCount}`);

      // Check for any new elements that appeared
      const allDivsBefore = await page.locator("div").count();
      await page.waitForTimeout(1000);
      const allDivsAfter = await page.locator("div").count();
      console.log(`Div count before: ${allDivsBefore}, after: ${allDivsAfter}`);

      // Let's also check if there's any text that suggests a volunteer selection
      const pageContent = await page.content();
      if (pageContent.includes("Select Volunteer")) {
        console.log('Found "Select Volunteer" in page content');
      }
      if (pageContent.includes("Confirm Assignment")) {
        console.log('Found "Confirm Assignment" in page content');
      }
    } else {
      console.log("No Assign buttons found");
    }
  });
});
