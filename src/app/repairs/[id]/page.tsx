"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  User,
  Phone,
  Mail,
  Smartphone,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Send,
  MessageSquare,
  FileSpreadsheet,
  CreditCard,
  HardHat,
  ArrowRight,
  Shield,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  FileCheck,
  Camera,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge, PaymentStatusBadge } from "@/components/repairs/status-badge";
import { PrintableJobCard } from "@/components/repairs/printable-jobcard";
import { PrintableReceipt } from "@/components/repairs/printable-receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  RepairTicket,
  RepairStatus,
  PaymentMethod,
  TicketStatusHistory,
  TicketNote,
  TicketAttachment,
  Estimate,
  Payment,
  Receipt,
  Organization,
} from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { TicketPhotoGallery } from "@/components/repairs/ticket-photo-gallery";

const STATUS_PIPELINE: RepairStatus[] = [
  "received",
  "under_diagnosis",
  "awaiting_approval",
  "waiting_for_parts",
  "in_repair",
  "quality_check",
  "ready_for_pickup",
  "delivered",
];

function RepairDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const autoPrint = searchParams.get("autoPrint") === "true";

  const { currentUser, currentRole, canEditPricing, canViewFinancials, isOwner, isAdmin } = useAuth();

  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [history, setHistory] = useState<TicketStatusHistory[]>([]);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<RepairStatus>("under_diagnosis");
  const [statusComment, setStatusComment] = useState("");

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<"diagnostic" | "customer_visible" | "internal">("diagnostic");

  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [estimatePartDesc, setEstimatePartDesc] = useState("");
  const [estimatePartPrice, setEstimatePartPrice] = useState<number | "">("");
  const [estimateLabourDesc, setEstimateLabourDesc] = useState("Technician Installation & Calibration");
  const [estimateLabourPrice, setEstimateLabourPrice] = useState<number | "">("");

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalEstimateId, setApprovalEstimateId] = useState("");
  const [approvalChannel, setApprovalChannel] = useState<"phone_call" | "in_person" | "whatsapp" | "email">("phone_call");
  const [approvalNotes, setApprovalNotes] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");

  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenTargetStatus, setReopenTargetStatus] = useState<RepairStatus>("under_diagnosis");
  const [reopenReason, setReopenReason] = useState("");
  const [reopening, setReopening] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("timeline");

  // Fetch full ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setOrganization(data.organization);
        setHistory(data.history);
        setNotes(data.notes);
        setEstimates(data.estimates);
        setPayments(data.payments);
        setReceipt(data.receipt || null);
        setAttachments(data.attachments || []);
        setRecipientName(data.ticket.customer?.full_name || "");
      } else {
        toast.error(data.error || "Failed to load repair details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    if (autoPrint && ticket) {
      setActiveTab("jobcard");
    }
  }, [autoPrint, ticket]);

  // Status transition handler
  const handleUpdateStatus = async (status: RepairStatus, notesText?: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status,
          notes: notesText || statusComment,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
      setShowStatusModal(false);
      setStatusComment("");
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    }
  };

  // Add Note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          note_type: noteType,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Note logged successfully");
      setNoteContent("");
      setShowNoteForm(false);
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add note";
      toast.error(msg);
    }
  };

  // Create Estimate handler
  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = [];
    if (estimatePartDesc.trim() && Number(estimatePartPrice) > 0) {
      items.push({
        item_type: "part" as const,
        description: estimatePartDesc.trim(),
        quantity: 1,
        unit_price: Number(estimatePartPrice),
      });
    }
    if (estimateLabourDesc.trim() && Number(estimateLabourPrice) > 0) {
      items.push({
        item_type: "labour" as const,
        description: estimateLabourDesc.trim(),
        quantity: 1,
        unit_price: Number(estimateLabourPrice),
      });
    }

    if (items.length === 0) {
      toast.error("Please add at least one part or labour charge");
      return;
    }

    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          items,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Estimate created successfully");
      setShowEstimateModal(false);
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create estimate";
      toast.error(msg);
    }
  };

  // Record Approval handler
  const handleRecordApproval = async (status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/estimates/${approvalEstimateId}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          channel: approvalChannel,
          notes: approvalNotes,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Estimate marked as ${status}`);
      setShowApprovalModal(false);
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Approval update failed";
      toast.error(msg);
    }
  };

  // Record Payment handler
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          amount,
          payment_method: paymentMethod,
          reference_number: paymentRef || undefined,
          notes: paymentNotes || undefined,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Payment of ${formatCurrency(amount)} recorded! Receipt generated.`);
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentRef("");
      setPaymentNotes("");
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment recording failed";
      toast.error(msg);
    }
  };

  // Complete Handover handler
  const handleCompleteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error("Please enter the name of the person receiving the device");
      return;
    }

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_handover",
          recipientName: recipientName.trim(),
          handoverNotes: handoverNotes.trim() || undefined,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Device successfully delivered to ${recipientName}!`);
      setShowHandoverModal(false);
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delivery handover failed";
      toast.error(msg);
    }
  };

  const handleReopenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      toast.error("Please provide an audited reason to reopen this job");
      return;
    }

    try {
      setReopening(true);
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reopen",
          targetStatus: reopenTargetStatus,
          reopenReason: reopenReason.trim(),
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reopen ticket");
      }

      toast.success(`Repair job reopened to ${reopenTargetStatus.replace(/_/g, " ")}!`);
      setShowReopenModal(false);
      setReopenReason("");
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reopen failed";
      toast.error(msg);
    } finally {
      setReopening(false);
    }
  };

  // Technician Reassignment
  const handleAssignTechnician = async (techId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_technician",
          technicianId: techId || null,
          staffId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Technician assignment updated");
      fetchTicketDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Assignment failed";
      toast.error(msg);
    }
  };

  // Tracking link helper
  const trackingUrl =
    ticket && typeof window !== "undefined"
      ? `${window.location.origin}/track/${ticket.tracking_token}`
      : "";

  const handleCopyTrackingLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Public customer tracking link copied to clipboard!");
  };

  const handleOpenWhatsApp = () => {
    if (!ticket) return;
    const phone = ticket.customer?.phone?.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hello ${ticket.customer?.full_name}, your repair ticket ${ticket.ticket_number} for ${ticket.device?.brand} ${ticket.device?.model} is currently "${ticket.current_status.replace(/_/g, " ")}". You can track live status updates here: ${trackingUrl}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (loading || !ticket || !organization) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-500">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading repair details...
        </div>
      </AppShell>
    );
  }

  const totalCharges = ticket.final_charge || ticket.estimate_amount || 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, totalCharges - totalPaid);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-mono font-bold text-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold font-mono tracking-tight text-slate-900">
                    {ticket.ticket_number}
                  </h1>
                  <StatusBadge status={ticket.current_status} />
                  <PaymentStatusBadge status={ticket.payment_status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Intake on {formatDateTime(ticket.created_at)} • Target: {formatDate(ticket.estimated_delivery_date)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("jobcard")}
                className="h-8 text-xs border-slate-200 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Job Card
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyTrackingLink}
                className="h-8 text-xs border-slate-200 gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Tracking Link
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenWhatsApp}
                className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                Share on WhatsApp
              </Button>

              {ticket.current_status === "ready_for_pickup" && (
                <Button
                  size="sm"
                  onClick={() => setShowHandoverModal(true)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Handover & Deliver Device
                </Button>
              )}
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Workflow Status Progression
              </div>
              {(ticket.current_status === "delivered" || ticket.current_status === "cancelled") && (isOwner || isAdmin) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReopenModal(true)}
                  className="h-7 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 gap-1.5 font-semibold"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Reopen Repair Job (Audited)
                </Button>
              )}
            </div>
            <div className="flex items-center overflow-x-auto gap-1 pb-1">
              {STATUS_PIPELINE.map((st, idx) => {
                const currentIdx = STATUS_PIPELINE.indexOf(ticket.current_status);
                const isPassed = currentIdx > idx;
                const isCurrent = ticket.current_status === st;

                return (
                  <div key={st} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (ticket.current_status !== "delivered") {
                          setSelectedNextStatus(st);
                          setShowStatusModal(true);
                        }
                      }}
                      disabled={ticket.current_status === "delivered"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                          : isPassed
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                      <span className="capitalize">{st.replace(/_/g, " ")}</span>
                    </button>
                    {idx < STATUS_PIPELINE.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-slate-300 mx-1 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-200/80 p-1 w-full justify-start rounded-lg">
                <TabsTrigger value="timeline" className="text-xs">
                  Notes & Findings ({notes.length})
                </TabsTrigger>
                <TabsTrigger value="photos" className="text-xs">
                  Device Photos ({attachments.length})
                </TabsTrigger>
                <TabsTrigger value="estimates" className="text-xs">
                  Estimates ({estimates.length})
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">
                  Payments ({payments.length})
                </TabsTrigger>
                <TabsTrigger value="jobcard" className="text-xs">
                  Print Job Card (A4)
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Timeline & Notes */}
              <TabsContent value="timeline" className="space-y-4 pt-2">
                {/* Add Note Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Add Diagnostic / Customer Note
                    </h3>
                    <div className="flex gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setNoteType("diagnostic")}
                        className={`px-2.5 py-1 rounded font-medium ${
                          noteType === "diagnostic" ? "bg-blue-100 text-blue-800" : "text-slate-500"
                        }`}
                      >
                        Internal Diagnostic
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteType("customer_visible")}
                        className={`px-2.5 py-1 rounded font-medium ${
                          noteType === "customer_visible" ? "bg-emerald-100 text-emerald-800" : "text-slate-500"
                        }`}
                      >
                        Customer Visible
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-3">
                    <Textarea
                      placeholder={
                        noteType === "diagnostic"
                          ? "Technician findings: Component readings, solder observations, IC model, parts required..."
                          : "Message visible on customer tracking portal (e.g. AMOLED display replaced, currently undergoing soak testing)..."
                      }
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                        <Send className="h-3 w-3" />
                        Log Note
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Audit Log & Activity History
                  </h3>

                  {/* Combined notes & status updates */}
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-lg border text-xs shadow-xs ${
                          n.note_type === "customer_visible"
                            ? "bg-emerald-50/70 border-emerald-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{n.author_name}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                n.note_type === "customer_visible"
                                  ? "bg-emerald-200/60 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {n.note_type === "customer_visible" ? "Customer Visible Update" : "Internal Diagnostic"}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{formatDateTime(n.created_at)}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                      </div>
                    ))}

                    {/* Status History */}
                    {history.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-900">
                              Status changed to <span className="capitalize text-blue-600">{h.new_status.replace(/_/g, " ")}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{formatDateTime(h.created_at)}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            By {h.changed_by_name || "System"} • {h.notes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB: Condition Photographs */}
              <TabsContent value="photos" className="pt-2">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <TicketPhotoGallery
                    ticketId={ticket.id}
                    initialPhotos={attachments}
                    onPhotoUploaded={fetchTicketDetails}
                    canUpload={true}
                  />
                </div>
              </TabsContent>

              {/* TAB 2: Estimates */}
              <TabsContent value="estimates" className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Estimates & Quote Revisions</h3>
                  {canEditPricing && (
                    <Button
                      size="sm"
                      onClick={() => setShowEstimateModal(true)}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create New Estimate
                    </Button>
                  )}
                </div>

                {estimates.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                    No detailed estimate recorded yet. Initial intake estimate was {formatCurrency(ticket.estimate_amount)}.
                  </div>
                ) : (
                  estimates.map((est) => (
                    <div key={est.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>Estimate Revision #{est.revision_number}</span>
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
                          <div className="text-[11px] text-slate-500">Created on {formatDateTime(est.created_at)}</div>
                        </div>

                        {est.status === "draft" && canEditPricing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setApprovalEstimateId(est.id);
                              setShowApprovalModal(true);
                            }}
                            className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            Record Customer Decision
                          </Button>
                        )}
                      </div>

                      {/* Line Items Table */}
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                            <th className="py-2 px-3 text-left">Type</th>
                            <th className="py-2 px-3 text-left">Description</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {est.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${item.item_type === "part" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                                  {item.item_type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-800 font-medium">{item.description}</td>
                              <td className="py-2 px-3 text-center text-slate-600">{item.quantity}</td>
                              <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(item.total_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-bold text-slate-900">
                            <td colSpan={4} className="py-2.5 px-3 text-right">Total Estimate:</td>
                            <td className="py-2.5 px-3 text-right text-base text-blue-600">{formatCurrency(est.total_amount)}</td>
                          </tr>
                        </tfoot>
                      </table>

                      {est.approval && (
                        <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-700 border border-slate-200">
                          <strong>Decision Logged:</strong> {est.approval.status.toUpperCase()} via{" "}
                          <span className="capitalize">{est.approval.channel.replace(/_/g, " ")}</span> by{" "}
                          {est.approval.recorded_by_name} on {formatDateTime(est.approval.decided_at)}.
                          {est.approval.decision_notes && <p className="mt-1 italic text-slate-600">{est.approval.decision_notes}</p>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              {/* TAB 3: Payments & Receipts */}
              <TabsContent value="payments" className="space-y-4 pt-2">
                {/* Financial Summary Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Final Repair Charges</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalCharges)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalPaid)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance Due</div>
                    <div className={`text-2xl font-bold mt-1 ${balanceDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {formatCurrency(balanceDue)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Payment Register</h3>
                  {balanceDue > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setShowPaymentModal(true)}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Record Payment
                    </Button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                    No payment recorded yet. Record advance or final payment above.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                          <th className="py-2.5 px-4 text-left">Date</th>
                          <th className="py-2.5 px-4 text-left">Method</th>
                          <th className="py-2.5 px-4 text-left">Reference / Notes</th>
                          <th className="py-2.5 px-4 text-left">Recorded By</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-4 text-slate-700">{formatDateTime(p.created_at)}</td>
                            <td className="py-2.5 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-800">
                                {p.payment_method}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-700">
                              <div>{p.reference_number || "—"}</div>
                              {p.notes && <div className="text-[11px] text-slate-500 italic">{p.notes}</div>}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700">{p.recorded_by_name}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {receipt && (
                  <div className="pt-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Printable Payment Receipt</h3>
                    <PrintableReceipt
                      receipt={receipt}
                      ticket={ticket}
                      organization={organization}
                      payments={payments}
                    />
                  </div>
                )}
              </TabsContent>

              {/* TAB 4: Printable Job Card */}
              <TabsContent value="jobcard" className="pt-2">
                <PrintableJobCard ticket={ticket} organization={organization} />
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT 1 COL: Customer & Device Overview */}
          <div className="space-y-6">
            {/* Customer Details Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Customer Details</span>
                  <User className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Full Name</div>
                  <div className="font-bold text-slate-900 text-sm">{ticket.customer?.full_name}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Phone Number</div>
                  <div className="font-mono font-semibold text-slate-900 flex items-center justify-between">
                    <span>{ticket.customer?.phone}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleOpenWhatsApp}
                      className="h-6 text-[10px] text-emerald-600 px-2 hover:bg-emerald-50"
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {ticket.customer?.email && (
                  <div>
                    <div className="text-slate-500 text-[11px]">Email Address</div>
                    <div className="text-slate-700">{ticket.customer.email}</div>
                  </div>
                )}

                {ticket.customer?.address && (
                  <div>
                    <div className="text-slate-500 text-[11px]">Address</div>
                    <div className="text-slate-700">{ticket.customer.address}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device & Intake Condition Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Device & Condition Checklist</span>
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Device Model</div>
                  <div className="font-bold text-slate-900">
                    {ticket.device?.brand} {ticket.device?.model}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{ticket.device?.category} • Color: {ticket.device?.color || "N/A"}</div>
                </div>

                <div className="p-2.5 bg-red-50/70 border border-red-200 rounded text-xs">
                  <div className="text-[10px] font-bold text-red-900 uppercase">Reported Issue</div>
                  <div className="text-slate-900 font-medium mt-0.5">{ticket.reported_problem}</div>
                </div>

                {ticket.intake_notes && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                    <div className="text-[10px] font-bold text-slate-600 uppercase">Intake Inspection Notes</div>
                    <div className="text-slate-700 mt-0.5">{ticket.intake_notes}</div>
                  </div>
                )}

                {/* Condition grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Screen</span>
                    <span className="font-semibold capitalize text-slate-800">
                      {ticket.condition_checklist?.screen_condition?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Power</span>
                    <span className="font-semibold capitalize text-slate-800">
                      {ticket.condition_checklist?.power_status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Charging</span>
                    <span className="font-semibold capitalize text-slate-800">
                      {ticket.condition_checklist?.charging_status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Liquid Indicator</span>
                    <span className="font-semibold capitalize text-slate-800">
                      {ticket.condition_checklist?.liquid_damage?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="text-slate-700 text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Deposited Accessories:</span>{" "}
                  <strong>{ticket.accessories_received || "Device Only"}</strong>
                </div>
              </CardContent>
            </Card>

            {/* Condition Photographs Quick Panel */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Device Photos ({attachments.length})</span>
                  <Camera className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                {attachments.length === 0 ? (
                  <div className="text-center py-3 text-slate-500 text-xs">
                    <p className="text-[11px]">No condition photos attached.</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveTab("photos")}
                      className="mt-1 h-7 text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Upload Intake Photo
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-2">
                      {attachments.slice(0, 3).map((att) => (
                        <div
                          key={att.id}
                          onClick={() => setActiveTab("photos")}
                          className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.file_url}
                            alt={att.file_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {attachments.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("photos")}
                        className="text-[11px] font-semibold text-blue-600 hover:underline mt-2 block text-center w-full"
                      >
                        View all {attachments.length} photos →
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technician Assignment */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Assigned Technician</span>
                  <HardHat className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    {ticket.technician?.full_name || <span className="text-slate-400 italic">Unassigned</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">{ticket.technician?.email}</div>
                </div>

                <div className="space-y-1.5 pt-2 border-t">
                  <Label className="text-[11px] text-slate-600">Reassign Job:</Label>
                  <select
                    value={ticket.assigned_technician_id || ""}
                    onChange={(e) => handleAssignTechnician(e.target.value)}
                    className="w-full text-xs h-8 px-2.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Unassigned</option>
                    <option value="staff-tech-1">Amit Joshi (Mobile & Micro-soldering)</option>
                    <option value="staff-tech-2">Rajesh Kumar (Laptop & Hardware)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* STATUS MODAL */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Confirm Status Transition</h3>
              <p className="text-xs text-slate-500">
                You are transitioning ticket {ticket.ticket_number} to{" "}
                <strong className="text-blue-600 capitalize">{selectedNextStatus.replace(/_/g, " ")}</strong>.
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs">Reason / Audit Comment</Label>
                <Input
                  placeholder="e.g. Parts arrived from supplier / Quality check completed..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowStatusModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedNextStatus)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm Status Change
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ESTIMATE MODAL */}
        {showEstimateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleCreateEstimate} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Create Detailed Estimate Revision</h3>
              <p className="text-xs text-slate-500">Add parts and labour charges for customer approval.</p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Replacement Part Charge</span>
                  <Input
                    placeholder="Part description (e.g. Original AMOLED Display Assembly)"
                    value={estimatePartDesc}
                    onChange={(e) => setEstimatePartDesc(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Part Cost (₹ INR)"
                    value={estimatePartPrice}
                    onChange={(e) => setEstimatePartPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Service & Labour Charge</span>
                  <Input
                    placeholder="Labour description"
                    value={estimateLabourDesc}
                    onChange={(e) => setEstimateLabourDesc(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Labour Cost (₹ INR)"
                    value={estimateLabourPrice}
                    onChange={(e) => setEstimateLabourPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowEstimateModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Save Estimate Draft
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* APPROVAL MODAL */}
        {showApprovalModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Record Customer Decision</h3>
              <p className="text-xs text-slate-500">Record approval or rejection received through documented communication.</p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Communication Channel</Label>
                  <select
                    value={approvalChannel}
                    onChange={(e) => setApprovalChannel(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none"
                  >
                    <option value="phone_call">Phone Call</option>
                    <option value="in_person">In Person at Counter</option>
                    <option value="whatsapp">WhatsApp Chat</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Customer Decision Notes</Label>
                  <Textarea
                    placeholder="e.g. Customer approved ₹8,500 over phone and requested evening delivery..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowApprovalModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRecordApproval("rejected")}
                  className="text-xs"
                >
                  Mark Rejected
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRecordApproval("approved")}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm Approved
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleRecordPayment} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between">
                <span>Remaining Balance Due:</span>
                <span className="font-bold text-amber-700">{formatCurrency(balanceDue)}</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="payAmount" className="text-xs">
                    Amount Received (₹ INR) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="payAmount"
                    type="number"
                    placeholder={`e.g. ${balanceDue}`}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payMethod" className="text-xs">
                    Payment Method <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    id="payMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash at Counter</option>
                    <option value="card">Card (POS Swiped)</option>
                    <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payRef" className="text-xs">
                    UPI Reference / Transaction ID (Optional)
                  </Label>
                  <Input
                    id="payRef"
                    placeholder="e.g. UPI/261118154501/PAYTM"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payNotes" className="text-xs">
                    Payment Notes (Optional)
                  </Label>
                  <Input
                    id="payNotes"
                    placeholder="e.g. Advance deposit or final settlement"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPaymentModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Confirm Payment & Generate Receipt
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* HANDOVER & DELIVERY MODAL */}
        {showHandoverModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleCompleteHandover} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Device Handover & Closure
              </h3>
              <p className="text-xs text-slate-500">
                Verify testing, return of deposited accessories, and outstanding payment before handing over device.
              </p>

              {balanceDue > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  ⚠️ <strong>Notice:</strong> Outstanding balance of <strong>{formatCurrency(balanceDue)}</strong> remains unpaid. You may collect payment before or simultaneously with handover.
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="recipName" className="text-xs">
                    Handed Over To (Name) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="recipName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hNotes" className="text-xs">
                    Handover Notes / Customer Satisfaction
                  </Label>
                  <Textarea
                    id="hNotes"
                    placeholder="e.g. Device tested in presence of customer. Display and fast charging verified working."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  ✓ Returned Accessories: <strong>{ticket.accessories_received || "None"}</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHandoverModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Complete Handover & Mark Delivered
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Reopen Ticket Modal */}
        {showReopenModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleReopenTicket} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Audited Repair Reopening Workflow
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reopening a delivered or closed repair creates an audited status history record and logs a prominent internal note.
              </p>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Reopen To Status</Label>
                <select
                  value={reopenTargetStatus}
                  onChange={(e) => setReopenTargetStatus(e.target.value as RepairStatus)}
                  className="w-full mt-1.5 h-9 text-xs rounded-lg border border-slate-300 px-3 bg-white"
                >
                  <option value="under_diagnosis">Under Diagnosis (Inspect again)</option>
                  <option value="in_repair">In Repair (Direct rework / parts replacement)</option>
                  <option value="received">Received (Fresh check-in)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Audited Reopen Reason / Warranty Claim <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g., Customer returned under 30-day warranty: Touch screen stopped responding after 4 days of delivery."
                  className="text-xs mt-1.5 h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReopenModal(false)}
                  disabled={reopening}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={reopening}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  {reopening ? "Reopening..." : "Confirm Audited Reopen"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function RepairDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading repair details...</div>}>
      <RepairDetailsContent />
    </Suspense>
  );
}
