import mongoose, { Schema, Model } from "mongoose";

export interface ITicketAttachment {
  attachmentId: string;
  ticket_id: string;
  category: "intake" | "diagnosis" | "repair" | "handover";
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string | null;
  caption?: string | null;
  created_at: Date;
}

const TicketAttachmentSchema = new Schema<ITicketAttachment>(
  {
    attachmentId: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["intake", "diagnosis", "repair", "handover"],
      default: "intake",
    },
    file_url: { type: String, required: true },
    file_name: { type: String, required: true },
    file_size: { type: Number, default: 0 },
    mime_type: { type: String, default: "image/jpeg" },
    uploaded_by: { type: String, default: null },
    caption: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const TicketAttachmentModel: Model<ITicketAttachment> =
  mongoose.models.TicketAttachment ||
  mongoose.model<ITicketAttachment>("TicketAttachment", TicketAttachmentSchema);
