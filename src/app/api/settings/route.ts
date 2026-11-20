import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;

    const organization = await dbService.getOrganization(orgId);
    return NextResponse.json({ success: true, organization });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    const updated = await dbService.updateOrganization(orgId, {
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      ticket_prefix: body.ticket_prefix,
      repair_terms: body.repair_terms,
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
