"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Search, Plus, Phone, Mail, MapPin, Wrench, ArrowRight, UserCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Name and Phone number are required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email: email || undefined,
          address: address || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (res.status === 409) {
        toast.warning(data.message || "A customer with this phone number already exists.");
        return;
      }
      if (!data.success) throw new Error(data.error);

      toast.success(`Customer ${data.customer.full_name} created successfully!`);
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");
      fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create customer";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage client records, phone contacts, address notes, and previous repair histories.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by customer name, phone number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading customer records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No matching customer found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/customers/${c.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                          {c.full_name}
                        </Link>
                        {c.notes && <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{c.notes}</div>}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {c.phone}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {c.email || "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                        {c.address || "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(c.created_at)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                          <Link href={`/customers/${c.id}`} className="gap-1">
                            <span>View History</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleCreateCustomer} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <p className="text-xs text-slate-500">Client details will be saved for repeat repair tickets.</p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="text-xs">
                    Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cName"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cPhone" className="text-xs">
                    Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cPhone"
                    placeholder="e.g. +91 98260 11223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cEmail" className="text-xs">Email Address (Optional)</Label>
                  <Input
                    id="cEmail"
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cAddress" className="text-xs">Address / Area (Optional)</Label>
                  <Input
                    id="cAddress"
                    placeholder="e.g. Scheme 54, Vijay Nagar, Indore"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cNotes" className="text-xs">Internal Customer Notes</Label>
                  <Input
                    id="cNotes"
                    placeholder="e.g. Regular customer, prefers evening pickup"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? "Saving..." : "Save Customer"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
