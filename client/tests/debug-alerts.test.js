import { test, expect } from "@playwright/test";

test.describe("Debug Alerts Page", () => {
  test("check what is rendered on alerts page", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to the alerts page
    await page.click("text=Alerts");
    await page.waitForURL("**/admin/alerts", { timeout: 5000 });

    // Get all headings on the page
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on the page:", headings);

    // Get all text content that might be headings
    const allText = await page.locator("body").innerText();
    console.log("First 500 chars of body text:", allText.substring(0, 500));

    // Take a screenshot for debugging
    await page.screenshot({ path: "alerts-page.png" });
  });
});
