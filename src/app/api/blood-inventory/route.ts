/**
 * Blood Inventory API - Collection Endpoints
 *
 * Handles blood inventory operations:
 * - GET /api/blood-inventory - List all blood inventory items
 * - POST /api/blood-inventory - Create a new inventory item
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      where.quantityMl = {
        gte: parseInt(minQuantity),
      };
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
 * Creates a new blood inventory item
 *
 * Request Body:
 * - bloodBankId: UUID of the blood bank
 * - bloodGroup: Blood group enum value
 * - quantityMl: Quantity in milliliters
 *
 * Response:
 * - 201 Created: Returns the created inventory item
 * - 400 Bad Request: Invalid input data
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bloodBankId, bloodGroup, quantityMl } = body;

    // Validate required fields
    if (!bloodBankId || !bloodGroup || quantityMl === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: bloodBankId, bloodGroup, quantityMl",
        },
        { status: 400 }
      );
    }

    // Create or update inventory
    const inventory = await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId,
          bloodGroup,
        },
      },
      update: {
        quantityMl: {
          increment: quantityMl,
        },
        lastUpdated: new Date(),
      },
      create: {
        bloodBankId,
        bloodGroup,
        quantityMl,
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
