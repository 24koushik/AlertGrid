import { test, expect } from "@playwright/test";

test.describe("Debug Assistance Queue", () => {
  test("check assistance queue modal elements", async ({ page }) => {
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

    // Find a request with SUBMITTED status and click its Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const buttonCount = await assignButtons.count();
    console.log(`Found ${buttonCount} Assign buttons`);

    if (buttonCount > 0) {
      // Click the first Assign button
      await assignButtons.first().click();
      await page.waitForTimeout(2000);

      // Check what's in the modal
      const modal = page.locator(
        "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
      );
      if ((await modal.count()) > 0) {
        console.log("Modal found");

        // Look for select elements
        const selects = modal.locator("select");
        console.log(`Select count in modal: ${await selects.count()}`);

        for (let i = 0; i < (await selects.count()); i++) {
          const select = selects.nth(i);
          const name = (await select.getAttribute("name")) || "(no name)";
          const id = (await select.getAttribute("id")) || "(no id)";
          console.log(`Select ${i}: name="${name}", id="${id}"`);

          const options = await select.locator("option").all();
          console.log(`  Has ${options.length} options:`);
          for (let j = 0; j < options.length; j++) {
            const option = options[j];
            const text = await option.textContent();
            const value = await option.getAttribute("value");
            console.log(
              `    Option ${j}: value="${value}", text="${text.trim()}"`,
            );
          }
        }

        // Look for buttons
        const buttons = modal.locator("button");
        console.log(`Button count in modal: ${await buttons.count()}`);
        for (let i = 0; i < (await buttons.count()); i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          console.log(`Button ${i}: "${text.trim()}"`);
        }
      } else {
        console.log("No modal found!");
      }
    } else {
      console.log(
        "No Assign buttons found - checking if we need to create a request first",
      );
    }
  });
});
