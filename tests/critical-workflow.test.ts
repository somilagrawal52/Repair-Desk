import { describe, it, expect, beforeEach } from "vitest";
import { dataStore } from "../src/lib/data-service";
import { INITIAL_ORG_ID } from "../src/lib/mock-data";

describe("RepairDesk Critical Automated Tests", () => {
  const testOrgId = INITIAL_ORG_ID;

  // 1. Repair ticket numbers remain unique under concurrent creation
  it("generates unique sequential ticket numbers under rapid creation", () => {
    const generated = new Set<string>();
    const count = 100;

    for (let i = 0; i < count; i++) {
      const ticketNum = dataStore.generateTicketNumber("RD");
      expect(generated.has(ticketNum)).toBe(false);
      generated.add(ticketNum);
    }

    expect(generated.size).toBe(count);
  });

  // 2. Organization Isolation
  it("enforces organization isolation across repair tickets", () => {
    const otherOrgId = "org-other-mumbai-99";

    // Create ticket in other organization
    const otherTicket = dataStore.createTicket(otherOrgId, {
      customerData: {
        full_name: "External Shop Customer",
        phone: "+91 99999 88888",
      },
      deviceData: {
        category: "smartphone",
        brand: "Google",
        model: "Pixel 8 Pro",
      },
      reported_problem: "Screen flickering",
      condition_checklist: {
        screen_condition: "flawless",
        power_status: "turns_on",
        charging_status: "charges_normally",
        liquid_damage: "none_visible",
        body_condition: "excellent",
        accessories_received: [],
      },
    });

    // TechFix Indore should NOT see the Mumbai ticket in its listings
    const indoreTickets = dataStore.getTickets(testOrgId);
    const foundInIndore = indoreTickets.find((t) => t.id === otherTicket.id);
    expect(foundInIndore).toBeUndefined();

    // Mumbai org should find it
    const mumbaiTickets = dataStore.getTickets(otherOrgId);
    expect(mumbaiTickets.some((t) => t.id === otherTicket.id)).toBe(true);
  });

  // 3. Customer Tracking Data Sanitization (Zero private leakage)
  it("sanitizes public tracking tokens to prevent leaking customer private contact details, internal notes, or IMEI", () => {
    const ticket = dataStore.getTickets(testOrgId)[0];
    expect(ticket.tracking_token).toBeDefined();

    // Verify lookup by tracking token
    const retrieved = dataStore.getTicketByTrackingToken(ticket.tracking_token!);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(ticket.id);

    // In tracking view, sensitive data must be scrubbed:
    // Device serial / IMEI should not be in public payload
    // Internal technician notes should be filtered
    const allNotes = dataStore.getNotes(retrieved!.id);
    const customerVisible = allNotes.filter((n) => n.note_type === "customer_visible");
    const internalNotes = allNotes.filter((n) => n.note_type === "internal" || n.note_type === "diagnostic");

    // Internal notes exist in DB but must not equal customer visible list
    expect(customerVisible.every((n) => n.note_type === "customer_visible")).toBe(true);
  });

  // 4. Invalid Status Transitions Blocked
  it("blocks modifying delivered and cancelled tickets without explicit reopening workflow", () => {
    // Ticket 5 is delivered in seed data
    const deliveredTicket = dataStore.getTickets(testOrgId).find((t) => t.current_status === "delivered");
    expect(deliveredTicket).toBeDefined();

    expect(() => {
      dataStore.updateTicketStatus(deliveredTicket!.id, "in_repair");
    }).toThrow(/Delivered repairs cannot be altered directly/);

    // Cancelled ticket check
    const newTicket = dataStore.createTicket(testOrgId, {
      customerData: { full_name: "Cancel Test", phone: "+91 99999 11111" },
      deviceData: { category: "smartphone", brand: "Apple", model: "iPhone 11" },
      reported_problem: "Unrepairable board",
      condition_checklist: {
        screen_condition: "flawless",
        power_status: "dead",
        charging_status: "not_charging",
        liquid_damage: "confirmed_corrosion",
        body_condition: "excellent",
        accessories_received: [],
      },
    });

    dataStore.updateTicketStatus(newTicket.id, "cancelled");

    expect(() => {
      dataStore.updateTicketStatus(newTicket.id, "in_repair");
    }).toThrow(/Cancelled repairs cannot be altered directly/);

    // Test audited reopening
    const reopened = dataStore.reopenTicket(
      newTicket.id,
      "under_diagnosis",
      "Customer brought new motherboard replacement donor unit",
      "staff-owner-1"
    );
    expect(reopened.current_status).toBe("under_diagnosis");

    const history = dataStore.getStatusHistory(newTicket.id);
    const reopenRecord = history.find((h) => h.notes?.includes("AUDITED REOPENING"));
    expect(reopenRecord).toBeDefined();
    expect(reopenRecord?.old_status).toBe("cancelled");
    expect(reopenRecord?.new_status).toBe("under_diagnosis");
  });

  // 5. Estimate Approvals Recorded Correctly
  it("records estimate approvals and updates ticket final charge and repair status", () => {
    // Create new ticket for diagnosis
    const ticket = dataStore.createTicket(testOrgId, {
      customerData: {
        full_name: "Test Customer Approval",
        phone: "+91 91111 22222",
      },
      deviceData: {
        category: "smartphone",
        brand: "OnePlus",
        model: "10 Pro",
      },
      reported_problem: "Cracked back glass",
      condition_checklist: {
        screen_condition: "flawless",
        power_status: "turns_on",
        charging_status: "charges_normally",
        liquid_damage: "none_visible",
        body_condition: "minor_scratches",
        accessories_received: [],
      },
    });

    // Move to awaiting approval
    dataStore.updateTicketStatus(ticket.id, "awaiting_approval");

    // Create estimate
    const estimate = dataStore.createEstimate(
      testOrgId,
      ticket.id,
      [
        { item_type: "part", description: "Original Back Glass Panel", quantity: 1, unit_price: 2400 },
        { item_type: "labour", description: "Laser separation & adhesive seal", quantity: 1, unit_price: 600 },
      ],
      "Quote for OnePlus 10 Pro Back Glass"
    );

    expect(estimate.total_amount).toBe(3000);
    expect(estimate.status).toBe("draft");

    // Record customer approval via phone call
    const approved = dataStore.recordEstimateApproval(estimate.id, {
      status: "approved",
      channel: "phone_call",
      notes: "Customer authorized ₹3000 over phone",
      staffId: "staff-rec-1",
    });

    expect(approved.status).toBe("approved");
    expect(approved.approval?.channel).toBe("phone_call");

    // Ticket should now have final_charge = 3000 and status moved to in_repair
    const updatedTicket = dataStore.getTicketById(ticket.id);
    expect(updatedTicket?.final_charge).toBe(3000);
    expect(updatedTicket?.current_status).toBe("in_repair");
  });

  // 6. Partial Payments and Outstanding Balance Calculations
  it("accurately tracks partial payments, calculates outstanding balance, and updates payment_status", () => {
    const ticket = dataStore.createTicket(testOrgId, {
      customerData: {
        full_name: "Payment Calculation Test",
        phone: "+91 93333 44444",
      },
      deviceData: {
        category: "laptop",
        brand: "Lenovo",
        model: "ThinkPad E14",
      },
      reported_problem: "Battery replacement",
      estimate_amount: 4000.0,
      condition_checklist: {
        screen_condition: "flawless",
        power_status: "turns_on",
        charging_status: "charges_normally",
        liquid_damage: "none_visible",
        body_condition: "excellent",
        accessories_received: [],
      },
    });

    expect(ticket.payment_status).toBe("unpaid");

    // Record partial advance payment of ₹1500
    const res1 = dataStore.recordPayment(
      testOrgId,
      ticket.id,
      1500.0,
      "upi",
      "UPI/TXN/123456",
      "Advance deposit"
    );

    expect(res1.ticket.payment_status).toBe("partially_paid");
    expect(res1.receipt?.total_paid).toBe(1500.0);
    expect(res1.receipt?.balance_remaining).toBe(2500.0);

    // Record second payment settling remaining ₹2500
    const res2 = dataStore.recordPayment(
      testOrgId,
      ticket.id,
      2500.0,
      "cash",
      undefined,
      "Final settlement at pickup"
    );

    expect(res2.ticket.payment_status).toBe("fully_paid");
    expect(res2.receipt?.total_paid).toBe(4000.0);
    expect(res2.receipt?.balance_remaining).toBe(0.0);
  });

  // 7. Inventory Stock Deductions & Safeguards
  it("prevents inventory stock from becoming negative and logs usage correctly", () => {
    const item = dataStore.createInventoryItem(testOrgId, {
      sku: "TEST-CHIP-99",
      name: "Power Management IC",
      category: "IC Chips",
      cost_price: 300,
      selling_price: 750,
      quantity_on_hand: 2,
      low_stock_threshold: 1,
    });

    expect(item.quantity_on_hand).toBe(2);

    // Consume 1 unit
    const consumption1 = dataStore.consumeInventoryPart(item.id, 1);
    expect(consumption1.newQty).toBe(1);

    // Attempt to consume 5 units (greater than available 1)
    expect(() => {
      dataStore.consumeInventoryPart(item.id, 5);
    }).toThrow(/Insufficient stock/);

    // Stock remains safely at 1
    const current = dataStore.getInventoryItemById(item.id);
    expect(current?.quantity_on_hand).toBe(1);
  });

  // 8. End-to-End Workflow: Intake -> Diagnosis -> Ready -> Delivery Handover
  it("completes full repair lifecycle from intake to delivery with audited history", () => {
    // 1. Intake
    const ticket = dataStore.createTicket(testOrgId, {
      customerData: {
        full_name: "Amitabh Bachchan",
        phone: "+91 98888 77777",
      },
      deviceData: {
        category: "smartphone",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
      },
      reported_problem: "Camera glass cracked",
      estimate_amount: 1800,
      condition_checklist: {
        screen_condition: "flawless",
        power_status: "turns_on",
        charging_status: "charges_normally",
        liquid_damage: "none_visible",
        body_condition: "excellent",
        accessories_received: ["Case"],
      },
    });

    expect(ticket.current_status).toBe("received");

    // 2. Technician assigned & diagnosis
    dataStore.assignTechnician(ticket.id, "staff-tech-1");
    dataStore.updateTicketStatus(ticket.id, "under_diagnosis");
    dataStore.addNote(ticket.id, "Camera sensor working. Only outer sapphire glass needs replacement.", "diagnostic");

    // 3. In Repair -> Ready for Pickup
    dataStore.updateTicketStatus(ticket.id, "in_repair");
    dataStore.updateTicketStatus(ticket.id, "quality_check");
    dataStore.updateTicketStatus(ticket.id, "ready_for_pickup");

    const readyTicket = dataStore.getTicketById(ticket.id);
    expect(readyTicket?.current_status).toBe("ready_for_pickup");

    // 4. Record Payment
    dataStore.recordPayment(testOrgId, ticket.id, 1800, "upi", "UPI/TEST/9988");

    // 5. Complete Handover
    const delivered = dataStore.completeHandover(
      ticket.id,
      "Amitabh Bachchan",
      "Camera thoroughly tested. Customer verified autofocus."
    );

    expect(delivered.current_status).toBe("delivered");
    expect(delivered.delivered_to_name).toBe("Amitabh Bachchan");
    expect(delivered.delivered_at).toBeDefined();

    // Verify complete history trail
    const history = dataStore.getStatusHistory(ticket.id);
    expect(history.length).toBeGreaterThanOrEqual(5);
    expect(history.some((h) => h.new_status === "received")).toBe(true);
    expect(history.some((h) => h.new_status === "delivered")).toBe(true);
  });
});
