"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Shield,
  Plus,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrganizationMember, UserRole } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function StaffPage() {
  const { isOwner, isAdmin, currentUser } = useAuth();
  const [staffList, setStaffList] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("technician");
  const [password, setPassword] = useState("staff123");
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in staff name and email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          role,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add staff member");
      }

      toast.success(`${fullName} has been added as a ${role}`);
      setShowAddModal(false);
      setFullName("");
      setEmail("");
      setPassword("staff123");
      fetchStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add staff member";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff & Roles</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage shop technicians, receptionists, and role-based operational permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStaff}
              disabled={loading}
              className="h-9 text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {(isOwner || isAdmin) && (
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Staff Member
              </Button>
            )}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium">Loading staff members...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Permissions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <div>{member.full_name}</div>
                          {member.id === currentUser?.id && (
                            <span className="text-[10px] text-blue-600 font-semibold">(You)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {member.email}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            member.role === "owner"
                              ? "bg-purple-100 text-purple-800"
                              : member.role === "receptionist"
                              ? "bg-blue-100 text-blue-800"
                              : member.role === "technician"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {member.role === "owner" && "Full administrative, financial & shop management"}
                        {member.role === "admin" && "Administrative settings, pricing, assignments & financial reports"}
                        {member.role === "receptionist" && "Device intake, customer registry, payments & handovers"}
                        {member.role === "technician" && "Assigned repairs, diagnostics, parts usage & QC submission"}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(member.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Add Shop Staff Member
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anand Kulkarni"
                    className="mt-1 h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Staff Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@techfix.in"
                    className="mt-1 h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Assigned Staff Role *</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="technician">Technician (Repairs, diagnostics, parts requests)</option>
                    <option value="receptionist">Receptionist (Intake, tickets, payments, delivery)</option>
                    <option value="admin">Administrator (Shop manager)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Initial Password *</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="staff123"
                    className="mt-1 h-9 text-xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Staff member can change their password after signing in.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {submitting ? "Adding..." : "Add Staff Member"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
