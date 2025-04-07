import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  console.log("Setting up test database...");

  // Reset tables
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE`
  );

  // Create default admin user for testing
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    },
  });
});

afterAll(async () => {
  console.log("Closing Prisma connection...");
  await prisma.$disconnect();
});
