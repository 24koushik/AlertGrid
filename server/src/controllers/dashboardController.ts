import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSummary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id as string;

    const summary: any = {};

    if (role === "ADMIN") {
      summary.activeIncidents = await prisma.incident.count({
        where: { status: { in: ["REPORTED", "VERIFIED", "ACTIVE"] } },
      });
      summary.criticalAlerts = await prisma.alert.count({
        where: { status: "ACTIVE", severity: "CRITICAL" },
      });
      summary.openShelters = await prisma.shelter.count({
        where: { status: "OPEN" },
      });
      summary.availableVolunteers = await prisma.volunteerProfile.count({
        where: { status: "AVAILABLE" },
      });
      summary.pendingAssistanceRequests = await prisma.assistanceRequest.count({
        where: { status: "SUBMITTED" },
      });
    } else if (role === "CITIZEN") {
      summary.activeAlerts = await prisma.alert.count({
        where: { status: "ACTIVE" },
      });
      summary.activeIncidents = await prisma.incident.count({
        where: { status: "ACTIVE" },
      });
      summary.unreadNotifications = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      summary.ownAssistanceRequests = await prisma.assistanceRequest.count({
        where: { userId },
      });

      const shelters = await prisma.shelter.findMany({
        where: { status: "OPEN" },
        take: 1,
      });
      summary.nearestShelter = shelters.length > 0 ? shelters[0] : null; // simplified distance calculation
    } else if (role === "VOLUNTEER") {
      summary.assignedTasks = await prisma.task.count({
        where: {
          volunteerId: userId,
          status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
        },
      });
      summary.availableTasks = await prisma.task.count({
        where: { status: "PENDING" },
      });
      summary.activeAlerts = await prisma.alert.count({
        where: { status: "ACTIVE" },
      });

      const profile = await prisma.volunteerProfile.findUnique({
        where: { userId },
      });
      summary.currentAssignment = profile?.status || "AVAILABLE";
    }

    res.status(200).json({ success: true, summary });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Only Admin
    const incidentsByType = await prisma.incident.groupBy({
      by: ["disasterType"],
      _count: true,
    });

    const incidentsBySeverity = await prisma.incident.groupBy({
      by: ["severity"],
      _count: true,
    });

    const requestsByType = await prisma.assistanceRequest.groupBy({
      by: ["requestType"],
      _count: true,
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ["status"],
      _count: true,
    });

    res.status(200).json({
      success: true,
      analytics: {
        incidentsByType,
        incidentsBySeverity,
        requestsByType,
        tasksByStatus,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
