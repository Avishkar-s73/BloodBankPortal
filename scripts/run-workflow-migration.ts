/**
 * Manual Migration Script
 * 
 * Run this with: npx tsx scripts/run-workflow-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting workflow migration...\n');

    // Step 1: Add enum values
    console.log('Step 1: Adding new enum values...');
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
    `);
    console.log('✓ Added PENDING_APPROVAL to RequestStatus');

    await prisma.$executeRawUnsafe(`
      ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'ESCALATED_TO_DONORS';
    `);
    console.log('✓ Added ESCALATED_TO_DONORS to RequestStatus');

    await prisma.$executeRawUnsafe(`
      ALTER TYPE "DonationStatus" ADD VALUE IF NOT EXISTS 'DONATION_CONFIRMED';
    `);
    console.log('✓ Added DONATION_CONFIRMED to DonationStatus\n');

    // Step 2: Create donation_intents table
    console.log('Step 2: Creating donation_intents table...');
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Table created');

    // Step 3: Create indexes
    console.log('\nStep 3: Creating indexes...');
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "donation_intents_donorId_idx" ON "donation_intents"("donorId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "donation_intents_requestId_idx" ON "donation_intents"("requestId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "donation_intents_bloodBankId_idx" ON "donation_intents"("bloodBankId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "donation_intents_status_idx" ON "donation_intents"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "donation_intents_createdAt_idx" ON "donation_intents"("createdAt");`);
    console.log('✓ Indexes created');

    // Step 4: Add foreign keys
    console.log('\nStep 4: Adding foreign keys...');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_donorId_fkey') THEN
          ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_donorId_fkey" 
          FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_requestId_fkey') THEN
          ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_requestId_fkey" 
          FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donation_intents_bloodBankId_fkey') THEN
          ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_bloodBankId_fkey" 
          FOREIGN KEY ("bloodBankId") REFERENCES "blood_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✓ Foreign keys added');

    // Step 5: Update default status
    console.log('\nStep 5: Updating default status for blood_requests...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
    `);
    console.log('✓ Default status updated');

    console.log('\n✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Migration failed:',error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
