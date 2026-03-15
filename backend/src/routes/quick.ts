import { Router, Request, Response } from "express";
import * as quickExpenseService from "../services/quickExpense";

const router = Router();

router.post("/expense", async (req: Request & { userId?: string }, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = req.body as { amount?: number; spendType?: string; accountId?: string; categoryId?: string; note?: string };
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }
  const spendType = body?.spendType === "IMPULSIVE" ? "IMPULSIVE" : "PLANNED";
  const dateParam = (req.body as { date?: string }).date;
  const date = dateParam ? new Date(dateParam) : new Date();
  try {
    const tx = await quickExpenseService.createQuickExpense(
      userId,
      {
        amount,
        spendType,
        accountId: body?.accountId ?? null,
        categoryId: body?.categoryId ?? null,
        note: body?.note ?? null,
      },
      date
    );
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
