const API_URL = "http://localhost:5000/api";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function run() {
  const loginRes = await fetchJSON(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@resqnet.demo", password: "demo123" }),
  });
  const token = loginRes.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetchJSON(`${API_URL}/incidents`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Test Incident",
        description: "Test Incident Desc",
        severity: "HIGH",
        disasterType: "Flood",
        latitude: 13.0,
        longitude: 80.2,
        affectedArea: 10,
        status: "ACTIVE",
      }),
    });
    console.log(res);
  } catch (err) {
    console.error(err.message || err);
  }
}
run();
