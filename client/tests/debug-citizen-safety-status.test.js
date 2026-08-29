import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Safety Status", () => {
  test("check what happens after clicking Help & Safety", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Click on Help & Safety
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');

    // Wait for navigation
    await page.waitForURL("**/guides", { timeout: 5000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get the URL
    const url = page.url();
    console.log("URL after clicking Help & Safety:", url);

    // Get all headings
    const allHeadings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on guides page:", allHeadings);

    // Click back to Help & Safety in bottom nav
    await page.click("text=Help & Safety");

    // Wait for navigation back to citizen
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 5000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get the URL
    const url2 = page.url();
    console.log("URL after clicking Help & Safety (bottom nav):", url2);

    // Look for "Your Safety Status" text
    const safetyStatusElements = page.locator('text="Your Safety Status"');
    const count = await safetyStatusElements.count();
    console.log(`Found ${count} elements with text "Your Safety Status"`);

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const isVisible = await safetyStatusElements.nth(i).isVisible();
        console.log(`Element ${i} is visible: ${isVisible}`);
        const text = await safetyStatusElements.nth(i).textContent();
        console.log(`Element ${i} text: "${text}"`);
      }
    }

    // Take a screenshot
    await page.screenshot({ path: "citizen-safety-status-debug.png" });
  });
});
