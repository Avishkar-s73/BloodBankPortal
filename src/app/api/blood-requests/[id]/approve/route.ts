/**
 * WORKFLOW STEP 3: Blood Bank Approves Request
 * 
 * POST /api/blood-requests/[id]/approve
 * 
 * Blood bank approves a request if inventory is sufficient.
 * This endpoint checks inventory availability and fulfills the request
 * in a single atomic transaction.
 * 
 * Status Flow: PENDING_APPROVAL → FULFILLED
 * 
 * Authorization: BLOOD_BANK role only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    // Fetch the blood request
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

    // Validate request status
    if (
      bloodRequest.status !== RequestStatus.PENDING_APPROVAL &&
      bloodRequest.status !== RequestStatus.ESCALATED_TO_DONORS &&
      bloodRequest.status !== "PENDING" as RequestStatus
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot approve request with status: ${bloodRequest.status}. Only PENDING_APPROVAL requests can be approved.`,
          },
        },
        { status: 400 }
      );
    }

    // Use Prisma transaction to ensure atomicity
    // Either inventory is deducted AND request is fulfilled, or nothing happens
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch current inventory
      const inventory = await tx.bloodInventory.findUnique({
        where: {
          bloodBankId_bloodGroup: {
            bloodBankId: bloodRequest.bloodBankId!,
            bloodGroup: bloodRequest.bloodGroup,
          },
        },
      });

      // Step 2: Validate inventory availability
      if (!inventory) {
        throw new Error(
          `No inventory record found for ${bloodRequest.bloodGroup} at this blood bank`
        );
      }

      if (inventory.quantity < bloodRequest.quantityNeeded) {
        throw new Error(
          `Insufficient inventory. Available: ${inventory.quantity} units, Required: ${bloodRequest.quantityNeeded} units`
        );
      }

      // Step 3: Deduct inventory (atomic operation)
      await tx.bloodInventory.update({
        where: {
          bloodBankId_bloodGroup: {
            bloodBankId: bloodRequest.bloodBankId!,
            bloodGroup: bloodRequest.bloodGroup,
          },
        },
        data: {
          quantity: {
            decrement: bloodRequest.quantityNeeded,
          },
          lastUpdated: new Date(),
        },
      });

      // Step 4: Update request status to FULFILLED
      const updatedRequest = await tx.bloodRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.FULFILLED,
          fulfilledAt: new Date(),
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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

      // Step 5: Mark associated DonationIntents and scheduled Donations as COMPLETED
      const intents = await tx.donationIntent.findMany({
        where: { requestId: requestId }
      });

      if (intents.length > 0) {
        // Mark intents as completed
        await tx.donationIntent.updateMany({
          where: { requestId: requestId },
          data: { status: "COMPLETED" }
        });

        // Also mark the SCHEDULED donations for these donors at this bank as COMPLETED
        const donorIds = intents.map(i => i.donorId);
        await tx.donation.updateMany({
          where: {
            donorId: { in: donorIds },
            bloodBankId: bloodRequest.bloodBankId!,
            status: "SCHEDULED"
          },
          data: {
            status: "COMPLETED"
          }
        });
      }

      // Step 6: Notify the requester
      await tx.notification.create({
        data: {
          userId: bloodRequest.requesterId,
          title: "Blood Request Approved",
          message: `Your request for ${bloodRequest.quantityNeeded} units of ${bloodRequest.bloodGroup} has been approved and fulfilled!`,
          type: "REQUEST_APPROVED",
          link: "/requests",
        }
      });

      return {
        request: updatedRequest,
        inventoryDeducted: bloodRequest.quantityNeeded,
        remainingInventory: inventory.quantity - bloodRequest.quantityNeeded,
      };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Blood request approved and fulfilled successfully. Inventory updated.",
      data: result,
    });
  } catch (error: any) {
    console.error("[APPROVE REQUEST ERROR]", error);

    // Handle insufficient inventory error
    if (error.message && error.message.includes("Insufficient inventory")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_INVENTORY",
            message: error.message,
            suggestion: "Consider escalating this request to donors using the escalate endpoint.",
          },
        },
        { status: 400 }
      );
    }

    // Handle missing inventory record
    if (error.message && error.message.includes("No inventory record found")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVENTORY_NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to approve blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
