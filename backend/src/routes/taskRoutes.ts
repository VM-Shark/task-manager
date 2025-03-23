import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task Management APIs
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (Admin only)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       403:
 *         description: Forbidden - Only admins can create tasks
 */

router.post("/", authenticate, authorize(["ADMIN"]), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (Admins) or assigned tasks (Users)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       403:
 *         description: Forbidden - Not authorized
 *       500:
 *         description: Failed to fetch tasks
 */

router.get("/", authenticate, getTasks);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     summary: Update task status (Authenticated users)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       403:
 *         description: Forbidden - Not authorized
 *       404:
 *         description: Task not found
 */

router.put("/:id/status", authenticate, updateTaskStatus);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden - Only Admins can delete tasks
 *       404:
 *         description: Task not found
 */

router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteTask);

export default router;
