import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Modal", () => {
  test("check if modal opens when clicking Assign button", async ({ page }) => {
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

    // Let's check the initial state - look for any elements that might be the modal
    console.log("=== INITIAL STATE ===");
    const initialModals = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    const initialCount = await initialModals.count();
    console.log(
      `Initial modal elements (by AssistanceQueue classes): ${initialCount}`,
    );

    const initialAnyFixed = page.locator("div.fixed.inset-0");
    const initialAnyFixedCount = await initialAnyFixed.count();
    console.log(`Initial fixed inset-0 elements: ${initialAnyFixedCount}`);

    // Find and click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const buttonCount = await assignButtons.count();
    console.log(`Found ${buttonCount} Assign buttons`);

    if (buttonCount > 0) {
      // Let's examine what clicking the button does
      console.log("\\n=== CLICKING ASSIGN BUTTON ===");

      // Set up listeners for dialogs or changes
      page.on("dialog", async (dialog) => {
        console.log(`Dialog opened: ${dialog.type()}`);
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });

      // Click the button
      await assignButtons.first().click();
      await page.waitForTimeout(1000); // Short wait to see immediate effects

      console.log("\\n=== AFTER CLICK (short wait) ===");
      const afterShortModals = page.locator(
        "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
      );
      const afterShortCount = await afterShortModals.count();
      console.log(`Modal elements after short wait: ${afterShortCount}`);

      const afterShortAnyFixed = page.locator("div.fixed.inset-0");
      const afterShortAnyFixedCount = await afterShortAnyFixed.count();
      console.log(
        `Fixed inset-0 elements after short wait: ${afterShortAnyFixedCount}`,
      );

      // Wait a bit longer
      await page.waitForTimeout(2000);

      console.log("\\n=== AFTER CLICK (longer wait) ===");
      const afterLongModals = page.locator(
        "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
      );
      const afterLongCount = await afterLongModals.count();
      console.log(`Modal elements after longer wait: ${afterLongCount}`);

      const afterLongAnyFixed = page.locator("div.fixed.inset-0");
      const afterLongAnyFixedCount = await afterLongAnyFixed.count();
      console.log(
        `Fixed inset-0 elements after longer wait: ${afterLongAnyFixedCount}`,
      );

      // Let's also check if there are any text changes that might indicate the modal content
      const pageContentAfter = await page.content();
      if (pageContentAfter.includes("Assign Volunteer")) {
        console.log('Found "Assign Volunteer" in page content after click');
      }
      if (pageContentAfter.includes("Select Volunteer")) {
        console.log('Found "Select Volunteer" in page content after click');
      }
      if (pageContentAfter.includes("Confirm Assignment")) {
        console.log('Found "Confirm Assignment" in page content after click');
      }

      // Let's check if there are any new div elements
      const allDivsAfter = await page.locator("div").count();
      // We'd need to know the before count, but let's just see if it's reasonable
      console.log(`Total div elements after click: ${allDivsAfter}`);
    } else {
      console.log("No Assign buttons found");
    }
  });
});
