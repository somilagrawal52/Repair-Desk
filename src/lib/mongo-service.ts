import { connectToDatabase } from "./mongodb";
import { OrganizationModel } from "./models/Organization";
import { UserModel } from "./models/User";
import { CustomerModel } from "./models/Customer";
import { DeviceModel } from "./models/Device";
import { RepairTicketModel } from "./models/RepairTicket";
import { SequenceModel } from "./models/Sequence";
import { InventoryItemModel } from "./models/InventoryItem";
import { PaymentModel } from "./models/Payment";
import { EstimateModel } from "./models/Estimate";
import { TicketNoteModel } from "./models/TicketNote";
import { TicketAttachmentModel } from "./models/TicketAttachment";
import { TicketStatusHistoryModel } from "./models/TicketStatusHistory";
import { ReceiptModel } from "./models/Receipt";
import { AuditLogModel } from "./models/AuditLog";
import {
  Organization,
  OrganizationMember,
  Customer,
  Device,
  RepairTicket,
  RepairStatus,
  PaymentMethod,
  TicketStatusHistory,
  TicketNote,
  TicketAttachment,
  Estimate,
  InventoryItem,
  Payment,
  Receipt,
  ConditionChecklist,
} from "@/types";
import { INITIAL_ORG_ID } from "./mock-data";

