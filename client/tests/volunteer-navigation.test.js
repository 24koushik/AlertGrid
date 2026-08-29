import { test, expect } from "@playwright/test";

test.describe("Volunteer Navigation Tests", () => {
  test("volunteer can navigate to all volunteer pages", async ({ page }) => {
    // Login as volunteer
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/volunteer", {
      timeout: 10000,
    });

    // List of volunteer menu items and their expected paths with corresponding heading text
    const menuItems = [
      {
        name: "Response Center",
        path: "/volunteer",
        heading: "Response Center",
      },
      {
        name: "Emergency Alerts",
        path: "/volunteer/alerts",
        heading: "Active Alerts",
      },
      { name: "My Tasks", path: "/volunteer/tasks", heading: "My Tasks" },
      {
        name: "Assistance Requests",
        path: "/volunteer/assistance",
        heading: "Assistance Requests",
      },
      {
        name: "Operations Map",
        path: "/volunteer/map",
        heading: "Operations Map",
      },
      {
        name: "Availability Status",
        path: "/volunteer/availability",
        heading: "Availability",
      },
      { name: "Profile", path: "/volunteer/profile", heading: "My Profile" },
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
      // Go back to the volunteer dashboard for the next iteration (except for the last item)
      if (item.name !== "Profile") {
        // Click on Response Center to go back to the dashboard for the next item
        await page.click("text=Response Center");
        await page.waitForURL("http://localhost:5173/volunteer", {
          timeout: 5000,
        });
      }
    }
  });
});
