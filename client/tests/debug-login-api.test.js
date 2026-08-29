import { test, expect } from "@playwright/test";

test.describe("Debug Login API", () => {
  test("test login API directly", async ({}) => {
    // Test admin login using fetch (should be available in test environment)
    const adminResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@resqnet.demo",
        password: "demo123",
      }),
    });

    console.log("Admin login status:", adminResponse.status);
    const adminData = await adminResponse.json();
    console.log("Admin login response:", adminData);

    // Test citizen login
    const citizenResponse = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "citizen@resqnet.demo",
          password: "demo123",
        }),
      },
    );

    console.log("Citizen login status:", citizenResponse.status);
    const citizenData = await citizenResponse.json();
    console.log("Citizen login response:", citizenData);

    // Test volunteer login
    const volunteerResponse = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "volunteer@resqnet.demo",
          password: "demo123",
        }),
      },
    );

    console.log("Volunteer login status:", volunteerResponse.status);
    const volunteerData = await volunteerResponse.json();
    console.log("Volunteer login response:", volunteerData);
  });
});
