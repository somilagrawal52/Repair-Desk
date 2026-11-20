import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISequence {
  organization_id: string;
  year: number;
  last_seq: number;
  created_at?: Date;
  updated_at?: Date;
}

const SequenceSchema = new Schema<ISequence>(
  {
    organization_id: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    last_seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SequenceSchema.index({ organization_id: 1, year: 1 }, { unique: true });

export const SequenceModel: Model<ISequence> =
  mongoose.models.Sequence || mongoose.model<ISequence>("Sequence", SequenceSchema);
