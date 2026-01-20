/**
 * Blood Banks API - Single Resource Operations
 * GET /api/blood-banks/:id
 * PUT /api/blood-banks/:id
 * DELETE /api/blood-banks/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blood-banks/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { id: params.id },
      include: {
        inventory: {
          orderBy: { bloodGroup: "asc" },
        },
        donations: {
          take: 5,
          orderBy: { scheduledDate: "desc" },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                bloodGroup: true,
              },
            },
          },
        },
        campaigns: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!bloodBank) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood bank not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: bloodBank,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get blood bank error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blood bank",
      },
      { status: 500 }
    );
  }
}

// PUT /api/blood-banks/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      license,
    } = body;

    // Check if blood bank exists
    const existing = await prisma.bloodBank.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood bank not found",
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
    if (license) updateData.license = license;

    // Update blood bank
    const updated = await prisma.bloodBank.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood bank updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update blood bank error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update blood bank",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blood-banks/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if blood bank exists
    const existing = await prisma.bloodBank.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood bank not found",
        },
        { status: 404 }
      );
    }

    // Delete blood bank
    await prisma.bloodBank.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood bank deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete blood bank error:", error);

    // Check for foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete blood bank with existing inventory, donations, or campaigns",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete blood bank",
      },
      { status: 500 }
    );
  }
}
