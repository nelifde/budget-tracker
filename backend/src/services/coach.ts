import * as transactionRepo from "../repositories/transaction";
import * as coachRepo from "../repositories/coach";
import * as reflectionRepo from "../repositories/reflection";

export const FEELING_KEYS = [
  "fine",
  "guilty",
  "anxious",
  "relieved",
  "not_sure",
] as const;
export const REASON_KEYS = [
  "stressed",
  "bored",
  "with_friends",
  "saw_deal",
  "not_sure",
] as const;

export type FeelingKey = (typeof FEELING_KEYS)[number];
export type ReasonKey = (typeof REASON_KEYS)[number];

const FEELING_LABELS: Record<string, string> = {
  fine: "Fine, it was planned",
  guilty: "A bit guilty",
  anxious: "Anxious",
  relieved: "Relieved",
  not_sure: "Not sure",
};
const REASON_LABELS: Record<string, string> = {
  stressed: "Stressed",
  bored: "Bored",
  with_friends: "With friends",
  saw_deal: "Saw a deal",
  not_sure: "Not sure",
};

export function getFeelingLabel(key: string): string {
  return FEELING_LABELS[key] ?? key;
}
export function getReasonLabel(key: string): string {
  return REASON_LABELS[key] ?? key;
}

const REFLECTION_PROMPTS: Record<string, string> = {
  impulsive_3_week:
    "You've logged a few impulsive spends this week. No judgment — want to look at what they had in common?",
  impulsive_5_week:
    "Impulsive spending's been up. Next time you're about to tap 'Impulsive', take one breath. You've got this.",
  impulsive_1_today:
    "One impulsive spend today. Anything that helped trigger it? (Just for you — no one else sees this.)",
  impulsive_5_category:
    "You've had 5 impulsive spends in {{categoryName}} recently. How did you feel about it?",
  impulsive_full_week:
    "You've had impulsive spending every day this week. How are you feeling about it?",
};

const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24 hours

export type ReflectionPromptResult = {
  prompt: string;
  requestFeelingLog?: boolean;
  trigger?: "same_category" | "full_week_impulsive" | "periodic";
  categoryId?: string;
  categoryName?: string;
} | null;

export async function getReflectionPrompt(userId: string): Promise<ReflectionPromptResult> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 1) 5+ impulsive in same category (last 7 days)
  const categoriesOver5 = await transactionRepo.getImpulsiveCountByCategorySince(
    userId,
    sevenDaysAgo,
    5
  );
  if (categoriesOver5.length > 0) {
    const top = categoriesOver5[0];
    const promptKey = `impulsive_5_category_${top.categoryId}`;
    const lastShownAt = await coachRepo.getLastShownAtForPromptKey(userId, promptKey);
    if (!lastShownAt || Date.now() - lastShownAt.getTime() > THROTTLE_MS) {
      await coachRepo.recordShownPrompt(userId, promptKey);
      const prompt = REFLECTION_PROMPTS.impulsive_5_category.replace(
        "{{categoryName}}",
        top.categoryName
      );
      return {
        prompt,
        requestFeelingLog: true,
        trigger: "same_category",
        categoryId: top.categoryId,
        categoryName: top.categoryName,
      };
    }
  }

  // 2) Full week of impulsive (each of last 7 days has at least one impulsive)
  const fullWeek = await transactionRepo.hadImpulsiveEveryDayLast7(userId);
  if (fullWeek) {
    const promptKey = "impulsive_full_week";
    const lastShownAt = await coachRepo.getLastShownAtForPromptKey(userId, promptKey);
    if (!lastShownAt || Date.now() - lastShownAt.getTime() > THROTTLE_MS) {
      await coachRepo.recordShownPrompt(userId, promptKey);
      return {
        prompt: REFLECTION_PROMPTS.impulsive_full_week,
        requestFeelingLog: true,
        trigger: "full_week_impulsive",
      };
    }
  }

  // 3) Text-only prompts (existing 1 today, 3 week, 5 week)
  const impulsiveThisWeek = await transactionRepo.getImpulsiveCountSince(userId, startOfWeek);
  const impulsiveToday = await transactionRepo.getImpulsiveCountSince(
    userId,
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );

  let chosenKey: string | null = null;
  if (impulsiveToday >= 1) chosenKey = "impulsive_1_today";
  else if (impulsiveThisWeek >= 5) chosenKey = "impulsive_5_week";
  else if (impulsiveThisWeek >= 3) chosenKey = "impulsive_3_week";

  if (!chosenKey || !REFLECTION_PROMPTS[chosenKey]) return null;

  const lastShown = await coachRepo.getLastShownPromptKey(userId);
  if (lastShown === chosenKey) return null;

  await coachRepo.recordShownPrompt(userId, chosenKey);
  return {
    prompt: REFLECTION_PROMPTS[chosenKey],
    trigger: "periodic",
  };
}

function isValidFeelingKey(key: string): key is FeelingKey {
  return FEELING_KEYS.includes(key as FeelingKey);
}
function isValidReasonKey(key: string): key is ReasonKey {
  return REASON_KEYS.includes(key as ReasonKey);
}

export async function submitReflection(
  userId: string,
  data: { feelingKey: string; reasonKey: string; categoryId?: string | null }
): Promise<void> {
  if (!isValidFeelingKey(data.feelingKey) || !isValidReasonKey(data.reasonKey)) {
    throw new Error("Invalid feelingKey or reasonKey");
  }
  await reflectionRepo.createReflection({
    userId,
    feelingKey: data.feelingKey,
    reasonKey: data.reasonKey,
    categoryId: data.categoryId,
  });
}

export async function getReminderMessage(
  userId: string,
  categoryId?: string | null
): Promise<string | null> {
  let r = await reflectionRepo.getRecentReflection(userId, {
    categoryId,
    withinDays: 30,
  });
  if (!r && categoryId) {
    r = await reflectionRepo.getRecentReflection(userId, { withinDays: 30 });
  }
  if (!r) return null;
  const feeling = getFeelingLabel(r.feelingKey);
  const reason = getReasonLabel(r.reasonKey);
  return `Last time you said you felt ${feeling.toLowerCase()} because you were ${reason.toLowerCase()}. Take a breath — you've got this.`;
}
