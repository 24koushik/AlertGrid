import { test, expect } from "@playwright/test";

test.describe("Debug Sidebar Element", () => {
  test("find sidebar element by various selectors", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Try various selectors for the sidebar
    const selectors = [
      '[class*="hidden"][class*="md:flex"]',
      'div[class*="hidden"][class*="md:flex"]',
      ".hidden.md\\:flex",
      "div.hidden.md\\:flex",
      '[class="hidden md:flex w-64 flex-col bg-slate-900 text-white"]',
      '[class*="bg-slate-900"][class*="text-white"]',
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

        // If this looks like the sidebar, try to find links inside it
        if (
          className &&
          className.includes("hidden") &&
          className.includes("md:flex")
        ) {
          console.log(
            `  --> This looks like the sidebar! Looking for links inside...`,
          );
          const linksInside = element.locator("a");
          const linksCount = await linksInside.count();
          console.log(`     Found ${linksCount} links inside this element`);

          for (let i = 0; i < Math.min(linksCount, 10); i++) {
            // Show first 10 links
            const link = linksInside.nth(i);
            const linkText = await link.textContent();
            const linkHref = await link.getAttribute("href");
            console.log(
              `       Link ${i}: "${linkText?.trim()}" -> ${linkHref}`,
            );
          }

          // Look for Settings link specifically
          const settingsLinks = linksInside.filter({ hasText: /^Settings$/ });
          const settingsCount = await settingsLinks.count();
          console.log(
            `     Found ${settingsCount} links with exact text "Settings"`,
          );

          const settingsLinksRegex = linksInside.filter({
            hasText: /Settings/,
          });
          const settingsRegexCount = await settingsLinksRegex.count();
          console.log(
            `     Found ${settingsRegexCount} links containing "Settings"`,
          );
        }
      }
    }
  });
});
