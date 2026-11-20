import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";
import { OrganizationModel } from "@/lib/models/Organization";
import { initialStaff } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("repairdesk_session")?.value;
    const authHeader = request.headers.get("authorization");
    const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    // Attempt to fetch latest from DB
    try {
      await connectToDatabase();
      const user = await UserModel.findOne({ staffId: payload.staffId });
      if (user) {
        const org = await OrganizationModel.findOne({ orgId: user.organization_id });
        return NextResponse.json({
          success: true,
          authenticated: true,
          user: {
            id: user.staffId,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            organization_id: user.organization_id,
          },
          organization: org
            ? {
                id: org.orgId,
                name: org.name,
                currency: org.currency,
                timezone: org.timezone,
                ticket_prefix: org.ticket_prefix,
              }
            : null,
        });
      }
    } catch (e) {
      console.warn("DB check in /api/auth/me fallback:", e);
    }

    // Fallback using token payload or mock
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: payload.staffId,
        user_id: payload.staffId,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
        organization_id: payload.organization_id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Session validation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
