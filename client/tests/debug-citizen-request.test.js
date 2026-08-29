import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Request Form", () => {
  test("check citizen request form elements", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });
    await expect(page.locator('text="Your Safety Status"')).toBeVisible();

    // Navigate to My Requests
    await page.click('.hidden.md\\:flex a:has-text("My Requests")');
    await page.waitForURL("**/requests", { timeout: 5000 });
    await expect(page.locator('h1:has-text("My Requests")')).toBeVisible();

    // Click Request Help button
    await page.click('button:has-text("Request Help")');
    await page.waitForTimeout(2000);

    // Check what's in the modal
    const modal = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    if ((await modal.count()) > 0) {
      console.log("Modal found");

      // Check form elements
      const requestTypeSelect = modal.locator('select[name="requestType"]');
      console.log(
        `Request type select count: ${await requestTypeSelect.count()}`,
      );

      if ((await requestTypeSelect.count()) > 0) {
        const options = await requestTypeSelect.locator("option").all();
        console.log(`Request type options: ${options.length}`);
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const text = await option.textContent();
          const value = await option.getAttribute("value");
          console.log(`  Option ${i}: value="${value}", text="${text.trim()}"`);
        }

        // Try to select an option
        try {
          await requestTypeSelect.selectOption("Evacuation");
          console.log("Successfully selected Evacuation");
        } catch (err) {
          console.log(`Failed to select Evacuation: ${err.message}`);
        }
      }

      // Check textarea
      const textarea = modal.locator(
        'textarea[placeholder="Describe your situation and number of people affected..."]',
      );
      console.log(`Textarea count: ${await textarea.count()}`);

      // Check priority select
      const prioritySelect = modal.locator('select[name="priority"]');
      console.log(`Priority select count: ${await prioritySelect.count()}`);

      if ((await prioritySelect.count()) > 0) {
        const options = await prioritySelect.locator("option").all();
        console.log(`Priority options: ${options.length}`);
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const text = await option.textContent();
          const value = await option.getAttribute("value");
          console.log(
            `  Priority ${i}: value="${value}", text="${text.trim()}"`,
          );
        }
      }

      // Check submit button
      const submitButton = modal.locator('button:has-text("Submit Request")');
      console.log(`Submit button count: ${await submitButton.count()}`);
    } else {
      console.log("No modal found!");

      // Let's see what's on the page
      const pageContent = await page.content();
      if (pageContent.includes("Request Emergency Assistance")) {
        console.log(
          'But "Request Emergency Assistance" text IS in the page content',
        );
      }
    }
  });
});
