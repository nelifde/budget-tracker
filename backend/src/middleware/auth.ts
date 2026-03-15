import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export type AuthPayload = { userId: string };

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      req.userId = decoded.userId;
    } catch {
      // Invalid token — continue without user (some routes may allow anonymous)
    }
  }

  // Dev: allow x-user-id header to simulate auth without OAuth
  if (!req.userId && process.env.NODE_ENV !== "production" && req.headers["x-user-id"]) {
    req.userId = req.headers["x-user-id"] as string;
  }

  next();
}

export function requireAuth(req: Request & { userId?: string }, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
