import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization {
  orgId: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  currency: string;
  timezone: string;
  logo_url?: string | null;
  ticket_prefix: string;
  repair_terms: string;
  created_at: Date;
  updated_at: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    orgId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, default: "Indore" },
    state: { type: String, default: "Madhya Pradesh" },
    country: { type: String, default: "India" },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    logo_url: { type: String, default: null },
    ticket_prefix: { type: String, default: "RD" },
    repair_terms: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const OrganizationModel: Model<IOrganization> =
  mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);
