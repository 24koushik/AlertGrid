import { test, expect } from "@playwright/test";

test.describe("Debug Click Event", () => {
  test("monitor what happens when clicking Help & Safety link", async ({
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

    // Go to alerts page first to test a known working navigation
    await page.click('.hidden.md\\:flex a:has-text("Emergency Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Go to guides page
    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Now let's spy on the link and see what happens when we click it
    const helpSafetyLink = page.locator(
      '.hidden.md\\:flex .px-4.mt-8.space-y-2 a:has-text("Help & Safety")',
    );

    // Log link properties before click
    console.log("=== BEFORE CLICK ===");
    const hrefBefore = await helpSafetyLink.getAttribute("href");
    console.log("Href before click:", hrefBefore);
    const textBefore = await helpSafetyLink.textContent();
    console.log("Text before click:", textBefore);

    // Set up console.log to capture any navigation-related messages
    page.on("console", (msg) => {
      if (
        msg.text().includes("navigation") ||
        msg.text().includes("url") ||
        msg.text().includes("click")
      ) {
        console.log("Page console:", msg.text());
      }
    });

    // Try clicking with force=true to bypass any potential overlays
    console.log("Attempting click with force=true...");
    await helpSafetyLink.click({ force: true });

    // Wait and check URL multiple times
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      console.log(`URL after ${(i + 1) * 1} second(s):`, url);
      if (url === "http://localhost:5173/citizen") {
        console.log("SUCCESS: Navigated back to citizen dashboard!");
        break;
      }
    }

    // Final check
    const finalUrl = page.url();
    console.log("Final URL:", finalUrl);

    // Take a screenshot
    await page.screenshot({ path: "click-event-debug.png" });
  });
});
