import { test, expect } from "@playwright/test";

test.describe("Debug Admin Alerts Page", () => {
  test("check what buttons and elements are on the admin alerts page", async ({
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

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get all buttons
    const buttons = await page.locator("button").allTextContents();
    console.log("All buttons on alerts page:", buttons);

    // Get all headings
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on alerts page:", headings);

    // Get all links
    const links = await page.locator("a").allTextContents();
    console.log("All links on alerts page:", links);

    // Take a screenshot
    await page.screenshot({ path: "admin-alerts-page-debug.png" });

    // Get the HTML content to see what's actually there
    const pageHtml = await page.locator("body").innerHTML();
    console.log("Page HTML (first 2000 chars):", pageHtml.substring(0, 2000));
  });
});
