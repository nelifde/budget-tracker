import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import * as userRepo from "../repositories/user";

const router = Router();

router.get("/", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await userRepo.ensureDevUser(userId);
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
  res.json(categories);
});

export default router;
