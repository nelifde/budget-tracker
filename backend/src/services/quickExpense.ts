import { prisma } from "../lib/db";
import * as transactionRepo from "../repositories/transaction";

export type QuickExpenseInput = {
  amount: number;
  spendType: "PLANNED" | "IMPULSIVE";
  accountId?: string | null;
  categoryId?: string | null;
  note?: string | null;
};

export async function createQuickExpense(userId: string, input: QuickExpenseInput, date: Date = new Date()) {
  let accountId = input.accountId ?? null;
  if (!accountId) {
    accountId = await transactionRepo.getLastUsedAccountId(userId);
  }
  if (!accountId) {
    const first = await prisma.account.findFirst({
      where: { userId },
      select: { id: true },
    });
    accountId = first?.id ?? null;
  }
  if (!accountId) {
    throw new Error("No account available. Create an account first.");
  }

  const spendType = input.spendType === "IMPULSIVE" ? "IMPULSIVE" : "PLANNED";

  return transactionRepo.createTransaction({
    userId,
    accountId,
    amount: input.amount,
    date,
    spendType,
    categoryId: input.categoryId ?? null,
    note: input.note ?? null,
  });
}
