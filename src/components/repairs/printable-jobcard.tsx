"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { RepairTicket, Organization } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Printer, CheckCircle2, XCircle, FileText, Receipt as ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintableJobCardProps {
  ticket: RepairTicket;
  organization: Organization;
}

export function PrintableJobCard({ ticket, organization }: PrintableJobCardProps) {
  const [layoutMode, setLayoutMode] = useState<"standard" | "thermal">("standard");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (ticket.tracking_token) {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const trackUrl = `${baseUrl}/track/${ticket.tracking_token}`;
      QRCode.toDataURL(trackUrl, { width: 160, margin: 1 }, (err, url) => {
        if (!err && url) {
          setQrCodeUrl(url);
        }
      });
    }
  }, [ticket.tracking_token]);

  const handlePrint = () => {
    window.print();
  };

  const checklist = ticket.condition_checklist;

  return (
    <div className="w-full space-y-4">
      {/* Controls & Layout Selector (Hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLayoutMode("standard")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              layoutMode === "standard"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Standard A4 Job Card
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("thermal")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              layoutMode === "thermal"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ReceiptIcon className="w-3.5 h-3.5" /> 80mm Counter Slip
          </button>
        </div>

        <Button
          onClick={handlePrint}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs h-9"
        >
          <Printer className="h-4 w-4" />
          Print {layoutMode === "thermal" ? "80mm Counter Slip" : "A4 Job Card"}
        </Button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: 80MM POS THERMAL INTAKE SLIP                          */}
      {/* ------------------------------------------------------------- */}
      {layoutMode === "thermal" ? (
        <div className="bg-white text-slate-950 font-mono text-[11px] leading-tight p-4 border border-dashed border-slate-300 rounded-lg max-w-[320px] mx-auto shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:w-[80mm] print:max-w-none">
          <div className="text-center space-y-1 pb-2">
            <div className="text-sm font-black tracking-wider uppercase">{organization.name}</div>
            <div className="text-[10px] text-slate-600">{organization.address}</div>
            <div className="text-[10px] text-slate-600">
              {organization.city}, {organization.state}
            </div>
            <div className="text-[10px] font-bold">Tel: {organization.phone}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 py-0.5 mt-1">
              *** REPAIR JOB CARD SLIP ***
            </div>
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between font-bold text-xs">
              <span>JOB CARD:</span>
              <span>{ticket.ticket_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDateTime(ticket.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{ticket.customer?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{ticket.customer?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Device:</span>
              <span className="font-semibold">{ticket.device?.brand} {ticket.device?.model}</span>
            </div>
            {ticket.device?.color && (
              <div className="flex justify-between">
                <span>Color:</span>
                <span>{ticket.device.color}</span>
              </div>
            )}
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          {/* Issue & Condition */}
          <div className="space-y-1 text-[10px]">
            <div>
              <span className="font-bold">REPORTED ISSUE:</span>
              <p className="mt-0.5 text-slate-800">{ticket.reported_problem}</p>
            </div>
            <div className="pt-1">
              <span className="font-bold">CONDITION:</span>
              <div className="text-[9px] space-y-0.5 mt-0.5 text-slate-700">
                <div>• Screen: {checklist?.screen_condition?.replace(/_/g, " ")}</div>
                <div>• Power: {checklist?.power_status?.replace(/_/g, " ")}</div>
                <div>• Charging: {checklist?.charging_status?.replace(/_/g, " ")}</div>
                <div>• Liquid: {checklist?.liquid_damage?.replace(/_/g, " ")}</div>
              </div>
            </div>
            <div className="pt-1">
              <span className="font-bold">ACCESSORIES:</span>{" "}
              <span>{ticket.accessories_received || "Device Only"}</span>
            </div>
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          {/* Estimate & Target */}
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Est. Delivery:</span>
              <span className="font-bold">{formatDate(ticket.estimated_delivery_date)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
              <span>Est. Amount:</span>
              <span>{formatCurrency(ticket.estimate_amount)}</span>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="text-center my-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Tracking QR Code" className="w-24 h-24 mx-auto" />
              <div className="text-[9px] text-slate-500 mt-0.5">Scan to Track Live Progress</div>
            </div>
          )}

          {/* Terms snippet */}
          <div className="text-[9px] text-slate-500 mt-2 space-y-0.5 text-center leading-tight">
            <div>Please present this slip for collection.</div>
            <div>Shop is not responsible for data loss.</div>
            <div>Unclaimed items disposed after 60 days.</div>
          </div>

          <div className="text-center text-[9px] font-bold text-slate-300 mt-3 tracking-widest">
            - - - - [ TEAR HERE ] - - - -
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: STANDARD A4 JOB CARD SHEET                           */
        /* ------------------------------------------------------------- */
        <div className="bg-white text-slate-900 border border-slate-200 rounded-lg p-8 max-w-4xl mx-auto shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 font-sans text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-blue-700">RepairDesk</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  OFFICIAL JOB CARD
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 mt-1">{organization.name}</h1>
              <p className="text-slate-600 max-w-md leading-relaxed">
                {organization.address}, {organization.city}, {organization.state}
              </p>
              <p className="text-slate-600 font-medium">
                Phone: {organization.phone} | Email: {organization.email}
              </p>
            </div>

            <div className="text-right">
              <div className="bg-slate-900 text-white px-4 py-2 rounded">
                <div className="text-[10px] uppercase font-semibold text-slate-300">Job Card No.</div>
                <div className="text-xl font-mono font-bold tracking-wider">{ticket.ticket_number}</div>
              </div>
              <div className="text-slate-600 mt-2 text-[11px]">
                <div><strong>Intake Date:</strong> {formatDateTime(ticket.created_at)}</div>
                <div><strong>Est. Completion:</strong> {formatDate(ticket.estimated_delivery_date)}</div>
              </div>
            </div>
          </div>

          {/* 2-Column Info: Customer & Device */}
          <div className="grid grid-cols-2 gap-4 my-4 py-3 border-b border-slate-200">
            <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                Customer Details
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-semibold text-slate-900">{ticket.customer?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-mono text-slate-900">{ticket.customer?.phone}</span>
                </div>
                {ticket.customer?.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-700">{ticket.customer.email}</span>
                  </div>
                )}
                {ticket.customer?.address && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Address:</span>
                    <span className="text-slate-700">{ticket.customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                Device Information
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-semibold capitalize text-slate-900">{ticket.device?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Brand & Model:</span>
                  <span className="font-bold text-slate-900">
                    {ticket.device?.brand} {ticket.device?.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Color:</span>
                  <span className="text-slate-700">{ticket.device?.color || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Initial Estimate:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(ticket.estimate_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reported Complaint */}
          <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
              Customer Reported Problem / Fault
            </h3>
            <p className="text-slate-800 text-xs leading-relaxed font-medium">
              {ticket.reported_problem}
            </p>
            {ticket.intake_notes && (
              <p className="text-slate-600 text-[11px] mt-1 pt-1 border-t border-slate-200">
                <strong>Intake Inspection Notes:</strong> {ticket.intake_notes}
              </p>
            )}
          </div>

          {/* Physical Condition Checklist */}
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Physical Condition & Inspection Checklist
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Screen Condition</span>
                <span className="font-semibold capitalize text-slate-900">
                  {checklist?.screen_condition?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Power On Status</span>
                <span className="font-semibold capitalize text-slate-900">
                  {checklist?.power_status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Charging Condition</span>
                <span className="font-semibold capitalize text-slate-900">
                  {checklist?.charging_status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Liquid Damage</span>
                <span className="font-semibold capitalize text-slate-900">
                  {checklist?.liquid_damage?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Body / Casing</span>
                <span className="font-semibold capitalize text-slate-900">
                  {checklist?.body_condition?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="border border-slate-200 p-2 rounded bg-slate-50/50">
                <span className="text-slate-500 font-medium block text-[10px]">Deposited Accessories</span>
                <span className="font-semibold text-slate-900">
                  {ticket.accessories_received || "Device Only"}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code & Tracking Instructions */}
          <div className="flex items-center gap-4 p-3 bg-blue-50/60 border border-blue-200 rounded-lg mb-6">
            {qrCodeUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt="Repair Tracking QR Code"
                className="w-20 h-20 bg-white p-1 rounded border border-blue-200 shrink-0"
              />
            )}
            <div className="flex-1 text-[11px] text-slate-700 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Customer Live Repair Tracking</div>
              <p>
                Scan the QR code with any smartphone camera to check diagnostic findings, quote approvals, and repair completion live.
              </p>
              <div className="text-[10px] text-slate-500">
                Customer token: <span className="font-mono text-slate-800">{ticket.tracking_token}</span>
              </div>
            </div>
          </div>

          {/* Terms & Policies */}
          <div className="mb-8 text-[10px] text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-800 uppercase text-[10px]">Repair Terms & Conditions:</h4>
            <div className="whitespace-pre-line leading-relaxed">{organization.repair_terms}</div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-200">
            <div>
              <div className="border-b border-slate-400 h-10 mb-2"></div>
              <div className="text-center font-medium text-slate-700 text-[11px]">
                Customer Signature & Acknowledgment
              </div>
              <div className="text-center text-[10px] text-slate-400">
                (I acknowledge the above stated condition and terms)
              </div>
            </div>

            <div>
              <div className="border-b border-slate-400 h-10 mb-2"></div>
              <div className="text-center font-medium text-slate-700 text-[11px]">
                Authorized Shop Representative
              </div>
              <div className="text-center text-[10px] text-slate-400">
                {organization.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
