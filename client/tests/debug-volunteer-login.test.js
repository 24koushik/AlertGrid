import { test, expect } from "@playwright/test";

test.describe("Debug Volunteer Login", () => {
  test("login as volunteer and see what page we get", async ({ page }) => {
    // Go to login page
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Get the URL
    const url = page.url();
    console.log("URL after login:", url);

    // Get the page title
    const title = await page.title();
    console.log("Page title:", title);

    // Get the main heading or some text to see what page we are on
    const h1Text = await page.locator("h1").first().textContent();
    console.log("First h1 text:", h1Text);

    // Get all text in the body (first 500 chars)
    const bodyText = await page.locator("body").innerText();
    console.log("Body text (first 500 chars):", bodyText.substring(0, 500));

    // Take a screenshot
    await page.screenshot({ path: "volunteer-login-debug.png" });
  });
});
