import { test, expect } from "@playwright/test";

test.describe("Citizen Navigation Tests", () => {
  test("citizen can navigate to all citizen pages", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // List of citizen menu items and their expected paths with corresponding heading text
    const menuItems = [
      {
        name: "Command Center",
        path: "/citizen",
        heading: "YOUR SAFETY STATUS",
      },
      { name: "Alerts", path: "/citizen/alerts", heading: "Emergency Alerts" },
      { name: "Requests", path: "/citizen/requests", heading: "My Requests" },
      { name: "Shelters", path: "/citizen/shelters", heading: "Safe Shelters" },
      { name: "Profile", path: "/citizen/profile", heading: "My Profile" },
      {
        name: "Help & Safety",
        path: "/citizen/guides",
        heading: "Safety Guides",
      },
      {
        name: "Settings",
        path: "/citizen/settings",
        heading: "Account Settings",
      },
    ];

    for (const item of menuItems) {
      // Click the menu item - target only link elements in the sidebar to avoid clicking heading divs
      await page.click(`.hidden.md\\:flex a:has-text("${item.name}")`);
      // Wait for navigation - we need to wait for the URL to contain the path
      await page.waitForURL(`**${item.path}`, { timeout: 5000 });
      // Verify we are on the correct page by checking if URL includes the path
      await expect(page.url()).toContain(item.path);
      // Check for the heading or a unique text on the page
      if (item.name === "Profile") {
        // Handle profile page with loading state
        const loadingText = page.locator("text=Loading profile...");
        const myProfileHeading = page.locator('h1:has-text("My Profile")');
        // Wait for either loading text or heading to appear (whichever comes first, up to 5 seconds)
        await Promise.race([
          loadingText.waitFor({ state: "visible", timeout: 5000 }),
          myProfileHeading.waitFor({ state: "visible", timeout: 5000 }),
        ]);
        // If loading text is visible, wait for it to disappear (up to 10 seconds)
        if (await loadingText.isVisible()) {
          await expect(loadingText).toBeHidden({ timeout: 10000 });
        }
        // Now the heading should be visible (wait up to 5 seconds)
        await expect(myProfileHeading).toBeVisible({ timeout: 5000 });
      } else {
        // For all other pages, check for the heading
        const heading = page.locator(
          `h1:has-text("${item.heading}"), h2:has-text("${item.heading}")`,
        );
        await expect(heading).toBeVisible({ timeout: 5000 });
      }
      // Go back to the citizen dashboard for the next iteration (except for the last item)
      if (item.name !== "Settings") {
        // Click on Command Center to go back to the dashboard for the next item
        await page.click("text=Command Center");
        await page.waitForURL("http://localhost:5173/citizen", {
          timeout: 5000,
        });
      }
    }
  });
});
