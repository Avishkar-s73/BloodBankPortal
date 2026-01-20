/**
 * Donations API - Single Resource Operations
 * GET /api/donations/:id
 * PUT /api/donations/:id
 * DELETE /api/donations/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DonationStatus } from "@prisma/client";

// GET /api/donations/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bloodGroup: true,
            city: true,
            state: true,
          },
        },
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

    if (!donation) {
      return NextResponse.json(
        {
          success: false,
          error: "Donation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: donation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get donation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation",
      },
      { status: 500 }
    );
  }
}

// PUT /api/donations/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { scheduledDate, status, quantity, notes, completedDate } = body;

    // Check if donation exists
    const existing = await prisma.donation.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Donation not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (status) updateData.status = status as DonationStatus;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (notes !== undefined) updateData.notes = notes;
    if (completedDate) updateData.completedDate = new Date(completedDate);

    // Update donation
    const updated = await prisma.donation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
        message: "Donation updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update donation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update donation",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if donation exists
    const existing = await prisma.donation.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Donation not found",
        },
        { status: 404 }
      );
    }

    // Only allow deletion of scheduled or cancelled donations
    if (existing.status === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete completed donations",
        },
        { status: 400 }
      );
    }

    // Delete donation
    await prisma.donation.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete donation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete donation",
      },
      { status: 500 }
    );
  }
}
