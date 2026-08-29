import { test, expect } from "@playwright/test";

test.describe("Debug Simple Assign", () => {
  test("click assign button and see what happens", async ({ page }) => {
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

    // Take a screenshot before clicking
    await page.screenshot({ path: "before-click-assign.png" });

    // Find and click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const count = await assignButtons.count();
    console.log(`Found ${count} Assign buttons`);

    if (count > 0) {
      await assignButtons.first().click();
      await page.waitForTimeout(3000); // Wait longer to see what happens

      // Take a screenshot after clicking
      await page.screenshot({ path: "after-click-assign.png" });

      // Check for any text that might indicate a modal
      const pageContent = await page.content();
      if (pageContent.includes("Assign Volunteer")) {
        console.log('Found "Assign Volunteer" in page content');
      }
      if (pageContent.includes("Select Volunteer")) {
        console.log('Found "Select Volunteer" in page content');
      }
      if (pageContent.includes("Confirm Assignment")) {
        console.log('Found "Confirm Assignment" in page content');
      }

      // Check for fixed positioned elements that might be modals
      const fixedElements = page.locator("div.fixed.inset-0");
      const fixedCount = await fixedElements.count();
      console.log(`Found ${fixedCount} fixed inset-0 elements`);

      // Check for any divs with high z-index (modals often have high z-index)
      const highZIndex = page.locator(
        'div[style*="z-index"], div[style*="zIndex"]',
      );
      const zIndexCount = await highZIndex.count();
      console.log(`Found ${zIndexCount} elements with z-index in style`);
    }
  });
});
