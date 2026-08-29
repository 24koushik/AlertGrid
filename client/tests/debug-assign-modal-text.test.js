import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Modal by Text", () => {
  test("click assign button and wait for Assign Volunteer text", async ({
    page,
  }) => {
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

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait for the Assign Volunteer text to appear (should be in the modal header)
    try {
      await expect(page.locator('text="Assign Volunteer"')).toBeVisible({
        timeout: 5000,
      });
      console.log('SUCCESS: Found "Assign Volunteer" text!');
    } catch (e) {
      console.log('FAILED: Did not find "Assign Volunteer" text');

      // Let's see what text IS on the page
      const pageText = await page.locator("body").innerText();
      console.log(`Page text length: ${pageText.length}`);
      if (pageText.length < 1000) {
        console.log(`Page text: "${pageText}"`);
      } else {
        console.log(`Page text start: "${pageText.substring(0, 200)}"`);
        console.log(`Page text end: "${pageText.substring(-200)}"`);
      }

      // Let's also take a screenshot
      await page.screenshot({ path: "after-assign-click.png" });
    }
  });
});
