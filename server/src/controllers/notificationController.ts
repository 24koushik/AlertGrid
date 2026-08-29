import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { notificationRepository } from "../repositories/notificationRepository";

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const notifications = await notificationRepository.getUserNotifications(
      req.user!.id as string,
    );
    res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const notification = await notificationRepository.markAsRead(
      req.params.id as string,
      req.user!.id as string,
    );
    res.status(200).json({ success: true, notification });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await notificationRepository.markAllAsRead(
      req.user!.id as string,
    );
    res.status(200).json({ success: true, updatedCount: result.count });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
