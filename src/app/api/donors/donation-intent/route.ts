/**
 * API: Record Donation Intent
 * POST /api/donors/donation-intent
 * Records when a donor expresses willingness to donate for a specific request or blood bank
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieToken = request.cookies.get("auth-token")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookieToken, JWT_SECRET);
    const userId = payload.userId as string;

    const body = await request.json();
    const { bloodBankId, requestId, scheduledDate, notes } = body;

    // Validate required fields
    if (!bloodBankId) {
      return NextResponse.json(
        { success: false, error: "Blood bank ID is required" },
        { status: 400 }
      );
    }

    // Get donor information
    const donor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bloodGroup: true,
        phone: true,
        email: true,
        role: true,
        weight: true,
        lastDonation: true,
      },
    });

    if (!donor || donor.role !== "DONOR") {
      return NextResponse.json(
        { success: false, error: "Only donors can access this endpoint" },
        { status: 403 }
      );
    }

    if (!donor.bloodGroup) {
      return NextResponse.json(
        { success: false, error: "Please update your blood group in profile" },
        { status: 400 }
      );
    }

    // Check if donor is eligible (last donation should be at least 90 days ago)
    if (donor.lastDonation) {
      const daysSinceLastDonation = Math.floor(
        (Date.now() - new Date(donor.lastDonation).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastDonation < 90) {
        return NextResponse.json(
          {
            success: false,
            error: `You can donate again after ${90 - daysSinceLastDonation} days`,
            daysRemaining: 90 - daysSinceLastDonation,
          },
          { status: 400 }
        );
      }
    }

    // Verify blood bank exists
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: bloodBankId },
      select: { id: true, name: true, isActive: true },
    });

    if (!bloodBank || !bloodBank.isActive) {
      return NextResponse.json(
        { success: false, error: "Blood bank not found or inactive" },
        { status: 404 }
      );
    }

    // If requestId is provided, verify the request exists
    let bloodRequest = null;
    if (requestId) {
      bloodRequest = await prisma.bloodRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          bloodGroup: true,
          status: true,
          patientName: true,
        },
      });

      const validStatuses = ["PENDING", "PENDING_APPROVAL", "ESCALATED_TO_DONORS"];
      if (!bloodRequest || !validStatuses.includes(bloodRequest.status)) {
        return NextResponse.json(
          { success: false, error: "Blood request not found or already fulfilled" },
          { status: 404 }
        );
      }

      // Check if donor already has an intent for this specific request
      const existingIntent = await prisma.donationIntent.findFirst({
        where: { donorId: userId, requestId: bloodRequest.id }
      });

      if (existingIntent) {
        return NextResponse.json(
          { success: false, error: "You have already scheduled a donation for this request." },
          { status: 400 }
        );
      }
    }

    // Parse scheduled date or default to tomorrow
    const scheduledDateTime = scheduledDate
      ? new Date(scheduledDate)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create donation intent (scheduled donation)
    const donation = await prisma.donation.create({
      data: {
        donorId: userId,
        bloodBankId: bloodBankId,
        bloodGroup: donor.bloodGroup,
        scheduledDate: scheduledDateTime,
        status: "SCHEDULED",
        preTestNotes: notes || null,
        weight: donor.weight || null,
        quantity: 1.0, // Default 1 unit
      },
      include: {
        bloodBank: {
          select: {
            name: true,
            address: true,
            phone: true,
            operatingHours: true,
          },
        },
      },
    });

    // If there is a linked blood request, ensure we record the explicit intent to link it
    if (bloodRequest) {
      await prisma.donationIntent.create({
        data: {
          donorId: userId,
          requestId: bloodRequest.id,
          bloodBankId: bloodBankId,
          status: "DONATION_CONFIRMED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Donation scheduled successfully! Thank you for your willingness to save lives.",
      data: {
        donation: {
          id: donation.id,
          scheduledDate: donation.scheduledDate,
          bloodGroup: donation.bloodGroup,
          status: donation.status,
          bloodBank: donation.bloodBank,
        },
        relatedRequest: bloodRequest
          ? {
            id: bloodRequest.id,
            patientName: bloodRequest.patientName,
            bloodGroup: bloodRequest.bloodGroup,
          }
          : null,
      },
    });
  } catch (error) {
    console.error("Error recording donation intent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record donation intent" },
      { status: 500 }
    );
  }
}

// GET endpoint to view donor's scheduled donations
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("auth-token")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookieToken, JWT_SECRET);
    const userId = payload.userId as string;

    const donations = await prisma.donation.findMany({
      where: {
        donorId: userId,
        status: "SCHEDULED",
      },
      include: {
        bloodBank: {
          select: {
            name: true,
            address: true,
            city: true,
            phone: true,
            operatingHours: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: { donations },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
