import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;
    const query = searchParams.get("q")?.toLowerCase();

    let items = await dbService.getInventory(orgId);

    if (query) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.sku.toLowerCase().includes(query) ||
          i.category.toLowerCase().includes(query) ||
          i.compatible_models?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch inventory";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.name || !body.sku || !body.category) {
      return NextResponse.json(
        { success: false, error: "Name, SKU, and Category are required" },
        { status: 400 }
      );
    }

    const item = await dbService.createInventoryItem(orgId, {
      name: body.name,
      sku: body.sku,
      category: body.category,
      compatible_models: body.compatible_models,
      cost_price: Number(body.cost_price) || 0,
      selling_price: Number(body.selling_price) || 0,
      quantity_on_hand: Number(body.quantity_on_hand) || 0,
      low_stock_threshold: Number(body.low_stock_threshold) || 3,
      supplier: body.supplier,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create inventory item";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
