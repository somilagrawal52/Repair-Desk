import mongoose, { Schema, Document, Model } from "mongoose";
import { RepairStatus, PaymentStatus, ConditionChecklist } from "@/types";

export interface IRepairTicket {
  ticketId: string;
  organization_id: string;
  ticket_number: string;
  customer_id: string;
  device_id: string;
  assigned_technician_id?: string | null;
  current_status: RepairStatus;
  payment_status: PaymentStatus;
  reported_problem: string;
  intake_notes?: string | null;
  accessories_received?: string | null;
  condition_checklist: ConditionChecklist;
  estimated_delivery_date?: Date | null;
  estimate_amount: number;
  final_charge: number;
  delivered_at?: Date | null;
  delivered_to_name?: string | null;
  handover_notes?: string | null;
  tracking_token: string;
  created_at: Date;
  updated_at: Date;
}

const RepairTicketSchema = new Schema<IRepairTicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    ticket_number: { type: String, required: true, unique: true, index: true },
    customer_id: { type: String, required: true, index: true },
    device_id: { type: String, required: true, index: true },
    assigned_technician_id: { type: String, default: null, index: true },
    current_status: {
      type: String,
      enum: [
        "received",
        "under_diagnosis",
        "awaiting_approval",
        "waiting_for_parts",
        "in_repair",
        "quality_check",
        "ready_for_pickup",
        "delivered",
        "cancelled",
        "unrepairable",
      ],
      default: "received",
      index: true,
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "partially_paid", "fully_paid", "refunded"],
      default: "unpaid",
    },
    reported_problem: { type: String, required: true },
    intake_notes: { type: String, default: null },
    accessories_received: { type: String, default: null },
    condition_checklist: { type: Schema.Types.Mixed, default: {} },
    estimated_delivery_date: { type: Date, default: null },
    estimate_amount: { type: Number, default: 0 },
    final_charge: { type: Number, default: 0 },
    delivered_at: { type: Date, default: null },
    delivered_to_name: { type: String, default: null },
    handover_notes: { type: String, default: null },
    tracking_token: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

RepairTicketSchema.index({ organization_id: 1, current_status: 1 });
RepairTicketSchema.index({ organization_id: 1, assigned_technician_id: 1 });

export const RepairTicketModel: Model<IRepairTicket> =
  mongoose.models.RepairTicket || mongoose.model<IRepairTicket>("RepairTicket", RepairTicketSchema);
