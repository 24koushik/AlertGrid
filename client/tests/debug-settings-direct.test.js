import { test, expect } from "@playwright/test";

test.describe("Debug Settings Direct Navigation", () => {
  test("go directly to settings page and see what we get", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Now go directly to the settings page
    await page.goto("http://localhost:5173/citizen/settings");
    await page.waitForTimeout(1000); // Wait for any initial rendering

    // Get the URL to confirm we are where we think we are
    const url = page.url();
    console.log("Current URL:", url);

    // Get all headings on the page
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on the page:", headings);

    // Get all text content that might be headings
    const allText = await page.locator("body").innerText();
    console.log("First 500 chars of body text:", allText.substring(0, 500));

    // Take a screenshot for debugging
    await page.screenshot({ path: "settings-direct.png" });
  });
});
