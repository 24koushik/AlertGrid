const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen");

    // wait for data
    await page.waitForSelector("text=Your Safety Status");
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: "../dashboard_screenshot.png",
      fullPage: true,
    });
    console.log("Screenshot taken at root as dashboard_screenshot.png");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