class MongoService {
  // --------------------------------------------------------------------------
  // ORGANIZATION & STAFF
  // --------------------------------------------------------------------------
  async getOrganization(orgId: string = INITIAL_ORG_ID): Promise<Organization | null> {
    await connectToDatabase();
    const doc = await OrganizationModel.findOne({ orgId });
    if (!doc) return null;
    return {
      id: doc.orgId,
      name: doc.name,
      slug: doc.slug,
      phone: doc.phone,
      email: doc.email,
      address: doc.address,
      city: doc.city,
      state: doc.state,
      country: doc.country,
      currency: doc.currency,
      timezone: doc.timezone,
      logo_url: doc.logo_url || null,
      ticket_prefix: doc.ticket_prefix,
      repair_terms: doc.repair_terms,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async getStaffMembers(orgId: string = INITIAL_ORG_ID): Promise<OrganizationMember[]> {
    await connectToDatabase();
    const docs = await UserModel.find({ organization_id: orgId, is_active: true });
    return docs.map((d) => ({
      id: d.staffId,
      organization_id: d.organization_id,
      user_id: d._id.toString(),
      email: d.email,
      full_name: d.full_name,
      role: d.role,
      is_active: d.is_active,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
    }));
  }

  async getStaffById(staffId: string): Promise<OrganizationMember | null> {
    await connectToDatabase();
    const doc = await UserModel.findOne({ staffId });
    if (!doc) return null;
    return {
      id: doc.staffId,
      organization_id: doc.organization_id,
      user_id: doc._id.toString(),
      email: doc.email,
      full_name: doc.full_name,
      role: doc.role,
      is_active: doc.is_active,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------------------------
  async getCustomers(orgId: string = INITIAL_ORG_ID): Promise<Customer[]> {
    await connectToDatabase();
    const docs = await CustomerModel.find({ organization_id: orgId, is_archived: false }).sort({ created_at: -1 });
    return docs.map((d) => ({
      id: d.customerId,
      organization_id: d.organization_id,
      full_name: d.full_name,
      phone: d.phone,
      email: d.email || null,
      address: d.address || null,
      notes: d.notes || null,
      is_archived: d.is_archived,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
    }));
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    await connectToDatabase();
    const doc = await CustomerModel.findOne({ customerId });
    if (!doc) return null;
    return {
      id: doc.customerId,
      organization_id: doc.organization_id,
      full_name: doc.full_name,
      phone: doc.phone,
      email: doc.email || null,
      address: doc.address || null,
      notes: doc.notes || null,
      is_archived: doc.is_archived,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async findCustomerByPhone(phone: string, orgId: string = INITIAL_ORG_ID): Promise<Customer | null> {
    await connectToDatabase();
    const clean = phone.replace(/\D/g, "");
    const docs = await CustomerModel.find({ organization_id: orgId, is_archived: false });
    const match = docs.find((d) => d.phone.replace(/\D/g, "").includes(clean));
    if (!match) return null;
    return {
      id: match.customerId,
      organization_id: match.organization_id,
      full_name: match.full_name,
      phone: match.phone,
      email: match.email || null,
      address: match.address || null,
      notes: match.notes || null,
      is_archived: match.is_archived,
      created_at: match.created_at.toISOString(),
      updated_at: match.updated_at.toISOString(),
    };
  }

  async createCustomer(
    orgId: string,
    data: { full_name: string; phone: string; email?: string | null; address?: string | null; notes?: string | null }
  ): Promise<Customer> {
    await connectToDatabase();
    const customerId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc = await CustomerModel.create({
      customerId,
      organization_id: orgId,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      is_archived: false,
    });

    return {
      id: doc.customerId,
      organization_id: doc.organization_id,
      full_name: doc.full_name,
      phone: doc.phone,
      email: doc.email || null,
      address: doc.address || null,
      notes: doc.notes || null,
      is_archived: doc.is_archived,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer | null> {
    await connectToDatabase();
    const doc = await CustomerModel.findOneAndUpdate({ customerId }, data, { new: true });
    if (!doc) return null;
    return {
      id: doc.customerId,
      organization_id: doc.organization_id,
      full_name: doc.full_name,
      phone: doc.phone,
      email: doc.email || null,
      address: doc.address || null,
      notes: doc.notes || null,
      is_archived: doc.is_archived,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // DEVICES
  // --------------------------------------------------------------------------
  async getDevicesByCustomerId(customerId: string): Promise<Device[]> {
    await connectToDatabase();
    const docs = await DeviceModel.find({ customer_id: customerId });
    return docs.map((d) => ({
      id: d.deviceId,
      organization_id: d.organization_id,
      customer_id: d.customer_id,
      category: d.category,
      brand: d.brand,
      model: d.model,
      color: d.color || null,
      serial_number: d.serial_number || null,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
    }));
  }

  async getDeviceById(deviceId: string): Promise<Device | null> {
    await connectToDatabase();
    const doc = await DeviceModel.findOne({ deviceId });
    if (!doc) return null;
    return {
      id: doc.deviceId,
      organization_id: doc.organization_id,
      customer_id: doc.customer_id,
      category: doc.category,
      brand: doc.brand,
      model: doc.model,
      color: doc.color || null,
      serial_number: doc.serial_number || null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async createDevice(
    orgId: string,
    data: Omit<Device, "id" | "organization_id" | "created_at" | "updated_at">
  ): Promise<Device> {
    await connectToDatabase();
    const deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc = await DeviceModel.create({
      deviceId,
      organization_id: orgId,
      customer_id: data.customer_id,
      category: data.category,
      brand: data.brand.trim(),
      model: data.model.trim(),
      color: data.color?.trim() || null,
      serial_number: data.serial_number?.trim() || null,
    });

    return {
      id: doc.deviceId,
      organization_id: doc.organization_id,
      customer_id: doc.customer_id,
      category: doc.category,
      brand: doc.brand,
      model: doc.model,
      color: doc.color || null,
      serial_number: doc.serial_number || null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // ATOMIC TICKET GENERATION & TICKETS
  // --------------------------------------------------------------------------
  async generateTicketNumber(orgId: string = INITIAL_ORG_ID, prefix: string = "RD"): Promise<string> {
    await connectToDatabase();
    const year = new Date().getFullYear();

    const seqDoc = await SequenceModel.findOneAndUpdate(
      { organization_id: orgId, year },
      { $inc: { last_seq: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const seqStr = String(seqDoc.last_seq).padStart(6, "0");
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

  async getTickets(orgId: string = INITIAL_ORG_ID): Promise<RepairTicket[]> {
    await connectToDatabase();
    const docs = await RepairTicketModel.find({ organization_id: orgId }).sort({ created_at: -1 });

    const customerIds = Array.from(new Set(docs.map((d) => d.customer_id)));
    const deviceIds = Array.from(new Set(docs.map((d) => d.device_id)));
    const techIds = Array.from(new Set(docs.map((d) => d.assigned_technician_id).filter((id): id is string => Boolean(id))));

    const [customers, devices, staff] = await Promise.all([
      CustomerModel.find({ customerId: { $in: customerIds } }),
      DeviceModel.find({ deviceId: { $in: deviceIds } }),
      UserModel.find({ staffId: { $in: techIds } }),
    ]);

    const custMap = new Map(customers.map((c) => [c.customerId, c]));
    const devMap = new Map(devices.map((d) => [d.deviceId, d]));
    const staffMap = new Map(staff.map((s) => [s.staffId, s]));

    return docs.map((d) => {
      const c = custMap.get(d.customer_id);
      const dev = devMap.get(d.device_id);
      const s = d.assigned_technician_id ? staffMap.get(d.assigned_technician_id) : undefined;

      return {
        id: d.ticketId,
        organization_id: d.organization_id,
        ticket_number: d.ticket_number,
        customer_id: d.customer_id,
        device_id: d.device_id,
        assigned_technician_id: d.assigned_technician_id || null,
        current_status: d.current_status,
        payment_status: d.payment_status,
        reported_problem: d.reported_problem,
        intake_notes: d.intake_notes || null,
        accessories_received: d.accessories_received || null,
        condition_checklist: d.condition_checklist,
        estimated_delivery_date: d.estimated_delivery_date?.toISOString() || null,
        estimate_amount: d.estimate_amount,
        final_charge: d.final_charge,
        delivered_at: d.delivered_at?.toISOString() || null,
        delivered_to_name: d.delivered_to_name || null,
        handover_notes: d.handover_notes || null,
        tracking_token: d.tracking_token,
        created_at: d.created_at.toISOString(),
        updated_at: d.updated_at.toISOString(),
        customer: c
          ? {
              id: c.customerId,
              organization_id: c.organization_id,
              full_name: c.full_name,
              phone: c.phone,
              email: c.email || null,
              address: c.address || null,
              is_archived: c.is_archived,
              created_at: c.created_at.toISOString(),
              updated_at: c.updated_at.toISOString(),
            }
          : undefined,
        device: dev
          ? {
              id: dev.deviceId,
              organization_id: dev.organization_id,
              customer_id: dev.customer_id,
              category: dev.category,
              brand: dev.brand,
              model: dev.model,
              color: dev.color || null,
              serial_number: dev.serial_number || null,
              created_at: dev.created_at.toISOString(),
              updated_at: dev.updated_at.toISOString(),
            }
          : undefined,
        technician: s
          ? {
              id: s.staffId,
              organization_id: s.organization_id,
              user_id: s._id.toString(),
              email: s.email,
              full_name: s.full_name,
              role: s.role,
              is_active: s.is_active,
              created_at: s.created_at.toISOString(),
              updated_at: s.updated_at.toISOString(),
            }
          : undefined,
      };
    });
  }

  async getTicketById(ticketId: string): Promise<RepairTicket | null> {
    await connectToDatabase();
    const doc = await RepairTicketModel.findOne({ ticketId });
    if (!doc) return null;

    const [customer, device, staff] = await Promise.all([
      CustomerModel.findOne({ customerId: doc.customer_id }),
      DeviceModel.findOne({ deviceId: doc.device_id }),
      doc.assigned_technician_id ? UserModel.findOne({ staffId: doc.assigned_technician_id }) : null,
    ]);

    return {
      id: doc.ticketId,
      organization_id: doc.organization_id,
      ticket_number: doc.ticket_number,
      customer_id: doc.customer_id,
      device_id: doc.device_id,
      assigned_technician_id: doc.assigned_technician_id || null,
      current_status: doc.current_status,
      payment_status: doc.payment_status,
      reported_problem: doc.reported_problem,
      intake_notes: doc.intake_notes || null,
      accessories_received: doc.accessories_received || null,
      condition_checklist: doc.condition_checklist,
      estimated_delivery_date: doc.estimated_delivery_date?.toISOString() || null,
      estimate_amount: doc.estimate_amount,
      final_charge: doc.final_charge,
      delivered_at: doc.delivered_at?.toISOString() || null,
      delivered_to_name: doc.delivered_to_name || null,
      handover_notes: doc.handover_notes || null,
      tracking_token: doc.tracking_token,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
      customer: customer
        ? {
            id: customer.customerId,
            organization_id: customer.organization_id,
            full_name: customer.full_name,
            phone: customer.phone,
            email: customer.email || null,
            address: customer.address || null,
            is_archived: customer.is_archived,
            created_at: customer.created_at.toISOString(),
            updated_at: customer.updated_at.toISOString(),
          }
        : undefined,
      device: device
        ? {
            id: device.deviceId,
            organization_id: device.organization_id,
            customer_id: device.customer_id,
            category: device.category,
            brand: device.brand,
            model: device.model,
            color: device.color || null,
            serial_number: device.serial_number || null,
            created_at: device.created_at.toISOString(),
            updated_at: device.updated_at.toISOString(),
          }
        : undefined,
      technician: staff
        ? {
            id: staff.staffId,
            organization_id: staff.organization_id,
            user_id: staff._id.toString(),
            email: staff.email,
            full_name: staff.full_name,
            role: staff.role,
            is_active: staff.is_active,
            created_at: staff.created_at.toISOString(),
            updated_at: staff.updated_at.toISOString(),
          }
        : undefined,
    };
  }

  async getTicketByTrackingToken(token: string): Promise<RepairTicket | null> {
    await connectToDatabase();
    const doc = await RepairTicketModel.findOne({ tracking_token: token });
    if (!doc) return null;
    return this.getTicketById(doc.ticketId);
  }

  async createTicket(
    orgId: string,
    params: {
      customerId?: string;
      customerData?: { full_name: string; phone: string; email?: string; address?: string };
      deviceData: { category: Device["category"]; brand: string; model: string; color?: string; serial_number?: string };
      reported_problem: string;
      intake_notes?: string;
      accessories_received?: string;
      condition_checklist: ConditionChecklist;
      estimated_delivery_date?: string;
      estimate_amount?: number;
      assigned_technician_id?: string;
      created_by_staff_id?: string;
    }
  ): Promise<RepairTicket> {
    await connectToDatabase();

    // 1. Resolve Customer
    let customerId = params.customerId;
    if (!customerId && params.customerData) {
      const createdCust = await this.createCustomer(orgId, params.customerData);
      customerId = createdCust.id;
    }
    if (!customerId) throw new Error("Customer resolution failed");

    // 2. Create Device
    const createdDevice = await this.createDevice(orgId, {
      customer_id: customerId,
      category: params.deviceData.category,
      brand: params.deviceData.brand,
      model: params.deviceData.model,
      color: params.deviceData.color,
      serial_number: params.deviceData.serial_number,
    });

    // 3. Ticket Number & Token
    const org = await this.getOrganization(orgId);
    const prefix = org?.ticket_prefix || "RD";
    const ticketNumber = await this.generateTicketNumber(orgId, prefix);
    const trackingToken = this.generateTrackingToken();
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const estimateAmount = Number(params.estimate_amount) || 0;

    await RepairTicketModel.create({
      ticketId,
      organization_id: orgId,
      ticket_number: ticketNumber,
      customer_id: customerId,
      device_id: createdDevice.id,
      assigned_technician_id: params.assigned_technician_id || null,
      current_status: "received",
      payment_status: "unpaid",
      reported_problem: params.reported_problem.trim(),
      intake_notes: params.intake_notes?.trim() || null,
      accessories_received: params.accessories_received?.trim() || null,
      condition_checklist: params.condition_checklist,
      estimated_delivery_date: params.estimated_delivery_date ? new Date(params.estimated_delivery_date) : null,
      estimate_amount: estimateAmount,
      final_charge: estimateAmount,
      tracking_token: trackingToken,
    });

    // Initial Status History
    const creator = params.created_by_staff_id ? await this.getStaffById(params.created_by_staff_id) : null;
    await TicketStatusHistoryModel.create({
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticket_id: ticketId,
      old_status: null,
      new_status: "received",
      changed_by: creator?.id || null,
      changed_by_name: creator?.full_name || "Reception Desk",
      notes: "Device intake registered. Job card created.",
    });

    const hyd = await this.getTicketById(ticketId);
    return hyd!;
  }

  async updateTicketStatus(
    ticketId: string,
    newStatus: RepairStatus,
    staffId?: string,
    notes?: string
  ): Promise<RepairTicket> {
    await connectToDatabase();
    const doc = await RepairTicketModel.findOne({ ticketId });
    if (!doc) throw new Error("Repair ticket not found");

    if (doc.current_status === "delivered" && newStatus !== "delivered") {
      throw new Error("Delivered repairs cannot be altered directly. Please use an audited reopening workflow.");
    }

    const oldStatus = doc.current_status;
    doc.current_status = newStatus;
    await doc.save();

    const staff = staffId ? await this.getStaffById(staffId) : null;
    await TicketStatusHistoryModel.create({
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticket_id: ticketId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: staff?.id || null,
      changed_by_name: staff?.full_name || "Staff",
      notes: notes || `Status updated to ${newStatus.replace(/_/g, " ")}.`,
    });

    const updated = await this.getTicketById(ticketId);
    return updated!;
  }

  async assignTechnician(ticketId: string, technicianId: string | null): Promise<RepairTicket> {
    await connectToDatabase();
    const doc = await RepairTicketModel.findOneAndUpdate(
      { ticketId },
      { assigned_technician_id: technicianId || null },
      { new: true }
    );
    if (!doc) throw new Error("Repair ticket not found");
    const updated = await this.getTicketById(ticketId);
    return updated!;
  }

  async completeHandover(ticketId: string, recipientName: string, handoverNotes?: string, staffId?: string): Promise<RepairTicket> {
    await connectToDatabase();
    const doc = await RepairTicketModel.findOne({ ticketId });
    if (!doc) throw new Error("Repair ticket not found");

    doc.current_status = "delivered";
    doc.delivered_at = new Date();
    doc.delivered_to_name = recipientName.trim();
    doc.handover_notes = handoverNotes?.trim() || null;
    await doc.save();

    const staff = staffId ? await this.getStaffById(staffId) : null;
    await TicketStatusHistoryModel.create({
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticket_id: ticketId,
      old_status: "ready_for_pickup",
      new_status: "delivered",
      changed_by: staff?.id || null,
      changed_by_name: staff?.full_name || "Reception Desk",
      notes: `Device delivered to ${recipientName}. ${handoverNotes || ""}`.trim(),
    });

    const updated = await this.getTicketById(ticketId);
    return updated!;
  }

  // --------------------------------------------------------------------------
  // HISTORY & NOTES
  // --------------------------------------------------------------------------
  async getStatusHistory(ticketId: string): Promise<TicketStatusHistory[]> {
    await connectToDatabase();
    const docs = await TicketStatusHistoryModel.find({ ticket_id: ticketId }).sort({ created_at: 1 });
    return docs.map((d) => ({
      id: d.historyId,
      ticket_id: d.ticket_id,
      old_status: (d.old_status as RepairStatus) || null,
      new_status: d.new_status,
      changed_by: d.changed_by || null,
      changed_by_name: d.changed_by_name || null,
      notes: d.notes || null,
      created_at: d.created_at.toISOString(),
    }));
  }

  async getNotes(ticketId: string): Promise<TicketNote[]> {
    await connectToDatabase();
    const docs = await TicketNoteModel.find({ ticket_id: ticketId }).sort({ created_at: -1 });
    return docs.map((d) => ({
      id: d.noteId,
      ticket_id: d.ticket_id,
      author_id: d.author_id || null,
      author_name: d.author_name || null,
      note_type: d.note_type,
      content: d.content,
      created_at: d.created_at.toISOString(),
    }));
  }

  async addNote(
    ticketId: string,
    content: string,
    noteType: "internal" | "diagnostic" | "customer_visible",
    staffId?: string
  ): Promise<TicketNote> {
    await connectToDatabase();
    const staff = staffId ? await this.getStaffById(staffId) : null;
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc = await TicketNoteModel.create({
      noteId,
      ticket_id: ticketId,
      author_id: staff?.id || null,
      author_name: staff?.full_name || "Staff Member",
      note_type: noteType,
      content: content.trim(),
    });

    return {
      id: doc.noteId,
      ticket_id: doc.ticket_id,
      author_id: doc.author_id || null,
      author_name: doc.author_name || null,
      note_type: doc.note_type,
      content: doc.content,
      created_at: doc.created_at.toISOString(),
    };
  }

  async getAttachments(ticketId: string): Promise<TicketAttachment[]> {
    await connectToDatabase();
    const docs = await TicketAttachmentModel.find({ ticket_id: ticketId }).sort({ created_at: -1 });
    return docs.map((d) => ({
      id: d.attachmentId,
      ticket_id: d.ticket_id,
      category: d.category,
      file_url: d.file_url,
      file_name: d.file_name,
      file_size: d.file_size,
      mime_type: d.mime_type,
      uploaded_by: d.uploaded_by || null,
      created_at: d.created_at.toISOString(),
    }));
  }

  async addAttachment(
    ticketId: string,
    data: {
      category: "intake" | "diagnosis" | "repair" | "handover";
      file_url: string;
      file_name: string;
      file_size?: number;
      mime_type?: string;
      uploaded_by?: string | null;
    }
  ): Promise<TicketAttachment> {
    await connectToDatabase();
    const attachmentId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc = await TicketAttachmentModel.create({
      attachmentId,
      ticket_id: ticketId,
      category: data.category,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size || 0,
      mime_type: data.mime_type || "image/jpeg",
      uploaded_by: data.uploaded_by || null,
    });

    return {
      id: doc.attachmentId,
      ticket_id: doc.ticket_id,
      category: doc.category,
      file_url: doc.file_url,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      uploaded_by: doc.uploaded_by || null,
      created_at: doc.created_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // ESTIMATES
  // --------------------------------------------------------------------------
  async getEstimatesByTicketId(ticketId: string): Promise<Estimate[]> {
    await connectToDatabase();
    const docs = await EstimateModel.find({ ticket_id: ticketId });
    return docs.map((d) => ({
      id: d.estimateId,
      organization_id: d.organization_id,
      ticket_id: d.ticket_id,
      revision_number: d.revision_number,
      status: d.status,
      subtotal: d.subtotal,
      tax_rate: d.tax_rate,
      tax_amount: d.tax_amount,
      total_amount: d.total_amount,
      notes: d.notes || null,
      created_by: d.created_by || null,
      items: d.items.map((i) => ({
        id: i.id,
        estimate_id: d.estimateId,
        item_type: i.item_type,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        created_at: d.created_at.toISOString(),
      })),
      approval: d.approval
        ? {
            id: d.approval.id,
            estimate_id: d.estimateId,
            status: d.approval.status,
            channel: d.approval.channel,
            recorded_by: d.approval.recorded_by || null,
            recorded_by_name: d.approval.recorded_by_name || null,
            decision_notes: d.approval.decision_notes || null,
            decided_at: d.approval.decided_at.toISOString(),
          }
        : null,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
    }));
  }

  async createEstimate(
    orgId: string,
    ticketId: string,
    items: Array<{ item_type: "part" | "labour"; description: string; quantity: number; unit_price: number }>,
    notes?: string,
    staffId?: string
  ): Promise<Estimate> {
    await connectToDatabase();
    const existingCount = await EstimateModel.countDocuments({ ticket_id: ticketId });

    let subtotal = 0;
    const estimateItems = items.map((item, idx) => {
      const total_price = Math.round(item.quantity * item.unit_price * 100) / 100;
      subtotal += total_price;
      return {
        id: `est-item-${Date.now()}-${idx}`,
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price,
      };
    });

    const total_amount = subtotal;
    const estimateId = `est-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const doc = await EstimateModel.create({
      estimateId,
      organization_id: orgId,
      ticket_id: ticketId,
      revision_number: existingCount + 1,
      status: "draft",
      subtotal,
      total_amount,
      notes: notes || null,
      created_by: staffId || null,
      items: estimateItems,
    });

    // Update ticket final_charge
    await RepairTicketModel.findOneAndUpdate(
      { ticketId },
      { estimate_amount: total_amount, final_charge: total_amount }
    );

    return {
      id: doc.estimateId,
      organization_id: doc.organization_id,
      ticket_id: doc.ticket_id,
      revision_number: doc.revision_number,
      status: doc.status,
      subtotal: doc.subtotal,
      tax_rate: doc.tax_rate,
      tax_amount: doc.tax_amount,
      total_amount: doc.total_amount,
      notes: doc.notes || null,
      created_by: doc.created_by || null,
      items: doc.items.map((i) => ({
        id: i.id,
        estimate_id: doc.estimateId,
        item_type: i.item_type,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        created_at: doc.created_at.toISOString(),
      })),
      approval: null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async recordEstimateApproval(
    estimateId: string,
    params: { status: "approved" | "rejected"; channel: "in_person" | "phone_call" | "whatsapp" | "email"; notes?: string; staffId?: string }
  ): Promise<Estimate> {
    await connectToDatabase();
    const doc = await EstimateModel.findOne({ estimateId });
    if (!doc) throw new Error("Estimate not found");

    const staff = params.staffId ? await this.getStaffById(params.staffId) : null;

    doc.status = params.status;
    doc.approval = {
      id: `appr-${Date.now()}`,
      status: params.status,
      channel: params.channel,
      recorded_by: staff?.id || undefined,
      recorded_by_name: staff?.full_name || undefined,
      decision_notes: params.notes || undefined,
      decided_at: new Date(),
    };
    await doc.save();

    if (params.status === "approved") {
      const ticket = await RepairTicketModel.findOne({ ticketId: doc.ticket_id });
      if (ticket) {
        ticket.final_charge = doc.total_amount;
        if (ticket.current_status === "awaiting_approval") {
          await this.updateTicketStatus(
            ticket.ticketId,
            "in_repair",
            params.staffId,
            `Customer approved estimate of ₹${doc.total_amount} via ${params.channel.replace(/_/g, " ")}.`
          );
        } else {
          await ticket.save();
        }
      }
    }

    return (await this.getEstimatesByTicketId(doc.ticket_id)).find((e) => e.id === estimateId)!;
  }

  // --------------------------------------------------------------------------
  // PAYMENTS & RECEIPTS
  // --------------------------------------------------------------------------
  async getPaymentsByTicketId(ticketId: string): Promise<Payment[]> {
    await connectToDatabase();
    const docs = await PaymentModel.find({ ticket_id: ticketId }).sort({ created_at: -1 });
    return docs.map((d) => ({
      id: d.paymentId,
      organization_id: d.organization_id,
      ticket_id: d.ticket_id,
      ticket_number: d.ticket_number,
      customer_id: d.customer_id,
      customer_name: d.customer_name || undefined,
      amount: d.amount,
      payment_method: d.payment_method,
      reference_number: d.reference_number || null,
      notes: d.notes || null,
      recorded_by: d.recorded_by || null,
      recorded_by_name: d.recorded_by_name || null,
      created_at: d.created_at.toISOString(),
    }));
  }

  async getAllPayments(orgId: string = INITIAL_ORG_ID): Promise<Payment[]> {
    await connectToDatabase();
    const docs = await PaymentModel.find({ organization_id: orgId }).sort({ created_at: -1 });
    return docs.map((d) => ({
      id: d.paymentId,
      organization_id: d.organization_id,
      ticket_id: d.ticket_id,
      ticket_number: d.ticket_number,
      customer_id: d.customer_id,
      customer_name: d.customer_name || undefined,
      amount: d.amount,
      payment_method: d.payment_method,
      reference_number: d.reference_number || null,
      notes: d.notes || null,
      recorded_by: d.recorded_by || null,
      recorded_by_name: d.recorded_by_name || null,
      created_at: d.created_at.toISOString(),
    }));
  }

  async recordPayment(
    orgId: string,
    ticketId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    referenceNumber?: string,
    notes?: string,
    staffId?: string
  ): Promise<{ payment: Payment; ticket: RepairTicket; receipt?: Receipt }> {
    await connectToDatabase();
    const ticketDoc = await RepairTicketModel.findOne({ ticketId });
    if (!ticketDoc) throw new Error("Repair ticket not found");

    if (amount <= 0) throw new Error("Payment amount must be greater than zero");

    const staff = staffId ? await this.getStaffById(staffId) : null;
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cust = await CustomerModel.findOne({ customerId: ticketDoc.customer_id });

    const paymentDoc = await PaymentModel.create({
      paymentId,
      organization_id: orgId,
      ticket_id: ticketDoc.ticketId,
      ticket_number: ticketDoc.ticket_number,
      customer_id: ticketDoc.customer_id,
      customer_name: cust?.full_name || "Customer",
      amount: Math.round(amount * 100) / 100,
      payment_method: paymentMethod,
      reference_number: referenceNumber?.trim() || null,
      notes: notes?.trim() || null,
      recorded_by: staff?.id || null,
      recorded_by_name: staff?.full_name || "Reception Desk",
    });

    // Recalculate total payments for ticket
    const allPayments = await PaymentModel.find({ ticket_id: ticketDoc.ticketId });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const finalCharge = ticketDoc.final_charge || ticketDoc.estimate_amount || 0;
    if (totalPaid >= finalCharge && finalCharge > 0) {
      ticketDoc.payment_status = "fully_paid";
    } else if (totalPaid > 0) {
      ticketDoc.payment_status = "partially_paid";
    } else {
      ticketDoc.payment_status = "unpaid";
    }
    await ticketDoc.save();

    // Create receipt
    const receiptCount = await ReceiptModel.countDocuments({ organization_id: orgId });
    const receiptYear = new Date().getFullYear();
    const receiptNum = `RCP-${receiptYear}-${String(receiptCount + 1).padStart(6, "0")}`;
    const receiptId = `rcpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const receiptDoc = await ReceiptModel.create({
      receiptId,
      organization_id: orgId,
      ticket_id: ticketDoc.ticketId,
      receipt_number: receiptNum,
      total_charges: finalCharge,
      total_paid: totalPaid,
      balance_remaining: Math.max(0, finalCharge - totalPaid),
      notes: notes || `Payment recorded via ${paymentMethod.toUpperCase()}`,
    });

    const hydTicket = await this.getTicketById(ticketId);

    return {
      payment: {
        id: paymentDoc.paymentId,
        organization_id: paymentDoc.organization_id,
        ticket_id: paymentDoc.ticket_id,
        ticket_number: paymentDoc.ticket_number,
        customer_id: paymentDoc.customer_id,
        customer_name: paymentDoc.customer_name || undefined,
        amount: paymentDoc.amount,
        payment_method: paymentDoc.payment_method,
        reference_number: paymentDoc.reference_number || null,
        notes: paymentDoc.notes || null,
        recorded_by: paymentDoc.recorded_by || null,
        recorded_by_name: paymentDoc.recorded_by_name || null,
        created_at: paymentDoc.created_at.toISOString(),
      },
      ticket: hydTicket!,
      receipt: {
        id: receiptDoc.receiptId,
        organization_id: receiptDoc.organization_id,
        ticket_id: receiptDoc.ticket_id,
        receipt_number: receiptDoc.receipt_number,
        total_charges: receiptDoc.total_charges,
        total_paid: receiptDoc.total_paid,
        balance_remaining: receiptDoc.balance_remaining,
        notes: receiptDoc.notes || null,
        created_at: receiptDoc.created_at.toISOString(),
      },
    };
  }

  async getReceiptByTicketId(ticketId: string): Promise<Receipt | null> {
    await connectToDatabase();
    const doc = await ReceiptModel.findOne({ ticket_id: ticketId }).sort({ created_at: -1 });
    if (!doc) return null;
    return {
      id: doc.receiptId,
      organization_id: doc.organization_id,
      ticket_id: doc.ticket_id,
      receipt_number: doc.receipt_number,
      total_charges: doc.total_charges,
      total_paid: doc.total_paid,
      balance_remaining: doc.balance_remaining,
      notes: doc.notes || null,
      created_at: doc.created_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // INVENTORY
  // --------------------------------------------------------------------------
  async getInventory(orgId: string = INITIAL_ORG_ID): Promise<InventoryItem[]> {
    await connectToDatabase();
    const docs = await InventoryItemModel.find({ organization_id: orgId }).sort({ name: 1 });
    return docs.map((d) => ({
      id: d.itemId,
      organization_id: d.organization_id,
      sku: d.sku,
      name: d.name,
      category: d.category,
      compatible_models: d.compatible_models || null,
      cost_price: d.cost_price,
      selling_price: d.selling_price,
      quantity_on_hand: d.quantity_on_hand,
      low_stock_threshold: d.low_stock_threshold,
      supplier: d.supplier || null,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
    }));
  }

  async getInventoryItemById(itemId: string): Promise<InventoryItem | null> {
    await connectToDatabase();
    const doc = await InventoryItemModel.findOne({ itemId });
    if (!doc) return null;
    return {
      id: doc.itemId,
      organization_id: doc.organization_id,
      sku: doc.sku,
      name: doc.name,
      category: doc.category,
      compatible_models: doc.compatible_models || null,
      cost_price: doc.cost_price,
      selling_price: doc.selling_price,
      quantity_on_hand: doc.quantity_on_hand,
      low_stock_threshold: doc.low_stock_threshold,
      supplier: doc.supplier || null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async createInventoryItem(
    orgId: string,
    data: Omit<InventoryItem, "id" | "organization_id" | "created_at" | "updated_at">
  ): Promise<InventoryItem> {
    await connectToDatabase();
    const existing = await InventoryItemModel.findOne({
      organization_id: orgId,
      sku: data.sku.toUpperCase(),
    });
    if (existing) {
      throw new Error(`An inventory item with SKU '${data.sku}' already exists.`);
    }

    const itemId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc = await InventoryItemModel.create({
      itemId,
      organization_id: orgId,
      sku: data.sku.toUpperCase(),
      name: data.name.trim(),
      category: data.category.trim(),
      compatible_models: data.compatible_models?.trim() || null,
      cost_price: Number(data.cost_price) || 0,
      selling_price: Number(data.selling_price) || 0,
      quantity_on_hand: Number(data.quantity_on_hand) || 0,
      low_stock_threshold: Number(data.low_stock_threshold) || 3,
      supplier: data.supplier?.trim() || null,
    });

    return {
      id: doc.itemId,
      organization_id: doc.organization_id,
      sku: doc.sku,
      name: doc.name,
      category: doc.category,
      compatible_models: doc.compatible_models || null,
      cost_price: doc.cost_price,
      selling_price: doc.selling_price,
      quantity_on_hand: doc.quantity_on_hand,
      low_stock_threshold: doc.low_stock_threshold,
      supplier: doc.supplier || null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  async consumeInventoryPart(itemId: string, quantity: number): Promise<{ item: InventoryItem; previousQty: number; newQty: number }> {
    await connectToDatabase();
    const doc = await InventoryItemModel.findOne({ itemId });
    if (!doc) throw new Error("Inventory item not found");

    if (quantity <= 0) throw new Error("Quantity to consume must be greater than 0");
    if (doc.quantity_on_hand < quantity) {
      throw new Error(`Insufficient stock for '${doc.name}'. Available: ${doc.quantity_on_hand}, Requested: ${quantity}`);
    }

    const previousQty = doc.quantity_on_hand;
    const newQty = previousQty - quantity;
    doc.quantity_on_hand = newQty;
    await doc.save();

    return {
      item: {
        id: doc.itemId,
        organization_id: doc.organization_id,
        sku: doc.sku,
        name: doc.name,
        category: doc.category,
        compatible_models: doc.compatible_models || null,
        cost_price: doc.cost_price,
        selling_price: doc.selling_price,
        quantity_on_hand: doc.quantity_on_hand,
        low_stock_threshold: doc.low_stock_threshold,
        supplier: doc.supplier || null,
        created_at: doc.created_at.toISOString(),
        updated_at: doc.updated_at.toISOString(),
      },
      previousQty,
      newQty,
    };
  }

  async restockInventoryPart(itemId: string, quantity: number): Promise<InventoryItem> {
    await connectToDatabase();
    const doc = await InventoryItemModel.findOne({ itemId });
    if (!doc) throw new Error("Inventory item not found");

    if (quantity <= 0) throw new Error("Restock quantity must be greater than 0");
    doc.quantity_on_hand += quantity;
    await doc.save();

    return {
      id: doc.itemId,
      organization_id: doc.organization_id,
      sku: doc.sku,
      name: doc.name,
      category: doc.category,
      compatible_models: doc.compatible_models || null,
      cost_price: doc.cost_price,
      selling_price: doc.selling_price,
      quantity_on_hand: doc.quantity_on_hand,
      low_stock_threshold: doc.low_stock_threshold,
      supplier: doc.supplier || null,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // DASHBOARD METRICS
  // --------------------------------------------------------------------------
  async getDashboardMetrics(orgId: string = INITIAL_ORG_ID) {
    await connectToDatabase();
    const [tickets, payments, inventory, staff] = await Promise.all([
      RepairTicketModel.find({ organization_id: orgId }),
      PaymentModel.find({ organization_id: orgId }),
      InventoryItemModel.find({ organization_id: orgId }),
      UserModel.find({ organization_id: orgId, is_active: true }),
    ]);

    const todayStr = new Date().toISOString().slice(0, 10);

    const totalTickets = tickets.length;
    const newTicketsToday = tickets.filter((t) => t.created_at.toISOString().startsWith(todayStr)).length;
    const inRepairCount = tickets.filter((t) => t.current_status === "in_repair").length;
    const awaitingApprovalCount = tickets.filter((t) => t.current_status === "awaiting_approval").length;
    const waitingForPartsCount = tickets.filter((t) => t.current_status === "waiting_for_parts").length;
    const readyForPickupCount = tickets.filter((t) => t.current_status === "ready_for_pickup").length;
    const deliveredCount = tickets.filter((t) => t.current_status === "delivered").length;

    const nowTime = Date.now();
    const overdueCount = tickets.filter(
      (t) =>
        t.current_status !== "delivered" &&
        t.current_status !== "cancelled" &&
        t.estimated_delivery_date &&
        t.estimated_delivery_date.getTime() < nowTime
    ).length;

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCharges = tickets.reduce((sum, t) => sum + (t.final_charge || t.estimate_amount || 0), 0);
    const outstandingBalance = Math.max(0, totalCharges - totalRevenue);

    const lowStockItems = inventory.filter((i) => i.quantity_on_hand <= i.low_stock_threshold);

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
      statusCounts[t.current_status as RepairStatus] = (statusCounts[t.current_status as RepairStatus] || 0) + 1;
    });

    const technicianWorkload = staff
      .filter((s) => s.role === "technician" || s.role === "owner")
      .map((tech) => {
        const assigned = tickets.filter(
          (t) =>
            t.assigned_technician_id === tech.staffId &&
            t.current_status !== "delivered" &&
            t.current_status !== "cancelled"
        ).length;
        return {
          id: tech.staffId,
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
      lowStockItems: lowStockItems.map((i) => ({
        id: i.itemId,
        name: i.name,
        sku: i.sku,
        quantity_on_hand: i.quantity_on_hand,
        low_stock_threshold: i.low_stock_threshold,
      })),
      statusCounts,
      technicianWorkload,
    };
  }
}

export const mongoService = new MongoService();
