import { PrismaClient, Alert, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class AlertRepository {
  async createAlert(data: Prisma.AlertUncheckedCreateInput): Promise<Alert> {
    return await prisma.alert.create({
      data,
    });
  }

  async getAlertById(id: string): Promise<Alert | null> {
    return await prisma.alert.findUnique({
      where: { id },
    });
  }

  async getAllActiveAlerts(): Promise<Alert[]> {
    return await prisma.alert.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateAlert(id: string, data: Prisma.AlertUpdateInput): Promise<Alert> {
    return await prisma.alert.update({
      where: { id },
      data,
    });
  }
}

export const alertRepository = new AlertRepository();
