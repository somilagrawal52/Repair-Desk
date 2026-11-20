import {
  Organization,
  OrganizationMember,
  Customer,
  Device,
  RepairTicket,
  RepairStatus,
  PaymentStatus,
  PaymentMethod,
  TicketStatusHistory,
  TicketNote,
  TicketAttachment,
  Estimate,
  EstimateItem,
  InventoryItem,
  Payment,
  Receipt,
  AuditLog,
  ConditionChecklist,
} from "@/types";

import {
  INITIAL_ORG_ID,
  initialOrganization,
  initialStaff,
  initialCustomers,
  initialDevices,
  initialTickets,
  initialStatusHistories,
  initialNotes,
  initialInventory,
  initialEstimates,
  initialPayments,
  initialReceipts,
  initialAuditLogs,
} from "./mock-data";

// In-memory data store for development, demonstration, and tests
// Note: When Supabase credentials are configured in .env.local, queries can route to Supabase.
class DataStore {
  private organization: Organization = { ...initialOrganization };
  private staff: OrganizationMember[] = [...initialStaff];
  private customers: Customer[] = [...initialCustomers];
  private devices: Device[] = [...initialDevices];
  private tickets: RepairTicket[] = [...initialTickets];
  private statusHistories: TicketStatusHistory[] = [...initialStatusHistories];
  private notes: TicketNote[] = [...initialNotes];
  private attachments: TicketAttachment[] = [];
  private inventory: InventoryItem[] = [...initialInventory];
  private estimates: Estimate[] = [...initialEstimates];
  private payments: Payment[] = [...initialPayments];
  private receipts: Receipt[] = [...initialReceipts];
  private auditLogs: AuditLog[] = [...initialAuditLogs];

  private ticketCounter: number = 6;
  private receiptCounter: number = 6;
  private idCounter: number = 1000;

  private generateUniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${++this.idCounter}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // --------------------------------------------------------------------------
  // ORGANIZATION & STAFF
  // --------------------------------------------------------------------------
  getOrganization(orgId: string = INITIAL_ORG_ID): Organization {
    return this.organization;
  }

