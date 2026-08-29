import { test, expect } from "@playwright/test";

test.describe("Debug Navigation After Assign Click", () => {
  test("check what happens after clicking Assign button", async ({ page }) => {
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

    // Log initial URL
    console.log("BEFORE CLICK:");
    console.log(`  URL: ${page.url()}`);

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait a bit for any changes
    await page.waitForTimeout(2000);

    // Log what happened
    console.log("AFTER CLICK:");
    console.log(`  URL: ${page.url()}`);
    console.log(`  Page title: ${await page.title()}`);

    // Check if we're still on the assistance page
    if (page.url().includes("/assistance")) {
      console.log("  Still on assistance page");

      // Check if the Assign button is still there
      const buttonsAfter = page.locator('button:has-text("Assign")');
      const countAfter = await buttonsAfter.count();
      console.log(`  Found ${countAfter} Assign buttons after click`);
    } else {
      console.log("  NAVIGATED AWAY FROM ASSISTANCE PAGE");

      // Let's see what page we're on now
      const pageContent = await page.content();
      if (pageContent.includes("Assign Volunteer")) {
        console.log('  But we found "Assign Volunteer" in the content');
      }
      if (pageContent.includes("Select Volunteer")) {
        console.log('  But we found "Select Volunteer" in the content');
      }
      if (pageContent.includes("Confirm Assignment")) {
        console.log('  But we found "Confirm Assignment" in the content');
      }
    }
  });
});
