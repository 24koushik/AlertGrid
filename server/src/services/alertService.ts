import { alertRepository } from "../repositories/alertRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import { redisService } from "./redisService";
import { io } from "../index";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient(); // For finding users to notify

export class AlertService {
  private ACTIVE_ALERTS_CACHE_KEY = "alerts:active";

  async createAlert(data: Prisma.AlertUncheckedCreateInput) {
    const alert = await alertRepository.createAlert(data);

    await redisService.del(this.ACTIVE_ALERTS_CACHE_KEY);

    // Geographic Notification Logic
    let notifyCitizenIds: string[] = [];

    if (data.communityId) {
      // 1. Explicitly mapped to a single community
      const citizens = await prisma.user.findMany({
        where: {
          role: "CITIZEN",
          memberships: {
            some: { communityId: data.communityId, status: "APPROVED" },
          },
        },
        select: { id: true },
      });
      notifyCitizenIds = citizens.map((c) => c.id);

      io.to(`community:${data.communityId}`).emit("alert:created", alert);
    } else {
      // 2. Global/Coordinate-based Alert
      // Find all communities that fall within the alert radius
      const allCommunities = await prisma.community.findMany();
      const affectedCommunityIds = allCommunities
        .filter((comm) => {
          const dist = this.calculateDistance(
            comm.latitude,
            comm.longitude,
            alert.latitude,
            alert.longitude,
          );
          return dist <= (alert.radius || 100);
        })
        .map((c) => c.id);

      if (affectedCommunityIds.length > 0) {
        const citizens = await prisma.user.findMany({
          where: {
            role: "CITIZEN",
            memberships: {
              some: {
                communityId: { in: affectedCommunityIds },
                status: "APPROVED",
              },
            },
          },
          select: { id: true },
        });
        notifyCitizenIds = citizens.map((c) => c.id);

        // Emit to affected community channels
        affectedCommunityIds.forEach((id) => {
          io.to(`community:${id}`).emit("alert:created", alert);
        });
      } else {
        // If it affects NO communities, do not send push notifications globally.
        // It remains in DB for users who might check the app from that exact GPS location.
      }
    }

    // Deduplicate and send notifications
    notifyCitizenIds = [...new Set(notifyCitizenIds)]; // unique

    if (notifyCitizenIds.length > 0) {
      const notifications = notifyCitizenIds.map((userId) => ({
        userId,
        title: alert.title,
        message: alert.description,
        type: "ALERT",
        severity: alert.severity,
      }));
      await notificationRepository.createManyNotifications(notifications);
    }

    return alert;
  }

  async getActiveAlerts(
    communityIds?: string[],
    userLat?: number | null,
    userLon?: number | null,
  ) {
    // 1. Fetch raw active alerts from DB
    // An alert is active if status is ACTIVE and expiryTime > now
    const now = new Date();

    let dbAlerts = await prisma.alert.findMany({
      where: {
        status: "ACTIVE",
        expiryTime: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. If no user location context is provided at all, we can only return their explicit community alerts
    // or global alerts if they are an admin requesting. Since citizens need location filtering:
    if (!userLat || !userLon) {
      if (communityIds && communityIds.length > 0) {
        return dbAlerts.filter(
          (a) => a.communityId && communityIds.includes(a.communityId),
        );
      }
      return []; // No location context = no alerts (safer than showing global)
    }

    // 3. Geographic Filtering
    // Keep alerts that are EITHER explicitly assigned to their community OR geographically overlap their radius
    return dbAlerts.filter((alert) => {
      // Explicit community match
      if (
        alert.communityId &&
        communityIds &&
        communityIds.includes(alert.communityId)
      ) {
        return true;
      }

      // Geographic distance match
      const dist = this.calculateDistance(
        userLat,
        userLon,
        alert.latitude,
        alert.longitude,
      );
      // alert.radius is the affected radius in km (default is usually 50-500km depending on event)
      // If the user's location falls within the affected radius, they see it!
      return dist <= (alert.radius || 100);
    });
  }

  // Haversine formula for distance in km
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getAlertById(id: string) {
    return await alertRepository.getAlertById(id);
  }

  async getAllAlerts() {
    return await alertRepository.getAllAlerts();
  }

  async updateAlert(id: string, data: Prisma.AlertUpdateInput) {
    const alert = await alertRepository.updateAlert(id, data);
    await redisService.del(this.ACTIVE_ALERTS_CACHE_KEY);

    // Optional: emit alert:updated
    io.emit("alert:updated", {
      id: alert.id,
      status: alert.status,
      severity: alert.severity,
    });

    return alert;
  }
}

export const alertService = new AlertService();
