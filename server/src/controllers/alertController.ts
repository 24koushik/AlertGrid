import { Request, Response } from "express";
import { alertService } from "../services/alertService";
import { AuthRequest } from "../middleware/authMiddleware";

export const createAlert = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      disasterType,
      severity,
      latitude,
      longitude,
      radius,
      expiryTime,
      instructions,
      communityId,
    } = req.body;

    if (
      !title ||
      !description ||
      !disasterType ||
      !severity ||
      !latitude ||
      !longitude ||
      !radius ||
      !expiryTime
    ) {
      res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields",
          errorCode: "VALIDATION_ERROR",
        });
      return;
    }

    const alert = await alertService.createAlert({
      title,
      description,
      disasterType,
      severity,
      latitude,
      longitude,
      radius,
      expiryTime: new Date(expiryTime),
      instructions,
      communityId: communityId || null,
      createdById: req.user!.id as string,
    });

    import("../services/auditService").then(({ logAudit }) => {
      logAudit(req.user!.id as string, "ALERT_CREATED", "Alert", alert.id);
    });

    res.status(201).json({ success: true, alert });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAlerts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { all, lat, lon } = req.query;

    // Admin request for all alerts
    if (all === "true") {
      const alerts = await alertService.getAllAlerts();
      res.status(200).json({ success: true, alerts });
      return;
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    let userLat: number | null = lat ? parseFloat(lat as string) : null;
    let userLon: number | null = lon ? parseFloat(lon as string) : null;
    let communityIds: string[] = [];

    if (req.user) {
      // 1. Fetch Approved Communities
      const memberships = await prisma.communityMembership.findMany({
        where: { userId: req.user.id as string, status: "APPROVED" },
        include: { community: true },
      });

      communityIds = memberships.map((m) => m.communityId);

      // If we don't have browser GPS, use the first approved community's location
      if ((!userLat || !userLon) && memberships.length > 0) {
        userLat = memberships[0].community.latitude;
        userLon = memberships[0].community.longitude;
      }

      // 2. Fallback to user profile location (stubbed if we had geocoding)
      // We don't have exact lat/lon on User model, so community is primary.
    }

    // Get ACTIVE alerts with geographic filtering
    const alerts = await alertService.getActiveAlerts(
      communityIds,
      userLat,
      userLon,
    );

    res.status(200).json({ success: true, alerts });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAlertById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const alert = await alertService.getAlertById(req.params.id as string);
    if (!alert) {
      res
        .status(404)
        .json({
          success: false,
          message: "Alert not found",
          errorCode: "NOT_FOUND",
        });
      return;
    }
    res.status(200).json({ success: true, alert });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateAlert = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const alert = await alertService.updateAlert(
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ success: true, alert });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
