const API_URL = "http://localhost:5000/api";
let token = "";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function runTest() {
  console.log("CITIZEN VERIFICATION START");

  try {
    // 1. LOGIN
    console.log("\\n--- TEST 1: LOGIN ---");
    const loginRes = await fetchJSON(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "citizen@resqnet.demo",
        password: "demo123",
      }),
    });
    token = loginRes.token;
    console.log("Login: SUCCESS");
    console.log("User Role:", loginRes.user.role);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 2. GET DASHBOARD DATA
    console.log("\\n--- TEST 2 & 3: ALERTS ---");
    const alertsRes = await fetchJSON(`${API_URL}/alerts`, { headers });
    console.log(
      "Alerts fetched:",
      alertsRes.alerts?.length || alertsRes.length,
    );
    if (alertsRes.alerts?.length > 0) {
      console.log("Sample alert:", alertsRes.alerts[0].title);
    }

    console.log("\\n--- TEST 4: SHELTERS ---");
    const sheltersRes = await fetchJSON(`${API_URL}/shelters`, { headers });
    console.log(
      "Shelters fetched:",
      sheltersRes.shelters?.length || sheltersRes.length,
    );

    console.log("\\n--- TEST 5: EMERGENCY HELP ---");
    const helpRes = await fetchJSON(`${API_URL}/assistance`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requestType: "Medical",
        description: "Need medical supplies for verification test.",
        location: "Test Location",
        latitude: 13.0,
        longitude: 80.0,
        priority: "HIGH",
      }),
    });
    console.log("Help Request Submitted:", helpRes.request.id);

    console.log("\\n--- TEST 6: MY REQUESTS ---");
    const myReqsRes = await fetchJSON(`${API_URL}/assistance`, { headers });
    console.log(
      "My Requests fetched:",
      myReqsRes.requests?.length || myReqsRes.length,
    );

    console.log("\\n--- TEST 7: NOTIFICATIONS ---");
    const notifsRes = await fetchJSON(`${API_URL}/notifications`, { headers });
    const notifs = notifsRes.notifications || notifsRes;
    console.log("Notifications fetched:", notifs.length);
    if (notifs.length > 0) {
      const notifId = notifs[0].id;
      await fetchJSON(`${API_URL}/notifications/${notifId}/read`, {
        method: "PATCH",
        headers,
      });
      console.log("Marked notification read:", notifId);
    }

    console.log("\\n--- TEST 8: SETTINGS ---");
    const profileRes = await fetchJSON(`${API_URL}/auth/profile`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        phone: "999-888-7777",
        location: "Verified City",
      }),
    });
    console.log("Profile updated. New phone:", profileRes.user.phone);

    console.log("\\nALL TESTS PASSED API LAYER VERIFICATION");
  } catch (error) {
    console.error("TEST FAILED:", error.message || error);
  }
}

runTest();
