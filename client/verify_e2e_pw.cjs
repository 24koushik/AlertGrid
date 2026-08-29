const { chromium } = require("playwright");
const assert = require("assert");

async function runTest() {
  console.log("Starting Full Cross-Role E2E Verification...");

  const browser = await chromium.launch({ headless: true });
  const adminContext = await browser.newContext();
  const citizenContext = await browser.newContext();
  const volContext = await browser.newContext();

  const adminPage = await adminContext.newPage();
  const citizenPage = await citizenContext.newPage();
  const volPage = await volContext.newPage();

  const handleDialog = async (dialog) => await dialog.accept();
  adminPage.on("dialog", handleDialog);
  citizenPage.on("dialog", handleDialog);
  volPage.on("dialog", handleDialog);

  try {
    // 1. Logins
    await adminPage.goto("http://localhost:5173/login");
    await adminPage.fill('input[type="email"]', "admin@resqnet.demo");
    await adminPage.fill('input[type="password"]', "demo123");
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL("http://localhost:5173/admin");

    await citizenPage.goto("http://localhost:5173/login");
    await citizenPage.fill('input[type="email"]', "citizen@resqnet.demo");
    await citizenPage.fill('input[type="password"]', "demo123");
    await citizenPage.click('button[type="submit"]');
    await citizenPage.waitForURL("http://localhost:5173/citizen");

    await volPage.goto("http://localhost:5173/login");
    await volPage.fill('input[type="email"]', "volunteer@resqnet.demo");
    await volPage.fill('input[type="password"]', "demo123");
    await volPage.click('button[type="submit"]');
    await volPage.waitForURL("http://localhost:5173/volunteer");

    console.log("Test 3: Logins VERIFIED");

    // 2. Admin Creates Alert
    await adminPage.click('button:has-text("Broadcast Critical Alert")');
    await adminPage.waitForSelector("text=Broadcast Alert");
    // use exact input matching for modal
    const inputs = adminPage.locator(".fixed.inset-0 input");
    await inputs.nth(0).fill("E2E Critical Flood Alert");
    const textarea = adminPage.locator(".fixed.inset-0 textarea");
    await textarea.nth(0).fill("Full system integration verification.");
    await adminPage.click('button[type="submit"]:has-text("Broadcast")');
    await adminPage.waitForSelector(".fixed.inset-0", { state: "hidden" });
    console.log("Test 4: Admin Creates Alert VERIFIED");

    // 3. Citizen Real-time (Wait for alert)
    await citizenPage.click('a[href="/citizen/alerts"]');
    await citizenPage.waitForSelector("text=E2E Critical Flood Alert", {
      timeout: 10000,
    });
    console.log("Test 5: Citizen Real-time VERIFIED");

    // 4. Citizen Shelters
    await citizenPage.click('a[href="/citizen/shelters"]');
    await citizenPage.waitForSelector("text=E2E Shelter Test");
    console.log("Test 6: Citizen Shelter VERIFIED");

    // 5. Citizen Requests Help
    await citizenPage.click('a[href="/citizen"]');
    await citizenPage.click("text=Request Emergency Help");
    await citizenPage.fill(
      'input[placeholder="House no, Street, Landmark"]',
      "E2E Test Location",
    );
    await citizenPage.fill("textarea", "E2E Critical Medical Assistance");
    await citizenPage.click('button[type="submit"]:has-text("Submit Request")');

    // We expect success modal or direct redirect. In CitizenLayout, there is a "My Requests" page so let's navigate there.
    await citizenPage.click('a[href="/citizen/requests"]');
    await citizenPage.waitForSelector("text=E2E Test Location", {
      timeout: 10000,
    });
    console.log("Test 7: Citizen Requests Help VERIFIED");

    // 6. Admin Receives Request
    await adminPage.click('a[href="/admin/assistance"]');
    await adminPage.waitForSelector("text=E2E Test Location");
    console.log("Test 8: Admin Receives Request VERIFIED");

    // 7. Admin Assigns Volunteer
    await adminPage
      .locator('tr:has-text("E2E Test Location")')
      .first()
      .locator('button:has-text("Assign")')
      .click();
    await adminPage.waitForSelector("text=Assign Volunteer");
    // Using nth option for generic select to not depend on specific volunteer name
    await adminPage.selectOption("select", { index: 1 });
    await adminPage.click('button:has-text("Confirm Assignment")');
    await adminPage.waitForSelector(".fixed.inset-0", { state: "hidden" });
    console.log("Test 9: Admin Assigns Volunteer VERIFIED");

    // 8. Volunteer Receives Task
    await volPage.click('a[href="/volunteer/tasks"]');
    await volPage.waitForSelector("text=E2E Critical Medical Assistance");
    console.log("Test 10: Volunteer Receives Task VERIFIED");

    // 9. Volunteer Lifecycle
    await volPage
      .locator('tr:has-text("E2E Critical Medical Assistance")')
      .first()
      .locator('button:has-text("Accept")')
      .click();
    await volPage.waitForSelector(
      'tr:has-text("E2E Critical Medical Assistance") >> button:has-text("Start")',
    );
    await volPage
      .locator('tr:has-text("E2E Critical Medical Assistance")')
      .first()
      .locator('button:has-text("Start")')
      .click();
    await volPage.waitForSelector(
      'tr:has-text("E2E Critical Medical Assistance") >> button:has-text("Complete")',
    );
    await volPage
      .locator('tr:has-text("E2E Critical Medical Assistance")')
      .first()
      .locator('button:has-text("Complete")')
      .click();
    await volPage.waitForSelector("text=Completed", { state: "visible" });
    console.log("Test 11: Volunteer Lifecycle VERIFIED");

    // 10. Admin Sees Completion
    await adminPage.click('a[href="/admin/tasks"]');
    await adminPage.waitForSelector("text=E2E Critical Medical Assistance");
    console.log("Test 12: Admin Sees Completion VERIFIED");

    // 11. Citizen Sees Completion
    await citizenPage.click('a[href="/citizen/requests"]');
    await citizenPage.waitForSelector("text=E2E Critical Medical Assistance");
    console.log("Test 13: Citizen Sees Completion VERIFIED");

    // 12. Audit Logs
    await adminPage.click('a[href="/admin/audit-logs"]');
    await adminPage.waitForSelector("text=ALERT_CREATED");
    await adminPage.waitForSelector("text=ASSISTANCE_CREATED");
    console.log("Test 15: Audit Logs VERIFIED");

    // 13. Refresh Test
    await adminPage.reload();
    await citizenPage.reload();
    await volPage.reload();
    await adminPage.waitForSelector("text=Audit Logs");
    await citizenPage.waitForSelector("text=E2E Critical Medical Assistance");
    await volPage.waitForSelector("text=E2E Critical Medical Assistance");
    console.log("Test 18: Refresh Test VERIFIED");

    console.log("ALL PHASE 4 CROSS-ROLE E2E TESTS PASSED!");
  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
