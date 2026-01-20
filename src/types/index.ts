/**
 * Type Definitions and Utilities for Blood Bank System
 *
 * This file provides additional TypeScript types and helper utilities
 * that complement the Prisma-generated types.
 */

import {
  User,
  UserRole,
  BloodGroup,
  RequestStatus,
  DonationStatus,
  Gender,
  Prisma,
} from "@prisma/client";

// ============================================
// SAFE USER TYPES (without password)
// ============================================

export type SafeUser = Omit<User, "password">;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    donations: true;
    bloodRequests: true;
  };
}>;

export type SafeUserWithRelations = Omit<UserWithRelations, "password">;

// ============================================
// BLOOD BANK TYPES
// ============================================

export type BloodBankWithInventory = Prisma.BloodBankGetPayload<{
  include: {
    inventory: true;
  };
}>;

export type BloodBankWithManager = Prisma.BloodBankGetPayload<{
  include: {
    manager: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    };
  };
}>;

// ============================================
// BLOOD REQUEST TYPES
// ============================================

export type BloodRequestWithRelations = Prisma.BloodRequestGetPayload<{
  include: {
    requester: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    };
    hospital: true;
    bloodBank: true;
  };
}>;

// ============================================
// DONATION TYPES
// ============================================

export type DonationWithRelations = Prisma.DonationGetPayload<{
  include: {
    donor: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
        bloodGroup: true;
      };
    };
    bloodBank: {
      select: {
        id: true;
        name: true;
        address: true;
        city: true;
        phone: true;
      };
    };
  };
}>;

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// ============================================
// FORM INPUT TYPES
// ============================================

export type UserRegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: Date;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
};

export type UserLoginInput = {
  email: string;
  password: string;
};

export type BloodRequestInput = {
  bloodGroup: BloodGroup;
  quantityNeeded: number;
  urgency: "CRITICAL" | "URGENT" | "NORMAL";
  patientName: string;
  patientAge?: number;
  patientGender?: Gender;
  requiredBy: Date;
  purpose: string;
  medicalNotes?: string;
  doctorName?: string;
  doctorContact?: string;
  hospitalId?: string;
  bloodBankId?: string;
};

export type DonationScheduleInput = {
  bloodBankId: string;
  scheduledDate: Date;
  notes?: string;
};

export type BloodInventoryUpdateInput = {
  quantity: number;
  expiryDate?: Date;
};

// ============================================
// SEARCH/FILTER TYPES
// ============================================

export type BloodAvailabilityFilter = {
  bloodGroup?: BloodGroup;
  city?: string;
  state?: string;
  minQuantity?: number;
};

export type DonorSearchFilter = {
  bloodGroup?: BloodGroup;
  city?: string;
  state?: string;
  isActive?: boolean;
  isVerified?: boolean;
  availableForDonation?: boolean; // Last donation > 90 days ago
};

export type BloodRequestFilter = {
  status?: RequestStatus;
  urgency?: string;
  bloodGroup?: BloodGroup;
  fromDate?: Date;
  toDate?: Date;
  requesterId?: string;
  hospitalId?: string;
  bloodBankId?: string;
};

export type DonationFilter = {
  status?: DonationStatus;
  bloodGroup?: BloodGroup;
  fromDate?: Date;
  toDate?: Date;
  donorId?: string;
  bloodBankId?: string;
};

// ============================================
// DASHBOARD STATISTICS TYPES
// ============================================

export type DashboardStats = {
  totalDonors: number;
  totalDonations: number;
  activeDonations: number;
  pendingRequests: number;
  criticalRequests: number;
  lowStockBloodGroups: BloodGroup[];
  todaysDonations: number;
  thisMonthDonations: number;
};

export type BloodBankStats = {
  totalUnits: number;
  bloodGroupDistribution: Record<BloodGroup, number>;
  lowStockGroups: BloodGroup[];
  expiringUnits: number;
  recentDonations: number;
  pendingRequests: number;
};

export type UserStats = {
  totalDonations: number;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  totalUnitsContributed: number;
  livesImpacted: number; // Estimated
};

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | "DONATION_REMINDER"
  | "DONATION_CONFIRMED"
  | "DONATION_CANCELLED"
  | "REQUEST_APPROVED"
  | "REQUEST_FULFILLED"
  | "REQUEST_REJECTED"
  | "INVENTORY_LOW"
  | "INVENTORY_CRITICAL"
  | "CAMPAIGN_ANNOUNCEMENT"
  | "ACCOUNT_VERIFIED"
  | "GENERAL";

export type NotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

// ============================================
// BLOOD COMPATIBILITY HELPERS
// ============================================

