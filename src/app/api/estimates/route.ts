import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.ticket_id) {
      return NextResponse.json(
        { success: false, error: "ticket_id is required" },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one line item (part or labour) is required" },
        { status: 400 }
      );
    }

    const estimate = dataStore.createEstimate(
      orgId,
      body.ticket_id,
      body.items,
      body.notes,
      body.staffId
    );

    return NextResponse.json({ success: true, estimate }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create estimate";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
