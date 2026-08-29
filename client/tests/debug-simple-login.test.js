import { test, expect } from "@playwright/test";

test.describe("Debug Simple Login", () => {
  test("try to login and see what happens", async ({ request }) => {
    // Try to login as admin with the correct URL from the server
    const loginResponse = await request.post(
      "http://localhost:5000/api/auth/login",
      {
        data: {
          email: "admin@resqnet.demo",
          password: "demo123",
        },
      },
    );

    console.log("Login status:", loginResponse.status());
    console.log("Login status text:", loginResponse.statusText());

    // Let's see what we get back regardless of status
    const responseText = await loginResponse.text();
    console.log("Response text:", responseText);

    // Try to parse as JSON if it looks like JSON
    if (responseText.startsWith("{") || responseText.startsWith("[")) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log("Parsed JSON:", jsonData);
      } catch (e) {
        console.log("Failed to parse as JSON:", e.message);
      }
    }
  });
});
