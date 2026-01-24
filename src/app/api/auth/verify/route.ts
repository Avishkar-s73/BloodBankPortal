/**
 * Authentication API - Verify Token Endpoint
 * GET /api/auth/verify
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get("auth-token")?.value;
    const headerToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No authentication token provided",
        },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          bloodGroup: true,
          city: true,
          state: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "Account is deactivated",
          },
          { status: 403 }
        );
      }
      // Also try to find a blood bank managed by this user (if any)
      const managedBloodBank = await prisma.bloodBank.findFirst({
        where: { managerId: user.id },
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            user,
            isAuthenticated: true,
            managedBloodBank: managedBloodBank || null,
          },
        },
        { status: 200 }
      );
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Token verification failed",
      },
      { status: 500 }
    );
  }
}
