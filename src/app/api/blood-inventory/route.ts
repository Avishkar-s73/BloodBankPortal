/**
 * Blood Inventory API - Collection Endpoints
 *
 * Handles blood inventory operations:
 * - GET /api/blood-inventory - List all blood inventory items
 * - POST /api/blood-inventory - Create or update inventory item
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
import { BloodGroup } from "@prisma/client";

/**
 * GET /api/blood-inventory
 *
 * Retrieves blood inventory with optional filtering
 *
 * Query Parameters:
 * - bloodGroup: Filter by blood group (A_POSITIVE, B_POSITIVE, etc.)
 * - bloodBankId: Filter by blood bank ID
 * - minQuantity: Minimum quantity threshold
 *
 * Response:
 * - 200 OK: Returns array of inventory items
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup") as BloodGroup | null;
    const bloodBankId = searchParams.get("bloodBankId");
    const minQuantity = searchParams.get("minQuantity");

    const where: any = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (bloodBankId) where.bloodBankId = bloodBankId;
    if (minQuantity) {
      where.quantity = {
        gte: parseInt(minQuantity),
      };
    }

    // If the requester is a blood bank user, restrict results to their blood bank only.
    try {
      const cookieToken = request.cookies.get("auth-token")?.value;
      const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
      const token = cookieToken || headerToken;
      if (token) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string | undefined;
        if (userId) {
          const managedBank = await prisma.bloodBank.findFirst({ where: { managerId: userId } });
          if (managedBank) {
            // override any requested bloodBankId — a blood bank user should only see their own inventory
            where.bloodBankId = managedBank.id;
          }
        }
      }
    } catch (e) {
      // ignore token errors and continue with provided filters
    }

    const inventory = await prisma.bloodInventory.findMany({
      where,
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        lastUpdated: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: inventory,
      count: inventory.length,
    });
  } catch (error) {
    console.error("Error fetching blood inventory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blood inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blood-inventory
 *
 * Creates or updates blood inventory for a blood bank
 *
 * Request Body:
 * - bloodBankId: UUID of the blood bank (required)
 * - bloodGroup: Blood group enum value (required)
 * - quantity: Quantity in units (required, must be positive)
 *
 * Response:
 * - 201 Created: Returns the created/updated inventory item
 * - 400 Bad Request: Invalid input data or negative quantity
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { bloodBankId, bloodGroup, quantity } = body;

    // If the requester is a logged-in blood bank manager, use their managed blood bank id
    try {
      const cookieToken = request.cookies.get("auth-token")?.value;
      const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
      const token = cookieToken || headerToken;
      if (token) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string | undefined;
        if (userId) {
          const managedBank = await prisma.bloodBank.findFirst({ where: { managerId: userId } });
          if (managedBank) {
            bloodBankId = managedBank.id;
          }
        }
      }
    } catch (e) {
      // ignore token errors; fall back to provided bloodBankId
    }

    // Validate required fields
    if (!bloodBankId || !bloodGroup || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: bloodBankId, bloodGroup, quantity",
        },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Quantity cannot be negative",
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

    // Create or update inventory using upsert
    // If inventory exists for this blood bank + blood group, update quantity
    // Otherwise, create new inventory record
    const inventory = await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId,
          bloodGroup,
        },
      },
      update: {
        quantity: {
          increment: quantity, // Add to existing quantity
        },
        lastUpdated: new Date(),
      },
      create: {
        bloodBankId,
        bloodGroup,
        quantity,
        lastUpdated: new Date(),
      },
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: inventory,
        message: "Blood inventory updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blood inventory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create blood inventory",
      },
      { status: 500 }
    );
  }
}
