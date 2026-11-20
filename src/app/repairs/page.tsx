"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wrench,
  Search,
  Plus,
  Filter,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge, PaymentStatusBadge } from "@/components/repairs/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RepairTicket, RepairStatus, DeviceCategory } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function RepairsList() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { canIntakeDevices } = useAuth();

  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [techFilter, setTechFilter] = useState<string>("all");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Status
      if (statusFilter !== "all" && t.current_status !== statusFilter) {
        return false;
      }
      // Category
      if (categoryFilter !== "all" && t.device?.category !== categoryFilter) {
        return false;
      }
      // Technician
      if (techFilter !== "all" && t.assigned_technician_id !== techFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = t.ticket_number.toLowerCase().includes(q);
        const matchesCust = t.customer?.full_name.toLowerCase().includes(q);
        const matchesPhone = t.customer?.phone.includes(q);
        const matchesModel = t.device?.model.toLowerCase().includes(q);
        const matchesBrand = t.device?.brand.toLowerCase().includes(q);
        const matchesIssue = t.reported_problem.toLowerCase().includes(q);
        if (!matchesNum && !matchesCust && !matchesPhone && !matchesModel && !matchesBrand && !matchesIssue) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, statusFilter, categoryFilter, techFilter, searchQuery]);

  // Tab counters
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      in_repair: tickets.filter((t) => t.current_status === "in_repair").length,
      awaiting_approval: tickets.filter((t) => t.current_status === "awaiting_approval").length,
      waiting_for_parts: tickets.filter((t) => t.current_status === "waiting_for_parts").length,
      ready_for_pickup: tickets.filter((t) => t.current_status === "ready_for_pickup").length,
      delivered: tickets.filter((t) => t.current_status === "delivered").length,
    };
  }, [tickets]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Repair Tickets</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage all ongoing, pending approval, ready, and delivered customer repairs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
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

        {/* Quick Filter Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-2 text-xs font-semibold select-none">
          {[
            { id: "all", label: "All Tickets", count: counts.all },
            { id: "in_repair", label: "In Repair", count: counts.in_repair },
            { id: "awaiting_approval", label: "Awaiting Approval", count: counts.awaiting_approval },
            { id: "waiting_for_parts", label: "Waiting for Parts", count: counts.waiting_for_parts },
            { id: "ready_for_pickup", label: "Ready for Pickup", count: counts.ready_for_pickup },
            { id: "delivered", label: "Delivered", count: counts.delivered },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? "bg-blue-800 text-blue-100" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Filter by ticket #, customer, phone, model or reported issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs h-9 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              <option value="smartphone">Smartphones</option>
              <option value="laptop">Laptops</option>
              <option value="desktop">Desktops</option>
              <option value="tablet">Tablets</option>
              <option value="smartwatch">Smartwatches</option>
              <option value="other">Other</option>
            </select>

            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="text-xs h-9 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Technicians</option>
              <option value="staff-tech-1">Amit Joshi</option>
              <option value="staff-tech-2">Rajesh Kumar</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Reported Issue</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading repair tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No repair tickets matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isOverdue =
                      ticket.current_status !== "delivered" &&
                      ticket.current_status !== "cancelled" &&
                      ticket.estimated_delivery_date &&
                      new Date(ticket.estimated_delivery_date).getTime() < Date.now();

                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          <Link href={`/repairs/${ticket.id}`} className="hover:underline">
                            {ticket.ticket_number}
                          </Link>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{ticket.customer?.full_name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {ticket.customer?.phone}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">
                            {ticket.device?.brand} {ticket.device?.model}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">{ticket.device?.category}</div>
                        </td>

                        <td className="py-3 px-4 max-w-[200px]">
                          <p className="truncate text-slate-700" title={ticket.reported_problem}>
                            {ticket.reported_problem}
                          </p>
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

                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-1 ${isOverdue ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                            {isOverdue && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                            <span>{formatDate(ticket.estimated_delivery_date)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                            <Link href={`/repairs/${ticket.id}`}>Manage</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function RepairsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading repairs directory...</div>}>
      <RepairsList />
    </Suspense>
  );
}
