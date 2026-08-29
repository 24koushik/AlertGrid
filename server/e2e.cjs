const axios = require("axios");
const { io } = require("socket.io-client");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const API_URL = "http://localhost:5000/api";

async function runE2E() {
  console.log("--- STARTING END-TO-END VERIFICATION ---");

  // 1. AUTH
  console.log("\\n[VERIFY] Authentication");
  let adminToken, citizenToken, volunteerToken;
  let adminId, citizenId, volunteerId;

  try {
    const adminRes = await axios.post(API_URL + "/auth/login", {
      email: "admin@resqnet.demo",
      password: "demo123",
    });
    adminToken = adminRes.data.token;
    adminId = adminRes.data.user.id;

    const citizenRes = await axios.post(API_URL + "/auth/login", {
      email: "citizen@resqnet.demo",
      password: "demo123",
    });
    citizenToken = citizenRes.data.token;
    citizenId = citizenRes.data.user.id;

    const volRes = await axios.post(API_URL + "/auth/login", {
      email: "volunteer@resqnet.demo",
      password: "demo123",
    });
    volunteerToken = volRes.data.token;
    volunteerId = volRes.data.user.id;
    console.log("V Auth verified for all 3 roles.");
  } catch (e) {
    console.error("X Auth failed:", e.response?.data || e.message);
    return;
  }

  // 2. SOCKET CONNECT CITIZEN
  console.log("\\n[VERIFY] Socket.IO Real-time Alert");
  let citizenSocketReceivedAlert = false;
  const socket = io("http://localhost:5000");

  await new Promise((resolve) => {
    socket.on("connect", () => {
      console.log("V Citizen Socket connected.");
      resolve(true);
    });
  });

  socket.on("alert:created", (data) => {
    console.log("V Citizen Socket received alert:created ->", data.title);
    citizenSocketReceivedAlert = true;
  });

  // 3. ADMIN CREATES ALERT
  console.log("\\n[VERIFY] Admin Alert Creation");
  let alertId;
  try {
    const alertRes = await axios.post(
      API_URL + "/alerts",
      {
        title: "CRITICAL FLOOD ALERT TEST",
        description: "End to end testing alert",
        disasterType: "Flood",
        severity: "CRITICAL",
        latitude: 13.0,
        longitude: 80.0,
        radius: 10,
        expiryTime: new Date(Date.now() + 86400000).toISOString(),
      },
      { headers: { Authorization: "Bearer " + adminToken } },
    );

    alertId = alertRes.data.alert.id;
    console.log("V Alert created via API. ID:", alertId);

    // Verify DB
    const dbAlert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (dbAlert) console.log("V Verified Alert exists in PostgreSQL.");
    else throw new Error("Alert not in DB");

    // Verify AuditLog
    const logs = await prisma.auditLog.findMany({
      where: { resourceId: alertId },
    });
    if (logs.length > 0)
      console.log("V Verified AuditLog exists for Alert Creation.");
    else throw new Error("AuditLog missing for Alert Creation");
  } catch (e) {
    console.error("X Alert Creation failed:", e.response?.data || e.message);
  }

  // Wait for socket to receive
  await new Promise((r) => setTimeout(r, 1000));
  if (!citizenSocketReceivedAlert)
    console.error("X Socket did not receive alert.");

  // Citizen fetch alerts
  try {
    const citizenAlertsRes = await axios.get(API_URL + "/alerts", {
      headers: { Authorization: "Bearer " + citizenToken },
    });
    const found = citizenAlertsRes.data.alerts.find((a) => a.id === alertId);
    if (found)
      console.log("V Verified Citizen GET /api/alerts returns the new alert.");
    else throw new Error("Citizen could not fetch the new alert");
  } catch (e) {
    console.error(
      "X Citizen Alert fetch failed:",
      e.response?.data || e.message,
    );
  }

  // 4. CITIZEN ASSISTANCE REQUEST
  console.log("\\n[VERIFY] Citizen Assistance Request");
  let requestId;
  try {
    const reqRes = await axios.post(
      API_URL + "/assistance",
      {
        requestType: "Evacuation",
        description: "Need immediate evacuation from flood",
        location: "123 Test St",
        priority: "CRITICAL",
        latitude: 13.0,
        longitude: 80.0,
      },
      { headers: { Authorization: "Bearer " + citizenToken } },
    );

    requestId = reqRes.data.request.id;
    console.log("V Request created via API. ID:", requestId);

    const dbReq = await prisma.assistanceRequest.findUnique({
      where: { id: requestId },
    });
    if (dbReq) console.log("V Verified Request exists in PostgreSQL.");
    else throw new Error("Request not in DB");
  } catch (e) {
    console.error("X Citizen Request failed:", e.response?.data || e.message);
  }

  // 5. ADMIN QUEUE & ASSIGNMENT
  console.log("\\n[VERIFY] Admin Assistance Queue & Assignment");
  let taskId;
  try {
    // Check queue
    const queueRes = await axios.get(API_URL + "/assistance", {
      headers: { Authorization: "Bearer " + adminToken },
    });
    const found = queueRes.data.requests.find((r) => r.id === requestId);
    if (found)
      console.log("V Verified Admin GET /api/assistance returns the request.");
    else throw new Error("Request missing from Admin Queue");

    // Assign Volunteer
    const taskRes = await axios.post(
      API_URL + "/tasks",
      {
        title: "Evacuation Response",
        description: "Respond to citizen request",
        volunteerId: volunteerId,
        priority: "CRITICAL",
      },
      { headers: { Authorization: "Bearer " + adminToken } },
    );
    taskId = taskRes.data.task.id;

    await axios.patch(
      API_URL + "/assistance/" + requestId + "/status",
      { status: "ASSIGNED" },
      { headers: { Authorization: "Bearer " + adminToken } },
    );

    console.log("V Assigned Volunteer -> Task created. Task ID:", taskId);

    const dbTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (dbTask && dbTask.volunteerId === volunteerId)
      console.log(
        "V Verified Task exists in PostgreSQL and mapped to Volunteer.",
      );
    else throw new Error("Task verification failed");

    const updatedReq = await prisma.assistanceRequest.findUnique({
      where: { id: requestId },
    });
    if (updatedReq.status === "ASSIGNED")
      console.log("V Verified Assistance Request status is ASSIGNED in DB.");
    else throw new Error("Assistance Request status not updated");
  } catch (e) {
    console.error("X Admin Assignment failed:", e.response?.data || e.message);
  }

  // 6. VOLUNTEER WORKFLOW
  console.log("\\n[VERIFY] Volunteer Task Workflow");
  try {
    // ACCEPT
    await axios.patch(
      API_URL + "/tasks/" + taskId + "/status",
      { status: "ACCEPTED" },
      { headers: { Authorization: "Bearer " + volunteerToken } },
    );
    let dbT = await prisma.task.findUnique({ where: { id: taskId } });
    if (dbT.status === "ACCEPTED") console.log("V Task ACCEPTED successfully.");

    // START
    await axios.patch(
      API_URL + "/tasks/" + taskId + "/status",
      { status: "IN_PROGRESS" },
      { headers: { Authorization: "Bearer " + volunteerToken } },
    );
    dbT = await prisma.task.findUnique({ where: { id: taskId } });
    if (dbT.status === "IN_PROGRESS")
      console.log("V Task IN_PROGRESS successfully.");

    // COMPLETE
    await axios.patch(
      API_URL + "/tasks/" + taskId + "/status",
      { status: "COMPLETED" },
      { headers: { Authorization: "Bearer " + volunteerToken } },
    );
    dbT = await prisma.task.findUnique({ where: { id: taskId } });
    if (dbT.status === "COMPLETED")
      console.log("V Task COMPLETED successfully.");
  } catch (e) {
    console.error(
      "X Volunteer Workflow failed:",
      e.response?.data || e.message,
    );
  }

  // 7. INVALID TRANSITION
  console.log("\\n[VERIFY] Invalid State Transitions");
  try {
    await axios.patch(
      API_URL + "/tasks/" + taskId + "/status",
      { status: "ACCEPTED" },
      { headers: { Authorization: "Bearer " + volunteerToken } },
    );
    console.error("X Invalid transition ALLOWED (Should have failed)");
  } catch (e) {
    if (
      e.response &&
      (e.response.status === 400 ||
        e.response.status === 403 ||
        e.response.status === 500)
    ) {
      console.log(
        "V Verified Invalid transition rejected (Expected behavior). Status:",
        e.response.status,
      );
    } else {
      console.log("X Unexpected error on invalid transition:", e.message);
    }
  }

  // 8. NOTIFICATIONS
  console.log("\\n[VERIFY] Notifications");
  try {
    const notifRes = await axios.get(API_URL + "/notifications", {
      headers: { Authorization: "Bearer " + citizenToken },
    });
    const notifs = notifRes.data.notifications;
    if (notifs.length > 0) {
      console.log(
        "V Verified Notifications exist for Citizen (Count:",
        notifs.length,
        ")",
      );
      const firstId = notifs[0].id;

      await axios.patch(
        API_URL + "/notifications/" + firstId + "/read",
        {},
        { headers: { Authorization: "Bearer " + citizenToken } },
      );
      const dbNotif = await prisma.notification.findUnique({
        where: { id: firstId },
      });
      if (dbNotif.isRead)
        console.log("V Verified Mark Read persisted to PostgreSQL.");
    } else {
      console.error("X No notifications found for Citizen.");
    }
  } catch (e) {
    console.error(
      "X Notification check failed:",
      e.response?.data || e.message,
    );
  }

  socket.disconnect();
  await prisma.$disconnect();
  console.log("\\n--- VERIFICATION COMPLETE ---");
}

runE2E();
