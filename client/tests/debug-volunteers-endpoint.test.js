import { test, expect } from "@playwright/test";

test.describe("Debug Volunteers Endpoint", () => {
  test("check what the /volunteers endpoint returns", async ({ request }) => {
    // First, we need to log in as admin to get a token
    const loginResponse = await request.post(
      "http://localhost:5173/api/auth/login",
      {
        data: {
          email: "admin@resqnet.demo",
          password: "demo123",
        },
      },
    );

    console.log(`Login status: ${loginResponse.status()}`);
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`Login error: ${errorText}`);
      return;
    }

    const loginData = await loginResponse.json();
    console.log("Login data:", loginData);

    // Extract the token (assuming it's in the response)
    const token = loginData.token || loginData.accessToken;
    if (!token) {
      console.log("No token found in login response");
      return;
    }

    // Now call the volunteers endpoint
    const volunteersResponse = await request.get(
      "http://localhost:5173/api/volunteers",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log(`Volunteers endpoint status: ${volunteersResponse.status()}`);
    if (!volunteersResponse.ok) {
      const errorText = await volunteersResponse.text();
      console.log(`Volunteers error: ${errorText}`);
      return;
    }

    const volunteersData = await volunteersResponse.json();
    console.log("Volunteers data:", volunteersData);
    console.log("Volunteers data type:", typeof volunteersData);
    console.log(
      "Volunteers data length:",
      Array.isArray(volunteersData) ? volunteersData.length : "not an array",
    );

    if (Array.isArray(volunteersData)) {
      for (let i = 0; i < Math.min(volunteersData.length, 5); i++) {
        console.log(`  Volunteer ${i}:`, volunteersData[i]);
      }
    } else if (volunteersData && typeof volunteersData === "object") {
      console.log("Volunteers object keys:", Object.keys(volunteersData));
      if (volunteersData.volunteers) {
        console.log("Volunteers array:", volunteersData.volunteers);
        console.log(
          "Volunteers array length:",
          volunteersData.volunteers.length,
        );
        for (
          let i = 0;
          i < Math.min(volunteersData.volunteers.length, 5);
          i++
        ) {
          console.log(`  Volunteer ${i}:`, volunteersData.volunteers[i]);
        }
      }
    }
  });
});
