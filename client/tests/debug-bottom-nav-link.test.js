import { test, expect } from "@playwright/test";

test.describe("Debug Bottom Nav Link Properties", () => {
  test("check properties of the Help & Safety link in bottom nav", async ({
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

    // Find all links in the bottom nav container
    const bottomNavLinks = page.locator(".px-4.mt-8.space-y-2 a");
    const count = await bottomNavLinks.count();
    console.log(`Found ${count} links in bottom nav container`);

    for (let i = 0; i < count; i++) {
      const link = bottomNavLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      const className = await link.getAttribute("class");
      console.log(
        `Link ${i}: text="${text}", href="${href}", class="${className}"`,
      );

      // Check if it's the Help & Safety link
      if (text?.trim() === "Help & Safety") {
        console.log(`Found Help & Safety link at index ${i}`);
        // Try to click it and see what happens
        console.log("Clicking Help & Safety link...");
        await link.click();
        await page.waitForTimeout(1000);
        const newUrl = page.url();
        console.log(`URL after click: ${newUrl}`);
      }
    }

    // Take a screenshot
    await page.screenshot({ path: "bottom-nav-links-debug.png" });
  });
});
