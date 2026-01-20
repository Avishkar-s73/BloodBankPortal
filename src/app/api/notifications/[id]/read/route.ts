/**
 * Notifications API - Mark as Read
 * POST /api/notifications/:id/read
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification not found",
        },
        { status: 404 }
      );
    }

    // Update notification as read
    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification marked as read",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark notification as read",
      },
      { status: 500 }
    );
  }
}
