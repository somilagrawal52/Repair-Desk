import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;

    const staff = await dbService.getStaffMembers(orgId);
    return NextResponse.json({ success: true, staff });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch staff members";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.full_name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: "Full name, email address, and role are required" },
        { status: 400 }
      );
    }

    const member = await dbService.createStaffMember(orgId, {
      full_name: body.full_name,
      email: body.email,
      role: body.role,
      password: body.password || "staff123",
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create staff member";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
