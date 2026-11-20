import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;

    const [metrics, allTickets] = await Promise.all([
      dbService.getDashboardMetrics(orgId),
      dbService.getTickets(orgId),
    ]);
    const recentTickets = allTickets.slice(0, 5);

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
