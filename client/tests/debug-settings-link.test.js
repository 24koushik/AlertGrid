import { test, expect } from "@playwright/test";

test.describe("Debug Settings Link", () => {
  test("check if Settings link is visible and clickable", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Check if Settings link exists in the sidebar
    const settingsLink = page.locator(
      '.hidden.md\\:flex a:has-text("Settings")',
    );
    const settingsLinkCount = await settingsLink.count();
    console.log("Number of Settings links found:", settingsLinkCount);

    if (settingsLinkCount > 0) {
      // Check if it's visible
      const isVisible = await settingsLink.isVisible();
      console.log("Settings link visible:", isVisible);

      // Get the href attribute
      const href = await settingsLink.getAttribute("href");
      console.log("Settings link href:", href);

      // Try to click it
      await settingsLink.click();
      // Wait for navigation
      await page.waitForTimeout(2000);
      console.log("URL after clicking Settings:", page.url());
    } else {
      // Let's see what links ARE in the sidebar
      const allSidebarLinks = await page
        .locator(".hidden.md\\:flex a")
        .allTextContents();
      console.log("All sidebar links:", allSidebarLinks);

      // Let's see all text in the sidebar
      const sidebarText = await page.locator(".hidden.md\\:flex").innerText();
      console.log("Full sidebar text:", sidebarText);
    }

    // Take a screenshot
    await page.screenshot({ path: "sidebar-debug.png" });
  });
});
