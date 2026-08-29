import { test, expect } from "@playwright/test";

test.describe("Debug Settings Navigation", () => {
  test("click Settings link and see where we go", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Store the initial URL
    const initialUrl = page.url();
    console.log("Initial URL:", initialUrl);

    // Find and click the Settings link using text selector
    const settingsLink = page.locator("text=Settings");
    console.log(
      "Settings link count (text selector):",
      await settingsLink.count(),
    );
    console.log("Settings link visible:", await settingsLink.isVisible());

    // Click it
    await settingsLink.click();

    // Wait a bit
    await page.waitForTimeout(1000);

    // Check URL after click
    const urlAfterClick = page.url();
    console.log("URL after click:", urlAfterClick);

    // Wait for navigation to settings
    try {
      await page.waitForURL("**/citizen/settings", { timeout: 5000 });
      console.log("Successfully navigated to settings page");

      // Check if we can see the Settings heading
      const settingsHeading = page.locator(
        'h1:has-text("Account Settings"), h2:has-text("Account Settings")',
      );
      const headingVisible = await settingsHeading.isVisible();
      console.log("Account Settings heading visible:", headingVisible);
    } catch (e) {
      console.log("Failed to navigate to settings page");
      console.log("Current URL after timeout:", page.url());

      // Let's see what's on the page
      const pageText = await page.locator("body").innerText();
      console.log("Page text (first 500 chars):", pageText.substring(0, 500));

      // Take a screenshot
      await page.screenshot({ path: "settings-navigation-fail.png" });
    }
  });
});
