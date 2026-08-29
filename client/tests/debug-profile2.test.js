import { test, expect } from "@playwright/test";

test.describe("Debug Profile Page - Take 2", () => {
  test("check what is rendered on profile page by looking for unique text", async ({
    page,
  }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Navigate to profile page
    await page.click("text=Profile");
    await page.waitForURL("**/citizen/profile", { timeout: 5000 });

    // Wait a bit for any loading
    await page.waitForTimeout(1000);

    // Look for the text "Loading profile..." which is in the Profile component when loading
    const loadingText = page.locator("text=Loading profile...");
    await expect(loadingText).toBeVisible({ timeout: 5000 });

    // Also look for the text "My Profile" in an h1
    const myProfileHeading = page.locator('h1:has-text("My Profile")');
    await expect(myProfileHeading).toBeVisible({ timeout: 5000 });

    // If we see the loading text, wait for it to disappear and then look for form labels
    // Alternatively, we can check if the API call is working by looking for network activity
    // but for now, let's just see if we can get past the loading state.

    // Wait for the loading text to disappear (if it does)
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });

    // Now look for the form
    const fullNameLabel = page.locator('label:has-text("Full Name")');
    await expect(fullNameLabel).toBeVisible({ timeout: 5000 });
  });
});
