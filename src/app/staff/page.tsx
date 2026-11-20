"use client";

import React, { useState } from "react";
import { UserCheck, Shield, Plus, Mail, CheckCircle2, User } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { initialStaff } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function StaffPage() {
  const [staffList] = useState(initialStaff);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff & Roles</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage shop technicians, receptionists, and role-based permissions.
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                        {member.full_name.charAt(0)}
                      </div>
                      <span>{member.full_name}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {member.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        member.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : member.role === "receptionist"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {member.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {member.role === "owner" && "Full administrative, financial & shop management"}
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
        </div>
      </div>
    </AppShell>
  );
}
