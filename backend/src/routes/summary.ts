import { Router, Request, Response } from "express";
import * as summaryService from "../services/summary";
import * as userRepo from "../repositories/user";

const router = Router();

router.get("/safe-to-spend", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await userRepo.ensureDevUser(userId);
  const dateParam = req.query.date as string | undefined;
  const asOf = dateParam ? new Date(dateParam) : new Date();
  const summary = await summaryService.getSafeToSpend(userId, asOf);
  const settings = await userRepo.getSettings(userId);
  res.json({ ...summary, currency: settings.currency });
});

export default router;
