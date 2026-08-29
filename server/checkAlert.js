const { PrismaClient } = require("./prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: "2f28a8a2-4c8a-40b5-982f-bb8a7cbcc7d8" },
    });
    console.log("Alert found:", alert);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
