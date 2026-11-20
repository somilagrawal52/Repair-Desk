import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-service";
import { INITIAL_ORG_ID } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || INITIAL_ORG_ID;
    const query = searchParams.get("q")?.toLowerCase();

    let customers = dataStore.getCustomers(orgId);

    if (query) {
      customers = customers.filter(
        (c) =>
          c.full_name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, customers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.organizationId || INITIAL_ORG_ID;

    if (!body.full_name || !body.phone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone number are required" },
        { status: 400 }
      );
    }

    // Check duplicate phone warning
    const existing = dataStore.findCustomerByPhone(body.phone, orgId);
    if (existing && !body.allowDuplicate) {
      return NextResponse.json(
        {
          success: false,
          warning: "duplicate_phone",
          message: `A customer named '${existing.full_name}' already exists with phone number ${existing.phone}.`,
          existingCustomer: existing,
        },
        { status: 409 }
      );
    }

    const customer = dataStore.createCustomer(orgId, {
      full_name: body.full_name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
