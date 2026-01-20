/**
 * Campaigns API - Collection Operations
 * GET /api/campaigns - List all campaigns
 * POST /api/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const bloodBankId = searchParams.get("bloodBankId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (bloodBankId) where.bloodBankId = bloodBankId;
    if (isActive === "true") {
      where.startDate = { lte: new Date() };
      where.endDate = { gte: new Date() };
    }

    // Get campaigns with pagination
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: {
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
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: campaigns,
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
    console.error("Get campaigns error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}

// POST /api/campaigns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bloodBankId,
      name,
      description,
      startDate,
      endDate,
      location,
      targetBloodGroups,
      contactPerson,
      contactPhone,
    } = body;

    // Validate required fields
    if (!bloodBankId || !name || !startDate || !endDate || !location) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Blood bank ID, name, start date, end date, and location are required",
        },
        { status: 400 }
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

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          error: "End date must be after start date",
        },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        bloodBankId,
        name,
        description,
        startDate: start,
        endDate: end,
        location,
        targetBloodGroups,
        contactPerson,
        contactPhone,
      },
      include: {
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
        message: "Campaign created successfully",
        data: campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
