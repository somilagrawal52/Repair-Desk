import mongoose, { Schema, Document, Model } from "mongoose";
import { DeviceCategory } from "@/types";

export interface IDevice {
  deviceId: string;
  organization_id: string;
  customer_id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  color?: string | null;
  serial_number?: string | null;
  created_at: Date;
  updated_at: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    customer_id: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["smartphone", "laptop", "desktop", "tablet", "smartwatch", "audio", "appliance", "other"],
      default: "smartphone",
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, trim: true, default: null },
    serial_number: { type: String, trim: true, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const DeviceModel: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>("Device", DeviceSchema);
