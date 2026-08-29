const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash("demo123", 10);

  // Create Demo Admin
  const admin = await prisma.user.upsert({
    where: { email: "demo-admin@alertgrid.demo" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "demo-admin@alertgrid.demo",
      password: hash,
      role: "ADMIN",
    },
  });

  // Create Demo Community
  let demoComm = await prisma.community.findFirst({
    where: { name: "AlertGrid Demo Community" },
  });
  if (!demoComm) {
    demoComm = await prisma.community.create({
      data: {
        name: "AlertGrid Demo Community",
        description: "Community for presentation access.",
        city: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
        radius: 10,
        createdById: admin.id,
      },
    });
  }

  // Create Demo Citizen
  const citizen = await prisma.user.upsert({
    where: { email: "demo-citizen@alertgrid.demo" },
    update: {},
    create: {
      name: "Demo Citizen",
      email: "demo-citizen@alertgrid.demo",
      password: hash,
      role: "CITIZEN",
      location: "13.0827,80.2707",
    },
  });

  // Citizen Community Membership
  await prisma.communityMembership.upsert({
    where: {
      communityId_userId: { userId: citizen.id, communityId: demoComm.id },
    },
    update: {},
    create: {
      userId: citizen.id,
      communityId: demoComm.id,
      role: "MEMBER",
      status: "APPROVED",
    },
  });

  // Create Demo Volunteer
  const volunteer = await prisma.user.upsert({
    where: { email: "demo-volunteer@alertgrid.demo" },
    update: {},
    create: {
      name: "Demo Volunteer",
      email: "demo-volunteer@alertgrid.demo",
      password: hash,
      role: "VOLUNTEER",
      location: "13.0827,80.2707",
    },
  });

  // Volunteer Profile
  await prisma.volunteerProfile.upsert({
    where: { userId: volunteer.id },
    update: {},
    create: {
      userId: volunteer.id,
      skills: ["First Aid", "Search & Rescue"],
      serviceArea: "Chennai",
      status: "AVAILABLE",
    },
  });

  // Volunteer Community Membership
  await prisma.communityMembership.upsert({
    where: {
      communityId_userId: { userId: volunteer.id, communityId: demoComm.id },
    },
    update: {},
    create: {
      userId: volunteer.id,
      communityId: demoComm.id,
      role: "MEMBER",
      status: "APPROVED",
    },
  });

  console.log("Demo accounts created successfully.");
}
run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
