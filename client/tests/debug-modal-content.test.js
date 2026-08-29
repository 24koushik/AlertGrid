import { test, expect } from "@playwright/test";

test.describe("Debug Modal Content", () => {
  test("check what form elements are actually in the modal", async ({
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
    await expect(page.locator('h1:has-text("Alert Management")')).toBeVisible();

    // Click the Broadcast Alert button to open modal
    await page.click('button:has-text("Broadcast Alert")');
    await page.waitForTimeout(2000); // Give it time to open

    // Find the modal dialog
    const dialog = page.locator('div[role="dialog"]').first();
    if ((await dialog.count()) > 0) {
      console.log("Modal dialog found");

      // Get all elements inside the dialog and log their tag names and classes
      const allElements = await dialog.locator("*").all();
      console.log(`Found ${allElements.length} elements in dialog`);

      // Log some key elements
      for (let i = 0; i < Math.min(allElements.length, 20); i++) {
        const element = allElements[i];
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase(),
        );
        const className = (await element.getAttribute("class")) || "";
        const placeholder = (await element.getAttribute("placeholder")) || "";
        const type = (await element.getAttribute("type")) || "";
        const value = (await element.inputValue)
          ? await element.inputValue()
          : "";

        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select"
        ) {
          console.log(
            `  ${i}: <${tagName}> placeholder="${placeholder}" type="${type}" class="${className}" value="${value}"`,
          );
        }
      }

      // Specifically look for the form fields we need
      const titleInput = dialog.locator(
        'input[placeholder="e.g. Extreme Flood Warning"]',
      );
      console.log(`Title input count: ${await titleInput.count()}`);

      const descriptionLabel = dialog.locator('label:has-text("Description")');
      console.log(`Description label count: ${await descriptionLabel.count()}`);

      const descriptionTextarea = dialog
        .locator('label:has-text("Description")')
        .locator("xpath=..")
        .locator("textarea");
      console.log(
        `Description textarea count: ${await descriptionTextarea.count()}`,
      );

      const severitySelect = dialog.locator("select");
      console.log(`Select count: ${await severitySelect.count()}`);

      const disasterTypeInput = dialog.locator('input[type="text"]');
      console.log(`Text input count: ${await disasterTypeInput.count()}`);

      const numberInput = dialog.locator('input[type="number"]');
      console.log(`Number input count: ${await numberInput.count()}`);

      const datetimeInput = dialog.locator('input[type="datetime-local"]');
      console.log(`Datetime-local input count: ${await datetimeInput.count()}`);

      const textareaElements = dialog.locator("textarea");
      console.log(`Textarea count: ${await textareaElements.count()}`);

      const submitButton = dialog.locator('button:has-text("Broadcast Alert")');
      console.log(`Submit button count: ${await submitButton.count()}`);
    } else {
      console.log("No modal dialog found!");

      // Let's see what's actually on the page
      const pageContent = await page.content();
      if (pageContent.includes("Broadcast New Alert")) {
        console.log('But "Broadcast New Alert" text IS in the page content');
      }
    }
  });
});
