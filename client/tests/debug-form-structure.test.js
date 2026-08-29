import { test, expect } from "@playwright/test";

test.describe("Debug Form Structure", () => {
  test("list all form elements in the modal with their exact positions", async ({
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

    // Find the modal and form container
    const modal = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    const formContainer = modal.locator(
      "div.p-6.space-y-4.overflow-y-auto.flex-1",
    );

    // Wait for form container to be visible
    await formContainer.waitFor({ state: "visible", timeout: 5000 });

    console.log("=== FORM CONTAINER ELEMENTS ===");

    // Get all direct children of the form container
    const children = await formContainer.locator("> *").all();
    console.log(`Form container has ${children.length} direct children:`);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const className = (await child.getAttribute("class")) || "";
      const tagName = await child.evaluate((el) => el.tagName.toLowerCase());
      console.log(`  Child ${i}: <${tagName}> class="${className}"`);

      // If it's a div, let's see what's inside it
      if (tagName === "div") {
        const grandChildren = await child.locator("> *").all();
        console.log(`    Has ${grandChildren.length} direct children:`);

        for (let j = 0; j < grandChildren.length; j++) {
          const gc = grandChildren[j];
          const gcTagName = await gc.evaluate((el) => el.tagName.toLowerCase());
          const gcClassName = (await gc.getAttribute("class")) || "";
          const gcPlaceholder = (await gc.getAttribute("placeholder")) || "";
          const gcType = (await gc.getAttribute("type")) || "";
          let gcValue = "";

          // Safely get input value only for input, textarea, select elements
          if (
            gcTagName === "input" ||
            gcTagName === "textarea" ||
            gcTagName === "select"
          ) {
            gcValue = (await gc.inputValue) ? await gc.inputValue() : "";
          }

          if (
            gcTagName === "input" ||
            gcTagName === "textarea" ||
            gcTagName === "select" ||
            gcTagName === "label"
          ) {
            console.log(
              `      Grandchild ${j}: <${gcTagName}> placeholder="${gcPlaceholder}" type="${gcType}" class="${gcClassName}" value="${gcValue}"`,
            );
          }
        }
      }
    }

    console.log("\n=== SPECIFIC ELEMENT COUNTS ===");

    // Now let's count specific types of elements
    const titleInputs = formContainer.locator(
      'input[placeholder="e.g. Extreme Flood Warning"]',
    );
    console.log(`Title input (by placeholder): ${await titleInputs.count()}`);

    const textInputs = formContainer.locator('input[type="text"]');
    console.log(`Text inputs: ${await textInputs.count()}`);

    for (let i = 0; i < (await textInputs.count()); i++) {
      const input = textInputs.nth(i);
      const placeholder =
        (await input.getAttribute("placeholder")) || "(no placeholder)";
      console.log(`  Text input ${i}: placeholder="${placeholder}"`);
    }

    const textareas = formContainer.locator("textarea");
    console.log(`Textareas: ${await textareas.count()}`);

    for (let i = 0; i < (await textareas.count()); i++) {
      const textarea = textareas.nth(i);
      const placeholder =
        (await textarea.getAttribute("placeholder")) || "(no placeholder)";
      console.log(`  Textarea ${i}: placeholder="${placeholder}"`);
    }

    const selects = formContainer.locator("select");
    console.log(`Selects: ${await selects.count()}`);

    for (let i = 0; i < (await selects.count()); i++) {
      const select = selects.nth(i);
      console.log(`  Select ${i}:`);
      const options = await select.locator("option").all();
      for (let j = 0; j < options.length; j++) {
        const optionText = await options[j].textContent();
        const optionValue = await options[j].getAttribute("value");
        console.log(
          `    Option ${j}: value="${optionValue}" text="${optionText}"`,
        );
      }
    }

    const numberInputs = formContainer.locator('input[type="number"]');
    console.log(`Number inputs: ${await numberInputs.count()}`);

    const datetimeInputs = formContainer.locator(
      'input[type="datetime-local"]',
    );
    console.log(`Datetime-local inputs: ${await datetimeInputs.count()}`);

    const buttons = formContainer.locator("button");
    console.log(`Buttons in form container: ${await buttons.count()}`);

    // Also check modal footer for the submit button
    const modalFooter = modal.locator(
      "div.p-4.border-t.bg-slate-50.flex.justify-end.space-x-2",
    );
    console.log(`Modal footer exists: ${(await modalFooter.count()) > 0}`);
    if ((await modalFooter.count()) > 0) {
      const footerButtons = modalFooter.locator("button");
      console.log(`Buttons in modal footer: ${await footerButtons.count()}`);
      for (let i = 0; i < (await footerButtons.count()); i++) {
        const button = footerButtons.nth(i);
        const text = await button.textContent();
        console.log(`  Footer button ${i}: "${text.trim()}"`);
      }
    }
  });
});
