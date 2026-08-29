import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const logAudit = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, resource, resourceId },
    });
  } catch (e) {
    console.error("Audit Log failed", e);
  }
};
