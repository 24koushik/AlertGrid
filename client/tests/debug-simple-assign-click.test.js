import { test, expect } from "@playwright/test";

test.describe("Debug Simple Assign Click", () => {
  test("click assign button and see immediate effects", async ({ page }) => {
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

    // Get the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const count = await assignButtons.count();
    console.log(`Found ${count} Assign buttons`);

    if (count > 0) {
      const firstButton = assignButtons.first();

      // Log initial state
      console.log("BEFORE CLICK:");
      console.log(
        `  Button text: "${(await firstButton.textContent()).trim()}"`,
      );
      console.log(`  Button visible: ${await firstButton.isVisible()}`);
      console.log(`  Button enabled: ${await firstButton.isEnabled()}`);

      // Store a reference to the button by saving its text content
      const buttonTextBefore = (await firstButton.textContent()).trim();

      // Click the button
      console.log("Clicking button...");
      await firstButton.click();

      // Wait a very short time
      await page.waitForTimeout(100);

      // Check if the button is still there and what it says
      console.log("AFTER CLICK (100ms):");
      const buttonsAfter = page.locator('button:has-text("Assign")');
      const countAfter = await buttonsAfter.count();
      console.log(`  Found ${countAfter} Assign buttons after click`);

      if (countAfter > 0) {
        const firstButtonAfter = buttonsAfter.first();
        console.log(
          `  Button text: "${(await firstButtonAfter.textContent()).trim()}"`,
        );
        console.log(`  Button visible: ${await firstButtonAfter.isVisible()}`);
        console.log(`  Button enabled: ${await firstButtonAfter.isEnabled()}`);
      } else {
        console.log("  No Assign buttons found after click");

        // Let's see what buttons ARE there
        const allButtons = page.locator("button");
        const allCount = await allButtons.count();
        console.log(`  Total buttons on page: ${allCount}`);

        // Let's check the first few buttons
        for (let i = 0; i < Math.min(allCount, 5); i++) {
          const btn = allButtons.nth(i);
          const text = await btn.textContent();
          console.log(`    Button ${i}: "${text.trim()}"`);
        }
      }

      // Wait a bit more
      await page.waitForTimeout(1000);

      console.log("AFTER CLICK (1100ms):");
      const buttonsAfter2 = page.locator('button:has-text("Assign")');
      const countAfter2 = await buttonsAfter2.count();
      console.log(`  Found ${countAfter2} Assign buttons after click`);
    }
  });
});
