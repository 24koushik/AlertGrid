import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Sidebar", () => {
  test("check what sidebar links are visible", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Get all links in the sidebar
    const links = await page.locator(".hidden.md\\:flex a").allTextContents();
    console.log("All sidebar links:", links);

    // Get all text in the sidebar
    const sidebarText = await page.locator(".hidden.md\\:flex").innerText();
    console.log("Full sidebar text:", sidebarText);

    // Take a screenshot
    await page.screenshot({ path: "citizen-sidebar.png" });
  });
});
