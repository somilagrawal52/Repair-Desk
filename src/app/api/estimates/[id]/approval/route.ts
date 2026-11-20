import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimateId = params.id;
    const body = await request.json();

    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    if (!body.channel) {
      return NextResponse.json(
        { success: false, error: "Communication channel is required (e.g. phone_call, in_person, whatsapp)" },
        { status: 400 }
      );
    }

    const updated = dataStore.recordEstimateApproval(estimateId, {
      status: body.status,
      channel: body.channel,
      notes: body.notes,
      staffId: body.staffId,
    });

    return NextResponse.json({ success: true, estimate: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record estimate approval";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
