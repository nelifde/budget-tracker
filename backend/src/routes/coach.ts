import { Router, Request, Response } from "express";
import * as coachService from "../services/coach";

const router = Router();

router.get("/reflection", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const prompt = await coachService.getReflectionPrompt(userId);
  res.json({ prompt });
});

export default router;
