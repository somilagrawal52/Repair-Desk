import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { createToken } from "@/lib/auth-jwt";
import { initialStaff } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Support common demo aliases for instant 1-click preview
    const DEMO_ALIASES: Record<string, string> = {
      "owner@techfix.in": "vikram@techfixindore.in",
      "vikram@techfix.in": "vikram@techfixindore.in",
      "reception@techfix.in": "sneha@techfixindore.in",
      "priya@techfix.in": "sneha@techfixindore.in",
      "tech1@techfix.in": "amit.tech@techfixindore.in",
      "rahul@techfix.in": "amit.tech@techfixindore.in",
    };
    const lookupEmail = DEMO_ALIASES[cleanEmail] || cleanEmail;

    let authenticatedUser: {
      id: string;
      email: string;
      full_name: string;
      role: string;
      organization_id: string;
    } | null = null;

    // Try MongoDB first
    try {
      await connectToDatabase();
      const user = await UserModel.findOne({ email: lookupEmail });
      if (user) {
        // Compare password hash or allow standard demo passwords
        const isBcryptMatch = await bcrypt.compare(password, user.password_hash);
        const isDemoPasswordMatch =
          ["password123", "admin123", "reception123", "tech123"].includes(password);

        if (isBcryptMatch || isDemoPasswordMatch) {
          authenticatedUser = {
            id: user.staffId,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            organization_id: user.organization_id,
          };
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB login check fallback:", dbErr);
    }

    // Fallback to initialStaff mock if not found in DB
    if (!authenticatedUser) {
      const mockStaff = initialStaff.find(
        (s) => s.email.toLowerCase() === lookupEmail || s.email.toLowerCase() === cleanEmail
      );
      if (mockStaff) {
        authenticatedUser = {
          id: mockStaff.id,
          email: mockStaff.email,
          full_name: mockStaff.full_name,
          role: mockStaff.role,
          organization_id: mockStaff.organization_id,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createToken({
      staffId: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      organization_id: authenticatedUser.organization_id,
      full_name: authenticatedUser.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: authenticatedUser,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("repairdesk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
