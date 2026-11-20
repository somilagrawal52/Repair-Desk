import { mongoService } from "./mongo-service";
import { dataStore } from "./data-service";
import {
  Organization,
  OrganizationMember,
  UserRole,
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

class DbService {
  private useMongo = true;

  async getOrganization(orgId: string = INITIAL_ORG_ID): Promise<Organization> {
    if (this.useMongo) {
      try {
        const org = await mongoService.getOrganization(orgId);
        if (org) return org;
      } catch (e) {
        console.warn("MongoDB getOrganization fallback to memory:", e);
      }
    }
    return dataStore.getOrganization(orgId);
  }

  async updateOrganization(orgId: string = INITIAL_ORG_ID, updates: Partial<Organization>): Promise<Organization> {
    if (this.useMongo) {
      try {
        return await mongoService.updateOrganization(orgId, updates);
      } catch (e) {
        console.warn("MongoDB updateOrganization fallback to memory:", e);
      }
    }
    return dataStore.updateOrganization(orgId, updates);
  }

  async getStaffMembers(orgId: string = INITIAL_ORG_ID): Promise<OrganizationMember[]> {
    if (this.useMongo) {
      try {
        const staff = await mongoService.getStaffMembers(orgId);
        if (staff.length > 0) return staff;
      } catch (e) {
        console.warn("MongoDB getStaffMembers fallback to memory:", e);
      }
    }
    return dataStore.getStaffMembers(orgId);
  }

  async createStaffMember(
    orgId: string = INITIAL_ORG_ID,
    data: { full_name: string; email: string; role: UserRole; password?: string }
  ): Promise<OrganizationMember> {
    if (this.useMongo) {
      try {
        return await mongoService.createStaffMember(orgId, data);
      } catch (e) {
        console.warn("MongoDB createStaffMember fallback to memory:", e);
      }
    }
    return dataStore.addStaffMember(orgId, {
      organization_id: orgId,
      user_id: `usr-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      is_active: true,
    });
  }

  async getCustomers(orgId: string = INITIAL_ORG_ID): Promise<Customer[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getCustomers(orgId);
      } catch (e) {
        console.warn("MongoDB getCustomers fallback to memory:", e);
      }
    }
    return dataStore.getCustomers(orgId);
  }

  async getCustomerById(customerId: string): Promise<Customer | undefined> {
    if (this.useMongo) {
      try {
        const c = await mongoService.getCustomerById(customerId);
        if (c) return c;
      } catch (e) {
        console.warn("MongoDB getCustomerById fallback to memory:", e);
      }
    }
    return dataStore.getCustomerById(customerId);
  }

  async findCustomerByPhone(phone: string, orgId: string = INITIAL_ORG_ID): Promise<Customer | undefined> {
    if (this.useMongo) {
      try {
        const c = await mongoService.findCustomerByPhone(phone, orgId);
        if (c) return c;
      } catch (e) {
        console.warn("MongoDB findCustomerByPhone fallback to memory:", e);
      }
    }
    return dataStore.findCustomerByPhone(phone, orgId);
  }

  async createCustomer(
    orgId: string,
    data: { full_name: string; phone: string; email?: string | null; address?: string | null; notes?: string | null }
  ): Promise<Customer> {
    if (this.useMongo) {
      try {
        return await mongoService.createCustomer(orgId, data);
      } catch (e) {
        console.warn("MongoDB createCustomer fallback to memory:", e);
      }
    }
    return dataStore.createCustomer(orgId, data);
  }

  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer> {
    if (this.useMongo) {
      try {
        const updated = await mongoService.updateCustomer(customerId, data);
        if (updated) return updated;
      } catch (e) {
        console.warn("MongoDB updateCustomer fallback to memory:", e);
      }
    }
    return dataStore.updateCustomer(customerId, data);
  }

  async getDevicesByCustomerId(customerId: string): Promise<Device[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getDevicesByCustomerId(customerId);
      } catch (e) {
        console.warn("MongoDB getDevicesByCustomerId fallback to memory:", e);
      }
    }
    return dataStore.getDevicesByCustomerId(customerId);
  }

  async getTickets(orgId: string = INITIAL_ORG_ID): Promise<RepairTicket[]> {
    if (this.useMongo) {
      try {
        const tickets = await mongoService.getTickets(orgId);
        if (tickets.length > 0) return tickets;
      } catch (e) {
        console.warn("MongoDB getTickets fallback to memory:", e);
      }
    }
    return dataStore.getTickets(orgId);
  }

  async getTicketById(ticketId: string): Promise<RepairTicket | undefined> {
    if (this.useMongo) {
      try {
        const ticket = await mongoService.getTicketById(ticketId);
        if (ticket) return ticket;
      } catch (e) {
        console.warn("MongoDB getTicketById fallback to memory:", e);
      }
    }
    return dataStore.getTicketById(ticketId);
  }

  async getTicketByTrackingToken(token: string): Promise<RepairTicket | undefined> {
    if (this.useMongo) {
      try {
        const ticket = await mongoService.getTicketByTrackingToken(token);
        if (ticket) return ticket;
      } catch (e) {
        console.warn("MongoDB getTicketByTrackingToken fallback to memory:", e);
      }
    }
    return dataStore.getTicketByTrackingToken(token);
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
    if (this.useMongo) {
      try {
        return await mongoService.createTicket(orgId, params);
      } catch (e) {
        console.warn("MongoDB createTicket fallback to memory:", e);
      }
    }
    return dataStore.createTicket(orgId, params);
  }

  async updateTicketStatus(
    ticketId: string,
    newStatus: RepairStatus,
    staffId?: string,
    notes?: string
  ): Promise<RepairTicket> {
    if (this.useMongo) {
      try {
        return await mongoService.updateTicketStatus(ticketId, newStatus, staffId, notes);
      } catch (e) {
        console.warn("MongoDB updateTicketStatus fallback to memory:", e);
      }
    }
    return dataStore.updateTicketStatus(ticketId, newStatus, staffId, notes);
  }

  async assignTechnician(ticketId: string, technicianId: string | null, staffId?: string): Promise<RepairTicket> {
    if (this.useMongo) {
      try {
        return await mongoService.assignTechnician(ticketId, technicianId);
      } catch (e) {
        console.warn("MongoDB assignTechnician fallback to memory:", e);
      }
    }
    return dataStore.assignTechnician(ticketId, technicianId, staffId);
  }

  async completeHandover(ticketId: string, recipientName: string, handoverNotes?: string, staffId?: string): Promise<RepairTicket> {
    if (this.useMongo) {
      try {
        return await mongoService.completeHandover(ticketId, recipientName, handoverNotes, staffId);
      } catch (e) {
        console.warn("MongoDB completeHandover fallback to memory:", e);
      }
    }
    return dataStore.completeHandover(ticketId, recipientName, handoverNotes, staffId);
  }

  async getStatusHistory(ticketId: string): Promise<TicketStatusHistory[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getStatusHistory(ticketId);
      } catch (e) {
        console.warn("MongoDB getStatusHistory fallback to memory:", e);
      }
    }
    return dataStore.getStatusHistory(ticketId);
  }

  async getNotes(ticketId: string): Promise<TicketNote[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getNotes(ticketId);
      } catch (e) {
        console.warn("MongoDB getNotes fallback to memory:", e);
      }
    }
    return dataStore.getNotes(ticketId);
  }

  async addNote(
    ticketId: string,
    content: string,
    noteType: "internal" | "diagnostic" | "customer_visible",
    staffId?: string
  ): Promise<TicketNote> {
    if (this.useMongo) {
      try {
        return await mongoService.addNote(ticketId, content, noteType, staffId);
      } catch (e) {
        console.warn("MongoDB addNote fallback to memory:", e);
      }
    }
    return dataStore.addNote(ticketId, content, noteType, staffId);
  }

  async getAttachments(ticketId: string): Promise<TicketAttachment[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getAttachments(ticketId);
      } catch (e) {
        console.warn("MongoDB getAttachments fallback to memory:", e);
      }
    }
    return dataStore.getAttachments(ticketId);
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
    if (this.useMongo) {
      try {
        return await mongoService.addAttachment(ticketId, data);
      } catch (e) {
        console.warn("MongoDB addAttachment fallback to memory:", e);
      }
    }
    return dataStore.addAttachment(ticketId, data);
  }

  async getEstimatesByTicketId(ticketId: string): Promise<Estimate[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getEstimatesByTicketId(ticketId);
      } catch (e) {
        console.warn("MongoDB getEstimatesByTicketId fallback to memory:", e);
      }
    }
    return dataStore.getEstimatesByTicketId(ticketId);
  }

  async getAllEstimates(orgId: string = INITIAL_ORG_ID): Promise<Estimate[]> {
    if (this.useMongo) {
      try {
        const estimates = await mongoService.getAllEstimates(orgId);
        if (estimates.length > 0) return estimates;
      } catch (e) {
        console.warn("MongoDB getAllEstimates fallback to memory:", e);
      }
    }
    return dataStore.getAllEstimates(orgId);
  }

  async createEstimate(
    orgId: string,
    ticketId: string,
    items: Array<{ item_type: "part" | "labour"; description: string; quantity: number; unit_price: number }>,
    notes?: string,
    staffId?: string
  ): Promise<Estimate> {
    if (this.useMongo) {
      try {
        return await mongoService.createEstimate(orgId, ticketId, items, notes, staffId);
      } catch (e) {
        console.warn("MongoDB createEstimate fallback to memory:", e);
      }
    }
    return dataStore.createEstimate(orgId, ticketId, items, notes, staffId);
  }

  async recordEstimateApproval(
    estimateId: string,
    params: { status: "approved" | "rejected"; channel: "in_person" | "phone_call" | "whatsapp" | "email"; notes?: string; staffId?: string }
  ): Promise<Estimate> {
    if (this.useMongo) {
      try {
        return await mongoService.recordEstimateApproval(estimateId, params);
      } catch (e) {
        console.warn("MongoDB recordEstimateApproval fallback to memory:", e);
      }
    }
    return dataStore.recordEstimateApproval(estimateId, params);
  }

  async getPaymentsByTicketId(ticketId: string): Promise<Payment[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getPaymentsByTicketId(ticketId);
      } catch (e) {
        console.warn("MongoDB getPaymentsByTicketId fallback to memory:", e);
      }
    }
    return dataStore.getPaymentsByTicketId(ticketId);
  }

  async getAllPayments(orgId: string = INITIAL_ORG_ID): Promise<Payment[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getAllPayments(orgId);
      } catch (e) {
        console.warn("MongoDB getAllPayments fallback to memory:", e);
      }
    }
    return dataStore.getAllPayments(orgId);
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
    if (this.useMongo) {
      try {
        return await mongoService.recordPayment(orgId, ticketId, amount, paymentMethod, referenceNumber, notes, staffId);
      } catch (e) {
        console.warn("MongoDB recordPayment fallback to memory:", e);
      }
    }
    return dataStore.recordPayment(orgId, ticketId, amount, paymentMethod, referenceNumber, notes, staffId);
  }

  async getReceiptByTicketId(ticketId: string): Promise<Receipt | undefined> {
    if (this.useMongo) {
      try {
        const rcpt = await mongoService.getReceiptByTicketId(ticketId);
        if (rcpt) return rcpt;
      } catch (e) {
        console.warn("MongoDB getReceiptByTicketId fallback to memory:", e);
      }
    }
    return dataStore.getReceiptByTicketId(ticketId);
  }

  async getInventory(orgId: string = INITIAL_ORG_ID): Promise<InventoryItem[]> {
    if (this.useMongo) {
      try {
        return await mongoService.getInventory(orgId);
      } catch (e) {
        console.warn("MongoDB getInventory fallback to memory:", e);
      }
    }
    return dataStore.getInventory(orgId);
  }

  async createInventoryItem(
    orgId: string,
    data: Omit<InventoryItem, "id" | "organization_id" | "created_at" | "updated_at">
  ): Promise<InventoryItem> {
    if (this.useMongo) {
      try {
        return await mongoService.createInventoryItem(orgId, data);
      } catch (e) {
        console.warn("MongoDB createInventoryItem fallback to memory:", e);
      }
    }
    return dataStore.createInventoryItem(orgId, data);
  }

  async consumeInventoryPart(itemId: string, quantity: number, ticketId?: string, staffId?: string): Promise<{ item: InventoryItem; previousQty: number; newQty: number }> {
    if (this.useMongo) {
      try {
        return await mongoService.consumeInventoryPart(itemId, quantity);
      } catch (e) {
        console.warn("MongoDB consumeInventoryPart fallback to memory:", e);
      }
    }
    return dataStore.consumeInventoryPart(itemId, quantity, ticketId, staffId);
  }

  async restockInventoryPart(itemId: string, quantity: number, staffId?: string): Promise<InventoryItem> {
    if (this.useMongo) {
      try {
        return await mongoService.restockInventoryPart(itemId, quantity);
      } catch (e) {
        console.warn("MongoDB restockInventoryPart fallback to memory:", e);
      }
    }
    return dataStore.restockInventoryPart(itemId, quantity, staffId);
  }

  async getDashboardMetrics(orgId: string = INITIAL_ORG_ID) {
    if (this.useMongo) {
      try {
        return await mongoService.getDashboardMetrics(orgId);
      } catch (e) {
        console.warn("MongoDB getDashboardMetrics fallback to memory:", e);
      }
    }
    return dataStore.getDashboardMetrics(orgId);
  }
}

export const dbService = new DbService();
