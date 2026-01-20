/**
 * Hospitals API - Collection Endpoints
 *
 * Handles hospital operations:
 * - GET /api/hospitals - List all hospitals with filtering
 * - POST /api/hospitals - Create a new hospital
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/hospitals
 *
 * Retrieves a list of hospitals with optional filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - city: Filter by city
 * - state: Filter by state
 * - hasBloodBank: Filter by whether hospital has blood bank (true/false)
 * - isActive: Filter by active status (true/false)
 *
 * Response:
 * - 200 OK: Returns array of hospitals with pagination metadata
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const hasBloodBank = searchParams.get("hasBloodBank");
    const isActive = searchParams.get("isActive");

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (hasBloodBank !== null) where.hasBloodBank = hasBloodBank === "true";
    if (isActive !== null) where.isActive = isActive === "true";

    // Execute parallel queries for data and count
    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          registrationNo: true,
          email: true,
          phone: true,
          alternatePhone: true,
          emergencyPhone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          country: true,
          totalBeds: true,
          hasBloodBank: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bloodRequests: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.hospital.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: hospitals,
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
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch hospitals",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hospitals
 *
 * Creates a new hospital
 *
 * Request Body:
 * {
 *   name: string (required)
 *   registrationNo: string (required, unique)
 *   email: string (required, unique)
 *   phone: string (required, unique)
 *   address: string (required)
 *   city: string (required)
 *   state: string (required)
 *   pincode: string (required)
 *   alternatePhone: string (optional)
 *   emergencyPhone: string (optional)
 *   totalBeds: number (optional)
 *   hasBloodBank: boolean (optional, default: false)
 *   country: string (optional, default: "India")
 * }
 *
 * Response:
 * - 201 Created: Returns the created hospital
 * - 400 Bad Request: Validation error or missing required fields
 * - 409 Conflict: Registration number, email, or phone already exists
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "registrationNo",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
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

    // Validate total beds if provided
    if (body.totalBeds !== undefined && body.totalBeds < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Total beds must be a positive number",
          },
        },
        { status: 400 }
      );
    }

    // Check for duplicate registration number
    const existingRegNo = await prisma.hospital.findUnique({
      where: { registrationNo: body.registrationNo },
    });

    if (existingRegNo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Hospital with this registration number already exists",
          },
        },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existingEmail = await prisma.hospital.findUnique({
      where: { email: body.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Hospital with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Check for duplicate phone
    const existingPhone = await prisma.hospital.findUnique({
      where: { phone: body.phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Hospital with this phone number already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create hospital in database
    const hospital = await prisma.hospital.create({
      data: {
        name: body.name,
        registrationNo: body.registrationNo,
        email: body.email,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        emergencyPhone: body.emergencyPhone,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        country: body.country || "India",
        totalBeds: body.totalBeds,
        hasBloodBank: body.hasBloodBank || false,
        latitude: body.latitude,
        longitude: body.longitude,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hospital created successfully",
        data: hospital,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating hospital:", error);

    // Handle Prisma unique constraint violations
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: `Hospital with this ${field} already exists`,
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
          message: "Failed to create hospital. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
