import { PrismaClient, Notification, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationRepository {
  async createNotification(
    data: Prisma.NotificationUncheckedCreateInput,
  ): Promise<Notification> {
    return await prisma.notification.create({ data });
  }

  async createManyNotifications(
    data: Prisma.NotificationUncheckedCreateInput[],
  ): Promise<Prisma.BatchPayload> {
    return await prisma.notification.createMany({ data });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return await prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
