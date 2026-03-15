/*
  Warnings:

  - You are about to drop the `SpendingReflection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SpendingReflection" DROP CONSTRAINT "SpendingReflection_userId_fkey";

-- DropTable
DROP TABLE "SpendingReflection";

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "feelingKey" TEXT NOT NULL,
    "reasonKey" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
