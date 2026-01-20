/**
 * Blood Requests API - Collection Endpoints
 *
 * Handles blood request operations:
 * - GET /api/blood-requests - List all blood requests (with pagination & filtering)
 * - POST /api/blood-requests - Create a new blood request
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BloodGroup, RequestStatus } from "@prisma/client";

/**
 * GET /api/blood-requests
 *
 * Retrieves a paginated list of blood requests with optional filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - status: Filter by status (PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED)
 * - urgency: Filter by urgency (NORMAL, URGENT, CRITICAL)
 * - bloodGroup: Filter by blood group (A_POSITIVE, B_POSITIVE, etc.)
 *
 * Response:
 * - 200 OK: Returns array of blood requests with pagination metadata
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as RequestStatus | null;
    const urgency = searchParams.get("urgency");
    const bloodGroup = searchParams.get("bloodGroup") as BloodGroup | null;

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build dynamic where clause based on filters
    const where: any = {};
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (bloodGroup) where.bloodGroup = bloodGroup;

    // Execute parallel queries for data and count (performance optimization)
    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        skip,
        take: limit,
        // Select specific fields to avoid over-fetching
        select: {
          id: true,
          bloodGroup: true,
          quantityNeeded: true,
          status: true,
          urgency: true,
          patientName: true,
          patientAge: true,
          purpose: true,
          requiredBy: true,
          createdAt: true,
          fulfilledAt: true,
          // Include nested relations with selected fields
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
        // Sort by newest first
        orderBy: { createdAt: "desc" },
      }),
      // Count total matching records for pagination
      prisma.bloodRequest.count({ where }),
    ]);

    // Return success response with data and pagination metadata
    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error("Error fetching blood requests:", error);

    // Return error response with 500 status
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch blood requests. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blood-requests
 *
 * Creates a new blood request with transactional inventory management
 *
 * CRITICAL TRANSACTION LOGIC:
 * 1. Check if sufficient blood units exist in inventory
 * 2. Create blood request with appropriate status
 * 3. Reduce inventory quantity if blood is available
 * 4. Rollback everything if any step fails
 *
 * Request Body:
 * {
 *   requesterId: string (UUID) - User making the request
 *   bloodBankId: string (UUID) - Blood bank to request from
 *   bloodGroup: BloodGroup enum - Blood type needed
 *   quantityNeeded: number - Units required (must be positive)
 *   patientName: string - Patient name
 *   patientAge: number - Patient age
 *   purpose: string - Purpose of request
 *   requiredBy: Date (ISO string) - When blood is needed
 *   urgency: "NORMAL" | "URGENT" | "CRITICAL" (optional)
 *   hospitalId: string (UUID) (optional) - Hospital making request
 * }
 *
 * Response:
 * - 201 Created: Request created and fulfilled successfully
 * - 202 Accepted: Request created but pending (insufficient inventory)
 * - 400 Bad Request: Validation error or missing required fields
 * - 404 Not Found: Requester or blood bank doesn't exist
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "requesterId",
      "bloodBankId",
      "bloodGroup",
      "quantityNeeded",
      "patientName",
      "patientAge",
      "purpose",
      "requiredBy",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields",
            details: { missingFields },
          },
        },
        { status: 400 }
      );
    }

    // Validate quantity is positive
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

    // Validate patient age is reasonable
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

    // Verify requester exists
    const requester = await prisma.user.findUnique({
      where: { id: body.requesterId },
    });

    if (!requester) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Requester not found",
          },
        },
        { status: 404 }
      );
    }

    // Verify blood bank exists
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: body.bloodBankId },
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

    // Verify hospital exists if provided
    if (body.hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: body.hospitalId },
      });

      if (!hospital) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Hospital not found",
            },
          },
          { status: 404 }
        );
      }
    }

    // ========================================
    // CRITICAL TRANSACTION LOGIC
    // ========================================
    // Use Prisma transaction to ensure atomicity
    // Either all operations succeed or all are rolled back
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Check inventory availability
      const inventory = await tx.bloodInventory.findUnique({
        where: {
          bloodBankId_bloodGroup: {
            bloodBankId: body.bloodBankId,
            bloodGroup: body.bloodGroup,
          },
        },
      });

      let requestStatus: RequestStatus;
      let statusMessage: string;

      // Step 2: Determine if request can be fulfilled
      if (!inventory || inventory.quantity < body.quantityNeeded) {
        // Insufficient blood units - create pending request
        requestStatus = RequestStatus.PENDING;
        statusMessage =
          "Insufficient blood units available. Request marked as PENDING.";

        console.log(
          `[BLOOD REQUEST] Insufficient inventory for ${body.bloodGroup}. ` +
            `Available: ${inventory?.quantity || 0}, Needed: ${
              body.quantityNeeded
            }`
        );
      } else {
        // Sufficient blood units - fulfill immediately
        requestStatus = RequestStatus.FULFILLED;
        statusMessage = "Blood request fulfilled successfully.";

        // Step 3: Reduce inventory quantity
        await tx.bloodInventory.update({
          where: {
            bloodBankId_bloodGroup: {
              bloodBankId: body.bloodBankId,
              bloodGroup: body.bloodGroup,
            },
          },
          data: {
            quantity: {
              decrement: body.quantityNeeded, // Atomic decrement
            },
            lastUpdated: new Date(),
          },
        });

        console.log(
          `[BLOOD REQUEST] Inventory updated. ${body.quantityNeeded} units of ` +
            `${body.bloodGroup} deducted from blood bank ${body.bloodBankId}`
        );
      }

      // Step 4: Create blood request record
      const bloodRequest = await tx.bloodRequest.create({
        data: {
          requesterId: body.requesterId,
          bloodBankId: body.bloodBankId,
          hospitalId: body.hospitalId,
          bloodGroup: body.bloodGroup,
          quantityNeeded: body.quantityNeeded,
          patientName: body.patientName,
          patientAge: body.patientAge,
          patientGender: body.patientGender,
          purpose: body.purpose,
          requiredBy: new Date(body.requiredBy),
          urgency: body.urgency || "NORMAL",
          status: requestStatus,
          medicalNotes: body.medicalNotes,
          doctorName: body.doctorName,
          doctorContact: body.doctorContact,
          // Set fulfillment timestamp if fulfilled immediately
          fulfilledAt:
            requestStatus === RequestStatus.FULFILLED ? new Date() : null,
        },
        // Include related data in response
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
        },
      });

      return { bloodRequest, statusMessage, requestStatus };
    });

    // Transaction successful - return appropriate response
    const statusCode =
      result.requestStatus === RequestStatus.FULFILLED ? 201 : 202;

    return NextResponse.json(
      {
        success: true,
        message: result.statusMessage,
        data: result.bloodRequest,
      },
      { status: statusCode }
    );
  } catch (error: any) {
    // Log error for debugging
    // eslint-disable-next-line no-console
    console.error("Error creating blood request:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2003") {
      // Foreign key constraint violation
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REFERENCE",
            message: "Invalid requester, blood bank, or hospital ID",
          },
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create blood request. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
