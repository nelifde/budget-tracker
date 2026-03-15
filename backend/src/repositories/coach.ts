import { prisma } from "../lib/db";

export async function getLastShownPromptKey(userId: string): Promise<string | null> {
  const last = await prisma.coachPrompt.findFirst({
    where: { userId },
    orderBy: { shownAt: "desc" },
    select: { promptKey: true },
  });
  return last?.promptKey ?? null;
}

export async function recordShownPrompt(userId: string, promptKey: string): Promise<void> {
  await prisma.coachPrompt.create({
    data: { userId, promptKey },
  });
}

export async function getLastShownAtForPromptKey(
  userId: string,
  promptKey: string
): Promise<Date | null> {
  const last = await prisma.coachPrompt.findFirst({
    where: { userId, promptKey },
    orderBy: { shownAt: "desc" },
    select: { shownAt: true },
  });
  return last?.shownAt ?? null;
}
