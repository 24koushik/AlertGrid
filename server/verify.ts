import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const alertCount = await prisma.alert.count();
    const shelterCount = await prisma.shelter.count();
    const volunteerCount = await prisma.volunteerProfile.count();
    const taskCount = await prisma.task.count();
    const assistanceRequestCount = await prisma.assistanceRequest.count();
    const incidentCount = await prisma.incident.count();
    const notificationCount = await prisma.notification.count();

    console.log({
      userCount,
      alertCount,
      shelterCount,
      volunteerCount,
      taskCount,
      assistanceRequestCount,
      incidentCount,
      notificationCount,
    });

    // Check for specific roles
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    const citizenCount = await prisma.user.count({
      where: { role: Role.CITIZEN },
    });
    const volunteerUserCount = await prisma.user.count({
      where: { role: Role.VOLUNTEER },
    });

    console.log({
      adminCount,
      citizenCount,
      volunteerUserCount,
    });

    // Check for specific demo accounts
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@resqnet.demo" },
    });
    const citizenUser = await prisma.user.findUnique({
      where: { email: "citizen@resqnet.demo" },
    });
    const volunteerUser = await prisma.user.findUnique({
      where: { email: "volunteer@resqnet.demo" },
    });

    console.log("Demo accounts found:", {
      admin: !!adminUser,
      citizen: !!citizenUser,
      volunteer: !!volunteerUser,
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
