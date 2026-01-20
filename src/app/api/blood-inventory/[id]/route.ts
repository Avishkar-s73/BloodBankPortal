/**
 * Blood Inventory API - Single Resource Operations
 * GET /api/blood-inventory/:id
 * PUT /api/blood-inventory/:id
 * DELETE /api/blood-inventory/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blood-inventory/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await prisma.bloodInventory.findUnique({
      where: { id: params.id },
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood inventory record not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: inventory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get blood inventory error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blood inventory",
      },
      { status: 500 }
    );
  }
}

// PUT /api/blood-inventory/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity, lastUpdated, expiryDate, notes } = body;

    // Check if inventory exists
    const existing = await prisma.bloodInventory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood inventory record not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (lastUpdated) updateData.lastUpdated = new Date(lastUpdated);
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (notes !== undefined) updateData.notes = notes;

    // Update inventory
    const updated = await prisma.bloodInventory.update({
      where: { id: params.id },
      data: updateData,
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood inventory updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update blood inventory error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update blood inventory",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blood-inventory/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if inventory exists
    const existing = await prisma.bloodInventory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Blood inventory record not found",
        },
        { status: 404 }
      );
    }

    // Delete inventory
    await prisma.bloodInventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood inventory deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete blood inventory error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete blood inventory",
      },
      { status: 500 }
    );
  }
}