  updateOrganization(orgId: string, updates: Partial<Organization>): Organization {
    this.organization = {
      ...this.organization,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.organization;
  }

  getStaffMembers(orgId: string = INITIAL_ORG_ID): OrganizationMember[] {
    return this.staff.filter((m) => m.organization_id === orgId && m.is_active);
  }

  getStaffById(staffId: string): OrganizationMember | undefined {
    return this.staff.find((m) => m.id === staffId);
  }

  addStaffMember(
    orgId: string,
    member: Omit<OrganizationMember, "id" | "created_at" | "updated_at">
  ): OrganizationMember {
    const newMember: OrganizationMember = {
      ...member,
      id: this.generateUniqueId("staff"),
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.staff.push(newMember);
    return newMember;
  }

  // --------------------------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------------------------
  getCustomers(orgId: string = INITIAL_ORG_ID): Customer[] {
    return this.customers.filter((c) => c.organization_id === orgId && !c.is_archived);
  }

  getCustomerById(customerId: string): Customer | undefined {
    return this.customers.find((c) => c.id === customerId);
  }

  findCustomerByPhone(phone: string, orgId: string = INITIAL_ORG_ID): Customer | undefined {
    const clean = phone.replace(/\D/g, "");
    return this.customers.find(
      (c) =>
        c.organization_id === orgId &&
        !c.is_archived &&
        c.phone.replace(/\D/g, "").includes(clean)
    );
  }

  createCustomer(
    orgId: string,
    data: {
      full_name: string;
      phone: string;
      email?: string | null;
      address?: string | null;
      notes?: string | null;
    }
  ): Customer {
    const newCustomer: Customer = {
      id: this.generateUniqueId("cust"),
      organization_id: orgId,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.customers.push(newCustomer);
    this.logAudit(orgId, null, "CUSTOMER_CREATED", "customer", newCustomer.id, {
      name: newCustomer.full_name,
      phone: newCustomer.phone,
    });
    return newCustomer;
  }

  updateCustomer(
    customerId: string,
    data: Partial<Omit<Customer, "id" | "organization_id" | "created_at">>
  ): Customer {
    const idx = this.customers.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error("Customer not found");
    this.customers[idx] = {
      ...this.customers[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.customers[idx];
  }

  archiveCustomer(customerId: string): void {
    const customer = this.getCustomerById(customerId);
    if (!customer) throw new Error("Customer not found");
    customer.is_archived = true;
    customer.updated_at = new Date().toISOString();
  }

  // --------------------------------------------------------------------------
  // DEVICES
  // --------------------------------------------------------------------------
  getDevicesByCustomerId(customerId: string): Device[] {
    return this.devices.filter((d) => d.customer_id === customerId);
  }

  getDeviceById(deviceId: string): Device | undefined {
    return this.devices.find((d) => d.id === deviceId);
  }

  createDevice(
    orgId: string,
    data: Omit<Device, "id" | "organization_id" | "created_at" | "updated_at">
  ): Device {
    const newDevice: Device = {
      ...data,
      id: this.generateUniqueId("dev"),
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.devices.push(newDevice);
    return newDevice;
  }

  // --------------------------------------------------------------------------
  // REPAIR TICKETS
  // --------------------------------------------------------------------------
  generateTicketNumber(prefix: string = "RD"): string {
    const year = new Date().getFullYear();
    const seqStr = String(this.ticketCounter++).padStart(6, "0");
    return `${prefix}-${year}-${seqStr}`;
  }

  generateTrackingToken(): string {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let token = "rd-";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) token += "-";
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  getTickets(orgId: string = INITIAL_ORG_ID): RepairTicket[] {
    return this.tickets
      .filter((t) => t.organization_id === orgId)
      .map((t) => this.hydrateTicket(t))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getTicketById(ticketId: string): RepairTicket | undefined {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    return ticket ? this.hydrateTicket(ticket) : undefined;
  }

  getTicketByNumber(ticketNumber: string, orgId: string = INITIAL_ORG_ID): RepairTicket | undefined {
    const ticket = this.tickets.find(
      (t) => t.ticket_number.toLowerCase() === ticketNumber.toLowerCase() && t.organization_id === orgId
    );
    return ticket ? this.hydrateTicket(ticket) : undefined;
  }

  getTicketByTrackingToken(token: string): RepairTicket | undefined {
    const ticket = this.tickets.find((t) => t.tracking_token === token);
    return ticket ? this.hydrateTicket(ticket) : undefined;
  }

  private hydrateTicket(ticket: RepairTicket): RepairTicket {
    const customer = this.getCustomerById(ticket.customer_id);
    const device = this.getDeviceById(ticket.device_id);
    const technician = ticket.assigned_technician_id
      ? this.getStaffById(ticket.assigned_technician_id)
      : undefined;

    return {
      ...ticket,
      customer,
      device,
      technician,
    };
  }

  createTicket(
    orgId: string,
    params: {
      customerId?: string;
      customerData?: {
        full_name: string;
        phone: string;
        email?: string;
        address?: string;
      };
      deviceData: {
        category: Device["category"];
        brand: string;
        model: string;
        color?: string;
        serial_number?: string;
      };
      reported_problem: string;
      intake_notes?: string;
      accessories_received?: string;
      condition_checklist: ConditionChecklist;
      estimated_delivery_date?: string;
      estimate_amount?: number;
      assigned_technician_id?: string;
      created_by_staff_id?: string;
    }
  ): RepairTicket {
    // 1. Resolve or create customer
    let customer: Customer;
    if (params.customerId) {
      const existing = this.getCustomerById(params.customerId);
      if (!existing) throw new Error("Customer not found");
      customer = existing;
    } else if (params.customerData) {
      customer = this.createCustomer(orgId, params.customerData);
    } else {
      throw new Error("Either customerId or customerData must be provided");
    }

    // 2. Create device
    const device = this.createDevice(orgId, {
      customer_id: customer.id,
      category: params.deviceData.category,
      brand: params.deviceData.brand.trim(),
      model: params.deviceData.model.trim(),
      color: params.deviceData.color?.trim() || null,
      serial_number: params.deviceData.serial_number?.trim() || null,
    });

    // 3. Generate unique ticket number and tracking token
    const ticketNumber = this.generateTicketNumber(this.organization.ticket_prefix);
    const trackingToken = this.generateTrackingToken();
    const now = new Date().toISOString();

    const newTicket: RepairTicket = {
      id: this.generateUniqueId("ticket"),
      organization_id: orgId,
      ticket_number: ticketNumber,
      customer_id: customer.id,
      device_id: device.id,
      assigned_technician_id: params.assigned_technician_id || null,
      current_status: "received",
      payment_status: "unpaid",
      reported_problem: params.reported_problem.trim(),
      intake_notes: params.intake_notes?.trim() || null,
      accessories_received: params.accessories_received?.trim() || null,
      condition_checklist: params.condition_checklist,
      estimated_delivery_date: params.estimated_delivery_date || null,
      estimate_amount: Number(params.estimate_amount) || 0.0,
      final_charge: Number(params.estimate_amount) || 0.0,
      tracking_token: trackingToken,
      created_at: now,
      updated_at: now,
    };

    this.tickets.push(newTicket);

    // Record initial status history
    const creator = params.created_by_staff_id
      ? this.getStaffById(params.created_by_staff_id)
      : undefined;

    this.statusHistories.push({
      id: this.generateUniqueId("hist"),
      ticket_id: newTicket.id,
      old_status: null,
      new_status: "received",
      changed_by: creator?.id || null,
      changed_by_name: creator?.full_name || "Reception Desk",
      notes: "Device intake registered. Job card created.",
      created_at: now,
    });

    this.logAudit(orgId, creator?.id || null, "TICKET_CREATED", "repair_ticket", newTicket.id, {
      ticket_number: newTicket.ticket_number,
      customer: customer.full_name,
      device: `${device.brand} ${device.model}`,
    });

    return this.hydrateTicket(newTicket);
  }

  updateTicketStatus(
    ticketId: string,
    newStatus: RepairStatus,
    staffId?: string,
    notes?: string
  ): RepairTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error("Repair ticket not found");

    if (ticket.current_status === "delivered" && newStatus !== "delivered") {
      throw new Error(
        "Delivered repairs cannot be altered directly. Please use an audited reopening workflow."
      );
    }

    const oldStatus = ticket.current_status;
    ticket.current_status = newStatus;
    ticket.updated_at = new Date().toISOString();

    const staff = staffId ? this.getStaffById(staffId) : undefined;

    this.statusHistories.push({
      id: this.generateUniqueId("hist"),
      ticket_id: ticket.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: staff?.id || null,
      changed_by_name: staff?.full_name || "Staff",
      notes: notes || `Status updated to ${newStatus.replace(/_/g, " ")}.`,
      created_at: new Date().toISOString(),
    });

    this.logAudit(ticket.organization_id, staff?.id || null, "STATUS_UPDATED", "repair_ticket", ticket.id, {
      old_status: oldStatus,
      new_status: newStatus,
      notes,
    });

    return this.hydrateTicket(ticket);
  }

  assignTechnician(ticketId: string, technicianId: string | null, actorId?: string): RepairTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error("Repair ticket not found");

    ticket.assigned_technician_id = technicianId;
    ticket.updated_at = new Date().toISOString();

    const tech = technicianId ? this.getStaffById(technicianId) : null;
    const actor = actorId ? this.getStaffById(actorId) : null;

    this.logAudit(ticket.organization_id, actor?.id || null, "TECHNICIAN_ASSIGNED", "repair_ticket", ticket.id, {
      technician: tech?.full_name || "Unassigned",
    });

    return this.hydrateTicket(ticket);
  }

  completeHandover(
    ticketId: string,
    recipientName: string,
    handoverNotes?: string,
    staffId?: string
  ): RepairTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error("Repair ticket not found");

    ticket.current_status = "delivered";
    ticket.delivered_at = new Date().toISOString();
    ticket.delivered_to_name = recipientName.trim();
    ticket.handover_notes = handoverNotes?.trim() || null;
    ticket.updated_at = new Date().toISOString();

    const staff = staffId ? this.getStaffById(staffId) : undefined;

    this.statusHistories.push({
      id: this.generateUniqueId("hist"),
      ticket_id: ticket.id,
      old_status: "ready_for_pickup",
      new_status: "delivered",
      changed_by: staff?.id || null,
      changed_by_name: staff?.full_name || "Reception Desk",
      notes: `Device delivered to ${recipientName}. ${handoverNotes || ""}`.trim(),
      created_at: new Date().toISOString(),
    });

    return this.hydrateTicket(ticket);
  }

  // --------------------------------------------------------------------------
  // STATUS HISTORY & NOTES
  // --------------------------------------------------------------------------
  getStatusHistory(ticketId: string): TicketStatusHistory[] {
    return this.statusHistories
      .filter((h) => h.ticket_id === ticketId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  getNotes(ticketId: string): TicketNote[] {
    return this.notes
      .filter((n) => n.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addNote(
    ticketId: string,
    content: string,
    noteType: "internal" | "diagnostic" | "customer_visible",
    staffId?: string
  ): TicketNote {
    const staff = staffId ? this.getStaffById(staffId) : undefined;
    const newNote: TicketNote = {
      id: this.generateUniqueId("note"),
      ticket_id: ticketId,
      author_id: staff?.id || null,
      author_name: staff?.full_name || "Staff Member",
      note_type: noteType,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    this.notes.push(newNote);
    return newNote;
  }

  getAttachments(ticketId: string): TicketAttachment[] {
    return this.attachments
      .filter((a) => a.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addAttachment(
    ticketId: string,
    data: {
      category: "intake" | "diagnosis" | "repair" | "handover";
      file_url: string;
      file_name: string;
      file_size?: number;
      mime_type?: string;
      uploaded_by?: string | null;
    }
  ): TicketAttachment {
    const attachment: TicketAttachment = {
      id: this.generateUniqueId("att"),
      ticket_id: ticketId,
      category: data.category,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      mime_type: data.mime_type,
      uploaded_by: data.uploaded_by || null,
      created_at: new Date().toISOString(),
    };
    this.attachments.push(attachment);
    return attachment;
  }

  // --------------------------------------------------------------------------
  // ESTIMATES
  // --------------------------------------------------------------------------
  getEstimatesByTicketId(ticketId: string): Estimate[] {
    return this.estimates.filter((e) => e.ticket_id === ticketId);
  }

  getAllEstimates(orgId: string = INITIAL_ORG_ID): Estimate[] {
    return this.estimates.filter((e) => e.organization_id === orgId);
  }

  createEstimate(
    orgId: string,
    ticketId: string,
    items: Array<{
      item_type: "part" | "labour";
      description: string;
      quantity: number;
      unit_price: number;
    }>,
    notes?: string,
    staffId?: string
  ): Estimate {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    let subtotal = 0;
    const estimateItems: EstimateItem[] = items.map((item) => {
      const total_price = Math.round(item.quantity * item.unit_price * 100) / 100;
      subtotal += total_price;
      return {
        id: this.generateUniqueId("est-item"),
        estimate_id: "",
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price,
        created_at: new Date().toISOString(),
      };
    });

    const tax_rate = 0;
    const tax_amount = 0;
    const total_amount = subtotal;

    const newEstimate: Estimate = {
      id: this.generateUniqueId("est"),
      organization_id: orgId,
      ticket_id: ticketId,
      revision_number: this.estimates.filter((e) => e.ticket_id === ticketId).length + 1,
      status: "draft",
      subtotal,
      tax_rate,
      tax_amount,
      total_amount,
      notes: notes || null,
      created_by: staffId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: estimateItems,
      approval: null,
    };

    estimateItems.forEach((item) => (item.estimate_id = newEstimate.id));
    this.estimates.push(newEstimate);

    // Update ticket estimate amount
    const ticketRef = this.tickets.find((t) => t.id === ticketId);
    if (ticketRef) {
      ticketRef.estimate_amount = total_amount;
      ticketRef.final_charge = total_amount;
    }

    return newEstimate;
  }

  recordEstimateApproval(
    estimateId: string,
    params: {
      status: "approved" | "rejected";
      channel: "in_person" | "phone_call" | "whatsapp" | "email";
      notes?: string;
      staffId?: string;
    }
  ): Estimate {
    const estimate = this.estimates.find((e) => e.id === estimateId);
    if (!estimate) throw new Error("Estimate not found");

    const staff = params.staffId ? this.getStaffById(params.staffId) : undefined;

    estimate.status = params.status;
    estimate.updated_at = new Date().toISOString();
    estimate.approval = {
      id: this.generateUniqueId("appr"),
      estimate_id: estimate.id,
      status: params.status,
      channel: params.channel,
      recorded_by: staff?.id || null,
      recorded_by_name: staff?.full_name || "Staff",
      decision_notes: params.notes || null,
      decided_at: new Date().toISOString(),
    };

    if (params.status === "approved") {
      const ticket = this.tickets.find((t) => t.id === estimate.ticket_id);
      if (ticket) {
        ticket.final_charge = estimate.total_amount;
        if (ticket.current_status === "awaiting_approval") {
          this.updateTicketStatus(
            ticket.id,
            "in_repair",
            params.staffId,
            `Customer approved estimate of ₹${estimate.total_amount} via ${params.channel.replace(/_/g, " ")}.`
          );
        }
      }
    }

    return estimate;
  }

  // --------------------------------------------------------------------------
  // PAYMENTS & RECEIPTS
  // --------------------------------------------------------------------------
  getPaymentsByTicketId(ticketId: string): Payment[] {
    return this.payments.filter((p) => p.ticket_id === ticketId);
  }

  getAllPayments(orgId: string = INITIAL_ORG_ID): Payment[] {
    return this.payments
      .filter((p) => p.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  recordPayment(
    orgId: string,
    ticketId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    referenceNumber?: string,
    notes?: string,
    staffId?: string
  ): { payment: Payment; ticket: RepairTicket; receipt?: Receipt } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found");

    if (amount <= 0) throw new Error("Payment amount must be greater than zero");

    const staff = staffId ? this.getStaffById(staffId) : undefined;
    const now = new Date().toISOString();

    const payment: Payment = {
      id: this.generateUniqueId("pay"),
      organization_id: orgId,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      customer_id: ticket.customer_id,
      customer_name: ticket.customer?.full_name,
      amount: Math.round(amount * 100) / 100,
      payment_method: paymentMethod,
      reference_number: referenceNumber?.trim() || null,
      notes: notes?.trim() || null,
      recorded_by: staff?.id || null,
      recorded_by_name: staff?.full_name || "Reception Desk",
      created_at: now,
    };

    this.payments.push(payment);

    // Recalculate total paid
    const allTicketPayments = this.payments.filter((p) => p.ticket_id === ticket.id);
    const totalPaid = allTicketPayments.reduce((sum, p) => sum + p.amount, 0);

    const ticketRef = this.tickets.find((t) => t.id === ticket.id)!;
    const finalCharge = ticketRef.final_charge || ticketRef.estimate_amount || 0;

    if (totalPaid >= finalCharge && finalCharge > 0) {
      ticketRef.payment_status = "fully_paid";
    } else if (totalPaid > 0) {
      ticketRef.payment_status = "partially_paid";
    } else {
      ticketRef.payment_status = "unpaid";
    }
    ticketRef.updated_at = now;

    // Generate receipt
    const receiptYear = new Date().getFullYear();
    const receiptNum = `RCP-${receiptYear}-${String(this.receiptCounter++).padStart(6, "0")}`;
    const receipt: Receipt = {
      id: this.generateUniqueId("rcpt"),
      organization_id: orgId,
      ticket_id: ticket.id,
      receipt_number: receiptNum,
      total_charges: finalCharge,
      total_paid: totalPaid,
      balance_remaining: Math.max(0, finalCharge - totalPaid),
      notes: notes || `Payment recorded via ${paymentMethod.toUpperCase()}`,
      created_at: now,
    };
    this.receipts.push(receipt);

    this.logAudit(orgId, staff?.id || null, "PAYMENT_RECORDED", "payment", payment.id, {
      ticket_number: ticket.ticket_number,
      amount: payment.amount,
      method: paymentMethod,
    });

    return {
      payment,
      ticket: this.hydrateTicket(ticketRef),
      receipt,
    };
  }

  getReceiptByTicketId(ticketId: string): Receipt | undefined {
    return this.receipts.slice().reverse().find((r) => r.ticket_id === ticketId);
  }

  // --------------------------------------------------------------------------
  // INVENTORY
  // --------------------------------------------------------------------------
  getInventory(orgId: string = INITIAL_ORG_ID): InventoryItem[] {
    return this.inventory
      .filter((i) => i.organization_id === orgId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getInventoryItemById(itemId: string): InventoryItem | undefined {
    return this.inventory.find((i) => i.id === itemId);
  }

  createInventoryItem(
    orgId: string,
    data: Omit<InventoryItem, "id" | "organization_id" | "created_at" | "updated_at">
  ): InventoryItem {
    const existing = this.inventory.find(
      (i) => i.organization_id === orgId && i.sku.toLowerCase() === data.sku.toLowerCase()
    );
    if (existing) {
      throw new Error(`An inventory item with SKU '${data.sku}' already exists.`);
    }

    const newItem: InventoryItem = {
      ...data,
      id: this.generateUniqueId("inv"),
      organization_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.inventory.push(newItem);
    return newItem;
  }

  updateInventoryItem(
    itemId: string,
    data: Partial<Omit<InventoryItem, "id" | "organization_id" | "created_at">>
  ): InventoryItem {
    const item = this.getInventoryItemById(itemId);
    if (!item) throw new Error("Inventory item not found");

    Object.assign(item, data, { updated_at: new Date().toISOString() });
    return item;
  }

  consumeInventoryPart(
    itemId: string,
    quantity: number,
    ticketId?: string,
    staffId?: string
  ): { item: InventoryItem; previousQty: number; newQty: number } {
    const item = this.getInventoryItemById(itemId);
    if (!item) throw new Error("Inventory item not found");

    if (quantity <= 0) throw new Error("Quantity to consume must be greater than 0");
    if (item.quantity_on_hand < quantity) {
      throw new Error(
        `Insufficient stock for '${item.name}'. Available: ${item.quantity_on_hand}, Requested: ${quantity}`
      );
    }

    const previousQty = item.quantity_on_hand;
    const newQty = previousQty - quantity;
    item.quantity_on_hand = newQty;
    item.updated_at = new Date().toISOString();

    return { item, previousQty, newQty };
  }

  restockInventoryPart(itemId: string, quantity: number, staffId?: string): InventoryItem {
    const item = this.getInventoryItemById(itemId);
    if (!item) throw new Error("Inventory item not found");

    if (quantity <= 0) throw new Error("Restock quantity must be greater than 0");
    item.quantity_on_hand += quantity;
    item.updated_at = new Date().toISOString();
    return item;
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  private logAudit(
    orgId: string,
    actorId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): void {
    const actor = actorId ? this.getStaffById(actorId) : undefined;
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      organization_id: orgId,
      actor_id: actorId,
      actor_name: actor?.full_name || "System",
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || null,
      created_at: new Date().toISOString(),
    });
  }

  getAuditLogs(orgId: string = INITIAL_ORG_ID, limit: number = 50): AuditLog[] {
    return this.auditLogs.filter((a) => a.organization_id === orgId).slice(0, limit);
  }

  // --------------------------------------------------------------------------
  // DASHBOARD METRICS
  // --------------------------------------------------------------------------
  getDashboardMetrics(orgId: string = INITIAL_ORG_ID) {
    const tickets = this.tickets.filter((t) => t.organization_id === orgId);
    const payments = this.payments.filter((p) => p.organization_id === orgId);
    const inventory = this.inventory.filter((i) => i.organization_id === orgId);

    const todayStr = new Date().toISOString().slice(0, 10);

    const totalTickets = tickets.length;
    const newTicketsToday = tickets.filter((t) => t.created_at.startsWith(todayStr)).length;
    const inRepairCount = tickets.filter((t) => t.current_status === "in_repair").length;
    const awaitingApprovalCount = tickets.filter((t) => t.current_status === "awaiting_approval").length;
    const waitingForPartsCount = tickets.filter((t) => t.current_status === "waiting_for_parts").length;
    const readyForPickupCount = tickets.filter((t) => t.current_status === "ready_for_pickup").length;
    const deliveredCount = tickets.filter((t) => t.current_status === "delivered").length;

    // Overdue repairs: not delivered/cancelled AND delivery date is past
    const nowTime = new Date().getTime();
    const overdueCount = tickets.filter(
      (t) =>
        t.current_status !== "delivered" &&
        t.current_status !== "cancelled" &&
        t.estimated_delivery_date &&
        new Date(t.estimated_delivery_date).getTime() < nowTime
    ).length;

    // Revenue collected
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Outstanding balance across active repairs
    const totalCharges = tickets.reduce((sum, t) => sum + (t.final_charge || t.estimate_amount || 0), 0);
    const outstandingBalance = Math.max(0, totalCharges - totalRevenue);

    // Low stock items
    const lowStockItems = inventory.filter((i) => i.quantity_on_hand <= i.low_stock_threshold);

    // Status breakdown
    const statusCounts: Record<RepairStatus, number> = {
      received: 0,
      under_diagnosis: 0,
      awaiting_approval: 0,
      waiting_for_parts: 0,
      in_repair: 0,
      quality_check: 0,
      ready_for_pickup: 0,
      delivered: 0,
      cancelled: 0,
      unrepairable: 0,
    };
    tickets.forEach((t) => {
      statusCounts[t.current_status] = (statusCounts[t.current_status] || 0) + 1;
    });

    // Technician workloads
    const staffMembers = this.getStaffMembers(orgId);
    const technicianWorkload = staffMembers
      .filter((s) => s.role === "technician" || s.role === "owner")
      .map((tech) => {
        const assigned = tickets.filter(
          (t) =>
            t.assigned_technician_id === tech.id &&
            t.current_status !== "delivered" &&
            t.current_status !== "cancelled"
        ).length;
        return {
          id: tech.id,
          name: tech.full_name,
          role: tech.role,
          activeJobs: assigned,
        };
      });

    return {
      totalTickets,
      newTicketsToday,
      inRepairCount,
      awaitingApprovalCount,
      waitingForPartsCount,
      readyForPickupCount,
      deliveredCount,
      overdueCount,
      totalRevenue,
      outstandingBalance,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      statusCounts,
      technicianWorkload,
    };
  }
}

// Global singleton instance
export const dataStore = new DataStore();
