import { Request, Response } from "express";
import { shelterService } from "../services/shelterService";

import { AuthRequest } from "../middleware/authMiddleware";

export const createShelter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      capacity,
      facilities,
      contactNumber,
      communityId,
    } = req.body;

    if (!name || !address || !latitude || !longitude || !capacity) {
      res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields",
          errorCode: "VALIDATION_ERROR",
        });
      return;
    }

    const shelter = await shelterService.createShelter({
      name,
      address,
      latitude,
      longitude,
      capacity,
      facilities,
      contactNumber,
      community: communityId ? { connect: { id: communityId } } : undefined,
    });

    res.status(201).json({ success: true, shelter });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getShelters = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { all } = req.query;
    let shelters;

    if (all === "true" || req.user?.role === "ADMIN") {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      shelters = await prisma.shelter.findMany(); // admin sees all
    } else {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      let communityIds: string[] = [];

      if (req.user) {
        const memberships = await prisma.communityMembership.findMany({
          where: { userId: req.user.id as string, status: "APPROVED" },
          select: { communityId: true },
        });
        communityIds = memberships.map((m) => m.communityId);
      }
      shelters = await shelterService.getAllShelters(communityIds);
    }

    res.status(200).json({ success: true, shelters });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getShelterById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const shelter = await shelterService.getShelterById(
      req.params.id as string,
    );
    if (!shelter) {
      res.status(404).json({ success: false, message: "Shelter not found" });
      return;
    }
    res.status(200).json({ success: true, shelter });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateShelter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const shelter = await shelterService.updateShelter(
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ success: true, shelter });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateCapacity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { currentOccupancy } = req.body;
    if (typeof currentOccupancy !== "number") {
      res.status(400).json({ success: false, message: "Invalid occupancy" });
      return;
    }
    const shelter = await shelterService.updateShelter(
      req.params.id as string,
      { currentOccupancy },
    );
    res.status(200).json({ success: true, shelter });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
