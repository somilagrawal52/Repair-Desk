import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();

    const quantity = Number(body.quantity) || 1;
    const result = dataStore.consumeInventoryPart(
      itemId,
      quantity,
      body.ticketId,
      body.staffId
    );

    return NextResponse.json({
      success: true,
      item: result.item,
      previousQuantity: result.previousQty,
      newQuantity: result.newQty,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to consume part";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
