import { prisma } from "../lib/db";

export async function getDueOpenCheckIn(userId: string, now: Date) {
  return prisma.coachCheckIn.findFirst({
    where: {
      userId,
      dueAt: { lte: now },
      completedAt: null,
      dismissedAt: null,
    },
    orderBy: { dueAt: "asc" },
  });
}

export async function getLastCheckIn(userId: string) {
  return prisma.coachCheckIn.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCheckIn(data: {
  userId: string;
  dueAt: Date;
  prompt: string;
  source: "ai" | "fallback";
}) {
  return prisma.coachCheckIn.create({
    data: {
      userId: data.userId,
      dueAt: data.dueAt,
      prompt: data.prompt,
      source: data.source,
      status: "due",
    },
  });
}

export async function markShown(id: string) {
  return prisma.coachCheckIn.update({
    where: { id },
    data: { shownAt: new Date(), status: "shown" },
  });
}

export async function dismissCheckIn(userId: string, id: string) {
  return prisma.coachCheckIn.updateMany({
    where: { id, userId },
    data: { dismissedAt: new Date(), status: "dismissed" },
  });
}

export async function completeCheckIn(userId: string, id: string) {
  return prisma.coachCheckIn.updateMany({
    where: { id, userId },
    data: { completedAt: new Date(), status: "completed" },
  });
}
