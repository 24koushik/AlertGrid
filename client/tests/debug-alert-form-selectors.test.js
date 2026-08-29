import { test, expect } from "@playwright/test";

test.describe("Debug Alert Form Selectors", () => {
  test("check what form elements are available in the alert creation modal", async ({
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

    // Get all input elements in the modal
    const inputs = await page.locator("input").allTextContents();
    console.log("All input values in modal:", inputs);

    // Get all textarea elements in the modal
    const textareas = await page.locator("textarea").allTextContents();
    console.log("All textarea values in modal:", textareas);

    // Get all select elements in the modal
    const selects = await page.locator("select").allTextContents();
    console.log("All select values in modal:", selects);

    // Get the HTML of the modal to see structure
    const modalHtml = await page
      .locator(".bg-white.rounded-xl.shadow-lg")
      .innerHTML();
    console.log("Modal HTML (first 1500 chars):", modalHtml.substring(0, 1500));

    // Try to find elements by their associated labels
    const titleLabel = page.locator('label:has-text("Title")');
    if (await titleLabel.isVisible()) {
      console.log("Title label found");
      // Get the associated input
      const titleInput = page.locator(
        'input[aria-labelledby*="title"], input[name="title"], input#title',
      );
      const titleCount = await titleInput.count();
      console.log(`Found ${titleCount} title input elements`);

      // Try to get the input by looking for the input near the label
      const titleContainer = titleLabel.locator("xpath=.."); // Get parent
      const titleInputInContainer = titleContainer.locator("input");
      const titleInputCount = await titleInputInContainer.count();
      console.log(`Found ${titleInputCount} title inputs in label container`);
    }

    const descriptionLabel = page.locator('label:has-text("Description")');
    if (await descriptionLabel.isVisible()) {
      console.log("Description label found");
      const descriptionContainer = descriptionLabel.locator("xpath=..");
      const descriptionInputInContainer =
        descriptionContainer.locator("textarea");
      const descCount = await descriptionInputInContainer.count();
      console.log(
        `Found ${descCount} description textareas in label container`,
      );
    }

    const instructionsLabel = page.locator(
      'label:has-text("Instructions for Citizens")',
    );
    if (await instructionsLabel.isVisible()) {
      console.log("Instructions label found");
      const instructionsContainer = instructionsLabel.locator("xpath=..");
      const instructionsInputInContainer =
        instructionsContainer.locator("textarea");
      const instrCount = await instructionsInputInContainer.count();
      console.log(
        `Found ${instrCount} instructions textareas in label container`,
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "alert-form-selectors-debug.png" });
  });
});
