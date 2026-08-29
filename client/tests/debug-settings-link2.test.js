import { test, expect } from "@playwright/test";

test.describe("Debug Settings Link Details", () => {
  test("check exact text of sidebar links", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Get all sidebar links and their exact text
    const links = await page.locator(".hidden.md\\:flex a").all();
    console.log(`Found ${links.length} sidebar links:`);

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      console.log(
        `  Link ${i}: text="${text}" (trimmed: "${text.trim()}") href="${href}"`,
      );

      // Check if this is the Settings link
      if (text && text.trim() === "Settings") {
        console.log(`    ^^^ This is the Settings link!`);

        // Try to click it
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`    URL after clicking: ${page.url()}`);

        // Wait for navigation to complete
        await page.waitForURL("**/citizen/settings", { timeout: 5000 });
        console.log(`    Successfully navigated to settings page`);
        break;
      }
    }
  });
});
