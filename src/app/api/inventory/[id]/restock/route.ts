import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();

    const quantity = Number(body.quantity);
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Restock quantity must be greater than zero" },
        { status: 400 }
      );
    }

    const item = await dbService.restockInventoryPart(itemId, quantity, body.staffId);
    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to restock part";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
