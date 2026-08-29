import { test, expect } from "@playwright/test";

test.describe("Debug All Input Elements", () => {
  test("list all input elements with detailed attributes", async ({ page }) => {
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

    // Get all input elements
    const inputs = await page.locator("input").all();
    console.log(`Found ${inputs.length} input elements:`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = (await input.getAttribute("placeholder")) || "";
      const type = (await input.getAttribute("type")) || "";
      const value = await input.inputValue();
      const name = (await input.getAttribute("name")) || "";
      const id = (await input.getAttribute("id")) || "";
      const className = (await input.getAttribute("class")) || "";

      console.log(
        `  ${i}: placeholder="${placeholder}", type="${type}", value="${value}", name="${name}", id="${id}", class="${className}"`,
      );
    }

    // Get all textarea elements
    const textareas = await page.locator("textarea").all();
    console.log(`Found ${textareas.length} textarea elements:`);

    for (let i = 0; i < textareas.length; i++) {
      const textarea = textareas[i];
      const placeholder = (await textarea.getAttribute("placeholder")) || "";
      const value = await textarea.inputValue();
      const name = (await textarea.getAttribute("name")) || "";
      const id = (await textarea.getAttribute("id")) || "";
      const className = (await textarea.getAttribute("class")) || "";

      console.log(
        `  ${i}: placeholder="${placeholder}", value="${value}", name="${name}", id="${id}", class="${className}"`,
      );
    }

    // Get all select elements
    const selects = await page.locator("select").all();
    console.log(`Found ${selects.length} select elements:`);

    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const placeholder = (await select.getAttribute("placeholder")) || "";
      const name = (await select.getAttribute("name")) || "";
      const id = (await select.getAttribute("id")) || "";
      const className = (await select.getAttribute("class")) || "";

      // Get options
      const options = await select.locator("option").all();
      const optionValues = [];
      for (let j = 0; j < options.length; j++) {
        const optionText = await options[j].textContent();
        const optionValue = await options[j].getAttribute("value");
        optionValues.push(`${optionValue}:${optionText}`);
      }

      console.log(
        `  ${i}: placeholder="${placeholder}", name="${name}", id="${id}", class="${className}", options=[${optionValues.join(", ")}]`,
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "all-inputs-debug.png" });
  });
});
