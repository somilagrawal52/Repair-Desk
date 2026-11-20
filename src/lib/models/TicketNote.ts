import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicketNote {
  noteId: string;
  ticket_id: string;
  author_id?: string | null;
  author_name?: string | null;
  note_type: "internal" | "diagnostic" | "customer_visible";
  content: string;
  created_at: Date;
}

const TicketNoteSchema = new Schema<ITicketNote>(
  {
    noteId: { type: String, required: true, unique: true, index: true },
    ticket_id: { type: String, required: true, index: true },
    author_id: { type: String, default: null },
    author_name: { type: String, default: null },
    note_type: {
      type: String,
      enum: ["internal", "diagnostic", "customer_visible"],
      default: "internal",
    },
    content: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const TicketNoteModel: Model<ITicketNote> =
  mongoose.models.TicketNote || mongoose.model<ITicketNote>("TicketNote", TicketNoteSchema);
