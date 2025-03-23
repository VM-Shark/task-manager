import "./types/express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import config from "./config";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
