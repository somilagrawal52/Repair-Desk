"use client";

import React from "react";
import { RepairTicket, Receipt, Organization, Payment } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, CheckCircle2 } from "lucide-react";
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
  const handlePrint = () => {
    window.print();
  };

  const isFullyPaid = receipt.balance_remaining <= 0;

  return (
    <div className="w-full">
      {/* Print Trigger Button */}
      <div className="no-print mb-4 flex justify-end">
        <Button onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
          <Printer className="h-4 w-4" />
          Print Official Receipt
        </Button>
      </div>

      {/* Printable Receipt Card */}
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
            PAYMENT RECEIPT
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
    </div>
  );
}
