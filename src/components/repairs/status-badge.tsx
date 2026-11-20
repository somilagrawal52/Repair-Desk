import React from "react";
import { RepairStatus, PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: RepairStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "received":
      return (
        <Badge variant="outline" className={`bg-slate-100 text-slate-800 border-slate-300 font-medium ${className}`}>
          Received
        </Badge>
      );
    case "under_diagnosis":
      return (
        <Badge variant="info" className={`bg-blue-100 text-blue-800 border-blue-200 font-medium ${className}`}>
          Under Diagnosis
        </Badge>
      );
    case "awaiting_approval":
      return (
        <Badge variant="warning" className={`bg-amber-100 text-amber-900 border-amber-300 font-medium ${className}`}>
          Awaiting Approval
        </Badge>
      );
    case "waiting_for_parts":
      return (
        <Badge variant="warning" className={`bg-orange-100 text-orange-900 border-orange-300 font-medium ${className}`}>
          Waiting for Parts
        </Badge>
      );
    case "in_repair":
      return (
        <Badge variant="purple" className={`bg-indigo-100 text-indigo-800 border-indigo-200 font-medium ${className}`}>
          In Repair
        </Badge>
      );
    case "quality_check":
      return (
        <Badge variant="info" className={`bg-cyan-100 text-cyan-800 border-cyan-200 font-medium ${className}`}>
          Quality Check
        </Badge>
      );
    case "ready_for_pickup":
      return (
        <Badge variant="success" className={`bg-emerald-100 text-emerald-800 border-emerald-300 font-medium animate-pulse ${className}`}>
          Ready for Pickup
        </Badge>
      );
    case "delivered":
      return (
        <Badge variant="success" className={`bg-emerald-600 text-white font-medium ${className}`}>
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive" className={`bg-rose-100 text-rose-800 border-rose-200 font-medium ${className}`}>
          Cancelled
        </Badge>
      );
    case "unrepairable":
      return (
        <Badge variant="destructive" className={`bg-red-200 text-red-900 border-red-300 font-medium ${className}`}>
          Unrepairable
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  switch (status) {
    case "unpaid":
      return (
        <Badge variant="destructive" className={`bg-rose-50 text-rose-700 border-rose-200 ${className}`}>
          Unpaid
        </Badge>
      );
    case "partially_paid":
      return (
        <Badge variant="warning" className={`bg-amber-50 text-amber-800 border-amber-200 ${className}`}>
          Partial
        </Badge>
      );
    case "fully_paid":
      return (
        <Badge variant="success" className={`bg-emerald-100 text-emerald-800 border-emerald-200 ${className}`}>
          Paid
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="outline" className={`bg-purple-50 text-purple-700 border-purple-200 ${className}`}>
          Refunded
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