export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  [BloodGroup.O_NEGATIVE]: [
    BloodGroup.O_NEGATIVE,
    BloodGroup.O_POSITIVE,
    BloodGroup.A_NEGATIVE,
    BloodGroup.A_POSITIVE,
    BloodGroup.B_NEGATIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.AB_NEGATIVE,
    BloodGroup.AB_POSITIVE,
  ],
  [BloodGroup.O_POSITIVE]: [
    BloodGroup.O_POSITIVE,
    BloodGroup.A_POSITIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.AB_POSITIVE,
  ],
  [BloodGroup.A_NEGATIVE]: [
    BloodGroup.A_NEGATIVE,
    BloodGroup.A_POSITIVE,
    BloodGroup.AB_NEGATIVE,
    BloodGroup.AB_POSITIVE,
  ],
  [BloodGroup.A_POSITIVE]: [BloodGroup.A_POSITIVE, BloodGroup.AB_POSITIVE],
  [BloodGroup.B_NEGATIVE]: [
    BloodGroup.B_NEGATIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.AB_NEGATIVE,
    BloodGroup.AB_POSITIVE,
  ],
  [BloodGroup.B_POSITIVE]: [BloodGroup.B_POSITIVE, BloodGroup.AB_POSITIVE],
  [BloodGroup.AB_NEGATIVE]: [BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE],
  [BloodGroup.AB_POSITIVE]: [BloodGroup.AB_POSITIVE],
};

// Can donate TO these blood groups
export function canDonateTo(donorBloodGroup: BloodGroup): BloodGroup[] {
  return BLOOD_COMPATIBILITY[donorBloodGroup];
}

// Can receive FROM these blood groups
export function canReceiveFrom(recipientBloodGroup: BloodGroup): BloodGroup[] {
  return Object.entries(BLOOD_COMPATIBILITY)
    .filter(([_, recipients]) => recipients.includes(recipientBloodGroup))
    .map(([donor]) => donor as BloodGroup);
}

// ============================================
// DATE HELPERS
// ============================================

export function isEligibleToDonate(lastDonationDate: Date | null): boolean {
  if (!lastDonationDate) return true;

  const daysSinceLastDonation = Math.floor(
    (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastDonation >= 90; // 90 days minimum gap
}

export function getNextEligibleDate(lastDonationDate: Date): Date {
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + 90);
  return nextDate;
}

export function isBloodExpiring(expiryDate: Date, daysThreshold = 7): boolean {
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry <= daysThreshold;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidBloodGroup(
  bloodGroup: string
): bloodGroup is BloodGroup {
  return Object.values(BloodGroup).includes(bloodGroup as BloodGroup);
}

export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidRequestStatus(status: string): status is RequestStatus {
  return Object.values(RequestStatus).includes(status as RequestStatus);
}

export function isValidDonationStatus(
  status: string
): status is DonationStatus {
  return Object.values(DonationStatus).includes(status as DonationStatus);
}

// ============================================
// FORMAT HELPERS
// ============================================

export function formatBloodGroup(bloodGroup: BloodGroup): string {
  const mapping: Record<BloodGroup, string> = {
    [BloodGroup.A_POSITIVE]: "A+",
    [BloodGroup.A_NEGATIVE]: "A-",
    [BloodGroup.B_POSITIVE]: "B+",
    [BloodGroup.B_NEGATIVE]: "B-",
    [BloodGroup.AB_POSITIVE]: "AB+",
    [BloodGroup.AB_NEGATIVE]: "AB-",
    [BloodGroup.O_POSITIVE]: "O+",
    [BloodGroup.O_NEGATIVE]: "O-",
  };

  return mapping[bloodGroup];
}

export function parseBloodGroup(formatted: string): BloodGroup | null {
  const mapping: Record<string, BloodGroup> = {
    "A+": BloodGroup.A_POSITIVE,
    "A-": BloodGroup.A_NEGATIVE,
    "B+": BloodGroup.B_POSITIVE,
    "B-": BloodGroup.B_NEGATIVE,
    "AB+": BloodGroup.AB_POSITIVE,
    "AB-": BloodGroup.AB_NEGATIVE,
    "O+": BloodGroup.O_POSITIVE,
    "O-": BloodGroup.O_NEGATIVE,
  };

  return mapping[formatted] || null;
}

export function formatUserName(
  user: Pick<User, "firstName" | "lastName">
): string {
  return `${user.firstName} ${user.lastName}`;
}

export function formatPhoneNumber(phone: string): string {
  // Format: +91 98765 43210
  if (phone.startsWith("+91")) {
    const digits = phone.substring(3);
    return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
  }
  return phone;
}
