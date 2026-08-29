import { PrismaClient, Incident, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class IncidentRepository {
  async create(data: Prisma.IncidentUncheckedCreateInput): Promise<Incident> {
    return await prisma.incident.create({ data });
  }

  async findById(id: string): Promise<Incident | null> {
    return await prisma.incident.findUnique({ where: { id } });
  }

  async findAll(): Promise<Incident[]> {
    return await prisma.incident.findMany({ orderBy: { createdAt: "desc" } });
  }

  async update(
    id: string,
    data: Prisma.IncidentUpdateInput,
  ): Promise<Incident> {
    return await prisma.incident.update({ where: { id }, data });
  }
}

export const incidentRepository = new IncidentRepository();
