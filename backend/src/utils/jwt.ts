import jwt from "jsonwebtoken";
import config from "../config";

export const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, config.jwtSecret, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
