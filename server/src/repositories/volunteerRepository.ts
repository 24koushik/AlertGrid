import { PrismaClient, VolunteerProfile, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class VolunteerRepository {
  async findProfileByUserId(userId: string): Promise<VolunteerProfile | null> {
    return await prisma.volunteerProfile.findUnique({ where: { userId } });
  }

  async createOrUpdateProfile(
    userId: string,
    data: Partial<VolunteerProfile>,
  ): Promise<VolunteerProfile> {
    const existing = await prisma.volunteerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return await prisma.volunteerProfile.update({
        where: { userId },
        data,
      });
    } else {
      return await prisma.volunteerProfile.create({
        data: {
          userId,
          skills: data.skills || [],
          experience: data.experience,
          serviceArea: data.serviceArea,
          status: data.status || "AVAILABLE",
        },
      });
    }
  }

  async getAllVolunteers() {
    return await prisma.user.findMany({
      where: { role: "VOLUNTEER" },
      include: { volunteerProfile: true },
    });
  }
}

export const volunteerRepository = new VolunteerRepository();
