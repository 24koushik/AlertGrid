import { test, expect } from "@playwright/test";

test.describe("Debug Bottom Nav from Alerts Page", () => {
  test("click Help & Safety in bottom nav from alerts page", async ({
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

    // Go to alerts page first
    await page.click('.hidden.md\\:flex a:has-text("Emergency Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Get URL before clicking bottom nav
    const urlBefore = page.url();
    console.log("URL before clicking bottom nav Help & Safety:", urlBefore);

    // Click the Help & Safety link in the bottom navigation
    await page.click(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Help & Safety")',
    );

    // Wait for navigation
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log("URL after clicking bottom nav Help & Safety:", urlAfter);

    // Check if we navigated to guides
    const isOnGuides = urlAfter.includes("/guides");
    console.log("Navigated to guides page:", isOnGuides);

    // Take a screenshot
    await page.screenshot({ path: "bottom-nav-from-alerts-debug.png" });
  });
});
