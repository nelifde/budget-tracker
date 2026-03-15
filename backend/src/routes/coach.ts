import { Router, Request, Response } from "express";
import * as coachService from "../services/coach";

const router = Router();

router.get("/reflection", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const result = await coachService.getReflectionPrompt(userId);
  if (!result) {
    res.json({ prompt: null });
    return;
  }
  res.json({
    prompt: result.prompt,
    requestFeelingLog: result.requestFeelingLog ?? false,
    trigger: result.trigger,
    categoryId: result.categoryId,
    categoryName: result.categoryName,
  });
});

router.post("/reflection", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { feelingKey, reasonKey, categoryId } = req.body as {
    feelingKey?: string;
    reasonKey?: string;
    categoryId?: string | null;
  };
  if (typeof feelingKey !== "string" || typeof reasonKey !== "string") {
    res.status(400).json({ error: "feelingKey and reasonKey are required" });
    return;
  }
  try {
    await coachService.submitReflection(userId, {
      feelingKey,
      reasonKey,
      categoryId: categoryId ?? null,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get("/reminder", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const categoryId = (req.query.categoryId as string) || undefined;
  const reminder = await coachService.getReminderMessage(userId, categoryId);
  res.json({ reminder });
});

export default router;
