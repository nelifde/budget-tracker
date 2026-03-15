import { prisma } from "../lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export type UserSettings = {
  currency: string;
  simplified: boolean;
  monthlyBudgetAmount: number | null;
};

export async function getMonthlyBudget(userId: string): Promise<Decimal | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyBudgetAmount: true },
  });
  return u?.monthlyBudgetAmount ?? null;
}

export async function setMonthlyBudget(userId: string, amount: Decimal): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyBudgetAmount: amount },
  });
}

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#00ff88", sortOrder: 0 },
  { name: "Drink", color: "#bf5af2", sortOrder: 1 },
  { name: "Shopping", color: "#ff9f0a", sortOrder: 2 },
  { name: "Transport", color: "#5ac8fa", sortOrder: 3 },
  { name: "Fun", color: "#ff453a", sortOrder: 4 },
  { name: "Other", color: "#8e8e93", sortOrder: 5 },
] as const;

export async function ensureDevUser(userId: string): Promise<void> {
  const user = await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: `dev-${userId}@local`,
      provider: "dev",
      providerId: userId,
    },
    update: {},
    include: { accounts: true, categories: true },
  });
  if (user.accounts.length === 0) {
    await prisma.account.create({
      data: { userId: user.id, name: "Default", type: "CASH" },
    });
  }
  if (user.categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c, i) => ({
        userId: user.id,
        name: c.name,
        type: "EXPENSE" as const,
        color: c.color,
        sortOrder: c.sortOrder,
      })),
    });
  }
}

export async function getSettings(userId: string): Promise<UserSettings> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true, simplified: true, monthlyBudgetAmount: true },
  });
  if (!u) throw new Error("User not found");
  return {
    currency: u.currency,
    simplified: u.simplified,
    monthlyBudgetAmount: u.monthlyBudgetAmount != null ? Number(u.monthlyBudgetAmount) : null,
  };
}

export async function updateSettings(
  userId: string,
  data: { currency?: string; simplified?: boolean; monthlyBudgetAmount?: number | null }
): Promise<UserSettings> {
  const update: { currency?: string; simplified?: boolean; monthlyBudgetAmount?: number | null } = {};
  if (data.currency != null) update.currency = data.currency;
  if (data.simplified != null) update.simplified = data.simplified;
  if (data.monthlyBudgetAmount !== undefined) {
    update.monthlyBudgetAmount = data.monthlyBudgetAmount;
  }
  await prisma.user.update({
    where: { id: userId },
    data: update,
  });
  return getSettings(userId);
}
