const { PrismaClient } = require("./prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const alertCount = await prisma.alert.count();
    const shelterCount = await prisma.shelter.count();
    const volunteerCount = await prisma.volunteerProfile.count();
    const taskCount = await prisma.task.count();
    const assistanceRequestCount = await prisma.assistanceRequest.count();

    console.log({
      userCount,
      alertCount,
      shelterCount,
      volunteerCount,
      taskCount,
      assistanceRequestCount,
    });

    // Check for specific roles
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const citizenCount = await prisma.user.count({
      where: { role: "CITIZEN" },
    });
    const volunteerUserCount = await prisma.user.count({
      where: { role: "VOLUNTEER" },
    });

    console.log({
      adminCount,
      citizenCount,
      volunteerUserCount,
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
