/**
 * Donor Stats API
 * GET /api/donors/stats - Get donor's statistics and eligibility
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const cookieToken = request.cookies.get("auth-token")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bloodGroup: true,
        role: true,
      },
    });

    if (!user || user.role !== "DONOR") {
      return NextResponse.json(
        { success: false, error: "User not found or not a donor" },
        { status: 404 }
      );
    }

    // Get all completed donations
    const completedDonations = await prisma.donation.findMany({
      where: {
        donorId: userId,
        status: "COMPLETED",
      },
      orderBy: {
        donationDate: "desc",
      },
      select: {
        id: true,
        donationDate: true,
        quantity: true,
      },
    });

    // Calculate stats
    const totalDonations = completedDonations.length;
    const lifetimeUnits = completedDonations.reduce(
      (sum, d) => sum + (d.quantity || 1),
      0
    );

    // Calculate eligibility (must wait 90 days between donations)
    let isEligible = true;
    let nextEligibleDate: string | null = null;
    let daysSinceLastDonation: number | null = null;

    if (completedDonations.length > 0 && completedDonations[0].donationDate) {
      const lastDonationDate = new Date(completedDonations[0].donationDate);
      const today = new Date();
      const diffTime = today.getTime() - lastDonationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      daysSinceLastDonation = diffDays;

      // Donors must wait 90 days (3 months) between donations
      if (diffDays < 90) {
        isEligible = false;
        const nextDate = new Date(lastDonationDate);
        nextDate.setDate(nextDate.getDate() + 90);
        nextEligibleDate = nextDate.toISOString();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,
        lifetimeUnits: Math.round(lifetimeUnits),
        isEligible,
        nextEligibleDate,
        daysSinceLastDonation,
      },
    });
  } catch (error) {
    console.error("Error fetching donor stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donor statistics",
      },
      { status: 500 }
    );
  }
}
