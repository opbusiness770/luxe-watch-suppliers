/*
  Warnings:

  - You are about to drop the column `companyName` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Watch` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessAuditEventType" AS ENUM ('WATCH_DELETED');

-- DropIndex
DROP INDEX "Supplier_companyName_idx";

-- DropIndex
DROP INDEX "Watch_sku_key";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "companyName";

-- AlterTable
ALTER TABLE "Watch" DROP COLUMN "sku",
ADD COLUMN     "deletedAt" TIMESTAMPTZ(3),
ADD COLUMN     "deletedByUserId" UUID,
ADD COLUMN     "deletionReason" TEXT;

-- CreateTable
CREATE TABLE "BusinessAuditLog" (
    "id" UUID NOT NULL,
    "eventType" "BusinessAuditEventType" NOT NULL,
    "watchId" UUID,
    "createdByUserId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessAuditLog_eventType_createdAt_idx" ON "BusinessAuditLog"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessAuditLog_watchId_createdAt_idx" ON "BusinessAuditLog"("watchId", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessAuditLog_createdByUserId_createdAt_idx" ON "BusinessAuditLog"("createdByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Supplier_contactName_idx" ON "Supplier"("contactName");

-- CreateIndex
CREATE INDEX "Watch_deletedAt_idx" ON "Watch"("deletedAt");

-- AddForeignKey
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAuditLog" ADD CONSTRAINT "BusinessAuditLog_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAuditLog" ADD CONSTRAINT "BusinessAuditLog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
