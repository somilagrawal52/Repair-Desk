import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Note content cannot be empty" },
        { status: 400 }
      );
    }

    const noteType = body.note_type || "internal";
    const note = await dbService.addNote(
      ticketId,
      body.content,
      noteType,
      body.staffId
    );

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add note";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
