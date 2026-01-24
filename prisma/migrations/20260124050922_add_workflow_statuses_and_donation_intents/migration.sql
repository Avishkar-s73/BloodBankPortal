-- AlterEnum
ALTER TYPE "DonationStatus" ADD VALUE 'DONATION_CONFIRMED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "RequestStatus" ADD VALUE 'ESCALATED_TO_DONORS';

-- AlterTable
ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- CreateTable
CREATE TABLE "donation_intents" (
    "id" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'DONATION_CONFIRMED',
    "preferredDate" TIMESTAMP(3),
    "confirmedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "donorNotes" TEXT,
    "bloodBankNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "donorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "bloodBankId" TEXT,

    CONSTRAINT "donation_intents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donation_intents_donorId_idx" ON "donation_intents"("donorId");

-- CreateIndex
CREATE INDEX "donation_intents_requestId_idx" ON "donation_intents"("requestId");

-- CreateIndex
CREATE INDEX "donation_intents_bloodBankId_idx" ON "donation_intents"("bloodBankId");

-- CreateIndex
CREATE INDEX "donation_intents_status_idx" ON "donation_intents"("status");

-- CreateIndex
CREATE INDEX "donation_intents_createdAt_idx" ON "donation_intents"("createdAt");

-- AddForeignKey
ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_bloodBankId_fkey" FOREIGN KEY ("bloodBankId") REFERENCES "blood_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
