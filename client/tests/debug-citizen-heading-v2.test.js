import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Heading V2", () => {
  test("check what heading is on the citizen dashboard after login", async ({
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

    // Get all text content to see what's actually there
    const allText = await page.locator("body").innerText();
    console.log(
      "All text on citizen page (first 500 chars):",
      allText.substring(0, 500),
    );

    // Look for elements that contain "Dashboard"
    const dashboardElements = page.locator("text=/Dashboard/i");
    const count = await dashboardElements.count();
    console.log(`Found ${count} elements containing "Dashboard"`);

    if (count > 0) {
      const texts = await dashboardElements.allTextContents();
      console.log("Dashboard element texts:", texts);
    }

    // Look for h1 elements specifically
    const h1Elements = page.locator("h1");
    const h1Count = await h1Elements.count();
    console.log(`Found ${h1Count} h1 elements`);

    if (h1Count > 0) {
      const h1Texts = await h1Elements.allTextContents();
      console.log("H1 element texts:", h1Texts);
    }

    // Take a screenshot
    await page.screenshot({ path: "citizen-dashboard-debug-v2.png" });
  });
});
