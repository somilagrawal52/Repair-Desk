import mongoose, { Schema, Document, Model } from "mongoose";
import { EstimateStatus } from "@/types";

export interface IEstimateItem {
  id: string;
  item_type: "part" | "labour";
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface IEstimateApproval {
  id: string;
  status: "approved" | "rejected";
  channel: "in_person" | "phone_call" | "whatsapp" | "email";
  recorded_by?: string | null;
  recorded_by_name?: string | null;
  decision_notes?: string | null;
  decided_at: Date;
}

export interface IEstimate {
  estimateId: string;
  organization_id: string;
  ticket_id: string;
  revision_number: number;
  status: EstimateStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  created_by?: string | null;
  items: IEstimateItem[];
  approval?: IEstimateApproval | null;
  created_at: Date;
  updated_at: Date;
}

const EstimateSchema = new Schema<IEstimate>(
  {
    estimateId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    revision_number: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "sent", "approved", "rejected", "revised"],
      default: "draft",
    },
    subtotal: { type: Number, default: 0 },
    tax_rate: { type: Number, default: 0 },
    tax_amount: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    notes: { type: String, default: null },
    created_by: { type: String, default: null },
    items: [
      {
        id: String,
        item_type: { type: String, enum: ["part", "labour"] },
        description: String,
        quantity: Number,
        unit_price: Number,
        total_price: Number,
      },
    ],
    approval: {
      type: {
        id: String,
        status: { type: String, enum: ["approved", "rejected"] },
        channel: { type: String, enum: ["in_person", "phone_call", "whatsapp", "email"] },
        recorded_by: String,
        recorded_by_name: String,
        decision_notes: String,
        decided_at: Date,
      },
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const EstimateModel: Model<IEstimate> =
  mongoose.models.Estimate || mongoose.model<IEstimate>("Estimate", EstimateSchema);
