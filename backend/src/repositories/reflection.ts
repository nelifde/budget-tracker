import { prisma } from "../lib/db";

export async function createReflection(data: {
  userId: string;
  feelingKey: string;
  reasonKey: string;
  categoryId?: string | null;
}) {
  return prisma.reflection.create({
    data: {
      userId: data.userId,
      feelingKey: data.feelingKey,
      reasonKey: data.reasonKey,
      categoryId: data.categoryId ?? undefined,
    },
  });
}

export async function getRecentReflection(
  userId: string,
  options: { categoryId?: string | null; withinDays?: number } = {}
): Promise<{
  feelingKey: string;
  reasonKey: string;
  categoryId: string | null;
  createdAt: Date;
} | null> {
  const withinDays = options.withinDays ?? 30;
  const since = new Date();
  since.setDate(since.getDate() - withinDays);

  const where: { userId: string; createdAt: { gte: Date }; categoryId?: string | null } = {
    userId,
    createdAt: { gte: since },
  };
  if (options.categoryId != null && options.categoryId !== "") {
    where.categoryId = options.categoryId;
  }

  const r = await prisma.reflection.findFirst({
    where,
    orderBy: { createdAt: "desc" },
    select: { feelingKey: true, reasonKey: true, categoryId: true, createdAt: true },
  });
  return r;
}
