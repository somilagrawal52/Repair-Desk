"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { RepairTicket, Organization } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Printer, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintableJobCardProps {
  ticket: RepairTicket;
  organization: Organization;
}

export function PrintableJobCard({ ticket, organization }: PrintableJobCardProps) {
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
    <div className="w-full">
      {/* Print Trigger Button (Hidden in print) */}
      <div className="no-print mb-4 flex justify-end">
        <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Printer className="h-4 w-4" />
          Print Job Card (A4)
        </Button>
      </div>

      {/* Printable Sheet */}
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
                <span className="font-mono font-semibold text-slate-900">{ticket.customer?.phone}</span>
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
                  <span className="text-slate-700 text-right max-w-[200px] truncate">{ticket.customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200/80">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
              Device Specifications
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Brand & Model:</span>
                <span className="font-semibold text-slate-900">
                  {ticket.device?.brand} {ticket.device?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="capitalize text-slate-800">{ticket.device?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Color:</span>
                <span className="text-slate-800">{ticket.device?.color || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Serial / IMEI:</span>
                <span className="font-mono text-slate-700">{ticket.device?.serial_number || "Not Recorded"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description & Intake Notes */}
        <div className="space-y-3 mb-4">
          <div className="p-3 bg-red-50/60 border border-red-200 rounded">
            <span className="font-bold text-red-900 uppercase tracking-wider text-[10px] block mb-1">
              Customer Reported Complaint
            </span>
            <p className="text-slate-900 text-[12px] font-medium leading-relaxed">{ticket.reported_problem}</p>
          </div>

          {ticket.intake_notes && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-0.5">
                Physical Intake & Visual Notes
              </span>
              <p className="text-slate-700 text-[11px]">{ticket.intake_notes}</p>
            </div>
          )}
        </div>

        {/* Physical Condition Checklist */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
            Intake Inspection Checklist
          </h3>
          <div className="grid grid-cols-4 gap-2 text-[11px]">
            <div className="border border-slate-200 rounded p-2">
              <div className="text-slate-500 text-[10px]">Screen Condition</div>
              <div className="font-semibold capitalize text-slate-800">{checklist.screen_condition.replace(/_/g, " ")}</div>
            </div>
            <div className="border border-slate-200 rounded p-2">
              <div className="text-slate-500 text-[10px]">Power State</div>
              <div className="font-semibold capitalize text-slate-800">{checklist.power_status.replace(/_/g, " ")}</div>
            </div>
            <div className="border border-slate-200 rounded p-2">
              <div className="text-slate-500 text-[10px]">Charging Port</div>
              <div className="font-semibold capitalize text-slate-800">{checklist.charging_status.replace(/_/g, " ")}</div>
            </div>
            <div className="border border-slate-200 rounded p-2">
              <div className="text-slate-500 text-[10px]">Liquid Indicator</div>
              <div className="font-semibold capitalize text-slate-800">{checklist.liquid_damage.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div className="mt-2 text-slate-700 text-[11px]">
            <strong>Accessories Deposited:</strong>{" "}
            {ticket.accessories_received || "Device Only (No Charger, Cable, or SIM card)"}
          </div>
        </div>

        {/* Financial & Tracking QR Code Section */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4 my-4">
          <div className="space-y-1">
            <div className="text-[11px] text-slate-600 font-medium">Estimated Repair Cost</div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(ticket.estimate_amount)}</div>
            <div className="text-[10px] text-slate-500">
              *Taxes and final component replacement charges subject to customer approval upon detailed diagnosis.
            </div>
          </div>

          {qrCodeUrl && (
            <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded">
              <img src={qrCodeUrl} alt="Repair Tracking QR Code" className="w-20 h-20" />
              <div className="max-w-[140px]">
                <div className="font-bold text-slate-900 text-[11px]">Track Your Repair</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  Scan with your phone camera to view live diagnostic progress & updates.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="border-t border-slate-200 pt-3 mt-4 text-[10px] text-slate-600 space-y-1 leading-relaxed">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Repair Terms & Acknowledgment:</div>
          <p className="whitespace-pre-line">{organization.repair_terms}</p>
          <p className="italic text-slate-500">
            *Customer confirms device data has been backed up. The shop is not liable for data loss during hardware motherboard repairs or re-flashing.
          </p>
        </div>

        {/* Signature Line */}
        <div className="grid grid-cols-2 gap-12 mt-10 pt-4 border-t border-slate-300">
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div className="text-center font-medium text-slate-700 mt-1">Customer Signature / Acknowledgment</div>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div className="text-center font-medium text-slate-700 mt-1">Authorized Store Technician / Receptionist</div>
          </div>
        </div>
      </div>
    </div>
  );
}
