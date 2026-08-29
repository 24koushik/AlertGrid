import { test, expect } from "@playwright/test";

test.describe("Debug Citizen Request Form Detail", () => {
  test("check all elements in the citizen request modal", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });
    await expect(page.locator('text="Your Safety Status"')).toBeVisible();

    // Navigate to My Requests
    await page.click('.hidden.md\\:flex a:has-text("My Requests")');
    await page.waitForURL("**/requests", { timeout: 5000 });
    await expect(page.locator('h1:has-text("My Requests")')).toBeVisible();

    // Click Request Help button
    await page.click('button:has-text("Request Help")');
    await page.waitForTimeout(2000);

    // Check what's in the modal
    const modal = page.locator(
      "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
    );
    if ((await modal.count()) > 0) {
      console.log("Modal found");

      // Look at the modal content structure
      const modalContent = modal.locator("div.bg-white.rounded-xl.shadow-lg");
      console.log(`Modal content count: ${await modalContent.count()}`);

      if ((await modalContent.count()) > 0) {
        // Look at the form container
        const formDiv = modalContent.locator("div.p-6.space-y-4");
        console.log(`Form div count: ${await formDiv.count()}`);

        if ((await formDiv.count()) > 0) {
          // List all direct children of the form div
          const children = await formDiv.locator("> *").all();
          console.log(`Form div has ${children.length} direct children:`);

          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const tagName = await child.evaluate((el) =>
              el.tagName.toLowerCase(),
            );
            const className = (await child.getAttribute("class")) || "";
            console.log(`  Child ${i}: <${tagName}> class="${className}"`);

            // If it's a div, look inside
            if (tagName === "div") {
              const grandChildren = await child.locator("> *").all();
              console.log(`    Has ${grandChildren.length} direct children:`);

              for (let j = 0; j < grandChildren.length; j++) {
                const gc = grandChildren[j];
                const gcTagName = await gc.evaluate((el) =>
                  el.tagName.toLowerCase(),
                );
                const gcClassName = (await gc.getAttribute("class")) || "";
                const gcPlaceholder =
                  (await gc.getAttribute("placeholder")) || "";
                const gcType = (await gc.getAttribute("type")) || "";
                const gcName = (await gc.getAttribute("name")) || "";
                let gcValue = "";

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
                    `      Grandchild ${j}: <${gcTagName}> name="${gcName}" placeholder="${gcPlaceholder}" type="${gcType}" class="${gcClassName}" value="${gcValue}"`,
                  );
                }
              }
            }
          }
        }

        // Look for specific elements
        const selects = formDiv.locator("select");
        console.log(`Select count: ${await selects.count()}`);

        for (let i = 0; i < (await selects.count()); i++) {
          const select = selects.nth(i);
          const name = (await select.getAttribute("name")) || "(no name)";
          console.log(`Select ${i}: name="${name}"`);
          const options = await select.locator("option").all();
          for (let j = 0; j < options.length; j++) {
            const option = options[j];
            const text = await option.textContent();
            const value = await option.getAttribute("value");
            console.log(
              `  Option ${j}: value="${value}", text="${text.trim()}"`,
            );
          }
        }

        const textareas = formDiv.locator("textarea");
        console.log(`Textarea count: ${await textareas.count()}`);

        for (let i = 0; i < (await textareas.count()); i++) {
          const textarea = textareas.nth(i);
          const placeholder =
            (await textarea.getAttribute("placeholder")) || "(no placeholder)";
          const name = (await textarea.getAttribute("name")) || "(no name)";
          console.log(
            `Textarea ${i}: name="${name}" placeholder="${placeholder}"`,
          );
        }

        const inputs = formDiv.locator("input");
        console.log(`Input count: ${await inputs.count()}`);

        for (let i = 0; i < (await inputs.count()); i++) {
          const input = inputs.nth(i);
          const placeholder =
            (await input.getAttribute("placeholder")) || "(no placeholder)";
          const name = (await input.getAttribute("name")) || "(no name)";
          const type = (await input.getAttribute("type")) || "(no type)";
          console.log(
            `Input ${i}: name="${name}" placeholder="${placeholder}" type="${type}"`,
          );
        }

        const buttons = modalContent.locator(
          "div.p-4.border-t.bg-slate-50.flex.justify-end.space-x-2 button",
        );
        console.log(`Footer button count: ${await buttons.count()}`);

        for (let i = 0; i < (await buttons.count()); i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          console.log(`Footer button ${i}: "${text.trim()}"`);
        }
      }
    } else {
      console.log("No modal found!");
    }
  });
});
