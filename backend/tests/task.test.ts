import request from "supertest";
import { app, server } from "../src/server";
import prisma from "../src/config/prisma";

let adminToken: string;
let userToken: string;
let userId: string;

jest.setTimeout(30000);

beforeAll(async () => {
  // Clean DB before tests start
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Register admin
  const adminEmail = `admin+${Date.now()}@example.com`;
  const adminRes = await request(app).post("/api/auth/register").send({
    email: adminEmail,
    password: "admin123",
    role: "ADMIN",
  });

  if (!adminRes.body.token) throw new Error("Admin registration failed");
  adminToken = adminRes.body.token;

  // Register a test user
  const userEmail = `user+${Date.now()}@example.com`;
  const userRes = await request(app).post("/api/auth/register").send({
    email: userEmail,
    password: "password123",
    role: "USER",
  });

  if (!userRes.body.token || !userRes.body.user?.id) {
    throw new Error("User registration failed");
  }

  userToken = userRes.body.token;
  userId = userRes.body.user.id;
});

describe("Task API", () => {
  it("should allow admin to create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Task",
        description: "This is a test task",
        assigneeId: userId,
        dueDate: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("title", "Test Task");
  });

  it("should allow users to fetch only their tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assigneeId: userId,
        }),
      ])
    );
  });

  it("should prevent unauthorized users from creating tasks", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Unauthorized Task",
      description: "This should not be created",
    });

    expect(res.status).toBe(401);
  });
});

afterAll(async () => {
  // Clean up DB
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
}, 40000);
