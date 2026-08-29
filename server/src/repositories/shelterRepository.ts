import { PrismaClient, Shelter, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class ShelterRepository {
  async createShelter(data: Prisma.ShelterCreateInput): Promise<Shelter> {
    return await prisma.shelter.create({ data });
  }

  async getShelterById(id: string): Promise<Shelter | null> {
    return await prisma.shelter.findUnique({ where: { id } });
  }

  async getAllShelters(): Promise<Shelter[]> {
    return await prisma.shelter.findMany({ orderBy: { name: "asc" } });
  }

  async updateShelter(
    id: string,
    data: Prisma.ShelterUpdateInput,
  ): Promise<Shelter> {
    return await prisma.shelter.update({ where: { id }, data });
  }
}

export const shelterRepository = new ShelterRepository();
