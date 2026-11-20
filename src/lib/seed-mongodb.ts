import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { OrganizationModel } from "./models/Organization";
import { UserModel } from "./models/User";
import { CustomerModel } from "./models/Customer";
import { DeviceModel } from "./models/Device";
import { RepairTicketModel } from "./models/RepairTicket";
import { InventoryItemModel } from "./models/InventoryItem";
import { PaymentModel } from "./models/Payment";
import { EstimateModel } from "./models/Estimate";
import { TicketNoteModel } from "./models/TicketNote";
import { TicketStatusHistoryModel } from "./models/TicketStatusHistory";
import { ReceiptModel } from "./models/Receipt";
import { SequenceModel } from "./models/Sequence";
import {
  INITIAL_ORG_ID,
  initialOrganization,
  initialStaff,
  initialCustomers,
  initialDevices,
  initialTickets,
  initialInventory,
  initialEstimates,
  initialPayments,
  initialReceipts,
  initialStatusHistories,
  initialNotes,
} from "./mock-data";

export async function seedMongoDatabase(force: boolean = false) {
  await connectToDatabase();

  const orgCount = await OrganizationModel.countDocuments();
  if (orgCount > 0 && !force) {
    return { message: "Database already seeded." };
  }

  if (force) {
    await Promise.all([
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
      CustomerModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      RepairTicketModel.deleteMany({}),
      InventoryItemModel.deleteMany({}),
      PaymentModel.deleteMany({}),
      EstimateModel.deleteMany({}),
      TicketNoteModel.deleteMany({}),
      TicketStatusHistoryModel.deleteMany({}),
      ReceiptModel.deleteMany({}),
      SequenceModel.deleteMany({}),
    ]);
  }

  // 1. Organization
  await OrganizationModel.create({
    orgId: initialOrganization.id,
    name: initialOrganization.name,
    slug: initialOrganization.slug,
    phone: initialOrganization.phone,
    email: initialOrganization.email,
    address: initialOrganization.address,
    city: initialOrganization.city,
    state: initialOrganization.state,
    country: initialOrganization.country,
    currency: initialOrganization.currency,
    timezone: initialOrganization.timezone,
    ticket_prefix: initialOrganization.ticket_prefix,
    repair_terms: initialOrganization.repair_terms,
  });

  // 2. Staff Users (hashed password 'password123')
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  for (const s of initialStaff) {
    await UserModel.create({
      staffId: s.id,
      organization_id: s.organization_id,
      email: s.email,
      password_hash: defaultPasswordHash,
      full_name: s.full_name,
      role: s.role,
      is_active: s.is_active,
    });
  }

  // 3. Customers
  for (const c of initialCustomers) {
    await CustomerModel.create({
      customerId: c.id,
      organization_id: c.organization_id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      notes: c.notes,
      is_archived: c.is_archived,
    });
  }

  // 4. Devices
  for (const d of initialDevices) {
    await DeviceModel.create({
      deviceId: d.id,
      organization_id: d.organization_id,
      customer_id: d.customer_id,
      category: d.category,
      brand: d.brand,
      model: d.model,
      color: d.color || null,
      serial_number: d.serial_number || null,
    });
  }

  // 5. Sequence
  await SequenceModel.create({
    organization_id: INITIAL_ORG_ID,
    year: new Date().getFullYear(),
    last_seq: 5,
  });

  // 6. Repair Tickets
  for (const t of initialTickets) {
    await RepairTicketModel.create({
      ticketId: t.id,
      organization_id: t.organization_id,
      ticket_number: t.ticket_number,
      customer_id: t.customer_id,
      device_id: t.device_id,
      assigned_technician_id: t.assigned_technician_id,
      current_status: t.current_status,
      payment_status: t.payment_status,
      reported_problem: t.reported_problem,
      intake_notes: t.intake_notes,
      accessories_received: t.accessories_received,
      condition_checklist: t.condition_checklist,
      estimated_delivery_date: t.estimated_delivery_date ? new Date(t.estimated_delivery_date) : null,
      estimate_amount: t.estimate_amount,
      final_charge: t.final_charge,
      delivered_at: t.delivered_at ? new Date(t.delivered_at) : null,
      delivered_to_name: t.delivered_to_name,
      handover_notes: t.handover_notes,
      tracking_token: t.tracking_token,
    });
  }

  // 7. Inventory Items
  for (const i of initialInventory) {
    await InventoryItemModel.create({
      itemId: i.id,
      organization_id: i.organization_id,
      sku: i.sku,
      name: i.name,
      category: i.category,
      compatible_models: i.compatible_models,
      cost_price: i.cost_price,
      selling_price: i.selling_price,
      quantity_on_hand: i.quantity_on_hand,
      low_stock_threshold: i.low_stock_threshold,
      supplier: i.supplier,
    });
  }

  // 8. Estimates
  for (const e of initialEstimates) {
    await EstimateModel.create({
      estimateId: e.id,
      organization_id: e.organization_id,
      ticket_id: e.ticket_id,
      revision_number: e.revision_number,
      status: e.status,
      subtotal: e.subtotal,
      tax_rate: e.tax_rate,
      tax_amount: e.tax_amount,
      total_amount: e.total_amount,
      notes: e.notes,
      created_by: e.created_by,
      items: e.items,
      approval: e.approval ? { ...e.approval, decided_at: new Date(e.approval.decided_at) } : null,
    });
  }

  // 9. Payments
  for (const p of initialPayments) {
    await PaymentModel.create({
      paymentId: p.id,
      organization_id: p.organization_id,
      ticket_id: p.ticket_id,
      ticket_number: p.ticket_number || "RD-2026-000001",
      customer_id: p.customer_id,
      customer_name: p.customer_name,
      amount: p.amount,
      payment_method: p.payment_method,
      reference_number: p.reference_number,
      notes: p.notes,
      recorded_by: p.recorded_by,
      recorded_by_name: p.recorded_by_name,
    });
  }

  // 10. Receipts
  for (const r of initialReceipts) {
    await ReceiptModel.create({
      receiptId: r.id,
      organization_id: r.organization_id,
      ticket_id: r.ticket_id,
      receipt_number: r.receipt_number,
      total_charges: r.total_charges,
      total_paid: r.total_paid,
      balance_remaining: r.balance_remaining,
      notes: r.notes,
    });
  }

  // 11. Status Histories
  for (const h of initialStatusHistories) {
    await TicketStatusHistoryModel.create({
      historyId: h.id,
      ticket_id: h.ticket_id,
      old_status: h.old_status,
      new_status: h.new_status,
      changed_by: h.changed_by,
      changed_by_name: h.changed_by_name,
      notes: h.notes,
    });
  }

  // 12. Notes
  for (const n of initialNotes) {
    await TicketNoteModel.create({
      noteId: n.id,
      ticket_id: n.ticket_id,
      author_id: n.author_id,
      author_name: n.author_name,
      note_type: n.note_type,
      content: n.content,
    });
  }

  return { message: "MongoDB seeded successfully with TechFix Repair Center data." };
}
