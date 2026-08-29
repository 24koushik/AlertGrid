import { test, expect } from "@playwright/test";

test.describe("Debug Sidebar Classes", () => {
  test("check what classes the sidebar element has", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Try different selectors for the sidebar
    const selectors = [
      ".hidden.md\\:flex",
      '[class*="hidden"][class*="md:flex"]',
      "div.hidden.md\\:flex",
      ".w-64",
      '[class*="bg-slate-900"]',
      "aside",
      '[role="complementary"]',
    ];

    for (const selector of selectors) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        const className = await element.first().getAttribute("class");
        console.log(`Selector "${selector}" matches ${count} element(s)`);
        console.log(`  Class: "${className}"`);

        // Get the text content to see if it's the sidebar
        const text = await element.first().textContent();
        console.log(`  Text preview: "${text?.substring(0, 100)}..."`);
        console.log();
      }
    }

    // Also, let's see what links are on the page overall
    const allLinks = await page.locator("a").allTextContents();
    console.log(`All links on page (${allLinks.length}):`);
    allLinks.forEach((text, index) => {
      if (text.trim()) {
        console.log(`  ${index}: "${text.trim()}"`);
      }
    });
  });
});
