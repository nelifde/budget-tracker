-- CreateTable
CREATE TABLE "SpendingReflection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "categoryName" TEXT,
    "amount" DECIMAL(65,30),
    "feeling" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "SpendingReflection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SpendingReflection" ADD CONSTRAINT "SpendingReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
