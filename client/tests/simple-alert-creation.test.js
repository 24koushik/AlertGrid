import { test, expect } from "@playwright/test";

test.describe("Simple Alert Creation Test", () => {
  test("admin can create a simple alert", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible();

    // Navigate to Alerts
    await page.click('.hidden.md\\:flex a:has-text("Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Alert Management")')).toBeVisible();

    // Click Broadcast Alert to open modal
    await page.click("text=Broadcast Alert");
    await page.waitForTimeout(2000);

    // Fill in the form using the correct selectors from our debugging
    await page.fill(
      'input[placeholder="e.g. Extreme Flood Warning"]',
      "TEST ALERT: Simple E2E Test",
    );

    // Find description textarea by its label
    await page
      .locator('label:has-text("Description")')
      .locator("xpath=..")
      .locator("textarea")
      .fill("This is a simple test alert created during end-to-end testing.");

    // Select severity
    await page.selectOption("select", "CRITICAL");

    // Fill in the form fields using index-based selection (since they have no placeholders)
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(1).fill("Flood"); // Disaster type (second text input)
    await inputs.nth(2).fill("13.0827"); // Latitude (third text input)
    await inputs.nth(3).fill("80.2707"); // Longitude (fourth text input)

    // Fill radius (number input)
    await page.locator('input[type="number"]').fill("10");

    // Set expiry time (datetime-local input)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const expiryString = expiryDate.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', expiryString);

    // Fill instructions
    await page
      .locator('label:has-text("Instructions for Citizens")')
      .locator("xpath=..")
      .locator("textarea")
      .fill("This is a test. No action required.");

    // Submit the alert
    await page.click('button:has-text("Broadcast Alert")');
    await page.waitForTimeout(3000);

    // Verify the alert was created by checking if it appears in the list
    const alertItem = await page
      .locator('text="TEST ALERT: Simple E2E Test"')
      .isVisible();
    expect(alertItem).toBeTruthy();

    // Take a screenshot for verification
    await page.screenshot({ path: "simple-alert-created.png" });
  });
});
