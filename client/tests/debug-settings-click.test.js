import { test, expect } from "@playwright/test";

test.describe("Debug Settings Link Click", () => {
  test("click Settings link by exact text and see what happens", async ({
    page,
  }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Find the Settings link by exact text and click it
    const settingsLink = page.locator(".hidden.md\\:flex a", {
      hasText: "Settings",
    });
    console.log("Settings link count:", await settingsLink.count());

    if ((await settingsLink.count()) > 0) {
      console.log("Settings link is visible:", await settingsLink.isVisible());
      console.log(
        "Settings link href:",
        await settingsLink.getAttribute("href"),
      );

      // Click the link
      await settingsLink.click();

      // Wait a bit and see what URL we end up at
      await page.waitForTimeout(1000);
      console.log("URL immediately after click:", page.url());

      // Wait for navigation to complete
      try {
        await page.waitForURL("**/citizen/settings", { timeout: 5000 });
        console.log("Successfully navigated to settings page");
      } catch (e) {
        console.log("Failed to navigate to settings page after 5 seconds");
        console.log("Current URL:", page.url());

        // Let's see if we're still on the citizen page or if we went somewhere else
        if (page.url().includes("/citizen")) {
          console.log("Still on citizen domain");
        } else {
          console.log("Not on citizen domain anymore");
        }

        // Let's see what's on the page
        const pageText = await page.locator("body").innerText();
        console.log("Page text (first 200 chars):", pageText.substring(0, 200));
      }
    } else {
      console.log("Settings link not found");
    }

    // Take a screenshot
    await page.screenshot({ path: "after-settings-click.png" });
  });
});
