/**
 * Alternative Blood Sources API
 *
 * Finds alternative hospitals and blood banks that have the required blood type
 * when the primary source doesn't have availability
 *
 * GET /api/hospitals/alternative-blood-sources
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BloodGroup } from "@prisma/client";

/**
 * GET /api/hospitals/alternative-blood-sources
 *
 * Finds up to 5 alternative blood sources (hospitals and blood banks) that have
 * the required blood type in stock
 *
 * Query Parameters:
 * - bloodGroup: Required blood group (e.g., A_POSITIVE, O_NEGATIVE)
 * - city: Optional city filter to prioritize local sources
 * - minQuantity: Minimum units required (default: 1)
 * - limit: Maximum number of sources to return (default: 5)
 *
 * Response:
 * - 200 OK: Returns array of blood banks with available inventory
 * - 400 Bad Request: Missing or invalid blood group
 * - 500 Internal Server Error: Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const city = searchParams.get("city");
    const minQuantity = parseInt(searchParams.get("minQuantity") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    // Validate required parameters
    if (!bloodGroup) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood group is required",
        },
        { status: 400 }
      );
    }

    // Validate blood group enum
    if (!Object.values(BloodGroup).includes(bloodGroup as BloodGroup)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid blood group",
        },
        { status: 400 }
      );
    }

    // Find blood banks with available inventory
    const bloodBanksWithInventory = await prisma.bloodBank.findMany({
      where: {
        isActive: true,
        isVerified: true,
        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),
        inventory: {
          some: {
            bloodGroup: bloodGroup as BloodGroup,
            quantity: {
              gte: minQuantity,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        alternatePhone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        operatingHours: true,
        inventory: {
          where: {
            bloodGroup: bloodGroup as BloodGroup,
            quantity: {
              gte: minQuantity,
            },
          },
          select: {
            bloodGroup: true,
            quantity: true,
            lastUpdated: true,
            expiryDate: true,
          },
        },
      },
      take: limit,
      orderBy: [
        ...(city ? [{ city: "asc" as const }] : []),
        { name: "asc" as const },
      ],
    });

    // Also find hospitals with their own blood banks
    const hospitalsWithBloodBank = await prisma.hospital.findMany({
      where: {
        isActive: true,
        isVerified: true,
        hasBloodBank: true,
        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        alternatePhone: true,
        emergencyPhone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        totalBeds: true,
        hasBloodBank: true,
      },
      take: Math.max(0, limit - bloodBanksWithInventory.length),
      orderBy: [
        ...(city ? [{ city: "asc" as const }] : []),
        { name: "asc" as const },
      ],
    });

    // Combine and format results
    const bloodSources = [
      ...bloodBanksWithInventory.map((bank) => ({
        id: bank.id,
        name: bank.name,
        type: "blood_bank" as const,
        email: bank.email,
        phone: bank.phone,
        alternatePhone: bank.alternatePhone,
        address: bank.address,
        city: bank.city,
        state: bank.state,
        pincode: bank.pincode,
        latitude: bank.latitude,
        longitude: bank.longitude,
        operatingHours: bank.operatingHours,
        availableUnits: bank.inventory[0]?.quantity || 0,
        bloodGroup: bloodGroup,
        lastUpdated: bank.inventory[0]?.lastUpdated,
        expiryDate: bank.inventory[0]?.expiryDate,
      })),
      ...hospitalsWithBloodBank.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        type: "hospital" as const,
        email: hospital.email,
        phone: hospital.phone,
        alternatePhone: hospital.alternatePhone,
        emergencyPhone: hospital.emergencyPhone,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        pincode: hospital.pincode,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        totalBeds: hospital.totalBeds,
        hasBloodBank: hospital.hasBloodBank,
        bloodGroup: bloodGroup,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: bloodSources.slice(0, limit),
      metadata: {
        bloodGroup,
        requestedCity: city || "All cities",
        minQuantity,
        totalFound: bloodSources.length,
        bloodBanks: bloodBanksWithInventory.length,
        hospitals: hospitalsWithBloodBank.length,
      },
    });
  } catch (error) {
    console.error("Error finding alternative blood sources:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to find alternative blood sources",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
