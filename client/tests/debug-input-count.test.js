import { test, expect } from "@playwright/test";

test.describe("Debug Input Count and Types", () => {
  test("count and list all input elements by type", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/admin", { timeout: 10000 });

    // Navigate to Alerts
    await page.click('.hidden.md\\:flex a:has-text("Alerts")');
    await page.waitForURL("**/alerts", { timeout: 5000 });

    // Click Broadcast Alert to open the modal
    await page.click("text=Broadcast Alert");
    await page.waitForTimeout(2000);

    // Count all inputs by type
    const textInputs = await page.locator('input[type="text"]').all();
    const numberInputs = await page.locator('input[type="number"]').all();
    const datetimeInputs = await page
      .locator('input[type="datetime-local"]')
      .all();
    const textareaInputs = await page.locator("textarea").all();

    console.log(`Found ${textInputs.length} text inputs`);
    console.log(`Found ${numberInputs.length} number inputs`);
    console.log(`Found ${datetimeInputs.length} datetime-local inputs`);
    console.log(`Found ${textareaInputs.length} textarea elements`);

    // List each text input with its placeholder and value
    for (let i = 0; i < textInputs.length; i++) {
      const input = textInputs[i];
      const placeholder =
        (await input.getAttribute("placeholder")) || "(no placeholder)";
      const value = await input.inputValue();
      console.log(
        `  Text input ${i}: placeholder="${placeholder}", value="${value}"`,
      );
    }

    // List each number input
    for (let i = 0; i < numberInputs.length; i++) {
      const input = numberInputs[i];
      const placeholder =
        (await input.getAttribute("placeholder")) || "(no placeholder)";
      const value = await input.inputValue();
      console.log(
        `  Number input ${i}: placeholder="${placeholder}", value="${value}"`,
      );
    }

    // List each datetime-local input
    for (let i = 0; i < datetimeInputs.length; i++) {
      const input = datetimeInputs[i];
      const placeholder =
        (await input.getAttribute("placeholder")) || "(no placeholder)";
      const value = await input.inputValue();
      console.log(
        `  Datetime-local input ${i}: placeholder="${placeholder}", value="${value}"`,
      );
    }

    // List each textarea
    for (let i = 0; i < textareaInputs.length; i++) {
      const textarea = textareaInputs[i];
      const placeholder =
        (await textarea.getAttribute("placeholder")) || "(no placeholder)";
      const value = await textarea.inputValue();
      console.log(
        `  Textarea ${i}: placeholder="${placeholder}", value="${value}"`,
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "input-count-debug.png" });
  });
});
