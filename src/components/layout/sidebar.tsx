"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  Users,
  FileSpreadsheet,
  PackageCheck,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  HardHat,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole, currentUser } = useAuth();

  const isOwnerOrAdmin = currentRole === "owner" || currentRole === "admin";
  const isReceptionist = currentRole === "receptionist";
  const isTechnician = currentRole === "technician";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "All Repairs",
      href: "/repairs",
      icon: Wrench,
      show: true,
    },
    {
      name: "New Intake",
      href: "/repairs/new",
      icon: PlusCircle,
      highlight: true,
      show: isOwnerOrAdmin || isReceptionist,
    },
    {
      name: "Technician Jobs",
      href: "/technician",
      icon: HardHat,
      show: isTechnician || isOwnerOrAdmin,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      show: isOwnerOrAdmin || isReceptionist,
    },
    {
      name: "Estimates",
      href: "/estimates",
      icon: FileSpreadsheet,
      show: isOwnerOrAdmin || isReceptionist,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: PackageCheck,
      show: true,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
      show: isOwnerOrAdmin || isReceptionist,
    },
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      show: isOwnerOrAdmin,
    },
    {
      name: "Staff",
      href: "/staff",
      icon: UserCheck,
      show: isOwnerOrAdmin,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      show: isOwnerOrAdmin,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              RepairDesk
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400">TechFix Repair Center</div>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>
        {navigation
          .filter((item) => item.show)
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100",
                  item.highlight && !isActive && "text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : item.highlight
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

        {/* Public Demo Link */}
        <div className="pt-6 px-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Customer Portal
          </div>
          <Link
            href="/track/token-s23-7721-a9b3"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          >
            <span className="truncate">Sample Customer Tracking</span>
            <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
            {currentUser?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.full_name}
            </div>
            <div className="text-[11px] text-slate-400 capitalize flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {currentRole}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
