const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user
  .count()
  .then((c) => console.log("DB OK, users:", c))
  .catch((e) => console.log("DB FAIL:", e.message))
  .finally(() => p.$disconnect());
