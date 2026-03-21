import * as userRepo from "../repositories/user";
import * as transactionRepo from "../repositories/transaction";
import * as budgetRepo from "../repositories/budget";

function daysLeftInMonth(d: Date): number {
  const year = d.getFullYear();
  const month = d.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = d.getDate();
  return Math.max(0, lastDay - today + 1);
}

export type SafeToSpendResult = {
  safeToSpendToday: number;
  xpPercent: number; // 0–100, remaining budget health
  remainingInPeriod: number;
  spentToday: number;
  exceededDailySafeLimit: boolean;
  monthlyBudget: number | null;
  spentThisMonth: number;
};

export async function getSafeToSpend(userId: string, asOf: Date): Promise<SafeToSpendResult> {
  const year = asOf.getFullYear();
  const month = asOf.getMonth() + 1;
  const budgetTotal = await budgetRepo.getTotalForMonth(userId, year, month);
  const userMonthly = await userRepo.getMonthlyBudget(userId);
  const monthlyNum = budgetTotal > 0 ? budgetTotal : (userMonthly != null ? Number(userMonthly) : 0);
  const spentThisMonth = await transactionRepo.getSpentInMonth(userId, year, month);
  const spentToday = await transactionRepo.getSpentToday(userId, asOf);
  const remainingInPeriod = Math.max(0, monthlyNum - spentThisMonth);
  const daysLeft = daysLeftInMonth(asOf);
  const safeToSpendToday = daysLeft > 0 ? remainingInPeriod / daysLeft : 0;
  const xpPercent = monthlyNum > 0 ? Math.min(100, (remainingInPeriod / monthlyNum) * 100) : 100;
  const exceededDailySafeLimit = spentToday > safeToSpendToday;

  return {
    safeToSpendToday: Math.round(safeToSpendToday * 100) / 100,
    xpPercent: Math.round(xpPercent * 10) / 10,
    remainingInPeriod: Math.round(remainingInPeriod * 100) / 100,
    spentToday: Math.round(spentToday * 100) / 100,
    exceededDailySafeLimit,
    monthlyBudget: monthlyNum > 0 ? monthlyNum : null,
    spentThisMonth: Math.round(spentThisMonth * 100) / 100,
  };
}
