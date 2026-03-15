import * as transactionRepo from "../repositories/transaction";
import * as coachRepo from "../repositories/coach";

const REFLECTION_PROMPTS: Record<string, string> = {
  impulsive_3_week: "You’ve logged a few impulsive spends this week. No judgment — want to look at what they had in common?",
  impulsive_5_week: "Impulsive spending’s been up. Next time you’re about to tap ‘Impulsive’, take one breath. You’ve got this.",
  impulsive_1_today: "One impulsive spend today. Anything that helped trigger it? (Just for you — no one else sees this.)",
};

const PROMPT_ORDER = ["impulsive_1_today", "impulsive_3_week", "impulsive_5_week"] as const;

export async function getReflectionPrompt(userId: string): Promise<string | null> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

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
  return REFLECTION_PROMPTS[chosenKey];
}
