"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  Smartphone,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { RepairTicket, Payment } from "@/types";

export default function ReportsPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tickets").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ])
      .then(([tData, pData]) => {
        if (tData.success) setTickets(tData.tickets);
        if (pData.success) setPayments(pData.payments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCompleted = tickets.filter((t) => t.current_status === "delivered").length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    const cat = t.device?.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = [
      "Ticket Number",
      "Customer Name",
      "Phone",
      "Category",
      "Brand",
      "Model",
      "Status",
      "Payment Status",
      "Estimate Amount (INR)",
      "Final Charge (INR)",
      "Created At",
    ];

    const rows = tickets.map((t) => [
      `"${t.ticket_number}"`,
      `"${t.customer?.full_name || ""}"`,
      `"${t.customer?.phone || ""}"`,
      `"${t.device?.category || ""}"`,
      `"${t.device?.brand || ""}"`,
      `"${t.device?.model || ""}"`,
      `"${t.current_status}"`,
      `"${t.payment_status}"`,
      t.estimate_amount,
      t.final_charge,
      `"${t.created_at}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `repairdesk-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial metrics, device volume breakdowns, and audit exports.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export Tickets to CSV
          </Button>
        </div>

        {/* 3 Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalRevenue)}</div>
              <p className="text-[11px] text-emerald-600 mt-1">Across all settled repairs & advance deposits</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Completed Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-blue-600">{totalCompleted} Units</div>
              <p className="text-[11px] text-slate-500 mt-1">Successfully repaired and handed over</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Average Repair Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(tickets.length > 0 ? totalRevenue / tickets.length : 0)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Average ticket realization</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Repair Volume by Device Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0;
              return (
                <div key={cat} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block capitalize">
                    {cat}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">{count} repairs</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{pct}% of total intake</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
