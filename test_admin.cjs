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
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const tasksRes = await fetchJSON(`${API_URL}/tasks`, { headers });
    const tasks = tasksRes.tasks;
    const task = tasks.find((t) => t.title === "E2E Verification Task");
    console.log("Task found by Admin:", task ? "YES" : "NO");
    console.log("Task status:", task?.status);

    if (task && task.status === "COMPLETED") {
      console.log("Admin cross-role verification: VERIFIED");
    }
  } catch (err) {
    console.error(err.message || err);
  }
}
run();
