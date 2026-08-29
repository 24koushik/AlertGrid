import { test, expect } from "@playwright/test";

test.describe("Debug Assignment - What Actually Happens", () => {
  test("click assign button and examine DOM changes", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to Assistance Queue
    await page.click('.hidden.md\\:flex a:has-text("Assistance Queue")');
    await page.waitForURL("**/assistance", { timeout: 5000 });
    await expect(
      page.locator('h1:has-text("Assistance Response Queue")'),
    ).toBeVisible();

    // Get initial HTML snapshot of a small part of the page
    const initialHtml = await page.locator("body").innerHTML();
    console.log("Initial body length:", initialHtml.length);

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait a bit for any changes
    await page.waitForTimeout(2000);

    // Get HTML after click
    const afterHtml = await page.locator("body").innerHTML();
    console.log("After click body length:", afterHtml.length);

    // Check if lengths are different
    if (initialHtml.length !== afterHtml.length) {
      console.log("Body length changed!");

      // Look for new divs that might be modals
      const divsAfter = await page.locator("div").all();
      console.log(`Total divs after click: ${divsAfter.length}`);

      // Look for elements with fixed positioning
      const fixedDivs = await page.locator("div.fixed").all();
      console.log(`Fixed divs after click: ${fixedDivs.length}`);

      // Look for elements with high z-index in style attribute
      const zIndexDivs = await page
        .locator('div[style*="z-index"], div[style*="zIndex"]')
        .all();
      console.log(`Divs with z-index in style: ${zIndexDivs.length}`);

      // Let's look for any text that contains words from the expected modal
      const pageText = await page.locator("body").innerText();
      const modalKeywords = [
        "Assign Volunteer",
        "Select Volunteer",
        "Confirm Assignment",
        "Cancel",
      ];
      for (const keyword of modalKeywords) {
        if (pageText.includes(keyword)) {
          console.log(`FOUND KEYWORD: "${keyword}"`);
        }
      }
    } else {
      console.log("Body length did NOT change");

      // Let's check if maybe we navigated away or something else happened
      const url = page.url();
      console.log(`Current URL: ${url}`);
    }
  });
});
