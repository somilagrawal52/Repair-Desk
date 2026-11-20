"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Smartphone,
  Wrench,
  Clock,
  Plus,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge, PaymentStatusBadge } from "@/components/repairs/status-badge";
import { Button } from "@/components/ui/button";
import { Customer, Device, RepairTicket } from "@/types";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.customer);
          setDevices(data.devices);
          setTickets(data.tickets);
        } else {
          toast.error("Customer not found");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading || !customer) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading customer profile...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Back Link */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/customers")}
            className="text-xs text-slate-600 gap-1.5 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Customer Directory
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-2xl">
              {customer.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-mono font-medium text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
              <Link href="/repairs/new">
                <Plus className="h-3.5 w-3.5" />
                Intake New Device For Customer
              </Link>
            </Button>
          </div>
        </div>

        {/* 2-Column: Customer Devices & Repair History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registered Devices */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Customer Devices ({devices.length})</span>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </h3>

            {devices.length === 0 ? (
              <p className="text-xs text-slate-500">No device registered yet.</p>
            ) : (
              <div className="space-y-2">
                {devices.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-900">
                      {d.brand} {d.model}
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {d.category} • Color: {d.color || "N/A"}
                    </div>
                    {d.serial_number && (
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Serial: {d.serial_number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repair History Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Repair Tickets History ({tickets.length})</span>
              <Wrench className="h-4 w-4 text-blue-600" />
            </h3>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500">No repair tickets on record for this customer.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Ticket #</th>
                      <th className="py-2.5 px-3">Device & Fault</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Charge</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          <Link href={`/repairs/${t.id}`}>{t.ticket_number}</Link>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">
                            {t.device?.brand} {t.device?.model}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {t.reported_problem}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={t.current_status} />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {formatCurrency(t.final_charge || t.estimate_amount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {formatDate(t.created_at)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] px-2">
                            <Link href={`/repairs/${t.id}`}>Open</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
