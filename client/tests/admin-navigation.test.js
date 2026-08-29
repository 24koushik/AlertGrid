import { test, expect } from "@playwright/test";

test.describe("Admin Navigation Tests", () => {
  test("admin can navigate to all admin pages", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // List of admin menu items and their expected paths with corresponding heading text
    const menuItems = [
      { name: "Command Center", path: "/admin", heading: "Command Center" },
      { name: "Alerts", path: "/admin/alerts", heading: "Alert Management" },
      {
        name: "Incidents",
        path: "/admin/incidents",
        heading: "Incident Tracking",
      },
      {
        name: "Shelters",
        path: "/admin/shelters",
        heading: "Shelter Management",
      },
      {
        name: "Assistance Queue",
        path: "/admin/assistance",
        heading: "Assistance Response Queue",
      },
      {
        name: "Volunteers",
        path: "/admin/volunteers",
        heading: "Volunteer Operations",
      },
      { name: "Tasks", path: "/admin/tasks", heading: "Task Management" },
      { name: "Analytics", path: "/admin/analytics", heading: "Analytics" },
      { name: "Audit Logs", path: "/admin/audit-logs", heading: "Audit Logs" },
      { name: "Settings", path: "/admin/settings", heading: "Settings" },
    ];

    for (const item of menuItems) {
      // Click the menu item
      await page.click(`text=${item.name}`);
      // Wait for navigation - we need to wait for the URL to contain the path
      await page.waitForURL(`**${item.path}`, { timeout: 5000 });
      // Verify we are on the correct page by checking if URL includes the path
      await expect(page.url()).toContain(item.path);
      // Check for a heading on the page
      const heading = page.locator(
        `h1:has-text("${item.heading}"), h2:has-text("${item.heading}")`,
      );
      await expect(heading).toBeVisible({ timeout: 5000 });
      // Go back to the admin dashboard for the next iteration (except for the last item)
      if (item.name !== "Settings") {
        // Click on Command Center to go back to the dashboard for the next item
        await page.click("text=Command Center");
        await page.waitForURL("http://localhost:5173/admin", { timeout: 5000 });
      }
    }
  });
});
