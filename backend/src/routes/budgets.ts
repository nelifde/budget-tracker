import { Router, Request, Response } from "express";
import * as userRepo from "../repositories/user";
import * as budgetRepo from "../repositories/budget";

const router = Router();

router.get("/", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId!;
  await userRepo.ensureDevUser(userId);
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
  const budgets = await budgetRepo.getBudgetsForMonth(userId, year, month);
  const total = await budgetRepo.getTotalForMonth(userId, year, month);
  res.json({ budgets, total });
});

router.post("/", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId!;
  await userRepo.ensureDevUser(userId);
  const body = req.body as { name?: string; amount?: number };
  if (!body?.name?.trim()) {
    res.status(400).json({ error: "Name required" });
    return;
  }
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    res.status(400).json({ error: "Valid amount required" });
    return;
  }
  const now = new Date();
  const budget = await budgetRepo.createBudget(
    userId,
    body.name.trim(),
    amount,
    now.getFullYear(),
    now.getMonth() + 1
  );
  res.status(201).json(budget);
});

router.delete("/:id", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId!;
  await budgetRepo.deleteBudget(userId, req.params.id);
  res.status(204).send();
});

export default router;
