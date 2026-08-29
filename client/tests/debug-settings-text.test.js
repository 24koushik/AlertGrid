import { test, expect } from "@playwright/test";

test.describe("Debug Settings Link Text", () => {
  test("get exact text of Settings link", async ({ page }) => {
    // Login as citizen
    await page.goto("http://localhost:5173/login");
    await page.fill('input[type="email"]', "citizen@resqnet.demo");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/citizen", { timeout: 10000 });

    // First find the sidebar element
    const sidebar = page.locator("div.hidden.md\\:flex");
    const sidebarCount = await sidebar.count();
    console.log(`Sidebar count: ${sidebarCount}`);

    if (sidebarCount > 0) {
      // Now find links within the sidebar
      const linksInSidebar = sidebar.locator("a");
      const linkCount = await linksInSidebar.count();
      console.log(`Found ${linkCount} links in sidebar`);

      for (let i = 0; i < linkCount; i++) {
        const link = linksInSidebar.nth(i);
        const text = await link.textContent();
        const href = await link.getAttribute("href");

        // Log the text with character codes to see hidden characters
        if (text) {
          // Trim the text and check if it's empty after trimming
          const trimmedText = text.trim();
          console.log(`Link ${i}:`);
          console.log(`  Raw text: "${text}"`);
          console.log(`  Trimmed text: "${trimmedText}"`);
          if (trimmedText === "") {
            console.log(`  (text is only whitespace)`);
          } else {
            const charCodes = [];
            for (let j = 0; j < trimmedText.length; j++) {
              charCodes.push(trimmedText.charCodeAt(j));
            }
            console.log(`  Char codes: ${charCodes.join(", ")}`);
          }
          console.log(`  Href: "${href}"`);

          // Check if this is the Settings link by href
          if (href && href.includes("/citizen/settings")) {
            console.log(`  *** This link goes to settings page ***`);
            console.log(`  *** Its trimmed text is: "${trimmedText}" ***`);
          }
        }
      }
    } else {
      console.log("Sidebar not found!");
    }
  });
});
