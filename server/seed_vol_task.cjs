const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const vol = await prisma.user.findUnique({
    where: { email: "volunteer@resqnet.demo" },
  });

  await prisma.task.create({
    data: {
      title: "E2E Verification Task",
      description: "Test task for playwright",
      volunteer: { connect: { id: vol.id } },
      status: "ASSIGNED",
    },
  });

  console.log("Seeded E2E task for volunteer.");
}
run();
