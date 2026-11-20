import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReceipt {
  receiptId: string;
  organization_id: string;
  ticket_id: string;
  receipt_number: string;
  total_charges: number;
  total_paid: number;
  balance_remaining: number;
  notes?: string | null;
  created_at: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    receiptId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    receipt_number: { type: String, required: true, unique: true, index: true },
    total_charges: { type: Number, required: true },
    total_paid: { type: Number, required: true },
    balance_remaining: { type: Number, required: true },
    notes: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const ReceiptModel: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);
