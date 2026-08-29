import { test, expect } from "@playwright/test";

test.describe("Debug Admin Heading", () => {
  test("check what heading is on the admin dashboard after login", async ({
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

    // Get all headings
    const allHeadings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on admin page:", allHeadings);

    // Get the main heading text
    const h1Text = await page.locator("h1").first().textContent();
    console.log("First h1 text:", h1Text);

    const h2Text = await page.locator("h2").first().textContent();
    console.log("First h2 text:", h2Text);

    // Take a screenshot
    await page.screenshot({ path: "admin-dashboard-heading.png" });
  });
});
