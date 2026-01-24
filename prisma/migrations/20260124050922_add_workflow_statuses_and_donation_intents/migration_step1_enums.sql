-- Add new enum values to RequestStatus
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'ESCALATED_TO_DONORS';

-- Add new enum value to DonationStatus
ALTER TYPE "DonationStatus" ADD VALUE IF NOT EXISTS 'DONATION_CONFIRMED';
