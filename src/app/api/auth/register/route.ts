/**
 * Authentication API - Register Endpoint
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, BloodGroup } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "DONOR",
      bloodGroup,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,
      country = "India",
      bloodBankId, // For BLOOD_BANK users
      bloodBankData, // Optional new blood bank details when registering a bank
      hospitalId, // For HOSPITAL users
      hospitalData, // Optional new hospital details when registering a hospital
    } = body;

    // Validate required fields. Allow blood-bank signups to provide bank contact
    // in `bloodBankData` instead of personal `firstName/lastName/phone`.
    const hasName = !!firstName || (!!bloodBankData && !!bloodBankData.name) || (!!hospitalData && !!hospitalData.name);
    const hasPhone = !!phone || (!!bloodBankData && !!bloodBankData.phone) || (!!hospitalData && !!hospitalData.phone);

    if (!email || !password || !hasName || !hasPhone) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email, password, name (or bank name) and phone (or bank phone) are required",
        },
        { status: 400 }
      );
    }

    // Validate organization selection based on role
    if (role === "BLOOD_BANK" && !bloodBankId && !(bloodBankData && bloodBankData.name)) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide an existing blood bank or enter new blood bank details",
        },
        { status: 400 }
      );
    }

    if (role === "HOSPITAL" && !hospitalId && !(hospitalData && hospitalData.name)) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide an existing hospital or enter new hospital details",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists — include phone from bank or hospital data when provided.
    const checkPhone = phone || (bloodBankData && bloodBankData.phone) || (hospitalData && hospitalData.phone) || undefined;
    const orConditions: any[] = [];
    if (email) orConditions.push({ email: email.toLowerCase() });
    if (checkPhone) orConditions.push({ phone: checkPhone });

    if (orConditions.length > 0) {
      // Debug: log the check inputs to help diagnose intermittent conflicts
      console.debug("[REGISTER CHECK] email:", email, "checkPhone:", checkPhone, "bankPhone:", bloodBankData?.phone, "hospitalPhone:", hospitalData?.phone, "orConditions:", orConditions);
      const existingUser = await prisma.user.findFirst({ where: { OR: orConditions } });
      console.debug("[REGISTER CHECK] existingUser:", existingUser ? { id: existingUser.id, email: existingUser.email, phone: existingUser.phone } : null);
      if (existingUser) {
        if (existingUser.email && email && existingUser.email === email.toLowerCase()) {
          return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
        }
        if (existingUser.phone && checkPhone && existingUser.phone === checkPhone) {
          return NextResponse.json({ success: false, error: "Phone number already registered" }, { status: 409 });
        }
        // Generic conflict
        return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      // Debug: show attempted create values
      console.debug("[REGISTER] creating user with email:", email, "phone:", phone, "checkPhone:", checkPhone, "hospitalPhone:", hospitalData?.phone, "bankPhone:", bloodBankData?.phone);
    // Create user and link to organization if applicable
      user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        // Prefer the provided phone or the bank phone (checkPhone). Avoid inserting empty string which can
        // collide with existing empty-phone records; pass undefined to omit the field when empty.
        phone: checkPhone || undefined,
        role: role as UserRole,
        bloodGroup: bloodGroup as BloodGroup,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        pincode,
        country,
        isActive: true,
        isVerified: false,
        emailVerified: false,
        phoneVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bloodGroup: true,
        city: true,
        state: true,
        createdAt: true,
      },
    });
    } catch (err: any) {
      console.error('[REGISTER] create user error code:', err?.code, 'meta:', err?.meta);
      // Handle unique constraint errors gracefully and return informative 409 responses
      if (err?.code === 'P2002' && err?.meta?.target) {
        const target = err.meta.target as string[];
        if (target.includes('email')) {
          const conflicting = await prisma.user.findMany({ where: { email: email.toLowerCase() } });
          console.debug('[REGISTER] conflicting users for email:', conflicting);
          return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
        }
        if (target.includes('phone')) {
          const phoneToCheck = checkPhone || phone;
          const conflicting = await prisma.user.findMany({ where: { phone: phoneToCheck } });
          console.debug('[REGISTER] conflicting users for phone:', phoneToCheck, conflicting);
          return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 409 });
        }
      }
      // Re-throw for generic error handling
      throw err;
    }

    // If registering a new blood bank, create it and attach managerId
    if (role === "BLOOD_BANK") {
      if (bloodBankId) {
        await prisma.bloodBank.update({
          where: { id: bloodBankId },
          data: { managerId: user.id },
        });
      } else if (bloodBankData && bloodBankData.name) {
        await prisma.bloodBank.create({
          data: {
            name: bloodBankData.name,
            registrationNo: bloodBankData.registrationNo || `REG-${Date.now()}`,
            // BloodBank.email is required in the schema — prefer provided bank email, fallback to registrant email
            email: (bloodBankData as any).email || email.toLowerCase(),
            phone: bloodBankData.phone || "",
            // schema requires address/city/state/pincode; provide safe fallbacks to avoid validation errors
            address: bloodBankData.address || "",
            city: bloodBankData.city || "",
            state: bloodBankData.state || "",
            pincode: bloodBankData.pincode ?? "",
            operatingHours: bloodBankData.operatingHours || "",
            managerId: user.id,
          },
        });
      }
    } else if (role === "HOSPITAL") {
      if (hospitalId) {
        await prisma.hospital.update({
          where: { id: hospitalId },
          data: { contactPersonId: user.id },
        });
      } else if (hospitalData && hospitalData.name) {
        await prisma.hospital.create({
          data: {
            name: hospitalData.name,
            registrationNo: hospitalData.registrationNo || `REG-H-${Date.now()}`,
            email: (hospitalData as any).email || email.toLowerCase(),
            phone: hospitalData.phone || phone || undefined,
            emergencyPhone: (hospitalData as any).emergencyPhone || undefined,
            address: hospitalData.address || "",
            city: hospitalData.city || "",
            state: hospitalData.state || "",
            pincode: hospitalData.pincode ?? "",
            contactPersonId: user.id,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please login.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
