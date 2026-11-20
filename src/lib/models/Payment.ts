import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentMethod } from "@/types";

export interface IPayment {
  paymentId: string;
  organization_id: string;
  ticket_id: string;
  ticket_number: string;
  customer_id: string;
  customer_name?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  recorded_by_name?: string | null;
  created_at: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    ticket_number: { type: String, required: true },
    customer_id: { type: String, required: true, index: true },
    customer_name: { type: String, default: null },
    amount: { type: Number, required: true },
    payment_method: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "card", "other"],
      default: "cash",
    },
    reference_number: { type: String, default: null },
    notes: { type: String, default: null },
    recorded_by: { type: String, default: null },
    recorded_by_name: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
