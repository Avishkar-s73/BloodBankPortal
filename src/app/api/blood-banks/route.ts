/**
 * Blood Banks API - Collection Endpoints
 *
 * Handles blood bank operations:
 * - GET /api/blood-banks - List all blood banks
 * - POST /api/blood-banks - Create a new blood bank
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/blood-banks
 *
 * Retrieves a list of blood banks with optional filtering
 *
 * Query Parameters:
 * - city: Filter by city
 * - state: Filter by state
 * - is24x7: Filter by 24x7 availability (true/false)
 *
 * Response:
 * - 200 OK: Returns array of blood banks
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const is24x7 = searchParams.get("is24x7");

    const where: any = {};
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (is24x7 !== null) where.is24x7 = is24x7 === "true";

    const bloodBanks = await prisma.bloodBank.findMany({
      where,
      include: {
        _count: {
          select: {
            inventory: true,
            bloodRequests: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: bloodBanks,
      count: bloodBanks.length,
    });
  } catch (error) {
    console.error("Error fetching blood banks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blood banks",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blood-banks
 *
 * Creates a new blood bank
 *
 * Request Body:
 * - name: Blood bank name
 * - email: Contact email
 * - phoneNumber: Contact phone
 * - addressLine1: Address line 1
 * - city, state, zipCode, country: Address details
 * - latitude, longitude: Geolocation (optional)
 * - is24x7: 24x7 availability (optional, default: false)
 * - licenseNumber: License number (optional)
 *
 * Response:
 * - 201 Created: Returns the created blood bank
 * - 400 Bad Request: Invalid input data
 * - 500 Internal Server Error: Database or server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      is24x7,
      licenseNumber,
    } = body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !addressLine1 || !city || !state) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, email, phoneNumber, addressLine1, city, state",
        },
        { status: 400 }
      );
    }

    // Create blood bank
    const bloodBank = await prisma.bloodBank.create({
      data: {
        name,
        email,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country: country || "USA",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        is24x7: is24x7 || false,
        licenseNumber,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: bloodBank,
        message: "Blood bank created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blood bank:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create blood bank",
      },
      { status: 500 }
    );
  }
}
