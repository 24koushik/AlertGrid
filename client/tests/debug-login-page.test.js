import { test, expect } from "@playwright/test";

test.describe("Debug Login Page", () => {
  test("check what is on the login page", async ({ page }) => {
    // Go to login page
    await page.goto("http://localhost:5173/login");

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get all text content to see what's actually there
    const allText = await page.locator("body").innerText();
    console.log(
      "All text on login page (first 500 chars):",
      allText.substring(0, 500),
    );

    // Look for input elements
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input elements`);

    if (inputCount > 0) {
      const inputPlaceholders = await inputs.evaluateAll((el) =>
        el.map((i) => i.placeholder),
      );
      console.log("Input placeholders:", inputPlaceholders);
    }

    // Look for button elements
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} button elements`);

    if (buttonCount > 0) {
      const buttonTexts = await buttons.allTextContents();
      console.log("Button texts:", buttonTexts);
    }

    // Take a screenshot
    await page.screenshot({ path: "login-page-debug.png" });
  });
});
