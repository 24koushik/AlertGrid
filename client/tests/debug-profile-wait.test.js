import { test, expect } from "@playwright/test";

test.describe("Debug Profile Page with Wait", () => {
  test("wait for loading to disappear then check for heading", async ({
    page,
  }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Navigate to profile page
    await page.click("text=Profile");
    await page.waitForURL("**/citizen/profile", { timeout: 5000 });

    // Wait for loading text to appear (if it does)
    const loadingText = page.locator("text=Loading profile...");
    const loadingVisible = await loadingText.isVisible();
    console.log("Is loading text visible initially?", loadingVisible);

    if (loadingVisible) {
      console.log("Waiting for loading text to disappear...");
      await expect(loadingText).toBeHidden({ timeout: 10000 });
      console.log("Loading text is now hidden");
    } else {
      console.log("Loading text was not visible initially");
    }

    // Wait a bit more
    await page.waitForTimeout(2000);

    // Check for heading
    const myProfileHeading = page.locator('h1:has-text("My Profile")');
    const headingVisible = await myProfileHeading.isVisible();
    console.log("Is My Profile heading visible?", headingVisible);

    if (!headingVisible) {
      // Let's see what headings ARE visible
      const allHeadings = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .allInnerTexts();
      console.log("All headings:", allHeadings);

      // Let's see what text is on the page
      const allText = await page.locator("body").innerText();
      console.log(
        "Full body text (first 1000 chars):",
        allText.substring(0, 1000),
      );
    }

    // Take a screenshot
    await page.screenshot({ path: "profile-after-wait.png" });

    // Expect the heading to be visible
    await expect(myProfileHeading).toBeVisible({ timeout: 5000 });
  });
});
