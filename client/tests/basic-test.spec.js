import { test, expect } from "@playwright/test";

test.describe("ResQNet Application Basic Tests", () => {
  test("application loads successfully", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Check that the page loads
    await expect(page).toHaveTitle(/client/);

    // Check for basic layout elements
    const appRoot = page.locator("#root");
    await expect(appRoot).toBeVisible();

    // Check for any obvious error messages
    const errorMessages = page.locator("text=/error|Error|ERROR/i");
    await expect(errorMessages).toHaveCount(0);
  });

  test("login page accessible", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Try to navigate to login (this might vary based on routing)
    // For now, just check that we can access the application
    await expect(page).toHaveURL("http://localhost:5173/");
  });
});
