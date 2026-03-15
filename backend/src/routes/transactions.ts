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
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const where: { userId: string; date?: { gte?: Date; lte?: Date } } = { userId };
  if (from) where.date = { ...where.date, gte: new Date(from) };
  if (to) where.date = { ...where.date, lte: new Date(to) };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
    include: {
      category: { select: { id: true, name: true, color: true } },
    },
  });

  res.json(transactions);
});

router.delete("/:id", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await prisma.transaction.deleteMany({
    where: { id: req.params.id, userId },
  });
  res.status(204).send();
});

export default router;
