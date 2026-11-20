"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RepairTicket, Receipt, Organization, Payment } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, CheckCircle2, Receipt as ReceiptIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintableReceiptProps {
  receipt: Receipt;
  ticket: RepairTicket;
  organization: Organization;
  payments: Payment[];
}

export function PrintableReceipt({
  receipt,
  ticket,
  organization,
  payments,
}: PrintableReceiptProps) {
  const [layoutMode, setLayoutMode] = useState<"standard" | "thermal">("standard");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (ticket.tracking_token) {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const trackUrl = `${baseUrl}/track/${ticket.tracking_token}`;
      QRCode.toDataURL(trackUrl, { width: 140, margin: 1 }, (err, url) => {
        if (!err && url) setQrCodeUrl(url);
      });
    }
  }, [ticket.tracking_token]);

  const handlePrint = () => {
    window.print();
  };

  const isFullyPaid = receipt.balance_remaining <= 0;

  return (
    <div className="w-full space-y-4">
      {/* Controls & Layout Selector */}
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
            <FileText className="w-3.5 h-3.5" /> Standard A4 Invoice
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
            <ReceiptIcon className="w-3.5 h-3.5" /> 80mm POS Thermal
          </button>
        </div>

        <Button
          onClick={handlePrint}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs h-9"
        >
          <Printer className="h-4 w-4" />
          Print {layoutMode === "thermal" ? "80mm Thermal Receipt" : "A4 Receipt"}
        </Button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: 80MM POS THERMAL RECEIPT LAYOUT                       */}
      {/* ------------------------------------------------------------- */}
      {layoutMode === "thermal" ? (
        <div className="bg-white text-slate-950 font-mono text-[11px] leading-tight p-4 border border-dashed border-slate-300 rounded-lg max-w-[320px] mx-auto shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:w-[80mm] print:max-w-none">
          {/* Shop Header */}
          <div className="text-center space-y-1 pb-2">
            <div className="text-sm font-black tracking-wider uppercase">{organization.name}</div>
            <div className="text-[10px] text-slate-600">{organization.address}</div>
            <div className="text-[10px] text-slate-600">
              {organization.city}, {organization.state}
            </div>
            <div className="text-[10px] font-bold">Tel: {organization.phone}</div>
            <div className="text-[9px] text-slate-500">GST/Tax Invoice Acknowledgment</div>
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          {/* Receipt Info */}
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="font-bold">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Job Ticket:</span>
              <span className="font-bold">{ticket.ticket_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{formatDateTime(receipt.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold truncate max-w-[170px]">{ticket.customer?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Device:</span>
              <span className="truncate max-w-[170px]">{ticket.device?.brand} {ticket.device?.model}</span>
            </div>
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          {/* Transactions */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider flex justify-between">
              <span>Payment Details</span>
              <span>Amount</span>
            </div>
            {payments.map((p) => (
              <div key={p.id} className="text-[10px] flex justify-between">
                <span>
                  {p.payment_method.toUpperCase()}
                  {p.reference_number ? ` (#${p.reference_number.slice(-4)})` : ""}
                </span>
                <span className="font-bold">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>

          <div className="text-center font-bold my-1 text-slate-400">
            --------------------------------
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Total Charge:</span>
              <span>{formatCurrency(receipt.total_charges)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Paid:</span>
              <span>{formatCurrency(receipt.total_paid)}</span>
            </div>
            <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-200">
              <span>Balance Due:</span>
              <span>{formatCurrency(receipt.balance_remaining)}</span>
            </div>
          </div>

          {isFullyPaid && (
            <div className="my-2 text-center text-[10px] font-black border border-slate-900 py-1 uppercase tracking-wider">
              *** PAID IN FULL ***
            </div>
          )}

          {/* Tracking QR Code */}
          {qrCodeUrl && (
            <div className="text-center my-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Tracking QR Code" className="w-24 h-24 mx-auto" />
              <div className="text-[9px] text-slate-500 mt-0.5">Scan to Track Repair Status</div>
            </div>
          )}

          {/* Footer & Tear Line */}
          <div className="text-center text-[9px] text-slate-500 mt-2 space-y-0.5">
            <div>30-Day Replaced Parts Warranty</div>
            <div>Thank you for your visit!</div>
          </div>

          <div className="text-center text-[9px] font-bold text-slate-300 mt-3 tracking-widest">
            - - - - [ TEAR HERE ] - - - -
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: STANDARD A4 INVOICE / RECEIPT LAYOUT                 */
        /* ------------------------------------------------------------- */
        <div className="bg-white text-slate-900 border border-slate-200 rounded-lg p-8 max-w-2xl mx-auto shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 font-sans text-xs">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold tracking-tight text-blue-700">RepairDesk</h1>
            <h2 className="text-base font-bold text-slate-900">{organization.name}</h2>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {organization.address}, {organization.city}, {organization.state}
            </p>
            <p className="text-slate-600 text-[11px]">Phone: {organization.phone} | Email: {organization.email}</p>
            <div className="mt-3 inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded font-semibold text-xs tracking-wider">
              OFFICIAL PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-[11px]">
            <div>
              <div><strong>Receipt No:</strong> <span className="font-mono font-bold text-slate-900">{receipt.receipt_number}</span></div>
              <div><strong>Ticket Reference:</strong> <span className="font-mono text-slate-900">{ticket.ticket_number}</span></div>
              <div><strong>Date:</strong> {formatDateTime(receipt.created_at)}</div>
            </div>
            <div className="text-right">
              <div><strong>Customer:</strong> {ticket.customer?.full_name}</div>
              <div><strong>Phone:</strong> {ticket.customer?.phone}</div>
              <div><strong>Device:</strong> {ticket.device?.brand} {ticket.device?.model}</div>
            </div>
          </div>

          {/* Payment History Breakdown */}
          <div className="my-4">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Payment Transactions
            </h3>
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600">
                  <th className="py-1.5 px-2">Date</th>
                  <th className="py-1.5 px-2">Method</th>
                  <th className="py-1.5 px-2">Reference</th>
                  <th className="py-1.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5 px-2">{formatDateTime(p.created_at)}</td>
                    <td className="py-1.5 px-2 uppercase font-medium">{p.payment_method}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-500">{p.reference_number || "—"}</td>
                    <td className="py-1.5 px-2 text-right font-medium text-slate-900">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 my-4">
            <div className="flex justify-between text-slate-700">
              <span>Total Repair Charge:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(receipt.total_charges)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Amount Paid:</span>
              <span>{formatCurrency(receipt.total_paid)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-base font-bold text-slate-900">
              <span>Balance Due:</span>
              <span className={receipt.balance_remaining > 0 ? "text-amber-600" : "text-emerald-600"}>
                {formatCurrency(receipt.balance_remaining)}
              </span>
            </div>
          </div>

          {/* Paid Status Stamp */}
          {isFullyPaid && (
            <div className="my-4 flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 py-2 rounded font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              PAYMENT SETTLED IN FULL
            </div>
          )}

          {/* Notes & Footer */}
          <div className="text-[10px] text-slate-500 mt-6 pt-3 border-t text-center space-y-1">
            <p>Thank you for choosing {organization.name}. We appreciate your trust in our service.</p>
            <p className="text-[9px]">Computer-generated payment acknowledgment. Valid without physical stamp.</p>
          </div>
        </div>
      )}
    </div>
  );
}
