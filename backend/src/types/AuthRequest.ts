import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
