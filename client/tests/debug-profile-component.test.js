import { test, expect } from "@playwright/test";

test.describe("Debug Profile Component Rendering", () => {
  test("check if Profile component renders by looking for unique text", async ({
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

    // Wait a bit for any loading
    await page.waitForTimeout(2000);

    // Look for text that should be in the Profile component
    const contactInfo = page.locator("text=Contact Information");
    const accountDetails = page.locator("text=Account Details");
    const myProfileHeading = page.locator('h1:has-text("My Profile")');
    const editProfileButton = page.locator('button:has-text("Edit Profile")');

    // Check if any of these are visible
    const contactInfoVisible = await contactInfo.isVisible();
    const accountDetailsVisible = await accountDetails.isVisible();
    const myProfileHeadingVisible = await myProfileHeading.isVisible();
    const editProfileButtonVisible = await editProfileButton.isVisible();

    console.log("Contact Information visible:", contactInfoVisible);
    console.log("Account Details visible:", accountDetailsVisible);
    console.log("My Profile heading visible:", myProfileHeadingVisible);
    console.log("Edit Profile button visible:", editProfileButtonVisible);

    // If we see any of these, the Profile component is rendering
    if (
      contactInfoVisible ||
      accountDetailsVisible ||
      myProfileHeadingVisible ||
      editProfileButtonVisible
    ) {
      console.log("Profile component appears to be rendering");
      // Now wait for the heading to be visible for the test
      await expect(myProfileHeading).toBeVisible({ timeout: 5000 });
    } else {
      // Profile component is not rendering, let's see what IS rendering
      const allText = await page.locator("body").innerText();
      console.log("Full body text:", allText);

      // Look for SafetyPortal text to see if we're seeing that instead
      const safetyStatus = page.locator("text=YOUR SAFETY STATUS");
      const activeAlerts = page.locator("text=Active Alerts");
      const safetyStatusVisible = await safetyStatus.isVisible();
      const activeAlertsVisible = await activeAlerts.isVisible();

      console.log("Safety Status visible:", safetyStatusVisible);
      console.log("Active Alerts visible:", activeAlertsVisible);

      // Take a screenshot
      await page.screenshot({ path: "profile-page-debug.png" });

      // Fail the test with useful information
      throw new Error(
        "Profile component did not render. Seeing SafetyPortal instead or blank page.",
      );
    }
  });
});
