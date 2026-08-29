import { test, expect } from "@playwright/test";

test.describe("Debug Admin Sidebar", () => {
  test("check what sidebar links are visible on admin dashboard", async ({
    page,
  }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Get all links in the sidebar
    const links = await page.locator(".hidden.md\\:flex a").allTextContents();
    console.log("All admin sidebar links:", links);

    // Get all text in the sidebar
    const sidebarText = await page.locator(".hidden.md\\:flex").innerText();
    console.log("Full admin sidebar text:", sidebarText);

    // Take a screenshot
    await page.screenshot({ path: "admin-sidebar.png" });
  });
});
