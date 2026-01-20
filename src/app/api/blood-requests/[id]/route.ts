/**
 * Blood Requests API - Single Resource Endpoints
 *
 * Handles individual blood request operations:
 * - GET /api/blood-requests/[id] - Get a specific blood request
 * - PUT /api/blood-requests/[id] - Update a blood request
 * - DELETE /api/blood-requests/[id] - Delete a blood request
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

/**
 * GET /api/blood-requests/[id]
 *
 * Retrieves a single blood request by ID with full details
 *
 * URL Parameters:
 * - id: Blood request UUID
 *
 * Response:
 * - 200 OK: Returns the blood request
 * - 404 Not Found: Blood request doesn't exist
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch blood request with related data
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: params.id },
      include: {
        // Include requester information
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        // Include blood bank information
        bloodBank: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            email: true,
            operatingHours: true,
          },
        },
      },
    });

    // Check if blood request exists
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

    // Return success response
    return NextResponse.json({
      success: true,
      data: bloodRequest,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching blood request:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blood-requests/[id]
 *
 * Updates a blood request (full or partial update)
 *
 * URL Parameters:
 * - id: Blood request UUID
 *
 * Request Body (all fields optional for partial update):
 * {
 *   bloodGroup?: BloodGroup enum
 *   quantityNeeded?: number
 *   status?: RequestStatus enum
 *   urgency?: "NORMAL" | "URGENT" | "CRITICAL"
 *   patientName?: string
 *   patientAge?: number
 *   purpose?: string
 *   requiredBy?: Date (ISO string)
 *   additionalNotes?: string
 * }
 *
 * Response:
 * - 200 OK: Request updated successfully
 * - 400 Bad Request: Validation error
 * - 404 Not Found: Blood request doesn't exist
 * - 500 Internal Server Error: Database or server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse request body
    const body = await request.json();

    // Build update data object (only include provided fields)
    const updateData: any = {};

    // Validate and add fields if provided
    if (body.bloodGroup !== undefined) {
      updateData.bloodGroup = body.bloodGroup;
    }

    if (body.quantityNeeded !== undefined) {
      if (body.quantityNeeded <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Quantity needed must be greater than 0",
            },
          },
          { status: 400 }
        );
      }
      updateData.quantityNeeded = body.quantityNeeded;
    }

    if (body.status !== undefined) {
      // Validate status is a valid enum value
      const validStatuses: RequestStatus[] = [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "FULFILLED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid status value",
              details: { validStatuses },
            },
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.urgency !== undefined) {
      updateData.urgency = body.urgency;
    }

    if (body.patientName !== undefined) {
      updateData.patientName = body.patientName;
    }

    if (body.patientAge !== undefined) {
      if (body.patientAge < 0 || body.patientAge > 150) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Patient age must be between 0 and 150",
            },
          },
          { status: 400 }
        );
      }
      updateData.patientAge = body.patientAge;
    }

    if (body.purpose !== undefined) {
      updateData.purpose = body.purpose;
    }

    if (body.requiredBy !== undefined) {
      updateData.requiredBy = new Date(body.requiredBy);
    }

    if (body.patientGender !== undefined) {
      updateData.patientGender = body.patientGender;
    }

    if (body.hospitalName !== undefined) {
      updateData.hospitalName = body.hospitalName;
    }

    if (body.doctorName !== undefined) {
      updateData.doctorName = body.doctorName;
    }

    if (body.contactNumber !== undefined) {
      updateData.contactNumber = body.contactNumber;
    }

    if (body.additionalNotes !== undefined) {
      updateData.additionalNotes = body.additionalNotes;
    }

    // Check if any fields were provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No fields provided for update",
          },
        },
        { status: 400 }
      );
    }

    // Update blood request in database
    const bloodRequest = await prisma.bloodRequest.update({
      where: { id: params.id },
      data: updateData,
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Blood request updated successfully",
      data: bloodRequest,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error updating blood request:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2025") {
      // Record not found
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

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blood-requests/[id]
 *
 * Deletes a blood request
 *
 * URL Parameters:
 * - id: Blood request UUID
 *
 * Response:
 * - 200 OK: Request deleted successfully
 * - 404 Not Found: Blood request doesn't exist
 * - 500 Internal Server Error: Database or server error
 *
 * Note: In production, consider soft delete (setting deletedAt timestamp)
 * instead of hard delete to maintain audit trail
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete blood request from database
    await prisma.bloodRequest.delete({
      where: { id: params.id },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Blood request deleted successfully",
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error deleting blood request:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2025") {
      // Record not found
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

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
