import { test, expect } from "@playwright/test";

test.describe("Check Volunteers Data", () => {
  test("log in and fetch volunteers via API", async ({ request }) => {
    // Login as admin
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
    if (!loginResponse.ok) {
      console.log("Login failed");
      return;
    }

    const loginData = await loginResponse.json();
    console.log("Login data:", loginData);

    const token = loginData.token || loginData.accessToken;
    if (!token) {
      console.log("No token in login response");
      return;
    }

    // Fetch volunteers
    const volunteersResponse = await request.get(
      "http://localhost:5173/api/volunteers",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Volunteers status:", volunteersResponse.status());
    if (!volunteersResponse.ok) {
      const errorText = await volunteersResponse.text();
      console.log("Volunteers error:", errorText);
      return;
    }

    const volunteersData = await volunteersResponse.json();
    console.log("Volunteers data:", volunteersData);
    console.log("Type:", typeof volunteersData);
    if (Array.isArray(volunteersData)) {
      console.log("Length:", volunteersData.length);
      volunteersData.forEach((v, i) => {
        console.log(`  ${i}:`, v);
      });
    } else if (volunteersData && typeof volunteersData === "object") {
      console.log("Keys:", Object.keys(volunteersData));
      if (volunteersData.volunteers) {
        console.log("Volunteers array:", volunteersData.volunteers);
        console.log("Length:", volunteersData.volunteers.length);
        volunteersData.volunteers.forEach((v, i) => {
          console.log(`  ${i}:`, v);
        });
      }
    }
  });
});
