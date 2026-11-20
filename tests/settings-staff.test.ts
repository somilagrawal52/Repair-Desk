import { describe, it, expect } from "vitest";
import { dataStore } from "../src/lib/data-service";
import { INITIAL_ORG_ID } from "../src/lib/mock-data";

describe("RepairDesk Settings & Staff Management Tests", () => {
  it("updates organization profile, prefix, and terms correctly", () => {
    const updated = dataStore.updateOrganization(INITIAL_ORG_ID, {
      name: "TechFix Pro Indore",
      ticket_prefix: "TP",
      repair_terms: "Updated terms with 45 days warranty.",
    });

    expect(updated.name).toBe("TechFix Pro Indore");
    expect(updated.ticket_prefix).toBe("TP");
    expect(updated.repair_terms).toBe("Updated terms with 45 days warranty.");

    const fetched = dataStore.getOrganization(INITIAL_ORG_ID);
    expect(fetched.name).toBe("TechFix Pro Indore");
    expect(fetched.ticket_prefix).toBe("TP");
  });

  it("adds and retrieves new staff members for the shop", () => {
    const newStaff = dataStore.addStaffMember(INITIAL_ORG_ID, {
      organization_id: INITIAL_ORG_ID,
      user_id: "usr-anand-99",
      email: "anand.k@techfix.in",
      full_name: "Anand Kulkarni",
      role: "technician",
      is_active: true,
    });

    expect(newStaff.id).toBeDefined();
    expect(newStaff.full_name).toBe("Anand Kulkarni");
    expect(newStaff.role).toBe("technician");

    const allStaff = dataStore.getStaffMembers(INITIAL_ORG_ID);
    const found = allStaff.find((s) => s.email === "anand.k@techfix.in");
    expect(found).toBeDefined();
    expect(found?.role).toBe("technician");
  });

  it("fetches all estimates across all tickets for the organization", () => {
    const allEstimates = dataStore.getAllEstimates(INITIAL_ORG_ID);
    expect(Array.isArray(allEstimates)).toBe(true);
    expect(allEstimates.length).toBeGreaterThan(0);
    allEstimates.forEach((e) => {
      expect(e.organization_id).toBe(INITIAL_ORG_ID);
      expect(e.items.length).toBeGreaterThan(0);
      expect(e.total_amount).toBeGreaterThan(0);
    });
  });
});
