import { test, expect } from "@playwright/test";

test.describe("Debug Bottom Nav Click", () => {
  test("check if clicking Help & Safety in bottom nav works", async ({
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

    // Get all bottom nav links - based on the layout, it's in: .px-4 mt-8 space-y-2
    const bottomNavLinks = page.locator(".px-4.mt-8.space-y-2 a");
    const count = await bottomNavLinks.count();
    console.log(`Found ${count} bottom nav links`);

    if (count > 0) {
      const texts = await bottomNavLinks.allTextContents();
      console.log("Bottom nav link texts:", texts);
    }

    // Try to click on the Help & Safety link specifically in the bottom nav
    await page.click('.px-4.mt-8.space-y-2 a:has-text("Help & Safety")');

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Check URL
    const url = page.url();
    console.log("URL after clicking bottom nav Help & Safety:", url);

    // Take a screenshot
    await page.screenshot({ path: "bottom-nav-click.png" });
  });
});
