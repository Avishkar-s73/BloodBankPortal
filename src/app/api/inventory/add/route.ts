/**
 * WORKFLOW STEP 7: Blood Bank Confirms Donation Received
 * 
 * POST /api/inventory/add
 * 
 * After a donor completes their donation, the blood bank uses this endpoint
 * to increase inventory. This is separate from the request approval workflow.
 * 
 * Authorization: BLOOD_BANK role only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BloodGroup } from "@prisma/client";

/**
 * POST /api/inventory/add
 * 
 * Request Body:
 * {
 *   bloodBankId: string (UUID)
 *   bloodGroup: BloodGroup enum
 *   quantity: number (units to add)
 *   donationId?: string (optional - links to a donation record)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.bloodBankId || !body.bloodGroup || !body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "bloodBankId, bloodGroup, and quantity are required",
          },
        },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (body.quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Quantity must be greater than 0",
          },
        },
        { status: 400 }
      );
    }

    // Verify blood bank exists
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: body.bloodBankId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!bloodBank) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Blood bank not found",
          },
        },
        { status: 404 }
      );
    }

    // Use transaction to ensure atomic inventory update
    const result = await prisma.$transaction(async (tx) => {
      // Check if inventory record exists
      const existingInventory = await tx.bloodInventory.findUnique({
        where: {
          bloodBankId_bloodGroup: {
            bloodBankId: body.bloodBankId,
            bloodGroup: body.bloodGroup as BloodGroup,
          },
        },
      });

      let inventory;

      if (existingInventory) {
        // Update existing inventory
        inventory = await tx.bloodInventory.update({
          where: {
            bloodBankId_bloodGroup: {
              bloodBankId: body.bloodBankId,
              bloodGroup: body.bloodGroup as BloodGroup,
            },
          },
          data: {
            quantity: {
              increment: body.quantity,
            },
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new inventory record
        inventory = await tx.bloodInventory.create({
          data: {
            bloodBankId: body.bloodBankId,
            bloodGroup: body.bloodGroup as BloodGroup,
            quantity: body.quantity,
            lastUpdated: new Date(),
          },
        });
      }

      // If this is linked to a donation, optionally update donation status
      if (body.donationId) {
        await tx.donation.update({
          where: { id: body.donationId },
          data: {
            status: "COMPLETED",
            donationDate: new Date(),
          },
        });
      }

      return inventory;
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Successfully added ${body.quantity} unit(s) of ${body.bloodGroup} to inventory`,
        data: {
          bloodBankId: result.bloodBankId,
          bloodGroup: result.bloodGroup,
          newQuantity: result.quantity,
          unitsAdded: body.quantity,
          lastUpdated: result.lastUpdated,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[INVENTORY ADD ERROR]", error);

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to add inventory. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inventory/add
 * 
 * Query Parameters:
 * - bloodBankId: Required - blood bank ID
 * - bloodGroup: Optional - filter by blood group
 * 
 * Returns current inventory levels
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodBankId = searchParams.get("bloodBankId");
    const bloodGroup = searchParams.get("bloodGroup") as BloodGroup | null;

    if (!bloodBankId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "bloodBankId is required",
          },
        },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { bloodBankId };
    if (bloodGroup) where.bloodGroup = bloodGroup;

    const inventory = await prisma.bloodInventory.findMany({
      where,
      select: {
        id: true,
        bloodGroup: true,
        quantity: true,
        lastUpdated: true,
        minimumQuantity: true,
        maximumQuantity: true,
      },
      orderBy: { bloodGroup: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: inventory,
      total: inventory.length,
    });
  } catch (error: any) {
    console.error("[GET INVENTORY ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch inventory",
        },
      },
      { status: 500 }
    );
  }
}
