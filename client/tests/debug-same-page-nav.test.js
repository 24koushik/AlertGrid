import { test, expect } from "@playwright/test";

test.describe("Debug Same Page Navigation", () => {
  test("check if clicking Help & Safety link does same-page navigation", async ({
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

    // First, go to guides page
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Get URL before clicking bottom nav
    const urlBefore = page.url();
    console.log("URL before clicking bottom nav Help & Safety:", urlBefore);

    // Click the Help & Safety link in the DESKTOP sidebar bottom navigation
    await page.click(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Help & Safety")',
    );

    // Wait for potential navigation
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log("URL after clicking bottom nav Help & Safety:", urlAfter);

    // Check if URL changed (it shouldn't for same-page nav)
    console.log("URL changed:", urlBefore !== urlAfter);

    // Now let's test clicking a DIFFERENT link to see if navigation works
    // Go back to guides first if we're not there
    if (!urlAfter.includes("/guides")) {
      await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
      await page.waitForURL("**/guides", { timeout: 5000 });
      await page.waitForTimeout(2000);
    }

    // Now click Profile link from bottom nav
    console.log("Clicking Profile link from bottom nav...");
    await page.click(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Profile")',
    );
    await page.waitForTimeout(2000);
    const urlAfterProfile = page.url();
    console.log("URL after clicking Profile link:", urlAfterProfile);

    // Check if we navigated to profile
    const isOnProfile = urlAfterProfile.includes("/profile");
    console.log("Navigated to profile:", isOnProfile);

    // Take a screenshot
    await page.screenshot({ path: "same-page-nav-debug.png" });
  });
});
