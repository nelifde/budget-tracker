import { prisma } from "../lib/db";

function monthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

function monthEnd(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999);
}

export async function getBudgetsForMonth(userId: string, year: number, month: number) {
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  return prisma.budget.findMany({
    where: {
      userId,
      periodStart: { lte: end },
      periodEnd: { gte: start },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTotalForMonth(userId: string, year: number, month: number): Promise<number> {
  const budgets = await getBudgetsForMonth(userId, year, month);
  const sum = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
  return Math.round(sum * 100) / 100;
}

export async function createBudget(
  userId: string,
  name: string,
  amount: number,
  year: number,
  month: number
) {
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  return prisma.budget.create({
    data: {
      userId,
      name: name.trim(),
      amount,
      periodStart: start,
      periodEnd: end,
    },
  });
}

export async function deleteBudget(userId: string, id: string) {
  await prisma.budget.deleteMany({
    where: { id, userId },
  });
}
