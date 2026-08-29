import { test, expect } from "@playwright/test";

test.describe("Debug Assignment with Console", () => {
  test("click assign button and check for errors", async ({ page }) => {
    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

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

    // Let's check the initial state
    console.log("=== BEFORE CLICK ===");
    const initialModals = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    const initialCount = await initialModals.count();
    console.log(`Initial modal elements: ${initialCount}`);

    // Find and click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const buttonCount = await assignButtons.count();
    console.log(`Found ${buttonCount} Assign buttons`);

    if (buttonCount > 0) {
      // Let's make sure the button is actually clickable
      const firstButton = assignButtons.first();
      console.log("Button properties:");
      console.log(`  Visible: ${await firstButton.isVisible()}`);
      console.log(`  Enabled: ${await firstButton.isEnabled()}`);
      console.log(
        `  Bounding box: ${JSON.stringify(await firstButton.boundingBox())}`,
      );

      // Try to click it
      console.log("Clicking Assign button...");
      await firstButton.click();
      console.log("Click completed");

      // Wait a bit and check for changes
      await page.waitForTimeout(1000);

      console.log("\\n=== AFTER CLICK ===");
      const afterModals = page.locator(
        "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
      );
      const afterCount = await afterModals.count();
      console.log(`Modal elements after click: ${afterCount}`);

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

      // Let's check if the button text changed or if there are loading indicators
      const buttonTextAfter = await firstButton.textContent();
      console.log(`Button text after click: "${buttonTextAfter.trim()}"`);
    } else {
      console.log("No Assign buttons found");

      // Let's see what's actually in the table
      const rows = await page.locator("tbody tr").all();
      console.log(`Found ${rows.length} rows in tbody`);
      for (let i = 0; i < Math.min(rows.length, 3); i++) {
        const row = rows[i];
        const text = await row.textContent();
        console.log(`Row ${i}: "${text.substring(0, 100)}..."`);
      }
    }
  });
});
