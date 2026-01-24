/**
 * WORKFLOW STEP 6: Donor Volunteers for Escalated Request
 * 
 * POST /api/donation-intents
 * 
 * Donors can volunteer to donate for escalated blood requests.
 * This creates a DonationIntent record linking the donor to the request.
 * 
 * Prerequisites: Request must have status ESCALATED_TO_DONORS
 * 
 * Authorization: DONOR role only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus, DonationStatus } from "@prisma/client";

/**
 * POST /api/donation-intents
 * 
 * Request Body:
 * {
 *   donorId: string (UUID)
 *   requestId: string (UUID)
 *   preferredDate?: string (ISO date)
 *   donorNotes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.donorId || !body.requestId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "donorId and requestId are required",
          },
        },
        { status: 400 }
      );
    }

    // Verify the donor exists
    const donor = await prisma.user.findUnique({
      where: { id: body.donorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        bloodGroup: true,
      },
    });

    if (!donor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Donor not found",
          },
        },
        { status: 404 }
      );
    }

    if (donor.role !== "DONOR") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "Only users with DONOR role can create donation intents",
          },
        },
        { status: 403 }
      );
    }

    // Verify the blood request exists and is escalated
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: body.requestId },
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            phone: true,
            email: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!bloodRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Blood request not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify request is escalated to donors
    if (bloodRequest.status !== RequestStatus.ESCALATED_TO_DONORS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot volunteer for request with status: ${bloodRequest.status}. Only ESCALATED_TO_DONORS requests accept volunteers.`,
          },
        },
        { status: 400 }
      );
    }

    // Check if donor's blood group matches the request
    if (donor.bloodGroup !== bloodRequest.bloodGroup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BLOOD_GROUP_MISMATCH",
            message: `Your blood group (${donor.bloodGroup}) does not match the request (${bloodRequest.bloodGroup})`,
          },
        },
        { status: 400 }
      );
    }

    // Check if donor has already volunteered for this request
    const existingIntent = await prisma.donationIntent.findFirst({
      where: {
        donorId: body.donorId,
        requestId: body.requestId,
      },
    });

    if (existingIntent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_INTENT",
            message: "You have already volunteered for this request",
          },
        },
        { status: 409 }
      );
    }

    // Create donation intent
    const donationIntent = await prisma.donationIntent.create({
      data: {
        donorId: body.donorId,
        requestId: body.requestId,
        bloodBankId: bloodRequest.bloodBankId,
        status: DonationStatus.DONATION_CONFIRMED,
        preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
        donorNotes: body.donorNotes || null,
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bloodGroup: true,
          },
        },
        request: {
          select: {
            id: true,
            patientName: true,
            bloodGroup: true,
            quantityNeeded: true,
            urgency: true,
            requiredBy: true,
          },
        },
        bloodBank: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for volunteering! The blood bank will contact you to schedule your donation.",
        data: donationIntent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[DONATION INTENT ERROR]", error);

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create donation intent. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/donation-intents
 * 
 * Query Parameters:
 * - donorId: Filter by donor
 * - requestId: Filter by blood request
 * - bloodBankId: Filter by blood bank
 * - status: Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");
    const requestId = searchParams.get("requestId");
    const bloodBankId = searchParams.get("bloodBankId");
    const status = searchParams.get("status") as DonationStatus | null;

    // Build where clause
    const where: any = {};
    if (donorId) where.donorId = donorId;
    if (requestId) where.requestId = requestId;
    if (bloodBankId) where.bloodBankId = bloodBankId;
    if (status) where.status = status;

    const donationIntents = await prisma.donationIntent.findMany({
      where,
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bloodGroup: true,
          },
        },
        request: {
          select: {
            id: true,
            patientName: true,
            bloodGroup: true,
            quantityNeeded: true,
            urgency: true,
            requiredBy: true,
            status: true,
          },
        },
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: donationIntents,
      total: donationIntents.length,
    });
  } catch (error: any) {
    console.error("[GET DONATION INTENTS ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch donation intents",
        },
      },
      { status: 500 }
    );
  }
}
