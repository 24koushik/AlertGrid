import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Body Content", () => {
  test("click assign button and examine body content", async ({ page }) => {
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

    // Get initial body content
    const initialBody = await page.locator("body").innerHTML();
    console.log("Initial body length:", initialBody.length);
    console.log("Initial body start:", initialBody.substring(0, 200));

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait a bit for any changes
    await page.waitForTimeout(2000);

    // Get body content after click
    const afterBody = await page.locator("body").innerHTML();
    console.log("After click body length:", afterBody.length);
    console.log("After click body start:", afterBody.substring(0, 200));
    console.log("After click body end:", afterBody.substring(-200));

    // Check if the afterBody contains any of the expected modal strings
    const expectedStrings = [
      "Assign Volunteer",
      "Select Volunteer",
      "Confirm Assignment",
      "bg-black/50",
      "z-50",
      "fixed inset-0",
    ];
    for (const str of expectedStrings) {
      if (afterBody.includes(str)) {
        console.log(`FOUND: ${str}`);
      } else {
        console.log(`NOT FOUND: ${str}`);
      }
    }

    // Also, let's see if the afterBody is just a string or something else
    if (afterBody.length < 500) {
      console.log("Body is very short, possibly not HTML");
      // Try to see if it's plain text
      const bodyText = await page.locator("body").innerText();
      console.log("Body as text:", bodyText);
    }
  });
});
