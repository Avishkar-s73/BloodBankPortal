import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    const result: { existsEmail?: boolean; existsPhone?: boolean } = {};

    if (email) {
      const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
      result.existsEmail = !!user;
    }

    if (phone) {
      const user = await prisma.user.findFirst({ where: { phone } });
      result.existsPhone = !!user;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("/api/auth/check error:", err);
    return NextResponse.json({ success: false, error: "Check failed" }, { status: 500 });
  }
}
