import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;
    const status = searchParams.get("status");
    const techId = searchParams.get("techId");
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();

    let tickets = await dbService.getTickets(orgId);

    if (status && status !== "all") {
      tickets = tickets.filter((t) => t.current_status === status);
    }

    if (techId && techId !== "all") {
      tickets = tickets.filter((t) => t.assigned_technician_id === techId);
    }

    if (category && category !== "all") {
      tickets = tickets.filter((t) => t.device?.category === category);
    }

    if (query) {
      tickets = tickets.filter(
        (t) =>
          t.ticket_number.toLowerCase().includes(query) ||
          t.customer?.full_name.toLowerCase().includes(query) ||
          t.customer?.phone.includes(query) ||
          t.device?.model.toLowerCase().includes(query) ||
          t.device?.brand.toLowerCase().includes(query) ||
          t.reported_problem.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch tickets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.reported_problem) {
      return NextResponse.json(
        { success: false, error: "Reported problem is required" },
        { status: 400 }
      );
    }

    if (!body.deviceData?.brand || !body.deviceData?.model) {
      return NextResponse.json(
        { success: false, error: "Device brand and model are required" },
        { status: 400 }
      );
    }

    const ticket = await dbService.createTicket(orgId, {
      customerId: body.customerId,
      customerData: body.customerData,
      deviceData: body.deviceData,
      reported_problem: body.reported_problem,
      intake_notes: body.intake_notes,
      accessories_received: body.accessories_received,
      condition_checklist: body.condition_checklist || {
        screen_condition: "flawless",
        power_status: "turns_on",
        charging_status: "charges_normally",
        liquid_damage: "none_visible",
        body_condition: "excellent",
        accessories_received: [],
      },
      estimated_delivery_date: body.estimated_delivery_date,
      estimate_amount: body.estimate_amount,
      assigned_technician_id: body.assigned_technician_id,
      created_by_staff_id: body.created_by_staff_id,
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create ticket";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
