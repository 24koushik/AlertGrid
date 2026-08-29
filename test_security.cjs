const API_URL = "http://localhost:5000/api";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log("Testing security boundaries...");

  // Login as Citizen
  const citizenLogin = await fetchJSON(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "citizen@resqnet.demo",
      password: "demo123",
    }),
  });
  const citizenToken = citizenLogin.data.token;
  const citizenHeaders = {
    Authorization: `Bearer ${citizenToken}`,
    "Content-Type": "application/json",
  };

  // Login as Volunteer
  const volLogin = await fetchJSON(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "volunteer@resqnet.demo",
      password: "demo123",
    }),
  });
  const volToken = volLogin.data.token;
  const volHeaders = {
    Authorization: `Bearer ${volToken}`,
    "Content-Type": "application/json",
  };

  // 1. Citizen -> create alert
  const alertRes = await fetchJSON(`${API_URL}/alerts`, {
    method: "POST",
    headers: citizenHeaders,
    body: JSON.stringify({
      title: "Hack",
      description: "Hack",
      severity: "HIGH",
      disasterType: "Flood",
      latitude: 0,
      longitude: 0,
      radius: 10,
      expiryTime: new Date().toISOString(),
    }),
  });
  console.log("Citizen creating alert (Expect 401/403):", alertRes.status);

  // 2. Volunteer -> admin analytics
  const analyticsRes = await fetchJSON(`${API_URL}/dashboard/analytics`, {
    headers: volHeaders,
  });
  console.log(
    "Volunteer accessing analytics (Expect 401/403):",
    analyticsRes.status,
  );

  // 3. Citizen -> admin audit logs
  const auditRes = await fetchJSON(`${API_URL}/audit-logs`, {
    headers: citizenHeaders,
  });
  console.log(
    "Citizen accessing audit logs (Expect 401/403):",
    auditRes.status,
  );
}

run();
