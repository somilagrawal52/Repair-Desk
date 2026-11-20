"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Tag,
  Boxes,
  Truck,
  IndianRupee,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function InventoryPage() {
  const { canEditPricing } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Display");
  const [compatibleModels, setCompatibleModels] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [quantityOnHand, setQuantityOnHand] = useState<number | "">("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(3);
  const [supplier, setSupplier] = useState("");
  const [saving, setSaving] = useState(false);

  // Restock Modal
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);

  // Consume Modal
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [consumeTicketId, setConsumeTicketId] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !category.trim()) {
      toast.error("SKU, Name, and Category are required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          category: category.trim(),
          compatible_models: compatibleModels.trim() || undefined,
          cost_price: Number(costPrice) || 0,
          selling_price: Number(sellingPrice) || 0,
          quantity_on_hand: Number(quantityOnHand) || 0,
          low_stock_threshold: Number(lowStockThreshold) || 3,
          supplier: supplier.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Inventory item '${data.item.name}' created!`);
      setShowAddModal(false);
      setSku("");
      setName("");
      setCompatibleModels("");
      setCostPrice("");
      setSellingPrice("");
      setQuantityOnHand("");
      setSupplier("");
      fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || restockQty <= 0) return;

    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: restockQty }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Added ${restockQty} units to ${selectedItem.name}. New total: ${data.item.quantity_on_hand}`);
      setShowRestockModal(false);
      fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Restock failed";
      toast.error(msg);
    }
  };

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || consumeQty <= 0) return;

    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: consumeQty,
          ticketId: consumeTicketId || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Deducted ${consumeQty} unit(s) for repair. Remaining in stock: ${data.newQuantity}`);
      setShowConsumeModal(false);
      setConsumeTicketId("");
      fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deduction failed";
      toast.error(msg);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.compatible_models?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = items.filter((i) => i.quantity_on_hand <= i.low_stock_threshold).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Spare Parts Inventory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track displays, batteries, flex cables, ICs, cost vs selling margins, and restock levels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInventory}
              disabled={loading}
              className="h-9 text-xs border-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {canEditPricing && (
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Spare Part
              </Button>
            )}
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Inventory Alert:</span> {lowStockCount} item(s) are running below their designated reorder threshold.
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search parts by name, SKU code (e.g. DISP-SAM-S23), category, or compatible model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Part Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Compatibility</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-right">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = item.quantity_on_hand <= item.low_stock_threshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {item.sku}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.supplier && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Truck className="h-3 w-3" />
                              {item.supplier}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={item.compatible_models || ""}>
                          {item.compatible_models || "Universal"}
                        </td>

                        <td className="py-3 px-4 text-right text-slate-600">
                          {formatCurrency(item.cost_price)}
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(item.selling_price)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isLow
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {isLow && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                            {item.quantity_on_hand} in stock
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowConsumeModal(true);
                              }}
                              className="h-7 text-[11px] px-2 text-rose-700 hover:bg-rose-50 border-rose-200"
                              title="Consume part in repair"
                            >
                              - Consume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowRestockModal(true);
                              }}
                              className="h-7 text-[11px] px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              title="Restock part"
                            >
                              + Restock
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Part Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleCreateItem} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add Spare Part</h3>
              <p className="text-xs text-slate-500">Record a new replacement part in your inventory catalog.</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">SKU Code *</Label>
                    <Input
                      placeholder="e.g. DISP-IPH13-OLED"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                      className="text-xs h-9 uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category *</Label>
                    <Input
                      placeholder="e.g. Display, Battery, Port"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Part Name *</Label>
                  <Input
                    placeholder="e.g. iPhone 13 Original OLED Display Assembly"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Compatible Models</Label>
                  <Input
                    placeholder="e.g. iPhone 13, iPhone 13 Pro"
                    value={compatibleModels}
                    onChange={(e) => setCompatibleModels(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Cost Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 4200"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Selling Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5500"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Initial Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={quantityOnHand}
                      onChange={(e) => setQuantityOnHand(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Low Stock Alert Threshold</Label>
                    <Input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Supplier / Wholesaler</Label>
                  <Input
                    placeholder="e.g. Apex Mobile Spares Mumbai"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? "Saving..." : "Save Part"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleRestock} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Restock Component</h3>
              <p className="text-xs text-slate-500">
                Adding inventory for <strong>{selectedItem.name}</strong> (Currently {selectedItem.quantity_on_hand} in stock).
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs">Units to Add</Label>
                <Input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRestockModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Confirm Restock
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Consume Modal */}
        {showConsumeModal && selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleConsume} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Consume Part in Repair</h3>
              <p className="text-xs text-slate-500">
                Deducting stock for <strong>{selectedItem.name}</strong> (Available: {selectedItem.quantity_on_hand}).
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantity Used</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedItem.quantity_on_hand}
                    value={consumeQty}
                    onChange={(e) => setConsumeQty(Math.max(1, Number(e.target.value)))}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Ticket # (Optional)</Label>
                  <Input
                    placeholder="e.g. RD-2026-000001"
                    value={consumeTicketId}
                    onChange={(e) => setConsumeTicketId(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowConsumeModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
                  Confirm Deduction
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
