import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Page Text", () => {
  test('check what text elements contain "YOUR SAFETY STATUS"', async ({
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

    // Find all elements containing "YOUR SAFETY STATUS"
    const elements = page.locator('text="YOUR SAFETY STATUS"');
    const count = await elements.count();
    console.log(`Found ${count} elements with exact text "YOUR SAFETY STATUS"`);

    if (count > 0) {
      const texts = await elements.allTextContents();
      console.log("Element texts:", texts);

      // Check if any are visible
      for (let i = 0; i < count; i++) {
        const isVisible = await elements.nth(i).isVisible();
        console.log(`Element ${i} is visible: ${isVisible}`);
      }
    } else {
      // Try partial match
      const partialElements = page.locator("text=YOUR SAFETY STATUS");
      const partialCount = await partialElements.count();
      console.log(
        `Found ${partialCount} elements with partial text "YOUR SAFETY STATUS"`,
      );

      if (partialCount > 0) {
        const texts = await partialElements.allTextContents();
        console.log("Partial match element texts:", texts);
      }
    }

    // Take a screenshot
    await page.screenshot({ path: "citizen-safety-status.png" });
  });
});
