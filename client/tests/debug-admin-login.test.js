import { test, expect } from "@playwright/test";

test.describe("Debug Admin Login", () => {
  test("check what happens when admin logs in", async ({ page }) => {
    // Listen for console errors
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
        console.log("Browser console error:", msg.text());
      }
    });

    // Go to login page
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait a bit longer to see what happens
    await page.waitForTimeout(5000);

    // Get the URL
    const url = page.url();
    console.log("URL after login attempt:", url);

    // Get the page title
    const title = await page.title();
    console.log("Page title:", title);

    // Get all text in the body (first 1000 chars)
    const bodyText = await page.locator("body").innerText();
    console.log("Body text (first 1000 chars):", bodyText.substring(0, 1000));

    // Take a screenshot
    await page.screenshot({ path: "admin-login-debug.png" });

    // Log any errors that occurred
    console.log("Total errors captured:", errors.length);
    if (errors.length > 0) {
      console.log("All errors:", errors);
    }
  });
});
