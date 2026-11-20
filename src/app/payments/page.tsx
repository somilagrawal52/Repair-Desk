"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  IndianRupee,
  RefreshCw,
  Calendar,
  User,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Payment } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const upiCollected = payments.filter((p) => p.payment_method === "upi").reduce((sum, p) => sum + p.amount, 0);
  const cashCollected = payments.filter((p) => p.payment_method === "cash").reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) => {
    if (methodFilter !== "all" && p.payment_method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTicket = p.ticket_number?.toLowerCase().includes(q);
      const matchCust = p.customer_name?.toLowerCase().includes(q);
      const matchRef = p.reference_number?.toLowerCase().includes(q);
      if (!matchTicket && !matchCust && !matchRef) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Receipts</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited payment transaction records, advances, settlements, and receipt tracking.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
            className="h-9 text-xs border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Revenue KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalCollected)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {payments.length} transactions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UPI / Online Received</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{formatCurrency(upiCollected)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant bank UPI QR settlements</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash at Counter</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(cashCollected)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Physical counter cash intake</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Filter by ticket #, customer, or transaction reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs h-9 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Ticket Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference / Notes</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      Loading payment records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No payment records matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-600">
                        {formatDateTime(p.created_at)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        <Link href={`/repairs/${p.ticket_id}?tab=payments`} className="hover:underline">
                          {p.ticket_number}
                        </Link>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900">
                        {p.customer_name || "Customer"}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-800">
                          {p.payment_method}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-mono text-[11px]">{p.reference_number || "—"}</div>
                        {p.notes && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.notes}</div>}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {p.recorded_by_name || "Reception"}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                          <Link href={`/repairs/${p.ticket_id}`}>Open Ticket</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
