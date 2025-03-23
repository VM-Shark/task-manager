import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController";

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), createTask);
router.get("/", authenticate, getTasks);
router.put("/:id/status", authenticate, updateTaskStatus);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteTask);

export default router;
