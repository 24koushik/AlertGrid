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
    body: JSON.stringify({
      email: "volunteer@resqnet.demo",
      password: "demo123",
    }),
  });
  const token = loginRes.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const putRes = await fetchJSON(`${API_URL}/volunteers/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: "BUSY" }),
    });
    console.log(putRes);
  } catch (err) {
    console.error(err.message || err);
  }
}
run();
