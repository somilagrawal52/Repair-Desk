import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;

    const payments = dataStore.getAllPayments(orgId);
    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch payments";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.ticket_id) {
      return NextResponse.json(
        { success: false, error: "ticket_id is required" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!body.payment_method) {
      return NextResponse.json(
        { success: false, error: "Payment method is required (cash, upi, bank_transfer, card)" },
        { status: 400 }
      );
    }

    const result = dataStore.recordPayment(
      orgId,
      body.ticket_id,
      amount,
      body.payment_method,
      body.reference_number,
      body.notes,
      body.staffId
    );

    return NextResponse.json(
      {
        success: true,
        payment: result.payment,
        ticket: result.ticket,
        receipt: result.receipt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
