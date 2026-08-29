import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import alertRoutes from "./routes/alertRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import shelterRoutes from "./routes/shelterRoutes";
import incidentRoutes from "./routes/incidentRoutes";
import assistanceRoutes from "./routes/assistanceRoutes";
import { volunteerRouter, taskRouter } from "./routes/volunteerRoutes";
import communityRoutes from "./routes/communityRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import auditRoutes from "./routes/auditRoutes";
import externalRoutes from "./routes/external/externalRoutes";
import { externalDataScheduler } from "./services/realtime/externalDataScheduler";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error(
    "CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.",
  );
  console.error(
    "Please configure JWT_SECRET in your .env file before starting the application.",
  );
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/assistance", assistanceRoutes);
app.use("/api/volunteers", volunteerRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/external", externalRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Socket.io
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start Background Jobs
externalDataScheduler.start(300000); // 5 minutes

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
