import { test, expect } from "@playwright/test";

test.describe("Debug Desktop Bottom Nav", () => {
  test("check if clicking Help & Safety in desktop bottom nav works", async ({
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

    // First, go to guides page
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Get URL before clicking bottom nav
    const urlBefore = page.url();
    console.log(
      "URL before clicking desktop bottom nav Help & Safety:",
      urlBefore,
    );

    // Click the Help & Safety link in the DESKTOP sidebar bottom navigation
    // Desktop sidebar: .hidden.md\\:flex
    // Bottom nav within it: .px-4.mt-8.space-y-2
    await page.click(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Help & Safety")',
    );

    // Wait for navigation
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log(
      "URL after clicking desktop bottom nav Help & Safety:",
      urlAfter,
    );

    // Check if we're back on the citizen dashboard by looking for "Your Safety Status"
    const safetyStatus = page.locator('text="Your Safety Status"');
    const isVisible = await safetyStatus.isVisible();
    console.log('Is "Your Safety Status" visible:', isVisible);

    // Take a screenshot
    await page.screenshot({ path: "citizen-desktop-bottom-nav-debug.png" });
  });
});
