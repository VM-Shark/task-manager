import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/AuthRequest";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can create tasks." });
    }

    const { title, description, assigneeId, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        createdBy: req.user.id,
        dueDate,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Task creation failed" });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    let tasks;

    if (req.user?.role === "ADMIN") {
      tasks = await prisma.task.findMany();
    } else {
      tasks = await prisma.task.findMany({
        where: { assigneeId: req.user?.id },
      });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (req.user?.id !== task.assigneeId && req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Not authorized to update this task" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Task update failed" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can delete tasks." });
    }

    const { id } = req.params;
    await prisma.task.delete({ where: { id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Task deletion failed" });
  }
};
