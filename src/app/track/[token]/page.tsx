"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Smartphone,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "received", label: "Received", desc: "Device checked in & logged" },
  { id: "under_diagnosis", label: "Under Diagnosis", desc: "Hardware inspection" },
  { id: "in_repair", label: "In Repair", desc: "Fix & part replacement" },
  { id: "quality_check", label: "Quality Check", desc: "Testing all functions" },
  { id: "ready_for_pickup", label: "Ready for Pickup", desc: "Ready to collect" },
  { id: "delivered", label: "Delivered", desc: "Completed & handed over" },
];

export default function CustomerTrackingPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/track/${token}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || "Repair record not found");
        }
      })
      .catch((err) => {
        setError("Unable to connect to repair system. Please check your link.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Clock className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-600 font-medium">Looking up your repair status...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Repair Tracking Link Invalid</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || "The tracking code provided is invalid or has expired. Please contact the repair shop for assistance."}
          </p>
        </div>
      </div>
    );
  }

  const { ticket, shop, timeline, notes } = data;

  // Determine active step index
  let currentStepIdx = 0;
  if (ticket.current_status === "received") currentStepIdx = 0;
  else if (ticket.current_status === "under_diagnosis") currentStepIdx = 1;
  else if (ticket.current_status === "awaiting_approval" || ticket.current_status === "waiting_for_parts" || ticket.current_status === "in_repair") currentStepIdx = 2;
  else if (ticket.current_status === "quality_check") currentStepIdx = 3;
  else if (ticket.current_status === "ready_for_pickup") currentStepIdx = 4;
  else if (ticket.current_status === "delivered") currentStepIdx = 5;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans p-4 sm:p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Shop Branding Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Live Repair Tracking</span>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{shop.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{shop.address}, {shop.city}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Shop: {shop.phone}</span>
            </a>
          </div>
        </div>

        {/* Current Status Highlight Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repair Job Reference</span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight mt-0.5">
                {ticket.ticket_number}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Device Model</span>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {ticket.device_brand} {ticket.device_model}
              </div>
            </div>
          </div>

          {/* Current Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            ticket.current_status === "ready_for_pickup"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : ticket.current_status === "delivered"
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}>
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
              {ticket.current_status === "ready_for_pickup" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Wrench className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Progress Stage</div>
              <div className="text-base font-bold capitalize">
                {ticket.current_status.replace(/_/g, " ")}
              </div>
              {ticket.current_status === "ready_for_pickup" && (
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Your device is repaired, tested, and ready for collection at our counter!
                </p>
              )}
            </div>
          </div>

          {/* Dates Overview */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Intake Registered</span>
              <span className="font-semibold text-slate-800">{formatDate(ticket.created_at)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Est. Ready Date</span>
              <span className="font-semibold text-slate-800">{formatDate(ticket.estimated_delivery_date) || "Under Evaluation"}</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Repair Workflow Progression</h2>

          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-[11px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-bold ${isCurrent ? "text-blue-700 font-extrabold" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Updates & Notes (Strictly Customer-Visible only) */}
        {notes && notes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Updates & Messages</h2>
            <div className="space-y-2">
              {notes.map((n: any) => (
                <div key={n.id} className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                    <span>Message from Repair Staff</span>
                    <span>{formatDateTime(n.created_at)}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Verification Footer */}
        <div className="text-center text-[11px] text-slate-400 space-y-2 pt-2 pb-6">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure End-to-End Tracking Powered by RepairDesk</span>
          </div>
          <p>
            Private device credentials, internal technician notes, and IMEI numbers are encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
}
