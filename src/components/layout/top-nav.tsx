"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, UserCircle, MapPin, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { initialStaff } from "@/lib/mock-data";
import { UserRole } from "@/types";

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps = {}) {
  const router = useRouter();
  const { currentUser, currentRole, switchUser, canIntakeDevices } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/repairs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 no-print">
      {/* Mobile Menu Trigger */}
      {onOpenMobileMenu && (
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search ticket #, customer, phone (e.g. RD-2026-000001 or Rahul)..."
          className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-blue-600 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Shop Location Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
          <MapPin className="h-3.5 w-3.5 text-slate-500" />
          <span>Indore Branch</span>
        </div>

        {/* Demo Role Switcher (Crucial for showcasing Multi-Role SaaS) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Shield className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Role View:</span>
          <select
            className="text-xs font-medium bg-transparent border-none text-slate-800 focus:outline-none cursor-pointer"
            value={currentUser?.id || ""}
            onChange={(e) => switchUser(e.target.value)}
          >
            {initialStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.full_name} ({staff.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        {canIntakeDevices && (
          <Button
            size="sm"
            onClick={() => router.push("/repairs/new")}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-3.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Intake</span>
          </Button>
        )}
      </div>
    </header>
  );
}
