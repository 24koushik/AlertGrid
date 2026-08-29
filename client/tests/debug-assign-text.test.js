import { test, expect } from "@playwright/test";

test.describe("Debug Assignment by Text", () => {
  test("click assign button and wait for modal text", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to Assistance Queue
    await page.click('.hidden.md\\:flex a:has-text("Assistance Queue")');
    await page.waitForURL("**/assistance", { timeout: 5000 });
    await expect(
      page.locator('h1:has-text("Assistance Response Queue")'),
    ).toBeVisible();

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait for modal text to appear
    // Try waiting for "Assign Volunteer" text
    await expect(page.locator('text="Assign Volunteer"')).toBeVisible({
      timeout: 5000,
    });
  });
});
