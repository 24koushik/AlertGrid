import { test, expect } from "@playwright/test";

test.describe("Find Modal Element", () => {
  test("search for the modal by different selectors", async ({ page }) => {
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

    // Try different ways to find the modal
    console.log("--- Trying different modal selectors ---");

    // 1. By the overlay from AlertManagement.tsx: fixed inset-0 bg-black/50
    const overlay1 = page.locator("div.fixed.inset-0.bg-black\\/50");
    const count1 = await overlay1.count();
    console.log(`Overlay (fixed inset-0 bg-black/50): ${count1}`);

    // 2. By the modal content: bg-white rounded-xl shadow-lg
    const modalContent = page.locator("div.bg-white.rounded-xl.shadow-lg");
    const count2 = await modalContent.count();
    console.log(`Modal content (bg-white rounded-xl shadow-lg): ${count2}`);

    // 3. By the header text: Broadcast New Alert
    const modalHeader = page.locator("text=Broadcast New Alert");
    const count3 = await modalHeader.count();
    console.log(`Header text (Broadcast New Alert): ${count3}`);

    // 4. By looking for the form structure
    const formElement = page.locator("form");
    const count4 = await formElement.count();
    console.log(`Form elements: ${count4}`);

    // 5. Let's look at the actual structure from AlertManagement.tsx
    // The modal is: fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4
    // containing: bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]
    const modalContainer = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    const count5 = await modalContainer.count();
    console.log(`Modal container (exact classes): ${count5}`);

    // 6. Let's try a more flexible approach - look for the overlay
    const overlayFlex = page.locator("div.fixed.inset-0.bg-black\\/50.flex");
    const count6 = await overlayFlex.count();
    console.log(`Overlay flex: ${count6}`);

    // If we found the overlay, let's look inside it
    if (count6 > 0) {
      const overlay = overlayFlex.first();
      console.log("Overlay found, checking contents...");

      // Check what's directly inside the overlay
      const overlayChildren = await overlay.locator("> *").all();
      console.log(`Overlay has ${overlayChildren.length} direct children`);

      for (let i = 0; i < overlayChildren.length; i++) {
        const child = overlayChildren[i];
        const className = (await child.getAttribute("class")) || "";
        console.log(`  Child ${i}: class="${className}"`);

        // If this looks like the modal content, look inside it
        if (
          className.includes("bg-white") &&
          className.includes("rounded-xl")
        ) {
          console.log(`    This looks like the modal content!`);
          const contentChildren = await child.locator("> *").all();
          console.log(
            `    Modal content has ${contentChildren.length} direct children`,
          );

          // Look for headers
          for (let j = 0; j < Math.min(contentChildren.length, 10); j++) {
            const grandChild = contentChildren[j];
            const tagName = await grandChild.evaluate((el) =>
              el.tagName.toLowerCase(),
            );
            const textContent = await grandChild.textContent();
            const gClassName = (await grandChild.getAttribute("class")) || "";
            console.log(
              `      Grandchild ${j}: <${tagName}> class="${gClassName}" text="${textContent.substring(0, 50)}"`,
            );
          }
        }
      }
    }

    // 7. Let's also check if maybe the modal is using a different approach
    // Look for any element that contains our form fields
    const titleInput = page.locator(
      'input[placeholder="e.g. Extreme Flood Warning"]',
    );
    const titleCount = await titleInput.count();
    console.log(`Title input (by placeholder): ${titleCount}`);

    if (titleCount > 0) {
      // If we found the title input, let's see what's around it
      const titleElement = titleInput.first();
      console.log("Title input found, checking parents...");

      // Go up the tree to find containers
      let parent = titleElement;
      for (let level = 0; level < 5; level++) {
        parent = parent.locator("xpath=..");
        const parentCount = await parent.count();
        if (parentCount > 0) {
          const parentElement = parent.first();
          const className = (await parentElement.getAttribute("class")) || "";
          const tagName = await parentElement.evaluate((el) =>
            el.tagName.toLowerCase(),
          );
          console.log(
            `  Parent level ${level}: <${tagName}> class="${className}"`,
          );
        }
      }
    }
  });
});
