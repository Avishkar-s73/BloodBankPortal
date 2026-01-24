/**
 * Donations API - Collection Operations
 * GET /api/donations - List all donations
 * POST /api/donations - Create new donation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus } from "@prisma/client";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// GET /api/donations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const donorId = searchParams.get("donorId");
    const bloodBankId = searchParams.get("bloodBankId");
    const bloodGroup = searchParams.get("bloodGroup");
    const myDonations = searchParams.get("my") === "true";

    // If filtering by current user, verify authentication
    let userId: string | null = null;
    if (myDonations) {
      const cookieToken = request.cookies.get("auth-token")?.value;
      const headerToken = request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      const token = cookieToken || headerToken;

      if (token) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          userId = payload.userId as string;
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status as DonationStatus;
    if (donorId) where.donorId = donorId;
    if (userId) where.donorId = userId; // Filter by logged-in user
    if (bloodBankId) where.bloodBankId = bloodBankId;
    if (bloodGroup) where.bloodGroup = bloodGroup;

    // Get donations with pagination
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { donationDate: "desc" },
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
          bloodBank: {
            select: {
              id: true,
              name: true,
              phone: true,
              city: true,
              state: true,
            },
          },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: donations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get donations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donations",
      },
      { status: 500 }
    );
  }
}

// POST /api/donations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      donorId,
      bloodBankId,
      bloodGroup,
      scheduledDate,
      quantity = 1,
      notes,
    } = body;

    // Validate required fields
    if (!donorId || !bloodBankId || !bloodGroup || !scheduledDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Donor ID, blood bank ID, blood group, and scheduled date are required",
        },
        { status: 400 }
      );
    }

    // Verify donor exists
    const donor = await prisma.user.findUnique({
      where: { id: donorId },
      select: { id: true, bloodGroup: true },
    });

    if (!donor) {
      return NextResponse.json(
        {
          success: false,
          error: "Donor not found",
        },
        { status: 404 }
      );
    }

    // Verify blood bank exists
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: bloodBankId },
    });

    if (!bloodBank) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood bank not found",
        },
        { status: 404 }
      );
    }

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        donorId,
        bloodBankId,
        bloodGroup,
        scheduledDate: new Date(scheduledDate),
        quantity,
        status: "SCHEDULED",
        notes,
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
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation scheduled successfully",
        data: donation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create donation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to schedule donation",
      },
      { status: 500 }
    );
  }
}
