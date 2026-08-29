import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Selection", () => {
  test("check what happens when we select a volunteer", async ({ page }) => {
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

    // Wait for the modal to open
    const assignmentModal = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    await assignmentModal.waitFor({ state: "visible", timeout: 5000 });

    // Check what options are available in the volunteer select
    const volunteerSelect = assignmentModal.locator("select").first();
    const options = volunteerSelect.locator("option");
    const count = await options.count();
    console.log(`Found ${count} options in volunteer select`);

    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      const value = await option.getAttribute("value");
      const text = await option.textContent();
      console.log(`  Option ${i}: value="${value}", text="${text.trim()}"`);
    }

    // Try to select the first option that has a value (not empty)
    let selected = false;
    for (let i = 1; i < count; i++) {
      // start at 1 to skip placeholder
      const optionValue = await options.nth(i).getAttribute("value");
      if (optionValue && optionValue.trim() !== "") {
        console.log(`Selecting option ${i} with value: "${optionValue}"`);
        await volunteerSelect.selectOption(optionValue);
        selected = true;

        // Check if the select now shows the selected value
        const selectedValue = await volunteerSelect.inputValue();
        console.log(`Selected value after selection: "${selectedValue}"`);
        break;
      }
    }

    if (!selected && count > 1) {
      console.log(`Selecting first non-placeholder option (index 1)`);
      await volunteerSelect.selectOption(
        await options.nth(1).getAttribute("value"),
      );

      // Check if the select now shows the selected value
      const selectedValue = await volunteerSelect.inputValue();
      console.log(`Selected value after selection: "${selectedValue}"`);
    }

    // Now check the Confirm Assignment button
    const confirmButton = assignmentModal.locator(
      'button:has-text("Confirm Assignment")',
    );
    console.log(`Confirm button count: ${await confirmButton.count()}`);
    if ((await confirmButton.count()) > 0) {
      const isDisabled = await confirmButton.isDisabled();
      console.log(`Confirm button is disabled: ${isDisabled}`);

      // Wait a bit to see if it becomes enabled
      await page.waitForTimeout(1000);
      const isDisabledAfterWait = await confirmButton.isDisabled();
      console.log(
        `Confirm button is disabled after wait: ${isDisabledAfterWait}`,
      );
    }
  });
});
