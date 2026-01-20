/**
 * Campaigns API - Single Resource Operations
 * GET /api/campaigns/:id
 * PUT /api/campaigns/:id
 * DELETE /api/campaigns/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
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

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get campaign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign",
      },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      targetBloodGroups,
      contactPerson,
      contactPhone,
    } = body;

    // Check if campaign exists
    const existing = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (location) updateData.location = location;
    if (targetBloodGroups) updateData.targetBloodGroups = targetBloodGroups;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (contactPhone) updateData.contactPhone = contactPhone;

    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        return NextResponse.json(
          {
            success: false,
            error: "End date must be after start date",
          },
          { status: 400 }
        );
      }
    }

    // Update campaign
    const updated = await prisma.campaign.update({
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
        message: "Campaign updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if campaign exists
    const existing = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
      },
      { status: 500 }
    );
  }
}
