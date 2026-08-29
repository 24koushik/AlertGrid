import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, location, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required",
          errorCode: "VALIDATION_ERROR",
        });
      return;
    }

    // Do not allow arbitrary ADMIN registration
    const requestedRole =
      role === "ADMIN" ? Role.CITIZEN : (role as Role) || Role.CITIZEN;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(409)
        .json({
          success: false,
          message: "Email already exists",
          errorCode: "CONFLICT",
        });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        location,
        role: requestedRole,
      },
    });

    // If volunteer, create volunteer profile
    if (requestedRole === "VOLUNTEER") {
      await prisma.volunteerProfile.create({
        data: {
          userId: user.id,
          skills: req.body.skills || [],
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
      },
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({
          success: false,
          message: "Email and password required",
          errorCode: "VALIDATION_ERROR",
        });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { community: true },
        },
      },
    });
    if (!user) {
      res
        .status(401)
        .json({
          success: false,
          message: "Invalid credentials",
          errorCode: "UNAUTHORIZED",
        });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res
        .status(401)
        .json({
          success: false,
          message: "Invalid credentials",
          errorCode: "UNAUTHORIZED",
        });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
      },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberships: user.memberships,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        phone: true,
        memberships: {
          include: { community: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, phone, location } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, location },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location: true,
        phone: true,
        memberships: {
          include: { community: true },
        },
      },
    });

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
