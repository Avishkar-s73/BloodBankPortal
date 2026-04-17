/**
 * WORKFLOW STEP 4: Blood Bank Escalates Request to Donors
 * 
 * POST /api/blood-requests/[id]/escalate
 * 
 * When blood bank has insufficient inventory, they escalate the request
 * to donors. This makes the request visible in the donor dashboard.
 * 
 * Status Flow: PENDING_APPROVAL → ESCALATED_TO_DONORS
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
    if (bloodRequest.status !== RequestStatus.PENDING_APPROVAL && bloodRequest.status !== "PENDING" as RequestStatus) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot escalate request with status: ${bloodRequest.status}. Only PENDING_APPROVAL requests can be escalated.`,
          },
        },
        { status: 400 }
      );
    }

    // Update request status to ESCALATED_TO_DONORS
    // No inventory changes at this stage
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.ESCALATED_TO_DONORS,
        // Note: Do NOT modify inventory or fulfilledAt
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
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message:
        "Blood request escalated to donors successfully. Donors can now volunteer for this request.",
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error("[ESCALATE REQUEST ERROR]", error);

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to escalate blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
