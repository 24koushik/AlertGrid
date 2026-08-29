import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Return to Dashboard", () => {
  test("check what happens when clicking Help & Safety in bottom nav", async ({
    page,
  }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Navigate to guides page first
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Get URL before clicking bottom nav
    const urlBefore = page.url();
    console.log("URL before clicking bottom nav Help & Safety:", urlBefore);

    // Click the Help & Safety link in the bottom navigation to return to dashboard
    await page.click('.px-4.mt-8.space-y-2 a:has-text("Help & Safety")');

    // Wait a bit and check URL
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log(
      "URL after clicking bottom nav Help & Safety (after 2s wait):",
      urlAfter,
    );

    // Wait longer and check URL again
    await page.waitForTimeout(3000);
    const urlAfter2 = page.url();
    console.log(
      "URL after clicking bottom nav Help & Safety (after 5s wait):",
      urlAfter2,
    );

    // Check if we're on the citizen dashboard by looking for "Your Safety Status"
    const safetyStatus = page.locator('text="Your Safety Status"');
    const isVisible = await safetyStatus.isVisible();
    console.log('Is "Your Safety Status" visible:', isVisible);

    if (!isVisible) {
      // Get all text content to see what's actually there
      const allText = await page.locator("body").innerText();
      console.log(
        "All text on page (first 500 chars):",
        allText.substring(0, 500),
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "citizen-return-debug.png" });
  });
});
