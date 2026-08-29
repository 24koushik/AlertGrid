import { test, expect } from "@playwright/test";

test.describe("Debug Sidebar Links Detailed", () => {
  test("list all links in sidebar with their properties", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // Find all links in the sidebar
    const sidebarLinks = page.locator(".hidden.md\\:flex a");
    const count = await sidebarLinks.count();
    console.log(`Found ${count} links in sidebar`);

    for (let i = 0; i < count; i++) {
      const link = sidebarLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      const className = await link.getAttribute("class");
      console.log(`  Link ${i}:`);
      console.log(`    Text: "${text}"`);
      console.log(`    Href: "${href}"`);
      console.log(`    Class: "${className}"`);

      // Check if this looks like the Settings link
      if (text && text.trim() === "Settings") {
        console.log(`    *** This appears to be the Settings link! ***`);
      }
    }

    // Also try to find the Settings link using different methods
    console.log("\n--- Trying different ways to find Settings link ---");

    // Method 1: By exact text
    const linkByText = page.locator(".hidden.md\\:flex a", {
      hasText: "Settings",
    });
    console.log(
      `Method 1 (hasText: 'Settings'): ${await linkByText.count()} found`,
    );

    // Method 2: By regex
    const linkByRegex = page.locator(".hidden.md\\:flex a", {
      hasText: /^Settings$/,
    });
    console.log(
      `Method 2 (regex /^Settings$/): ${await linkByRegex.count()} found`,
    );

    // Method 3: By getting all links and filtering
    const allLinks = page.locator(".hidden.md\\:flex a");
    const allCount = await allLinks.count();
    let settingsFound = false;
    for (let i = 0; i < allCount; i++) {
      const link = allLinks.nth(i);
      const text = await link.textContent();
      if (text && text.trim() === "Settings") {
        console.log(`Method 3 (filtering): Found Settings link at index ${i}`);
        settingsFound = true;
        // Try clicking it
        await link.click();
        await page.waitForTimeout(1000);
        console.log(`    URL after click: ${page.url()}`);
        break;
      }
    }
    if (!settingsFound) {
      console.log(`Method 3 (filtering): Settings link NOT found`);
    }

    // Take a screenshot
    await page.screenshot({ path: "sidebar-links-debug.png" });
  });
});
