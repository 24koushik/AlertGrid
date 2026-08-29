import { test, expect } from "@playwright/test";

test.describe("Debug Assignment Button Properties", () => {
  test("examine the Assign button properties", async ({ page }) => {
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

      // Examine all properties of the button
      console.log("=== BUTTON PROPERTIES ===");
      console.log(`Text: "${(await firstButton.textContent()).trim()}"`);
      console.log(`Visible: ${await firstButton.isVisible()}`);
      console.log(`Enabled: ${await firstButton.isEnabled()}`);

      const boundingBox = await firstButton.boundingBox();
      console.log(`Bounding box: ${JSON.stringify(boundingBox)}`);

      // Get all attributes
      const attributes = await firstButton.evaluate((el) => {
        const attrs = {};
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });
      console.log(`Attributes: ${JSON.stringify(attributes)}`);

      // Get inner HTML
      const innerHtml = await firstButton.innerHTML();
      console.log(`Inner HTML: "${innerHtml}"`);

      // Check if it's a submit button or has form association
      const form = await firstButton.evaluate((el) => el.form);
      console.log(`Associated form: ${form ? "YES" : "NO"}`);
      if (form) {
        console.log(`Form action: ${form.action}`);
        console.log(`Form method: ${form.method}`);
      }

      // Check if it's inside a form
      const insideForm = await firstButton.evaluate(
        (el) => el.closest("form") !== null,
      );
      console.log(`Inside form element: ${insideForm}`);

      // Check onclick handler or other event listeners (we can't get actual listeners, but we can check attributes)
      const onclick = await firstButton.getAttribute("onclick");
      console.log(`Onclick attribute: ${onclick}`);

      // Check if it's a Link component from react-router (common mistake)
      const isLink = await firstButton.evaluate(
        (el) => el.tagName.toLowerCase() === "a",
      );
      console.log(`Is anchor tag: ${isLink}`);

      // Let's also check what happens when we hover over it
      console.log("\\n=== HOVERING OVER BUTTON ===");
      await firstButton.hover();
      await page.waitForTimeout(100);

      // And finally, let's see what the cursor looks like
      const cursor = await firstButton.evaluate(
        (el) => getComputedStyle(el).cursor,
      );
      console.log(`CSS cursor: ${cursor}`);
    }
  });
});
