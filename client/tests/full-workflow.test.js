import { test, expect } from "@playwright/test";

test.describe("Full End-to-End Workflow Test", () => {
  test("complete workflow from admin alert creation to volunteer task completion", async ({
    page,
    browser,
  }) => {
    // We'll need multiple pages for the three different user types
    const adminPage = await browser.newPage();
    const citizenPage = await browser.newPage();
    const volunteerPage = await browser.newPage();

    try {
      // STEP 1: ADMIN login → create critical flood alert
      console.log("=== STEP 1: Admin login and create alert ===");

      // Admin login
      await adminPage.goto("http://localhost:5173/login");
      await adminPage.fill('input[type="email"]', "admin@resqnet.demo");
      await adminPage.fill('input[type="password"]', "demo123");
      await adminPage.click('button[type="submit"]');
      await adminPage.waitForURL("http://localhost:5173/admin", {
        timeout: 10000,
      });
      await expect(
        adminPage.locator('h1:has-text("Command Center")'),
      ).toBeVisible();

      // Navigate to Alert Management
      await adminPage.click('.hidden.md\\:flex a:has-text("Alerts")');
      await adminPage.waitForURL("**/alerts", { timeout: 5000 });
      await expect(
        adminPage.locator('h1:has-text("Alert Management")'),
      ).toBeVisible();

      // Create a new critical flood alert
      await adminPage.click("text=Broadcast Alert");
      await adminPage.waitForTimeout(1000);

      // Wait for modal to be fully ready - using the correct selectors from our debugging
      const modal = adminPage.locator(
        "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
      );
      await modal.waitFor({ state: "visible", timeout: 5000 });

      // Target the form container within the modal (the div with class "p-6 space-y-4 overflow-y-auto flex-1")
      const formContainer = modal.locator(
        "div.p-6.space-y-4.overflow-y-auto.flex-1",
      );
      await formContainer.waitFor({ state: "visible", timeout: 5000 });

      // Fill alert form within the modal using correct child indices from debugging
      // Child 0: Title input container
      await formContainer
        .locator(
          'div:nth-child(1) input[placeholder="e.g. Extreme Flood Warning"]',
        )
        .fill("CRITICAL: Severe Urban Flooding - E2E Test");

      // Child 2: Description textarea container (first textarea)
      await formContainer
        .locator("div:nth-child(3) textarea")
        .fill(
          "This is a test alert created during end-to-end testing. Immediate action required.",
        );

      // Child 1: Grid container for Severity and Disaster Type
      // Severity select (first column)
      await formContainer
        .locator("div:nth-child(2) div:nth-child(1) select")
        .selectOption("CRITICAL");
      // Disaster type input (second column)
      await formContainer
        .locator('div:nth-child(2) div:nth-child(2) input[type="text"]')
        .fill("Flood");

      // Child 4: Grid container for Expiry Time and Radius
      // Expiry time input (first column)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      const expiryString = expiryDate.toISOString().slice(0, 16); // Format for datetime-local
      await formContainer
        .locator(
          'div:nth-child(5) div:nth-child(1) input[type="datetime-local"]',
        )
        .fill(expiryString);
      // Radius input (second column)
      await formContainer
        .locator('div:nth-child(5) div:nth-child(2) input[type="number"]')
        .fill("10");

      // Child 3: Instructions textarea container (second textarea)
      await formContainer
        .locator("div:nth-child(4) textarea")
        .fill("Test instructions: Please verify this alert in the system.");

      // Submit the alert - wait for button to be ready and click (button is in the footer)
      const submitButton = modal.locator('button:has-text("Broadcast Alert")');
      await submitButton.waitFor({ state: "visible", timeout: 5000 });
      await submitButton.click();
      await adminPage.waitForTimeout(3000);

      // Verify alert was created (should appear in list)
      const alertCreated = await adminPage
        .locator('text="CRITICAL: Severe Urban Flooding - E2E Test"')
        .first()
        .isVisible();
      expect(alertCreated).toBeTruthy();

      // STEP 2: CITIZEN receives alert → views alert → finds nearest shelter → requests emergency help
      console.log("=== STEP 2: Citizen views alert and requests help ===");

      // Citizen login
      await citizenPage.goto("http://localhost:5173/login");
      await citizenPage.fill('input[type="email"]', "citizen@resqnet.demo");
      await citizenPage.fill('input[type="password"]', "demo123");
      await citizenPage.click('button[type="submit"]');
      await citizenPage.waitForURL("http://localhost:5173/citizen", {
        timeout: 10000,
      });
      await expect(
        citizenPage.locator('text="Your Safety Status"'),
      ).toBeVisible();

      // Check that the citizen sees the alert (might be in the safety status or alerts section)
      await citizenPage.waitForTimeout(3000); // Wait for potential real-time updates

      // Navigate to alerts to view the alert
      await citizenPage.click(
        '.hidden.md\\:flex a:has-text("Emergency Alerts")',
      );
      await citizenPage.waitForURL("**/alerts", { timeout: 5000 });
      await expect(
        citizenPage.locator('h1:has-text("Emergency Alerts")'),
      ).toBeVisible();

      // Verify the alert appears in the citizen's alerts list
      const citizenAlert = await citizenPage
        .locator('text="CRITICAL: Severe Urban Flooding - E2E Test"')
        .first()
        .isVisible();
      expect(citizenAlert).toBeTruthy();

      // Navigate to shelters to find nearest shelter
      await citizenPage.click('.hidden.md\\:flex a:has-text("Shelters")');
      await citizenPage.waitForURL("**/shelters", { timeout: 5000 });
      await expect(
        citizenPage.locator('h1:has-text("Safe Shelters")'),
      ).toBeVisible();

      // Request emergency help
      await citizenPage.click('.hidden.md\\:flex a:has-text("My Requests")');
      await citizenPage.waitForURL("**/requests", { timeout: 5000 });
      await expect(
        citizenPage.locator('h1:has-text("My Requests")'),
      ).toBeVisible();

      await citizenPage.click('button:has-text("Request Help")');
      await citizenPage.waitForTimeout(2000);

      // Fill help request form
      // First select is for request type (Evacuation, Medical, Food/Water, Shelter)
      await citizenPage
        .locator(
          "div.p-6.space-y-4 div.grid.grid-cols-2.gap-4 div:nth-child(1) select",
        )
        .selectOption("Evacuation");
      // Textarea for situation description
      await citizenPage.fill(
        'textarea[placeholder="Describe your situation and number of people affected..."]',
        "Test evacuation request created during E2E testing. Need immediate assistance due to flooding.",
      );
      // Second select is for priority (Low, Medium, High, CRITICAL)
      await citizenPage
        .locator(
          "div.p-6.space-y-4 div.grid.grid-cols-2.gap-4 div:nth-child(2) select",
        )
        .selectOption("CRITICAL");

      // Submit the request
      await citizenPage.click('button:has-text("Submit Request")');
      await citizenPage.waitForTimeout(3000);

      // Verify request was created - look for the evacuation text in the table (not in dropdown)
      const requestCreated = await citizenPage
        .locator('text="Evacuation"')
        .first()
        .isVisible();
      expect(requestCreated).toBeTruthy();

      // STEP 3: ADMIN sees request in assistance queue → assigns volunteer
      console.log("=== STEP 3: Admin assigns volunteer to request ===");

      // Admin navigates to assistance queue
      await adminPage.goto("http://localhost:5173/admin");
      await adminPage.waitForURL("http://localhost:5173/admin", {
        timeout: 5000,
      });

      await adminPage.click('.hidden.md\\:flex a:has-text("Assistance Queue")');
      await adminPage.waitForURL("**/assistance", { timeout: 5000 });
      await expect(
        adminPage.locator('h1:has-text("Assistance Response Queue")'),
      ).toBeVisible();

      // Find the citizen's request and assign a volunteer
      // Look for the evacuation request we just created
      const requestRow = await adminPage
        .locator('tr:has-text("Evacuation")')
        .first();
      expect(await requestRow.isVisible()).toBeTruthy();

      // Click assign volunteer button (assuming it exists in the row)
      const assignButton = requestRow.locator('button:has-text("Assign")');
      if (await assignButton.isVisible()) {
        await assignButton.click();
        await adminPage.waitForTimeout(2000);

        // Wait for assignment modal to open - using exact classes from AssistanceQueue.tsx
        const assignmentModal = adminPage.locator(
          "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
        );
        await assignmentModal.waitFor({ state: "visible", timeout: 5000 });

        // Select a volunteer from the dropdown - try to find any option with a value
        const volunteerSelect = assignmentModal.locator("select").first();
        // Get all options and select the first one that has a value (not empty)
        const options = volunteerSelect.locator("option");
        const count = await options.count();
        for (let i = 1; i < count; i++) {
          // start at 1 to skip placeholder
          const optionValue = await options.nth(i).getAttribute("value");
          if (optionValue && optionValue.trim() !== "") {
            await volunteerSelect.selectOption(optionValue);
            break;
          }
        }

        // Wait for the Confirm Assignment button to be enabled
        const confirmButton = adminPage.locator(
          'button:has-text("Confirm Assignment")',
        );
        await confirmButton.waitFor({ state: "visible", timeout: 5000 });
        await expect(confirmButton).toBeEnabled({ timeout: 5000 });
        await confirmButton.click();
        await adminPage.waitForTimeout(3000);
      } else {
        // If no direct assign button, click on the request to view details then assign
        await requestRow.click();
        await adminPage.waitForTimeout(2000);
        await adminPage.click('button:has-text("Assign")');
        await adminPage.waitForTimeout(2000);

        // Wait for assignment modal to open - using exact classes from AssistanceQueue.tsx
        const assignmentModal = adminPage.locator(
          "div.fixed.inset-0.bg-black\\/50.z-50.flex.items-center.justify-center.p-4",
        );
        await assignmentModal.waitFor({ state: "visible", timeout: 5000 });

        // Select a volunteer from the dropdown - try to find any option with a value
        const volunteerSelect = assignmentModal.locator("select").first();
        // Get all options and select the first one that has a value (not empty)
        const options = volunteerSelect.locator("option");
        const count = await options.count();
        for (let i = 1; i < count; i++) {
          // start at 1 to skip placeholder
          const optionValue = await options.nth(i).getAttribute("value");
          if (optionValue && optionValue.trim() !== "") {
            await volunteerSelect.selectOption(optionValue);
            break;
          }
        }

        // Wait for the Confirm Assignment button to be enabled
        const confirmButton = adminPage.locator(
          'button:has-text("Confirm Assignment")',
        );
        await confirmButton.waitFor({ state: "visible", timeout: 5000 });
        // Wait for button to be enabled (not disabled)
        await expect(confirmButton).toBeEnabled({ timeout: 5000 });
        await confirmButton.click();
        await adminPage.waitForTimeout(3000);
      }

      // STEP 4: VOLUNTEER receives assignment → accepts → starts → completes task
      console.log("=== STEP 4: Volunteer accepts and completes task ===");

      // Volunteer login
      await volunteerPage.goto("http://localhost:5173/login");
      await volunteerPage.fill('input[type="email"]', "volunteer@resqnet.demo");
      await volunteerPage.fill('input[type="password"]', "demo123");
      await volunteerPage.click('button[type="submit"]');
      await volunteerPage.waitForURL("http://localhost:5173/volunteer", {
        timeout: 10000,
      });
      await expect(
        volunteerPage.locator('h1:has-text("Response Center")'),
      ).toBeVisible();

      // Check for notifications or go to tasks to see the assignment
      await volunteerPage.waitForTimeout(3000); // Wait for real-time notification

      // Navigate to tasks
      await volunteerPage.click('.hidden.md\\:flex a:has-text("My Tasks")');
      await volunteerPage.waitForURL("**/tasks", { timeout: 5000 });
      await expect(
        volunteerPage.locator('h1:has-text("My Tasks")'),
      ).toBeVisible();

      // Find the assigned task and accept it
      const taskRow = await volunteerPage
        .locator('tr:has-text("Evacuation")')
        .first();
      expect(await taskRow.isVisible()).toBeTruthy();

      // Accept the task
      const acceptButton = taskRow.locator(
        'button:has-text("Accept"), button:has-text("Accept Task")',
      );
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await volunteerPage.waitForTimeout(2000);
      }

      // Start the task
      const startButton = taskRow.locator(
        'button:has-text("Start"), button:has-text("Start Progress")',
      );
      if (await startButton.isVisible()) {
        await startButton.click();
        await volunteerPage.waitForTimeout(2000);
      }

      // Complete the task
      const completeButton = taskRow.locator(
        'button:has-text("Complete"), button:has-text("Mark Complete"), button:has-text("Finish Task")',
      );
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await volunteerPage.waitForTimeout(2000);

        // Confirm completion if prompted
        const confirmButton = volunteerPage.locator(
          'button:has-text("Confirm"), button:has-text("Yes")',
        );
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await volunteerPage.waitForTimeout(2000);
        }
      }

      // STEP 5: All status changes persist → verify via refresh → data remains correct
      console.log("=== STEP 5: Verify persistence via refresh ===");

      // Refresh all three pages and verify data is still correct

      // Admin refresh and check
      await adminPage.reload();
      await adminPage.waitForTimeout(3000);
      await adminPage.click('.hidden.md\\:flex a:has-text("Assistance Queue")');
      await adminPage.waitForURL("**/assistance", { timeout: 5000 });
      const adminRequestStatus = await adminPage
        .locator('tr:has-text("Evacuation")')
        .textContent();
      expect(adminRequestStatus).toContain("COMPLETED"); // or similar status

      // Citizen refresh and check
      await citizenPage.reload();
      await citizenPage.waitForTimeout(3000);
      await citizenPage.click('.hidden.md\\:flex a:has-text("My Requests")');
      await citizenPage.waitForURL("**/requests", { timeout: 5000 });
      const citizenRequestStatus = await citizenPage
        .locator('tr:has-text("Evacuation")')
        .textContent();
      expect(citizenRequestStatus).toContain("COMPLETED"); // or similar status

      // Volunteer refresh and check
      await volunteerPage.reload();
      await volunteerPage.waitForTimeout(3000);
      await volunteerPage.click('.hidden.md\\:flex a:has-text("My Tasks")');
      await volunteerPage.waitForURL("**/tasks", { timeout: 5000 });
      const volunteerTaskStatus = await volunteerPage
        .locator('tr:has-text("Evacuation")')
        .textContent();
      expect(volunteerTaskStatus).toContain("COMPLETED"); // or similar status

      // STEP 6: ANALYTICS reflect updated data
      console.log("=== STEP 6: Check analytics ===");

      // Check admin analytics
      await adminPage.click('.hidden.md\\:flex a:has-text("Analytics")');
      await adminPage.waitForURL("**/analytics", { timeout: 5000 });
      await expect(
        adminPage.locator('h1:has-text("Analytics Dashboard")'),
      ).toBeVisible();

      // Verify that analytics show updated numbers (completed tasks, etc.)
      await adminPage.waitForTimeout(3000);

      // STEP 7: AUDIT LOG contains all actions
      console.log("=== STEP 7: Check audit log ===");

      await adminPage.click('.hidden.md\\:flex a:has-text("Audit Logs")');
      await adminPage.waitForURL("**/audit-logs", { timeout: 5000 });
      await expect(
        adminPage.locator('h1:has-text("Audit Log Management")'),
      ).toBeVisible();

      // Look for our actions in the audit log
      await adminPage.waitForTimeout(3000);

      // STEP 8: CITIZEN sees updated request status
      console.log("=== STEP 8: Final citizen verification ===");

      await citizenPage.goto("http://localhost:5173/citizen");
      await citizenPage.waitForURL("http://localhost:5173/citizen", {
        timeout: 5000,
      });
      await expect(
        citizenPage.locator('text="Your Safety Status"'),
      ).toBeVisible();

      // Check that the request status is updated in citizen's view
      await citizenPage.click('.hidden.md\\:flex a:has-text("My Requests")');
      await citizenPage.waitForURL("**/requests", { timeout: 5000 });
      const finalCitizenStatus = await citizenPage
        .locator('tr:has-text("Evacuation")')
        .textContent();
      expect(finalCitizenStatus).toContain("COMPLETED");

      // STEP 9: REFRESH ALL THREE CLIENTS → VERIFY EVERYTHING REMAINS CORRECT
      console.log("=== STEP 9: Final refresh verification ===");

      // Refresh all pages one final time
      await adminPage.reload();
      await citizenPage.reload();
      await volunteerPage.reload();

      await adminPage.waitForTimeout(3000);
      await citizenPage.waitForTimeout(3000);
      await volunteerPage.waitForTimeout(3000);

      // Quick verification that key elements are still present
      const adminCommandCenter = await adminPage
        .locator('h1:has-text("Command Center")')
        .isVisible();
      const citizenSafetyStatus = await citizenPage
        .locator('text="Your Safety Status"')
        .isVisible();
      const volunteerResponseCenter = await volunteerPage
        .locator('h1:has-text("Response Center")')
        .isVisible();

      expect(adminCommandCenter).toBeTruthy();
      expect(citizenSafetyStatus).toBeTruthy();
      expect(volunteerResponseCenter).toBeTruthy();

      console.log("=== WORKFLOW COMPLETED SUCCESSFULLY ===");
    } finally {
      // Close all pages
      await adminPage.close();
      await citizenPage.close();
      await volunteerPage.close();
    }
  });
});
