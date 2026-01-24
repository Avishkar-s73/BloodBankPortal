-- ================================================
-- Blood Request Workflow Migration
-- Run this in pgAdmin Query Tool
-- ================================================

-- PART 1: Add enum values and COMMIT
-- PostgreSQL requires enum values to be committed before use

-- Step 1: Add new enum values to RequestStatus
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_APPROVAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'RequestStatus')) THEN
        ALTER TYPE "RequestStatus" ADD VALUE 'PENDING_APPROVAL';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ESCALATED_TO_DONORS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'RequestStatus')) THEN
        ALTER TYPE "RequestStatus" ADD VALUE 'ESCALATED_TO_DONORS';
    END IF;
END$$;

-- Step 2: Add new enum value to DonationStatus
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DONATION_CONFIRMED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'DonationStatus')) THEN
        ALTER TYPE "DonationStatus" ADD VALUE 'DONATION_CONFIRMED';
    END IF;
END$$;

-- CRITICAL: Commit the enum changes before proceeding
COMMIT;

-- PART 2: Create tables and indexes using the new enum values

-- Step 3: Create donation_intents table
CREATE TABLE IF NOT EXISTS "donation_intents" (
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

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS "donation_intents_donorId_idx" ON "donation_intents"("donorId");
CREATE INDEX IF NOT EXISTS "donation_intents_requestId_idx" ON "donation_intents"("requestId");
CREATE INDEX IF NOT EXISTS "donation_intents_bloodBankId_idx" ON "donation_intents"("bloodBankId");
CREATE INDEX IF NOT EXISTS "donation_intents_status_idx" ON "donation_intents"("status");
CREATE INDEX IF NOT EXISTS "donation_intents_createdAt_idx" ON "donation_intents"("createdAt");

-- Step 5: Add foreign keys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_donorId_fkey') THEN
        ALTER TABLE "donation_intents" 
        ADD CONSTRAINT "donation_intents_donorId_fkey" 
        FOREIGN KEY ("donorId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_requestId_fkey') THEN
        ALTER TABLE "donation_intents" 
        ADD CONSTRAINT "donation_intents_requestId_fkey" 
        FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_bloodBankId_fkey') THEN
        ALTER TABLE "donation_intents" 
        ADD CONSTRAINT "donation_intents_bloodBankId_fkey" 
        FOREIGN KEY ("bloodBankId") REFERENCES "blood_banks"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END$$;

-- Step 6: Update default status for blood_requests
ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- Verify the changes
SELECT 'Migration completed successfully!' as status;
