import jwt from "jsonwebtoken";
import config from "../config";

export const generateToken = async (userId: string, role: string) => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
