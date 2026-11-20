"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  HardHat,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Package,
  Smartphone,
  Calendar,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/repairs/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RepairTicket, RepairStatus } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";

export default function TechnicianWorkspacePage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assigned" | "diagnosis" | "in_repair" | "quality_check">("assigned");

  const [activeNoteTicketId, setActiveNoteTicketId] = useState<string | null>(null);
  const [techNote, setTechNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchTechnicianTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianTickets();
  }, []);

  const myTickets = tickets.filter(
    (t) =>
      (!currentUser?.id || t.assigned_technician_id === currentUser.id) &&
      t.current_status !== "delivered" &&
      t.current_status !== "cancelled"
  );

  const underDiagnosis = tickets.filter((t) => t.current_status === "under_diagnosis");
  const inRepair = tickets.filter((t) => t.current_status === "in_repair" || t.current_status === "waiting_for_parts");
  const awaitingQC = tickets.filter((t) => t.current_status === "quality_check");

  const handleQuickStatus = async (ticketId: string, newStatus: RepairStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: newStatus,
          staffId: currentUser?.id,
          notes: `Status updated by technician ${currentUser?.full_name}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Job updated to ${newStatus.replace(/_/g, " ")}`);
      fetchTechnicianTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    }
  };

  const handleAddDiagnosticNote = async (ticketId: string) => {
    if (!techNote.trim()) return;
    try {
      setSubmittingNote(true);
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: techNote,
          note_type: "diagnostic",
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Diagnostic finding recorded");
      setTechNote("");
      setActiveNoteTicketId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Note failed";
      toast.error(msg);
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HardHat className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technician Workbench</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong>{currentUser?.full_name}</strong> (Technician Bench View)
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "assigned" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Assigned to Me</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-800 text-blue-100">
              {myTickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("diagnosis")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "diagnosis" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Awaiting Diagnosis</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {underDiagnosis.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("in_repair")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "in_repair" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>In Repair</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {inRepair.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("quality_check")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "quality_check" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Quality Check</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {awaitingQC.length}
            </span>
          </button>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === "assigned"
            ? myTickets
            : activeTab === "diagnosis"
            ? underDiagnosis
            : activeTab === "in_repair"
            ? inRepair
            : awaitingQC
          ).map((ticket) => (
            <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/repairs/${ticket.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                      {ticket.ticket_number}
                    </Link>
                    <StatusBadge status={ticket.current_status} />
                  </div>
                  <h3 className="font-bold text-slate-900 mt-1">
                    {ticket.device?.brand} {ticket.device?.model}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Client: {ticket.customer?.full_name} • Est. Completion: {formatDate(ticket.estimated_delivery_date)}
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5">
                  <Link href={`/repairs/${ticket.id}`}>Open Workstation</Link>
                </Button>
              </div>

              {/* Reported Fault */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs">
                <span className="text-[10px] font-bold uppercase text-red-900 block">Reported Defect</span>
                <p className="text-slate-900 mt-0.5 leading-relaxed">{ticket.reported_problem}</p>
              </div>

              {/* Physical Condition Quick Glance */}
              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Screen</span>
                  <span className="font-bold capitalize text-slate-800">
                    {ticket.condition_checklist?.screen_condition?.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Power</span>
                  <span className="font-bold capitalize text-slate-800">
                    {ticket.condition_checklist?.power_status?.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">LDI Liquid</span>
                  <span className="font-bold capitalize text-slate-800">
                    {ticket.condition_checklist?.liquid_damage?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Quick Note Drawer */}
              {activeNoteTicketId === ticket.id ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Textarea
                    placeholder="Log technical multimeter findings, replaced IC, test measurements..."
                    value={techNote}
                    onChange={(e) => setTechNote(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveNoteTicketId(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={submittingNote}
                      onClick={() => handleAddDiagnosticNote(ticket.id)}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Finding
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveNoteTicketId(ticket.id)}
                    className="text-blue-600 hover:underline text-[11px] font-medium"
                  >
                    + Add Diagnostic Finding
                  </button>

                  {/* Stage Progress Shortcuts */}
                  <div className="flex items-center gap-1.5">
                    {ticket.current_status === "received" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickStatus(ticket.id, "under_diagnosis")}
                        className="h-7 text-[11px] bg-blue-600 text-white"
                      >
                        Start Diagnosis
                      </Button>
                    )}
                    {ticket.current_status === "under_diagnosis" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickStatus(ticket.id, "in_repair")}
                        className="h-7 text-[11px] bg-indigo-600 text-white"
                      >
                        Begin Repair
                      </Button>
                    )}
                    {ticket.current_status === "in_repair" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickStatus(ticket.id, "quality_check")}
                        className="h-7 text-[11px] bg-cyan-600 text-white"
                      >
                        Send to QC
                      </Button>
                    )}
                    {ticket.current_status === "quality_check" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickStatus(ticket.id, "ready_for_pickup")}
                        className="h-7 text-[11px] bg-emerald-600 text-white"
                      >
                        Pass & Ready
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
