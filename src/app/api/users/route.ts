/**
 * Users API - Collection Endpoints
 *
 * Handles user operations:
 * - GET /api/users - List all users with filtering
 * - POST /api/users - Create a new user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BloodGroup, UserRole } from "@prisma/client";

/**
 * GET /api/users
 *
 * Retrieves a list of users with optional filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - role: Filter by user role (DONOR, HOSPITAL, BLOOD_BANK, NGO, ADMIN)
 * - bloodGroup: Filter by blood group
 * - city: Filter by city
 *
 * Response:
 * - 200 OK: Returns array of users with pagination metadata
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role") as UserRole | null;
    const bloodGroup = searchParams.get("bloodGroup") as BloodGroup | null;
    const city = searchParams.get("city");

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};
    if (role) where.role = role;
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (city) where.city = { contains: city, mode: "insensitive" };

    // Execute parallel queries for data and count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          bloodGroup: true,
          gender: true,
          city: true,
          state: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 *
 * Creates a new user
 *
 * Request Body:
 * {
 *   email: string (required, unique)
 *   password: string (required, min 6 chars)
 *   firstName: string (required)
 *   lastName: string (required)
 *   phone: string (required, unique)
 *   role: UserRole (optional, default: DONOR)
 *   bloodGroup: BloodGroup (optional)
 *   gender: Gender (optional)
 *   city: string (optional)
 *   state: string (optional)
 *   address: string (optional)
 * }
 *
 * Response:
 * - 201 Created: Returns the created user (without password)
 * - 400 Bad Request: Validation error or missing required fields
 * - 409 Conflict: Email or phone already exists
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "email",
      "password",
      "firstName",
      "lastName",
      "phone",
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email format",
          },
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 6 characters long",
          },
        },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(body.phone.replace(/[\s\-\(\)]/g, ""))) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid phone number format",
          },
        },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "User with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Check if user with phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone: body.phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "User with this phone number already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create user in database (password stored as plain text for MVP - hash in production)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password, // In production, use bcrypt.hash()
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: body.role || "DONOR",
        bloodGroup: body.bloodGroup,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        city: body.city,
        state: body.state,
        address: body.address,
        pincode: body.pincode,
        country: body.country || "India",
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        bloodGroup: true,
        gender: true,
        city: true,
        state: true,
        createdAt: true,
        // Exclude password from response
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Prisma unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "User with this email or phone already exists",
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create user. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
