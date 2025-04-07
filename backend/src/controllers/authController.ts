import { Request, Response } from "express";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    console.log(`Registering user with email: ${email}`);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
      select: { id: true, email: true, role: true },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({ message: "User registered", user, token });
  } catch (error) {
    console.error("Error during registration:", error);

    res.status(500).json({ error: "Registration failed" });
  }
};

//Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id, user.role);

    return res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
