"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-slate-50/70 text-slate-900 font-sans">
        <div className="no-print hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
