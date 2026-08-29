import { Request, Response } from "express";
import {
  PrismaClient,
  CommunityStatus,
  MembershipRole,
  MembershipStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// List communities
export const getCommunities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q } = req.query;
    let filter: any = { status: CommunityStatus.ACTIVE };

    if (q && typeof q === "string") {
      filter.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const communities = await prisma.community.findMany({
      where: filter,
      include: {
        _count: {
          select: {
            memberships: { where: { status: MembershipStatus.APPROVED } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ success: true, communities });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get single community
export const getCommunity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: { where: { status: MembershipStatus.APPROVED } },
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (!community) {
      res.status(404).json({ success: false, message: "Community not found" });
      return;
    }

    res.status(200).json({ success: true, community });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Register new community
export const registerCommunity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      radius,
    } = req.body;
    const userId = (req as any).user.id;

    if (!name || !city || latitude === undefined || longitude === undefined) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const community = await prisma.$transaction(async (tx) => {
      // Create the community
      const newCommunity = await tx.community.create({
        data: {
          name,
          description,
          address,
          city,
          state,
          postalCode,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: radius ? parseFloat(radius) : 5.0,
          createdById: userId,
          status: CommunityStatus.ACTIVE,
        },
      });

      // Add the creator as an APPROVED COMMUNITY_ADMIN
      await tx.communityMembership.create({
        data: {
          communityId: newCommunity.id,
          userId,
          role: MembershipRole.COMMUNITY_ADMIN,
          status: MembershipStatus.APPROVED,
          joinedAt: new Date(),
        },
      });

      return newCommunity;
    });

    res.status(201).json({ success: true, community });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Request to join a community
export const joinCommunity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      res.status(404).json({ success: false, message: "Community not found" });
      return;
    }

    const existingMembership = await prisma.communityMembership.findUnique({
      where: { communityId_userId: { communityId: id, userId } },
    });

    if (existingMembership) {
      res
        .status(400)
        .json({
          success: false,
          message: "Already a member or request pending",
        });
      return;
    }

    // For demonstration, we'll Auto-Approve joins unless specific logic applies
    // A real app might leave it as PENDING for admin approval
    const membership = await prisma.communityMembership.create({
      data: {
        communityId: id,
        userId,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.APPROVED,
        joinedAt: new Date(),
      },
    });

    res.status(201).json({ success: true, membership });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get members of a community (Requires COMMUNITY_ADMIN or System ADMIN)
export const getCommunityMembers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;

    // Check auth
    if (user.role !== "ADMIN") {
      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId: user.id } },
      });
      if (!membership || membership.role !== MembershipRole.COMMUNITY_ADMIN) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
    }

    const members = await prisma.communityMembership.findMany({
      where: { communityId: id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, members });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
