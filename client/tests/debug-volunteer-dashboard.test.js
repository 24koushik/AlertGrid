import { test, expect } from "@playwright/test";

test.describe("Debug Volunteer Dashboard", () => {
  test("check what is on the volunteer dashboard after login", async ({
    page,
  }) => {
    // Login as volunteer
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/volunteer", {
      timeout: 10000,
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Get the entire body text
    const bodyText = await page.locator("body").innerText();
    console.log("Body text (first 1000 chars):", bodyText.substring(0, 1000));

    // Take a screenshot
    await page.screenshot({ path: "volunteer-dashboard.png" });

    // Check if we see any of the expected headings from the volunteer layout
    // The volunteer dashboard (Response Center) should have some text
    // Let's look for the heading "Response Center" or any text from the volunteer layout
    const responseCenterHeading = page.locator(
      'h1:has-text("Response Center"), h2:has-text("Response Center")',
    );
    const isVisible = await responseCenterHeading.isVisible();
    console.log("Is Response Center heading visible?", isVisible);

    // If not, let's see what headings are present
    const allHeadings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allInnerTexts();
    console.log("All headings:", allHeadings);
  });
});
