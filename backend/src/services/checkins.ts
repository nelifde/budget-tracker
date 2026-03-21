import * as checkInRepo from "../repositories/checkins";
import * as reflectionRepo from "../repositories/reflection";
import * as transactionRepo from "../repositories/transaction";
import { generateCoachPrompt } from "./aiCoach";

const CHECKIN_INTERVAL_DAYS = Number(process.env.COACH_CHECKIN_INTERVAL_DAYS ?? "3");

export type DueCheckInResult = {
  id: string;
  prompt: string;
  dueAt: string;
  source: string;
} | null;

function shouldCreateNew(lastCreatedAt: Date | null, now: Date): boolean {
  if (!lastCreatedAt) return true;
  const diffMs = now.getTime() - lastCreatedAt.getTime();
  return diffMs >= CHECKIN_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
}

export async function getDueCheckIn(userId: string): Promise<DueCheckInResult> {
  const now = new Date();
  let due = await checkInRepo.getDueOpenCheckIn(userId, now);
  if (!due) {
    const last = await checkInRepo.getLastCheckIn(userId);
    if (!shouldCreateNew(last?.createdAt ?? null, now)) return null;

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const impulsiveWeek = await transactionRepo.getImpulsiveCountSince(userId, weekAgo);
    const recentReflection = await reflectionRepo.getRecentReflection(userId, {
      withinDays: 30,
    });
    const fallback =
      "Quick check-in: how are you feeling about your money situation today?";
    const context = `Impulsive spends in last 7 days: ${impulsiveWeek}. Recent reflection feeling: ${
      recentReflection?.feelingKey ?? "none"
    }.`;
    const generated = await generateCoachPrompt({
      kind: "checkin",
      context,
      fallback,
    });
    due = await checkInRepo.createCheckIn({
      userId,
      dueAt: now,
      prompt: generated.prompt,
      source: generated.source,
    });
  }

  if (!due.shownAt) {
    await checkInRepo.markShown(due.id);
  }

  return {
    id: due.id,
    prompt: due.prompt,
    dueAt: due.dueAt.toISOString(),
    source: due.source,
  };
}

export async function dismissCheckIn(userId: string, id: string): Promise<void> {
  await checkInRepo.dismissCheckIn(userId, id);
}

export async function completeCheckIn(userId: string, id: string): Promise<void> {
  await checkInRepo.completeCheckIn(userId, id);
}
