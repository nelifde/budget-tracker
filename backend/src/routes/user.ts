import { Router, Request, Response } from "express";
import * as userRepo from "../repositories/user";

const router = Router();

router.get("/settings", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId!;
  try {
    await userRepo.ensureDevUser(userId);
    const settings = await userRepo.getSettings(userId);
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.patch("/settings", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId!;
  const body = req.body as { currency?: string; simplified?: boolean; monthlyBudgetAmount?: number | null };
  try {
    await userRepo.ensureDevUser(userId);
    const settings = await userRepo.updateSettings(userId, {
      currency: body.currency,
      simplified: body.simplified,
      monthlyBudgetAmount: body.monthlyBudgetAmount,
    });
    res.json(settings);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
