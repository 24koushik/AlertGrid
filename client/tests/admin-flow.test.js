import { test, expect } from "@playwright/test";

test.describe("Admin Flow Tests", () => {
  test("admin can log in and navigate to alerts", async ({ page }) => {
    // Go to the login page
    await page.goto("http://localhost:5173/login");

    // Fill in the login form
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard (root path redirects based on role)
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Verify we are on the admin dashboard
    await expect(page).toHaveURL("http://localhost:5173/admin");

    // Check for admin dashboard elements - look for the Command Center heading
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible({
      timeout: 5000,
    });

    // Navigate to the alerts page
    await page.click("text=Alerts");
    await page.waitForURL("**/alerts", { timeout: 5000 });

    // Verify we are on the alerts page
    await expect(page).toHaveURL(/.*\/alerts/);

    // Check for the alerts table or create alert button
    const alertsTable = page.locator("table");
    const createAlertButton = page.locator(
      'button:has-text("Create Alert"), button:has-text("New Alert")',
    );

    // Wait for either the table or the button to be visible
    await expect(alertsTable.or(createAlertButton)).toBeVisible({
      timeout: 5000,
    });

    // If there's a create button, we can create an alert
    if (await createAlertButton.isVisible()) {
      await createAlertButton.click();
      await page.waitForURL("**/alerts/create", { timeout: 5000 });

      // Fill in the alert form
      await page.fill(
        'input[name="title"]',
        "Browser Integration Test — Critical Flood",
      );
      await page.fill(
        'textarea[name="description"]',
        "Browser end-to-end integration test.",
      );
      await page.selectOption('select[name="disasterType"]', "Flood");
      await page.selectOption('select[name="severity"]', "CRITICAL");
      await page.fill('input[name="latitude"]', "13.0827");
      await page.fill('input[name="longitude"]', "80.2707");
      await page.fill('input[name="radius"]', "10");
      await page.fill('input[name="instructions"]', "Test instructions");

      // Set expiry time (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expiryTime = tomorrow.toISOString().slice(0, 16);
      await page.fill('input[name="expiryTime"]', expiryTime);

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for navigation back to alerts list
      await page.waitForURL("**/alerts", { timeout: 10000 });

      // Verify the alert appears in the list
      const alertRow = page.locator(
        "text=Browser Integration Test — Critical Flood",
      );
      await expect(alertRow).toBeVisible({ timeout: 5000 });
    } else {
      // If there's no create button, we can at least verify the alerts list loads
      await expect(alertsTable).toBeVisible();
    }
  });
});
