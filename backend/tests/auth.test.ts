import request from "supertest";
import { app, server } from "../src/server";
import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";

jest.setTimeout(15000);

beforeEach(async () => {
  // Deleting data first to avoid errors
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  try {
    console.log("Cleaning up database...");

    await Promise.race([
      prisma.task.deleteMany(),
      new Promise((_, reject) =>
        setTimeout(() => reject("Timeout during task deletion"), 10000)
      ),
    ]);

    await Promise.race([
      prisma.user.deleteMany(),
      new Promise((_, reject) =>
        setTimeout(() => reject("Timeout during user deletion"), 10000)
      ),
    ]);
    console.log("Data cleanup completed.");

    console.log("Disconnecting Prisma...");
    await Promise.race([
      prisma.$disconnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject("Timeout during Prisma disconnect"), 10000)
      ),
    ]);
    console.log("Prisma disconnected.");

    console.log("Closing server...");
    await Promise.race([
      new Promise((resolve) => server?.close(resolve)),
      new Promise((_, reject) =>
        setTimeout(() => reject("Timeout during server close"), 10000)
      ),
    ]);
    console.log("Server closed.");
  } catch (error) {
    console.error("Error during afterAll cleanup:", error);
  }
}, 20000);

describe("Authentication API", () => {
  it("should register a new user", async () => {
    const email = `testuser+${Date.now()}@example.com`;

    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "password123",
      role: "USER",
    });

    // Debugging
    console.log("Registration Response:", res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should log in an existing user", async () => {
    const email = `admin+${Date.now()}@example.com`;

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "admin123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with incorrect credentials", async () => {
    const email = `failuser+${Date.now()}@example.com`;

    // Create user with known password
    await prisma.user.create({
      data: {
        email,
        password: "correctpassword",
        role: "USER",
      },
    });

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});
