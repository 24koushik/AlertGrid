import { test, expect } from "@playwright/test";

test.describe("Debug Assignment State", () => {
  test("click assign button and check if modal opens by looking for any fixed inset-0 element", async ({
    page,
  }) => {
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

    // Let's add a listener to the window to catch any errors
    page.on("pageerror", (err) => {
      console.log(`Page error: ${err}`);
    });

    // Also listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });

    // Get the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    const count = await assignButtons.count();
    console.log(`Found ${count} Assign buttons`);

    if (count > 0) {
      const firstButton = assignButtons.first();

      // Let's try to click the button and then wait for a short time and check for any fixed inset-0 elements
      console.log("Clicking Assign button...");
      await firstButton.click();

      // Wait for 100ms and check
      await page.waitForTimeout(100);
      const fixedAfter100 = page.locator("div.fixed.inset-0").all();
      const countAfter100 = (await fixedAfter100).length;
      console.log(`Fixed inset-0 elements after 100ms: ${countAfter100}`);

      // Wait for 500ms and check
      await page.waitForTimeout(400); // total 500ms
      const fixedAfter500 = page.locator("div.fixed.inset-0").all();
      const countAfter500 = (await fixedAfter500).length;
      console.log(`Fixed inset-0 elements after 500ms: ${countAfter500}`);

      // Wait for 1000ms and check
      await page.waitForTimeout(500); // total 1000ms
      const fixedAfter1000 = page.locator("div.fixed.inset-0").all();
      const countAfter1000 = (await fixedAfter1000).length;
      console.log(`Fixed inset-0 elements after 1000ms: ${countAfter1000}`);

      // Wait for 2000ms and check
      await page.waitForTimeout(1000); // total 2000ms
      const fixedAfter2000 = page.locator("div.fixed.inset-0").all();
      const countAfter2000 = (await fixedAfter2000).length;
      console.log(`Fixed inset-0 elements after 2000ms: ${countAfter2000}`);

      // Also, let's check the body content at 2000ms to see if there's any text from the modal
      const bodyContentAfter2000 = await page.locator("body").innerHTML();
      console.log(`Body length after 2000ms: ${bodyContentAfter2000.length}`);
      if (bodyContentAfter2000.includes("Assign Volunteer")) {
        console.log('Found "Assign Volunteer" in body after 2000ms');
      }
      if (bodyContentAfter2000.includes("Select Volunteer")) {
        console.log('Found "Select Volunteer" in body after 2000ms');
      }
      if (bodyContentAfter2000.includes("Confirm Assignment")) {
        console.log('Found "Confirm Assignment" in body after 2000ms');
      }
    } else {
      console.log("No Assign buttons found");
    }
  });
});
