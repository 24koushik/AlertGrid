import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Guides Heading", () => {
  test("check what heading is on the citizen guides page", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Navigate to guides page
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get all headings
    const allHeadings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on guides page:", allHeadings);

    // Get the main heading text
    const h1Text = await page.locator("h1").first().textContent();
    console.log("First h1 text:", h1Text);

    const h2Text = await page.locator("h2").first().textContent();
    console.log("First h2 text:", h2Text);

    // Take a screenshot
    await page.screenshot({ path: "citizen-guides-heading.png" });
  });
});
