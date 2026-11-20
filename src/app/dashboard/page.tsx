"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  HardHat,
  IndianRupee,
  RefreshCw,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge, PaymentStatusBadge } from "@/components/repairs/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RepairTicket } from "@/types";
import { useAuth } from "@/lib/auth-context";

interface DashboardMetrics {
  totalTickets: number;
  newTicketsToday: number;
  inRepairCount: number;
  awaitingApprovalCount: number;
  waitingForPartsCount: number;
  readyForPickupCount: number;
  deliveredCount: number;
  overdueCount: number;
  totalRevenue: number;
  outstandingBalance: number;
  lowStockCount: number;
  lowStockItems: Array<{ id: string; name: string; sku: string; quantity_on_hand: number; low_stock_threshold: number }>;
  statusCounts: Record<string, number>;
  technicianWorkload: Array<{ id: string; name: string; role: string; activeJobs: number }>;
}

export default function DashboardPage() {
  const { canViewFinancials, canIntakeDevices } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRecentTickets(data.recentTickets);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Command Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status for TechFix Repair Center • Indore, Madhya Pradesh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              className="h-9 text-xs border-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {canIntakeDevices && (
              <Button asChild size="sm" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
                <Link href="/repairs/new">
                  <Plus className="h-3.5 w-3.5" />
                  New Repair Intake
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Low Stock Banner (If any) */}
        {metrics && metrics.lowStockCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Low Stock Alert: {metrics.lowStockCount} items below threshold</h4>
                <p className="text-[11px] text-amber-700">
                  {metrics.lowStockItems.map((item) => `${item.name} (${item.quantity_on_hand} left)`).join(", ")}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs shrink-0">
              <Link href="/inventory">Manage Inventory</Link>
            </Button>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: In Repair */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                In Repair
              </CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrics?.inRepairCount ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Currently on technician benches</p>
            </CardContent>
          </Card>

          {/* Card 2: Awaiting Approval */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Awaiting Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metrics?.awaitingApprovalCount ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Estimates sent to customer</p>
            </CardContent>
          </Card>

          {/* Card 3: Ready for Pickup */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ready for Pickup
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{metrics?.readyForPickupCount ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Repairs verified & awaiting delivery</p>
            </CardContent>
          </Card>

          {/* Card 4: Overdue Repairs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overdue
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{metrics?.overdueCount ?? 0}</div>
              <p className="text-[11px] text-slate-500 mt-1">Past promised delivery date</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial KPIs (Visible to Owner & Admin) */}
        {canViewFinancials && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Collected</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(metrics?.totalRevenue ?? 0)}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Across all settled repairs & advances</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{formatCurrency(metrics?.outstandingBalance ?? 0)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">To be collected upon device handover</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Completed Repairs</div>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">{metrics?.deliveredCount ?? 0} Delivered</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Successfully handed over to customers</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Section: Technician Workload & Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Repair Pipeline Breakdown</h3>
            <div className="space-y-2">
              {metrics &&
                Object.entries(metrics.statusCounts).map(([status, count]) => {
                  if (count === 0 && (status === "cancelled" || status === "unrepairable")) return null;
                  return (
                    <div key={status} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="capitalize text-slate-600 font-medium">{status.replace(/_/g, " ")}</span>
                      <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded text-[11px]">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Technician Workload */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Technician Active Workload</h3>
              <span className="text-[11px] text-slate-500">Uncompleted assigned jobs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics?.technicianWorkload.map((tech) => (
                <div key={tech.id} className="p-3.5 border border-slate-200/80 rounded-lg bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{tech.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{tech.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-blue-600">{tech.activeJobs}</div>
                    <div className="text-[10px] text-slate-500">active jobs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Repairs Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Repair Tickets</h3>
              <p className="text-[11px] text-slate-500">Latest devices admitted or updated</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
              <Link href="/repairs" className="flex items-center gap-1">
                View All Repairs
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Promised Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      <Link href={`/repairs/${ticket.id}`} className="hover:underline">
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ticket.customer?.full_name}</div>
                      <div className="text-[11px] text-slate-500">{ticket.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{ticket.device?.brand} {ticket.device?.model}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{ticket.reported_problem}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {ticket.technician?.full_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.current_status} />
                    </td>
                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={ticket.payment_status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(ticket.estimated_delivery_date)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                        <Link href={`/repairs/${ticket.id}`}>Manage</Link>
                      </Button>
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
