import { assistanceRepository } from "../repositories/assistanceRepository";
import { Prisma } from "@prisma/client";
import { io } from "../index";

export class AssistanceService {
  async createRequest(data: Prisma.AssistanceRequestUncheckedCreateInput) {
    const request = await assistanceRepository.create(data);
    io.emit("assistance:created", request);
    return request;
  }

  async getRequestById(id: string) {
    return await assistanceRepository.findById(id);
  }

  async getAllRequests(communityIds?: string[]) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    if (!communityIds || communityIds.length === 0) {
      return await assistanceRepository.findAll();
    }
    return await prisma.assistanceRequest.findMany({
      where: {
        OR: [{ communityId: null }, { communityId: { in: communityIds } }],
      },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserRequests(userId: string) {
    return await assistanceRepository.findByUserId(userId);
  }

  async updateRequestStatus(
    id: string,
    status: string,
    resolutionNotes?: string,
  ) {
    const data: Prisma.AssistanceRequestUpdateInput = { status: status as any };
    if (resolutionNotes) {
      data.resolutionNotes = resolutionNotes;
    }
    const request = await assistanceRepository.update(id, data);
    io.emit("assistance:updated", { id: request.id, status: request.status });
    return request;
  }

  async assignVolunteer(id: string, incidentId?: string) {
    const data: Prisma.AssistanceRequestUpdateInput = { status: "ASSIGNED" };
    if (incidentId) {
      data.incident = { connect: { id: incidentId } };
    }
    const request = await assistanceRepository.update(id, data);
    io.emit("assistance:assigned", { id: request.id });
    return request;
  }
}

export const assistanceService = new AssistanceService();
