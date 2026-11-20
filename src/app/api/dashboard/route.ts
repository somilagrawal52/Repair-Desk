import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;

    const metrics = dataStore.getDashboardMetrics(orgId);
    const recentTickets = dataStore.getTickets(orgId).slice(0, 5);

    return NextResponse.json({
      success: true,
      metrics,
      recentTickets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard metrics";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
