import mongoose, { Schema, Document, Model } from "mongoose";
import { RepairStatus } from "@/types";

export interface ITicketStatusHistory {
  historyId: string;
  ticket_id: string;
  old_status?: RepairStatus | null;
  new_status: RepairStatus;
  changed_by?: string | null;
  changed_by_name?: string | null;
  notes?: string | null;
  created_at: Date;
}

const TicketStatusHistorySchema = new Schema<ITicketStatusHistory>(
  {
    historyId: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    old_status: { type: String, default: null },
    new_status: { type: String, required: true },
    changed_by: { type: String, default: null },
    changed_by_name: { type: String, default: null },
    notes: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const TicketStatusHistoryModel: Model<ITicketStatusHistory> =
  mongoose.models.TicketStatusHistory ||
  mongoose.model<ITicketStatusHistory>("TicketStatusHistory", TicketStatusHistorySchema);
