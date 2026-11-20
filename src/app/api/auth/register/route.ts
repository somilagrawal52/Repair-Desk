import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { OrganizationModel } from "@/lib/models/Organization";
import { UserModel } from "@/lib/models/User";
import { SequenceModel } from "@/lib/models/Sequence";
import { createToken } from "@/lib/auth-jwt";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      owner_name,
      email,
      password,
      shop_name,
      phone,
      address,
      city = "Indore",
      state = "Madhya Pradesh",
      ticket_prefix = "RD",
      repair_terms,
    } = body;

    if (!owner_name || !email || !password || !shop_name || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Owner name, email, password, shop name, and phone are required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const slug =
      shop_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 6);

    await connectToDatabase();

    // Check if email already registered
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const orgId = `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const staffId = `staff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Create Organization
    const defaultTerms =
      repair_terms ||
      "1. Minimum inspection fee of ₹200 applies if device is diagnosed as unrepairable.\n2. Repair warranty is 30 days covering replaced parts only.\n3. Shop is not liable for data loss during repairs. Backups are customer responsibility.\n4. Unclaimed devices past 60 days will be disposed of to recover costs.";

    const org = await OrganizationModel.create({
      orgId,
      name: shop_name.trim(),
      slug,
      phone: phone.trim(),
      email: cleanEmail,
      address: (address || `${city}, ${state}`).trim(),
      city: city.trim(),
      state: state.trim(),
      country: "India",
      currency: "INR",
      timezone: "Asia/Kolkata",
      ticket_prefix: ticket_prefix.toUpperCase().trim() || "RD",
      repair_terms: defaultTerms,
    });

    // Hash Password & Create Owner User
    const password_hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      staffId,
      organization_id: orgId,
      email: cleanEmail,
      password_hash,
      full_name: owner_name.trim(),
      role: "owner",
      is_active: true,
    });

    // Initialize Sequence counter for concurrency-safe ticket numbers
    await SequenceModel.create({
      organization_id: orgId,
      year: new Date().getFullYear(),
      last_seq: 0,
    });

    const token = await createToken({
      staffId: user.staffId,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      full_name: user.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.staffId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization_id: user.organization_id,
      },
      organization: {
        id: org.orgId,
        name: org.name,
        slug: org.slug,
        ticket_prefix: org.ticket_prefix,
      },
      token,
    }, { status: 201 });

    response.cookies.set("repairdesk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Shop onboarding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
