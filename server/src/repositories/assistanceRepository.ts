import { PrismaClient, AssistanceRequest, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class AssistanceRepository {
  async create(
    data: Prisma.AssistanceRequestUncheckedCreateInput,
  ): Promise<AssistanceRequest> {
    return await prisma.assistanceRequest.create({ data });
  }

  async findById(id: string): Promise<AssistanceRequest | null> {
    return await prisma.assistanceRequest.findUnique({ where: { id } });
  }

  async findAll(): Promise<AssistanceRequest[]> {
    return await prisma.assistanceRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserId(userId: string): Promise<AssistanceRequest[]> {
    return await prisma.assistanceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.AssistanceRequestUpdateInput,
  ): Promise<AssistanceRequest> {
    return await prisma.assistanceRequest.update({ where: { id }, data });
  }
}

export const assistanceRepository = new AssistanceRepository();
