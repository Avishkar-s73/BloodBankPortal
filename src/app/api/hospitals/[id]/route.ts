/**
 * Hospitals API - Single Resource Operations
 * GET /api/hospitals/:id
 * PUT /api/hospitals/:id
 * DELETE /api/hospitals/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hospitals/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: params.id },
      include: {
        bloodRequests: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            bloodGroup: true,
            quantityNeeded: true,
            urgency: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        {
          success: false,
          error: "Hospital not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: hospital,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get hospital error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch hospital",
      },
      { status: 500 }
    );
  }
}

// PUT /api/hospitals/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, city, state, pincode, country } = body;

    // Check if hospital exists
    const existing = await prisma.hospital.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Hospital not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (country) updateData.country = country;

    // Update hospital
    const updated = await prisma.hospital.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hospital updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update hospital error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update hospital",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/hospitals/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if hospital exists
    const existing = await prisma.hospital.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Hospital not found",
        },
        { status: 404 }
      );
    }

    // Delete hospital
    await prisma.hospital.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hospital deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete hospital error:", error);

    // Check for foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete hospital with existing blood requests",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete hospital",
      },
      { status: 500 }
    );
  }
}
