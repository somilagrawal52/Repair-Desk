"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Search, Plus, RefreshCw, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialEstimates } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState(initialEstimates);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = estimates.filter((e) =>
    e.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.items.some((item) => item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Repair Estimates & Quotes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review parts & labour quotes, revisions, and customer approvals.
            </p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search estimates by item description or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((est) => (
            <div key={est.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Estimate Revision #{est.revision_number}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        est.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : est.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {est.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Created on {formatDateTime(est.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Amount</span>
                    <span className="text-base font-extrabold text-blue-600">{formatCurrency(est.total_amount)}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs ml-3">
                    <Link href={`/repairs/${est.ticket_id}`}>
                      View Ticket
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {est.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${item.item_type === "part" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                        {item.item_type}
                      </span>
                      <span className="text-slate-800 font-medium">{item.description}</span>
                    </div>
                    <div className="font-bold text-slate-900">{formatCurrency(item.total_price)}</div>
                  </div>
                ))}
              </div>

              {est.approval && (
                <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-700 border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Approval Record:</strong> Approved via{" "}
                    <span className="capitalize">{est.approval.channel.replace(/_/g, " ")}</span> by{" "}
                    {est.approval.recorded_by_name} on {formatDateTime(est.approval.decided_at)}.
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
