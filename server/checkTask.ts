import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const task = await prisma.task.findUnique({
      where: { id: "20e6fc63-fa28-4fd1-ad4e-a23cf02f610f" },
    });
    console.log("Task found:", task);
    console.log("Task status:", task?.status);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
