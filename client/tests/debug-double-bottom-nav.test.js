import { test, expect } from "@playwright/test";

test.describe("Debug Double Bottom Nav", () => {
  test("check if there are duplicate bottom nav links", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Find ALL elements matching the bottom nav pattern
    const allBottomNavLinks = page.locator(".px-4.mt-8.space-y-2 a");
    const count = await allBottomNavLinks.count();
    console.log(`Total elements matching '.px-4.mt-8.space-y-2 a': ${count}`);

    // Group them by parent container to see if we have duplicates
    const linkDetails = [];
    for (let i = 0; i < count; i++) {
      const link = allBottomNavLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute("href");

      // Get the parent elements to understand context
      const parentClasses = await link.evaluate((el) => {
        const classes = [];
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          if (parent.className) classes.push(parent.className);
          parent = parent.parentElement;
        }
        return classes.join(" | ");
      });

      linkDetails.push({ index: i, text, href, parentClasses });
      console.log(
        `Link ${i}: text="${text}", href="${href}", parent classes: "${parentClasses}"`,
      );
    }

    // Check if we have links from both sidebar and mobile drawer
    const sidebarLinks = linkDetails.filter((link) =>
      link.parentClasses.includes("flex-1 overflow-y-auto py-6 flex flex-col"),
    );
    const mobileDrawerLinks = linkDetails.filter((link) =>
      link.parentClasses.includes("fixed inset-0 z-50 flex md:hidden"),
    );

    console.log(`Links in sidebar container: ${sidebarLinks.length}`);
    console.log(
      `Links in mobile drawer container: ${mobileDrawerLinks.length}`,
    );

    // Take a screenshot
    await page.screenshot({ path: "double-bottom-nav-debug.png" });
  });
});
