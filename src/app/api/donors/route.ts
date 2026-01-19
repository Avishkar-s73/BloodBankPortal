/**
 * Donors API - Collection Endpoints
 *
 * Handles donor operations:
 * - GET /api/donors - List all donors with filtering
 * - POST /api/donors - Register a new donor
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BloodGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * GET /api/donors
 *
 * Retrieves a list of donors with optional filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - bloodGroup: Filter by blood group
 * - city: Filter by city
 * - state: Filter by state
 *
 * Response:
 * - 200 OK: Returns array of donors with pagination metadata
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const bloodGroup = searchParams.get("bloodGroup") as BloodGroup | null;
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    const skip = (page - 1) * limit;

    const where: any = { role: "DONOR" };
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };

    const [donors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          bloodGroup: true,
          dateOfBirth: true,
          gender: true,
          city: true,
          state: true,
          zipCode: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: donors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching donors:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donors",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/donors
 *
 * Registers a new donor
 *
 * Request Body:
 * - email: User email (unique)
 * - password: User password (will be hashed)
 * - firstName: First name
 * - lastName: Last name
 * - phoneNumber: Contact number
 * - bloodGroup: Blood group enum
 * - dateOfBirth: Date of birth
 * - gender: Gender
 * - addressLine1, city, state, zipCode, country: Address details
 *
 * Response:
 * - 201 Created: Returns the created donor (without password)
 * - 400 Bad Request: Invalid input or email already exists
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      bloodGroup,
      dateOfBirth,
      gender,
      addressLine1,
      city,
      state,
      zipCode,
      country,
    } = body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !bloodGroup
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: email, password, firstName, lastName, phoneNumber, bloodGroup",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create donor
    const donor = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        bloodGroup,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        addressLine1,
        city,
        state,
        zipCode,
        country: country || "USA",
        role: "DONOR",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        bloodGroup: true,
        dateOfBirth: true,
        gender: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: donor,
        message: "Donor registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating donor:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to register donor",
      },
      { status: 500 }
    );
  }
}
