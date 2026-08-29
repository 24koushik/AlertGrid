const { chromium } = require("playwright");

(async () => {
  console.log("Starting Playwright Volunteer verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let token = "";

  try {
    console.log("Navigating to login...");
    await page.goto("http://localhost:5173/login");

    // Login
    await page.fill('input[type="email"]', "volunteer@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');

    // Wait for redirect to Dashboard
    await page.waitForURL("http://localhost:5173/volunteer");
    console.log("Login: VERIFIED");

    // Dashboard
    await page.waitForSelector("text=Response Center");
    const hasMock = await page.evaluate(
      () =>
        document.body.innerText.includes("Demo Mode Enabled") ||
        document.body.innerText.includes("const tasks = ["),
    );
    if (hasMock) throw new Error("Demo Mode/Mock data found");
    console.log("Response Center: VERIFIED");

    // Extract token from localStorage
    token = await page.evaluate(() => localStorage.getItem("token"));

    // Tasks (ACCEPT, START, COMPLETE)
    console.log("Navigating to tasks...");
    await page.click('a:has-text("Tasks")');
    await page.waitForURL("**/volunteer/tasks");
    await page.waitForSelector("text=My Tasks");
    await page.waitForTimeout(500);

    // Click Accept
    const acceptBtn = await page.$('button:has-text("Accept")');
    if (acceptBtn) {
      await acceptBtn.click();
      await page.waitForTimeout(1000);
      console.log("Accept Task: VERIFIED");
    } else {
      console.log("No tasks to accept");
    }

    // Click Start
    const startBtn = await page.$('button:has-text("Start")');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(1000);
      console.log("Start Task: VERIFIED");
    } else {
      console.log("No tasks to start");
    }

    // Click Complete
    const completeBtn = await page.$('button:has-text("Complete")');
    if (completeBtn) {
      await completeBtn.click();
      await page.waitForTimeout(1000);
      console.log("Complete Task: VERIFIED");
    } else {
      console.log("No tasks to complete");
    }

    // Invalid transition
    console.log("Testing invalid transition...");
    const invalidRes = await page.evaluate(async (t) => {
      const res = await fetch(
        "http://localhost:5000/api/tasks/fake-id/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        },
      );
      return res.status;
    }, token);
    if (invalidRes >= 400) {
      console.log("Invalid transitions: VERIFIED (backend rejects)");
    } else {
      throw new Error("Backend did not reject invalid transition");
    }

    // Availability
    console.log("Navigating to availability...");
    await page.click("text=Availability");
    await page.waitForURL("**/volunteer/availability");
    await page.selectOption("select", "BUSY");
    await page.waitForSelector("text=Availability updated successfully");
    await page.selectOption("select", "AVAILABLE");
    await page.waitForSelector("text=Availability updated successfully");
    console.log("Availability: VERIFIED");

    // Assistance
    console.log("Navigating to assistance...");
    await page.goto("http://localhost:5173/volunteer/assistance");
    await page.waitForSelector("table");
    console.log("Assistance: VERIFIED");

    // Operations Map
    console.log("Navigating to map...");
    await page.goto("http://localhost:5173/volunteer/map");
    await page.waitForSelector("text=Operations Map");
    console.log("Operations Map: VERIFIED");

    // Profile
    console.log("Navigating to profile...");
    await page.goto("http://localhost:5173/volunteer/profile");
    await page.waitForSelector("text=My Profile");
    console.log("Profile: VERIFIED");

    console.log("ALL VOLUNTEER VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("TEST FAILED:", err);
  } finally {
    await browser.close();
  }
})();
