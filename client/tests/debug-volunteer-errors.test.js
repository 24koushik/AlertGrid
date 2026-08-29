import { test, expect } from "@playwright/test";

test.describe("Debug Volunteer Console Errors", () => {
  test("check for console errors when loading volunteer page", async ({
    page,
  }) => {
    // Listen for console errors
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
        console.log("Browser console error:", msg.text());
      }
    });

    // Also listen for page errors
    page.on("pageerror", (err) => {
      console.log("Page error:", err);
      errors.push(err.toString());
    });

    // Go to login page
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/volunteer", {
      timeout: 10000,
    });

    // Wait for page to settle
    await page.waitForTimeout(3000);

    // Log any errors that occurred
    console.log("Total errors captured:", errors.length);
    if (errors.length > 0) {
      console.log("All errors:", errors);
    } else {
      console.log("No console errors detected");
    }

    // Take a screenshot
    await page.screenshot({ path: "volunteer-errors.png" });

    // Get the page HTML to see what's actually rendered
    const html = await page.locator(".hidden.md\\:flex").innerHTML();
    console.log("Sidebar HTML:", html);
  });
});
