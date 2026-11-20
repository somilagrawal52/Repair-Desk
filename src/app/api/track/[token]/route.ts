import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token || token.length < 5) {
      return NextResponse.json(
        { success: false, error: "Invalid tracking token" },
        { status: 400 }
      );
    }

    const ticket = await dbService.getTicketByTrackingToken(token);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "No repair found for this tracking link" },
        { status: 404 }
      );
    }

    const [organization, history, allNotes] = await Promise.all([
      dbService.getOrganization(ticket.organization_id),
      dbService.getStatusHistory(ticket.id),
      dbService.getNotes(ticket.id),
    ]);

    // Strictly filter out internal and diagnostic notes
    const customerVisibleNotes = allNotes
      .filter((n) => n.note_type === "customer_visible")
      .map((n) => ({
        id: n.id,
        content: n.content,
        created_at: n.created_at,
      }));

    // Strictly sanitize ticket to prevent leaking customer private contact info, IMEI, or tech costs
    const sanitizedTicket = {
      ticket_number: ticket.ticket_number,
      current_status: ticket.current_status,
      device_brand: ticket.device?.brand || "Device",
      device_model: ticket.device?.model || "Model",
      device_category: ticket.device?.category || "device",
      reported_problem: ticket.reported_problem,
      created_at: ticket.created_at,
      estimated_delivery_date: ticket.estimated_delivery_date,
      delivered_at: ticket.delivered_at,
    };

    const sanitizedShop = {
      name: organization.name,
      phone: organization.phone,
      email: organization.email,
      address: organization.address,
      city: organization.city,
    };

    // Customer timeline
    const timeline = history.map((h) => ({
      status: h.new_status,
      timestamp: h.created_at,
      message: h.notes,
    }));

    return NextResponse.json({
      success: true,
      ticket: sanitizedTicket,
      shop: sanitizedShop,
      timeline,
      notes: customerVisibleNotes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Tracking lookup failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
