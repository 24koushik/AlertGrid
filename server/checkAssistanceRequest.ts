import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const request = await prisma.assistanceRequest.findUnique({
      where: { id: "6e66204c-e8ef-4f04-907c-e89791aa1422" },
    });
    console.log("Assistance request found:", request);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
