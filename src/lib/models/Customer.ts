import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer {
  customerId: string;
  organization_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, default: null },
    is_archived: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

CustomerSchema.index({ organization_id: 1, phone: 1 });
CustomerSchema.index({ organization_id: 1, full_name: 1 });

export const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
