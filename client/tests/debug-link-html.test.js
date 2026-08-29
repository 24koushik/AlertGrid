import { test, expect } from "@playwright/test";

test.describe("Debug Link HTML", () => {
  test("check the actual HTML rendered for bottom nav links", async ({
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

    // Get the HTML of the bottom nav container
    const bottomNavHtml = await page
      .locator(".hidden.md\\:flex .px-4.mt-8.space-y-2")
      .innerHTML();
    console.log("Bottom nav container HTML:");
    console.log(bottomNavHtml);

    // Get the HTML of each link
    const links = page.locator(".hidden.md\\:flex .px-4.mt-8.space-y-2 a");
    const count = await links.count();
    console.log(`Number of links found: ${count}`);

    for (let i = 0; i < count; i++) {
      const linkHtml = await links.nth(i).innerHTML();
      console.log(`Link ${i} HTML: ${linkHtml}`);
    }

    // Try to click the link using evaluate to see if it's a clickability issue
    const helpSafetyLink = page.locator(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Help & Safety")',
    );
    const isEnabled = await helpSafetyLink.isEnabled();
    console.log(`Is Help & Safety link enabled: ${isEnabled}`);

    const isVisible = await helpSafetyLink.isVisible();
    console.log(`Is Help & Safety link visible: ${isVisible}`);

    const boundingBox = await helpSafetyLink.boundingBox();
    console.log(`Help & Safety link bounding box:`, boundingBox);

    // Take a screenshot
    await page.screenshot({ path: "link-html-debug.png" });
  });
});
