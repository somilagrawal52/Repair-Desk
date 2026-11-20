import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventoryItem {
  itemId: string;
  organization_id: string;
  sku: string;
  name: string;
  category: string;
  compatible_models?: string | null;
  cost_price: number;
  selling_price: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
  supplier?: string | null;
  created_at: Date;
  updated_at: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    sku: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    compatible_models: { type: String, default: null },
    cost_price: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    quantity_on_hand: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 3 },
    supplier: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

InventoryItemSchema.index({ organization_id: 1, sku: 1 }, { unique: true });

export const InventoryItemModel: Model<IInventoryItem> =
  mongoose.models.InventoryItem || mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);
