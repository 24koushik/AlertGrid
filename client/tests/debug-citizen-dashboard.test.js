import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Dashboard", () => {
  test("check what headings are on the citizen dashboard", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Get all headings on the page
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on the citizen dashboard:", headings);

    // Get all text content that might be headings
    const allText = await page.locator("body").innerText();
    console.log("First 500 chars of body text:", allText.substring(0, 500));

    // Take a screenshot for debugging
    await page.screenshot({ path: "citizen-dashboard.png" });
  });
});
