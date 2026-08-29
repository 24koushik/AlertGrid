import { shelterRepository } from "../repositories/shelterRepository";
import { io } from "../index";
import { Prisma } from "@prisma/client";

export class ShelterService {
  async createShelter(data: Prisma.ShelterCreateInput) {
    return await shelterRepository.createShelter(data);
  }

  async getAllShelters(communityIds?: string[]) {
    // If we want to filter in the DB using Prisma instead of repository pattern for simplicity:
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    if (!communityIds || communityIds.length === 0) {
      return await prisma.shelter.findMany({
        where: { communityId: null },
      });
    }

    return await prisma.shelter.findMany({
      where: {
        OR: [{ communityId: null }, { communityId: { in: communityIds } }],
      },
    });
  }

  async getShelterById(id: string) {
    return await shelterRepository.getShelterById(id);
  }

  async updateShelter(id: string, data: Prisma.ShelterUpdateInput) {
    const shelter = await shelterRepository.updateShelter(id, data);

    // Broadcast shelter update (e.g. capacity changed)
    io.emit("shelter:updated", {
      id: shelter.id,
      currentOccupancy: shelter.currentOccupancy,
      status: shelter.status,
    });

    return shelter;
  }
}

export const shelterService = new ShelterService();
