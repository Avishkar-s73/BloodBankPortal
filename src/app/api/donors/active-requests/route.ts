/**
 * API: Get Active Blood Requests for Donors
 * GET /api/donors/active-requests
 * Returns blood requests that match donor's blood group or are compatible
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Blood compatibility matrix
const COMPATIBLE_BLOOD_GROUPS: Record<string, string[]> = {
  O_NEGATIVE: ["O_NEGATIVE", "O_POSITIVE", "A_NEGATIVE", "A_POSITIVE", "B_NEGATIVE", "B_POSITIVE", "AB_NEGATIVE", "AB_POSITIVE"],
  O_POSITIVE: ["O_POSITIVE", "A_POSITIVE", "B_POSITIVE", "AB_POSITIVE"],
  A_NEGATIVE: ["A_NEGATIVE", "A_POSITIVE", "AB_NEGATIVE", "AB_POSITIVE"],
  A_POSITIVE: ["A_POSITIVE", "AB_POSITIVE"],
  B_NEGATIVE: ["B_NEGATIVE", "B_POSITIVE", "AB_NEGATIVE", "AB_POSITIVE"],
  B_POSITIVE: ["B_POSITIVE", "AB_POSITIVE"],
  AB_NEGATIVE: ["AB_NEGATIVE", "AB_POSITIVE"],
  AB_POSITIVE: ["AB_POSITIVE"],
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieToken = request.cookies.get("auth-token")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookieToken, JWT_SECRET);
    const userId = payload.userId as string;

    // Get donor information
    const donor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bloodGroup: true,
        city: true,
        state: true,
        role: true,
      },
    });

    if (!donor || donor.role !== "DONOR") {
      return NextResponse.json(
        { success: false, error: "Only donors can access this endpoint" },
        { status: 403 }
      );
    }

    if (!donor.bloodGroup) {
      return NextResponse.json(
        { success: false, error: "Please update your blood group in profile" },
        { status: 400 }
      );
    }

    // Get compatible blood groups that this donor can donate to
    const compatibleGroups = COMPATIBLE_BLOOD_GROUPS[donor.bloodGroup] || [donor.bloodGroup];

    // Get active blood requests (include escalated requests so donors can see them)
    const activeRequests = await prisma.bloodRequest.findMany({
      where: {
        status: { in: ["PENDING", "ESCALATED_TO_DONORS"] },
        bloodGroup: {
          in: compatibleGroups,
        },
        // Optionally filter by location
        ...(donor.city && {
          OR: [
            { bloodBank: { city: donor.city } },
            { hospital: { city: donor.city } },
          ],
        }),
      },
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
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            phone: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { urgency: "desc" },
        { requiredBy: "asc" },
      ],
      take: 20, // Limit to 20 most urgent requests
    });

    // Format response
    const formattedRequests = activeRequests.map((request) => ({
      id: request.id,
      bloodGroup: request.bloodGroup,
      quantityNeeded: request.quantityNeeded,
      purpose: request.purpose,
      urgency: request.urgency,
      status: request.status,
      requiredBy: request.requiredBy,
      patientName: request.patientName,
      patientAge: request.patientAge,
      patientGender: request.patientGender,
      createdAt: request.createdAt,
      bloodBank: request.bloodBank,
      hospital: request.hospital,
      requester: request.requester
        ? `${request.requester.firstName} ${request.requester.lastName}`
        : null,
      distance: null, // Can be calculated if coordinates are available
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: formattedRequests,
        donorBloodGroup: donor.bloodGroup,
        compatibleGroups,
        totalRequests: formattedRequests.length,
      },
    });
  } catch (error) {
    console.error("Error fetching active requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active requests" },
      { status: 500 }
    );
  }
}
