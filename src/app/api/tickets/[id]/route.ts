import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const ticket = await dbService.getTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Repair ticket not found" },
        { status: 404 }
      );
    }

    const [history, notes, estimates, payments, receipt, organization] = await Promise.all([
      dbService.getStatusHistory(ticketId),
      dbService.getNotes(ticketId),
      dbService.getEstimatesByTicketId(ticketId),
      dbService.getPaymentsByTicketId(ticketId),
      dbService.getReceiptByTicketId(ticketId),
      dbService.getOrganization(ticket.organization_id),
    ]);

    return NextResponse.json({
      success: true,
      ticket,
      organization,
      history,
      notes,
      estimates,
      payments,
      receipt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch ticket";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();

    let updatedTicket;

    if (body.action === "update_status") {
      if (!body.status) {
        return NextResponse.json(
          { success: false, error: "New status is required" },
          { status: 400 }
        );
      }
      updatedTicket = await dbService.updateTicketStatus(
        ticketId,
        body.status,
        body.staffId,
        body.notes
      );
    } else if (body.action === "assign_technician") {
      updatedTicket = await dbService.assignTechnician(
        ticketId,
        body.technicianId,
        body.staffId
      );
    } else if (body.action === "complete_handover") {
      if (!body.recipientName) {
        return NextResponse.json(
          { success: false, error: "Recipient name is required for delivery" },
          { status: 400 }
        );
      }
      updatedTicket = await dbService.completeHandover(
        ticketId,
        body.recipientName,
        body.handoverNotes,
        body.staffId
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Unknown action specified" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update ticket";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
