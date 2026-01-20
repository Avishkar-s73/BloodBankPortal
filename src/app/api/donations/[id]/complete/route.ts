/**
 * Donations API - Complete Action
 * POST /api/donations/:id/complete
 * Marks donation as completed and updates blood inventory
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get donation
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        bloodBank: true,
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

    // Check if already completed
    if (donation.status === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Donation is already completed",
        },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (donation.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot complete a cancelled donation",
        },
        { status: 400 }
      );
    }

    // Use transaction to update donation and inventory atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update donation status
      const updatedDonation = await tx.donation.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          completedDate: new Date(),
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bloodGroup: true,
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

      // Find or create inventory record
      let inventory = await tx.bloodInventory.findFirst({
        where: {
          bloodBankId: donation.bloodBankId,
          bloodGroup: donation.bloodGroup,
        },
      });

      if (inventory) {
        // Update existing inventory
        inventory = await tx.bloodInventory.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity + donation.quantity,
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new inventory record
        inventory = await tx.bloodInventory.create({
          data: {
            bloodBankId: donation.bloodBankId,
            bloodGroup: donation.bloodGroup,
            quantity: donation.quantity,
            lastUpdated: new Date(),
          },
        });
      }

      return { donation: updatedDonation, inventory };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation completed and inventory updated successfully",
        data: result.donation,
        inventory: result.inventory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete donation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete donation",
      },
      { status: 500 }
    );
  }
}
