import { test, expect } from "@playwright/test";

test.describe("Citizen Flow Tests", () => {
  test("citizen can log in and view alerts", async ({ page }) => {
    // Go to the login page
    await page.goto("http://localhost:5173/login");

    // Fill in the login form
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard (root path redirects based on role)
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Verify we are on the citizen dashboard
    await expect(page).toHaveURL("http://localhost:5173/citizen");

    // Check for citizen dashboard elements
    const citizenHeading = page.locator(
      'h1:has-text("Citizen"), h1:has-text("Dashboard"), h1:has-text("Safety Portal")',
    );
    await expect(citizenHeading).toBeVisible({ timeout: 5000 });

    // Navigate to the alerts page
    await page.click("text=Alerts");
    await page.waitForURL("**/citizen/alerts", { timeout: 5000 });

    // Verify we are on the citizen alerts page
    await expect(page).toHaveURL(/.*\/citizen\/alerts/);

    // Check for alerts heading
    const alertsHeading = page.locator(
      'h1:has-text("Alerts"), h2:has-text("Alerts")',
    );
    await expect(alertsHeading).toBeVisible();

    // Check for alerts table or message
    const alertsTable = page.locator("table");
    const noAlertsMessage = page.locator("text=/no alerts|no data|empty/i");

    // Wait for either the table or a message to be visible
    await expect(alertsTable.or(noAlertsMessage)).toBeVisible({
      timeout: 5000,
    });
  });
});
