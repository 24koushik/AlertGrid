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
    const volRes = await fetchJSON(`${API_URL}/volunteers`, { headers });
    const volId = volRes.volunteers[0].userId;
    console.log("Using volId:", volId);

    const taskRes = await fetchJSON(`${API_URL}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Test Create Task",
        description: "Testing task creation via API",
        volunteerId: volId,
      }),
    });
    console.log(taskRes);
  } catch (err) {
    console.error(err.message || err);
  }
}
run();
