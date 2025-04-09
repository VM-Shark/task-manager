import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/AuthRequest";
import { Status } from "@prisma/client";

// Create task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Authenticated User:", req.user);
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ error: "Only admins can create tasks." });
      return;
    }

    const { title, description, assigneeId, dueDate } = req.body;

    if (!title || !description || !assigneeId || !dueDate) {
      res.status(400).json({
        error: "Title, description, asigneee and dueDate are required.",
      });
      return;
    }
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

// Get tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    let tasks;

    // Validate status from query
    let statusFilter: Status | undefined = undefined;

    if (
      typeof status === "string" &&
      Object.values(Status).includes(status as Status)
    ) {
      statusFilter = status as Status;
    } else if (status !== undefined) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const baseWhere =
      req.user?.role === "ADMIN" ? {} : { assigneeId: req.user?.id };

    const whereClause = statusFilter
      ? { ...baseWhere, status: statusFilter }
      : baseWhere;

    tasks = await prisma.task.findMany({ where: whereClause });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Update task for normal user
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

// Update task for admin
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can update tasks fully" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate,
        assigneeId,
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Task update failed" });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ error: "Only admins can delete tasks." });
      return;
    }

    const { id } = req.params;
    await prisma.task.delete({ where: { id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Task deletion failed" });
  }
};

// Create comment on task
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, content } = req.body;

    if (!taskId || !content) {
      res.status(400).json({ error: "Task ID and content are required." });
      return;
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: req.user?.id!,
        content,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Comment creation failed" });
  }
};

// Get comments for as task
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Fetch the comments related to the task
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { email: true, id: true } },
      },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
