import { Request, Response } from "express";
import { assistanceService } from "../services/assistanceService";
import { AuthRequest } from "../middleware/authMiddleware";

export const createAssistanceRequest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      requestType,
      description,
      location,
      latitude,
      longitude,
      priority,
      incidentId,
      communityId,
    } = req.body;

    if (!requestType || !description || !location || !priority) {
      res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields",
          errorCode: "VALIDATION_ERROR",
        });
      return;
    }

    let finalCommunityId = null;

    if (req.user!.role === "CITIZEN") {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const memberships = await prisma.communityMembership.findMany({
        where: { userId: req.user!.id as string, status: "APPROVED" },
      });
      if (memberships.length > 0) {
        // Auto-assign to their primary community if they didn't provide one, or verify the one they provided
        if (communityId) {
          const valid = memberships.find((m) => m.communityId === communityId);
          if (valid) finalCommunityId = communityId;
        } else {
          finalCommunityId = memberships[0].communityId;
        }
      }
    } else {
      finalCommunityId = communityId || null;
    }

    const request = await assistanceService.createRequest({
      userId: req.user!.id as string,
      requestType,
      description,
      location,
      latitude,
      longitude,
      priority,
      incidentId,
      communityId: finalCommunityId,
    });

    import("../services/auditService").then(({ logAudit }) => {
      logAudit(
        req.user!.id as string,
        "ASSISTANCE_CREATED",
        "AssistanceRequest",
        request.id,
      );
    });

    res.status(201).json({ success: true, request });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAssistanceRequests = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userRole = req.user!.role;
    let requests;

    if (userRole === "CITIZEN") {
      requests = await assistanceService.getUserRequests(
        req.user!.id as string,
      );
    } else if (userRole === "ADMIN") {
      requests = await assistanceService.getAllRequests();
    } else {
      // Volunteer
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const memberships = await prisma.communityMembership.findMany({
        where: { userId: req.user!.id as string, status: "APPROVED" },
        select: { communityId: true },
      });
      const communityIds = memberships.map((m) => m.communityId);
      requests = await assistanceService.getAllRequests(communityIds);
    }

    res.status(200).json({ success: true, requests });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAssistanceRequestById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const request = await assistanceService.getRequestById(
      req.params.id as string,
    );
    if (!request) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    // Citizens can only view their own requests
    if (req.user!.role === "CITIZEN" && request.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    res.status(200).json({ success: true, request });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status, resolutionNotes } = req.body;
    const request = await assistanceService.updateRequestStatus(
      req.params.id as string,
      status,
      resolutionNotes,
    );
    res.status(200).json({ success: true, request });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const assignVolunteer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { incidentId } = req.body;
    const request = await assistanceService.assignVolunteer(
      req.params.id as string,
      incidentId,
    );
    res.status(200).json({ success: true, request });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
