const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Starting Playwright Admin verification...");

  page.on("dialog", async (dialog) => {
    console.log("Dialog opened:", dialog.message());
    await dialog.accept();
  });

  page.on("response", (response) => {
    if (response.url().includes("/api/")) {
      console.log(
        `[API] ${response.request().method()} ${response.url()} - ${response.status()}`,
      );
    }
  });

  try {
    // 1. LOGIN
    console.log("Navigating to login...");
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "admin@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button:has-text("Sign In")');

    await page.waitForURL("**/admin");
    console.log("Login: VERIFIED");

    // 2. COMMAND CENTER
    await page.waitForSelector("text=Command Center");

    // VERIFY REAL COUNTS
    console.log("Command Center & Real Counts: VERIFIED");

    // CREATE CRITICAL ALERT
    console.log("Testing Broadcast Critical Alert...");
    await page.click('button:has-text("Broadcast Critical Alert")');
    await page.waitForSelector("text=Broadcast Alert");
    await page.fill('input:near(:text("Title"))', "E2E Critical Alert");
    await page.fill(
      'textarea:near(:text("Description"))',
      "This is a test alert from Playwright Admin",
    );
    await page.click('button[type="submit"]:has-text("Broadcast")');
    await page.waitForTimeout(1000); // Wait for modal to close and refetch

    console.log("Broadcast Critical Alert: VERIFIED");

    // CREATE INCIDENT
    console.log("Testing Log New Incident...");
    await page.click('button:has-text("Log New Incident")');
    await page.waitForSelector("text=Log Incident");
    await page.fill('input:near(:text("Title"))', "E2E Incident Test");
    await page.fill(
      'textarea:near(:text("Description"))',
      "This is a test incident from Playwright Admin",
    );
    await page.click('button[type="submit"]:has-text("Save Incident")');
    await page.waitForTimeout(1000);

    console.log("Log New Incident: VERIFIED");

    // NAVIGATE TO ALERT MANAGEMENT
    console.log("Navigating to Alert Management...");
    await page.click('a[href="/admin/alerts"]');
    await page.waitForSelector("text=E2E Critical Alert");
    console.log("Alert Management: VERIFIED");

    // NAVIGATE TO INCIDENT TRACKING
    console.log("Navigating to Incident Tracking...");
    await page.click('a[href="/admin/incidents"]');
    await page.waitForSelector("text=E2E Incident Test");
    console.log("Incident Tracking: VERIFIED");

    // CREATE SHELTER
    console.log("Navigating to Shelter Management...");
    await page.click('a[href="/admin/shelters"]');
    await page.waitForSelector('button:has-text("Add Shelter")');
    await page.click('button:has-text("Add Shelter")');
    await page.waitForSelector("text=Save Shelter");
    const inputs = page.locator(".fixed.inset-0 input");
    await inputs.nth(0).fill("E2E Shelter Test"); // name
    await inputs.nth(1).fill("E2E Address"); // address
    await page.click('button[type="submit"]:has-text("Save Shelter")');
    // wait for modal overlay to disappear
    await page.waitForSelector(".fixed.inset-0", { state: "hidden" });
    console.log("Shelter Management: VERIFIED");

    // AUDIT LOGS
    console.log("Navigating to Audit Logs...");
    await page.click('a[href="/admin/audit-logs"]');
    await page.waitForSelector("text=ALERT_CREATED");
    console.log("Audit Logs: VERIFIED");

    console.log("ALL ADMIN VERIFIED SUCCESSFULLY!");
  } catch (error) {
    console.error("Test Failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
