import { test, expect } from "@playwright/test";

test.describe("Debug Assignment - Wait Longer", () => {
  test("click assign button and wait longer for modal", async ({ page }) => {
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

    // Click the first Assign button
    const assignButtons = page.locator('button:has-text("Assign")');
    await assignButtons.first().click();

    // Wait for up to 10 seconds for the modal to appear
    try {
      // Wait for the modal by looking for the fixed inset-0 bg-black/50 overlay
      await page.waitForSelector("div.fixed.inset-0.bg-black\\/50", {
        timeout: 10000,
      });
      console.log("Modal overlay appeared!");

      // Now check for the modal content
      const modalContent = page.locator("div.bg-white.rounded-xl.shadow-lg");
      if ((await modalContent.count()) > 0) {
        console.log("Modal content found!");

        // Check for the title
        const title = modalContent.locator('h3:has-text("Assign Volunteer")');
        if ((await title.count()) > 0) {
          console.log("Assign Volunteer title found!");
        } else {
          console.log("Assign Volunteer title NOT found");
          // Let's see what h3 elements are there
          const h3s = modalContent.locator("h3");
          const h3Count = await h3s.count();
          console.log(`Found ${h3Count} h3 elements in modal content`);
          for (let i = 0; i < h3Count; i++) {
            const text = await h3s.nth(i).textContent();
            console.log(`  h3 ${i}: "${text.trim()}"`);
          }
        }
      } else {
        console.log("Modal content NOT found");
        // Let's see what's in the fixed inset-0 bg-black/50 div
        const overlay = page.locator("div.fixed.inset-0.bg-black\\/50");
        if ((await overlay.count()) > 0) {
          const overlayChildren = await overlay.locator("> *").all();
          console.log(`Overlay has ${overlayChildren.length} direct children`);
          for (let i = 0; i < overlayChildren.length; i++) {
            const child = overlayChildren[i];
            const tagName = await child.evaluate((el) =>
              el.tagName.toLowerCase(),
            );
            const className = (await child.getAttribute("class")) || "";
            console.log(`  Child ${i}: <${tagName}> class="${className}"`);
          }
        }
      }
    } catch (e) {
      console.log("Modal overlay did not appear within 10 seconds");
      // Let's see what's on the page after waiting
      const pageContent = await page.content();
      if (pageContent.includes("Assign Volunteer")) {
        console.log('But "Assign Volunteer" is in the page content');
      }
      if (pageContent.includes("Select Volunteer")) {
        console.log('But "Select Volunteer" is in the page content');
      }
      if (pageContent.includes("Confirm Assignment")) {
        console.log('But "Confirm Assignment" is in the page content');
      }

      // Let's check the body content again
      const bodyContent = await page.locator("body").innerHTML();
      console.log(`Body content length: ${bodyContent.length}`);
      console.log(`Body content start: ${bodyContent.substring(0, 200)}`);
    }
  });
});
