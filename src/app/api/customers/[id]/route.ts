import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const customer = await dbService.getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const [devices, allTickets] = await Promise.all([
      dbService.getDevicesByCustomerId(customerId),
      dbService.getTickets(customer.organization_id),
    ]);
    const tickets = allTickets.filter((t) => t.customer_id === customerId);

    return NextResponse.json({
      success: true,
      customer,
      devices,
      tickets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();

    const updated = await dbService.updateCustomer(customerId, body);
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update customer";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
