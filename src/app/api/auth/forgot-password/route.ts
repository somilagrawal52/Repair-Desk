import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { initialStaff } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let found = false;

    try {
      await connectToDatabase();
      const user = await UserModel.findOne({ email: cleanEmail });
      if (user) found = true;
    } catch {
      // ignore
    }

    if (!found) {
      found = initialStaff.some((s) => s.email.toLowerCase() === cleanEmail);
    }

    if (!found) {
      return NextResponse.json(
        { success: false, error: "No account found registered with this email address" },
        { status: 404 }
      );
    }

    const resetToken = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been generated for ${cleanEmail}. In development mode, use token: ${resetToken}`,
      resetToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
