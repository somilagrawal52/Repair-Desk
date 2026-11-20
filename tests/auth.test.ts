import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { createToken, verifyToken } from "../src/lib/auth-jwt";

describe("RepairDesk Authentication & Security Tests", () => {
  it("securely hashes and verifies passwords using bcrypt", async () => {
    const rawPassword = "ShopOwner@Password2026";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await bcrypt.compare(rawPassword, hash);
    expect(matches).toBe(true);

    const wrongMatches = await bcrypt.compare("WrongPassword", hash);
    expect(wrongMatches).toBe(false);
  });

  it("creates and verifies cryptographically signed JWT tokens", async () => {
    const payload = {
      staffId: "staff-test-101",
      email: "vikram@techfix.in",
      role: "owner",
      organization_id: "org-techfix-indore",
      full_name: "Vikram Patel",
    };

    const token = await createToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.staffId).toBe(payload.staffId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.organization_id).toBe(payload.organization_id);
    expect(decoded?.full_name).toBe(payload.full_name);
  });

  it("rejects tampered or forged JWT tokens", async () => {
    const validToken = await createToken({
      staffId: "staff-test-102",
      email: "rahul@techfix.in",
      role: "technician",
      organization_id: "org-techfix-indore",
      full_name: "Rahul Verma",
    });

    // Tamper payload segment
    const parts = validToken.split(".");
    const tamperedToken = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;

    const decoded = await verifyToken(tamperedToken);
    expect(decoded).toBeNull();
  });
});
