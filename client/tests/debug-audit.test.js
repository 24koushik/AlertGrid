import { test, expect } from "@playwright/test";

test.describe("Debug Audit Logs Page", () => {
  test("check navigation to audit logs page", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Click on Audit Logs and see what happens
    await page.click("text=Audit Logs");

    // Wait a bit and see what URL we end up at
    await page.waitForTimeout(2000);

    console.log("Current URL after clicking Audit Logs:", page.url());

    // Get all headings on the page
    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings on the page:", headings);

    // Get all text content that might be headings
    const allText = await page.locator("body").innerText();
    console.log("First 500 chars of body text:", allText.substring(0, 500));

    // Take a screenshot for debugging
    await page.screenshot({ path: "audit-logs-page.png" });
  });
});
