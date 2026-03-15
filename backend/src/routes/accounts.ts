import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";

const router = Router();

router.get("/", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(accounts);
});

router.post("/", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = req.body as { name?: string; type?: string };
  if (!body?.name?.trim()) {
    res.status(400).json({ error: "Name required" });
    return;
  }
  const account = await prisma.account.create({
    data: {
      userId,
      name: body.name.trim(),
      type: body.type?.trim() || "CASH",
    },
  });
  res.status(201).json(account);
});

export default router;
