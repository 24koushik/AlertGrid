import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("admin login and navigation", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Verify we're on admin dashboard
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible();

    // Test navigation to a few key pages
    await page.click('.hidden.md\\:flex a:has-text("Volunteers")');
    await page.waitForURL("**/volunteers", { timeout: 5000 });
    await expect(
      page.locator('h1:has-text("Volunteer Operations")'),
    ).toBeVisible();

    await page.click("text=Command Center");
    await page.waitForURL("http://localhost:5173/admin", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible();
  });

  test("citizen login and navigation", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Verify we're on citizen dashboard
    await expect(page.locator('text="Your Safety Status"')).toBeVisible();

    // Test navigation to a few key pages
    await page.click('.hidden.md\\:flex a:has-text("Emergency Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Emergency Alerts")')).toBeVisible();

    await page.click('.hidden.md\\:flex a:has-text("Help & Safety")');
    await page.waitForURL("**/guides", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Safety Guides")')).toBeVisible();

    // Click the Command Center link in the sidebar to return to dashboard
    await page.click('.hidden.md\\:flex a:has-text("Command Center")');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 5000 });
    await expect(page.locator('text="Your Safety Status"')).toBeVisible();
  });

  test("volunteer login and navigation", async ({ page }) => {
    // Login as volunteer
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/volunteer", {
      timeout: 10000,
    });

    // Verify we're on volunteer dashboard
    await expect(page.locator('h1:has-text("Response Center")')).toBeVisible();

    // Test navigation to a few key pages
    await page.click('.hidden.md\\:flex a:has-text("My Tasks")');
    await page.waitForURL("**/tasks", { timeout: 5000 });
    await expect(page.locator('h1:has-text("My Tasks")')).toBeVisible();

    await page.click("text=Response Center");
    await page.waitForURL("http://localhost:5173/volunteer", { timeout: 5000 });
    await expect(page.locator('h1:has-text("Response Center")')).toBeVisible();
  });
});
