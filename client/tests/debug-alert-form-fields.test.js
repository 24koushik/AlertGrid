import { test, expect } from "@playwright/test";

test.describe("Debug Alert Form Fields", () => {
  test("check actual placeholder values for lat/long/radius fields", async ({
    page,
  }) => {
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

    // Get all input elements and their attributes
    const inputs = await page.locator("input").all();
    console.log(`Found ${inputs.length} input elements`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute("placeholder");
      const type = await input.getAttribute("type");
      const value = await input.inputValue();
      const className = await input.getAttribute("class");
      console.log(
        `Input ${i}: placeholder="${placeholder}", type="${type}", value="${value}", class="${className}"`,
      );
    }

    // Get all textarea elements and their attributes
    const textareas = await page.locator("textarea").all();
    console.log(`Found ${textareas.length} textarea elements`);

    for (let i = 0; i < textareas.length; i++) {
      const textarea = textareas[i];
      const placeholder = await textarea.getAttribute("placeholder");
      const value = await textarea.inputValue();
      const className = await textarea.getAttribute("class");
      console.log(
        `Textarea ${i}: placeholder="${placeholder}", value="${value}", class="${className}"`,
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "alert-form-fields-debug.png" });
  });
});
