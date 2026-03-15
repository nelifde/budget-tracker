import { prisma } from "../lib/db";
import { SpendType } from "@prisma/client";

function decimalToNumber(d: { toNumber?: () => number } | null | undefined): number {
  if (d == null) return 0;
  if (typeof (d as { toNumber: () => number }).toNumber === "function") return (d as { toNumber: () => number }).toNumber();
  return Number(d);
}

export async function getSpentInMonth(userId: string, year: number, month: number): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      date: { gte: start, lte: end },
      amount: { gt: 0 },
    },
    _sum: { amount: true },
  });

  return decimalToNumber(result._sum?.amount);
}

export async function getSpentToday(userId: string, date: Date): Promise<number> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      date: { gte: start, lte: end },
      amount: { gt: 0 },
    },
    _sum: { amount: true },
  });

  return decimalToNumber(result._sum?.amount);
}

export async function getLastUsedAccountId(userId: string): Promise<string | null> {
  const last = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { accountId: true },
  });
  return last?.accountId ?? null;
}

export async function getImpulsiveCountSince(userId: string, since: Date): Promise<number> {
  return prisma.transaction.count({
    where: {
      userId,
      spendType: SpendType.IMPULSIVE,
      date: { gte: since },
    },
  });
}

export async function createTransaction(data: {
  userId: string;
  accountId: string;
  amount: number;
  date: Date;
  spendType: SpendType;
  categoryId?: string | null;
  note?: string | null;
}) {
  return prisma.transaction.create({
    data: {
      userId: data.userId,
      accountId: data.accountId,
      amount: data.amount,
      date: data.date,
      spendType: data.spendType,
      categoryId: data.categoryId ?? undefined,
      note: data.note ?? undefined,
    },
  });
}
