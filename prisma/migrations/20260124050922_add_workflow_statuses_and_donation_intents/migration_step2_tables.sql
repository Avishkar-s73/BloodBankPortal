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

-- Update default status for new blood requests
ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
