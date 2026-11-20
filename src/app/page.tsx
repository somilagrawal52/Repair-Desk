"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  QrCode,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle,
  Wrench,
  Package,
  Layers,
  Sparkles,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">RepairDesk</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SaaS Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/track/token-s23-7721-a9b3"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Customer Tracking Demo
            </Link>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 px-4 shadow-lg shadow-blue-600/25"
            >
              <Link href="/dashboard">
                Launch Workspace
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Electronics Repair Management System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Every Repair. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            One Organized Workspace.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to lost paper registers and messy messaging threads. RepairDesk streamlines
          device intake, job cards, parts inventory, customer status tracking, and payments for modern repair businesses.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 h-12 shadow-xl shadow-blue-600/30 text-sm"
          >
            <Link href="/dashboard">
              Enter TechFix Demo Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-6 h-12 text-sm"
          >
            <Link href="/track/token-s23-7721-a9b3">
              <QrCode className="mr-2 h-4 w-4 text-blue-400" />
              View Customer Tracking Portal
            </Link>
          </Button>
        </div>

        {/* Highlight Stats / Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Built for Independent Repair Shops in India</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Multi-Role: Owner, Receptionist, Technician</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Sequential Unique Job Cards (RD-YYYY-XXXXXX)</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Complete Operations From Intake to Delivery
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Engineered with deep operational empathy for fast-paced repair environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Device Intake & Condition Checklist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record screen damage, body condition, power/charging status, liquid indicators, and accessories deposited. Generate printable A4 job cards with QR codes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Unguessable Customer Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customers scan a QR code or click a secure link to view real-time repair progress without logging in. Zero leakage of private notes, IMEI, or technician costs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Estimates & Payment Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parts and labour estimates with customer approval logging. Record Cash and UPI payments, track balances, and generate instant printable receipts upon delivery.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Spare Parts Inventory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track screens, batteries, and ICs with SKU codes, cost vs selling prices, low-stock threshold warnings, and transactional deduction upon repair completion.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-4">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dedicated Technician Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Technicians see only assigned jobs, add diagnostic notes, request replacement components, and update stages without tampering with financial records.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Tenant SaaS Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organization isolation with PostgreSQL Row Level Security (RLS), concurrency-safe ticket generators, audit logs, and complete data integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Shop Banner */}
      <section className="py-12 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <MapPin className="h-3.5 w-3.5" />
              Active Demo Organization
            </div>
            <h3 className="text-xl font-bold text-white">TechFix Repair Center — Indore</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Pre-seeded with realistic repairs, customers (Rahul Sharma, Priya Verma, etc.), inventory parts, and staff accounts (Owner, Receptionist, Technicians).
            </p>
          </div>

          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 px-6 shrink-0 shadow-lg shadow-blue-600/20"
          >
            <Link href="/dashboard">Open Demo Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>RepairDesk — Smart Electronics Repair Management System. Built with Next.js, TypeScript, Tailwind CSS & Supabase.</p>
        <p className="mt-1">Currency: INR (₹) | Default Timezone: Asia/Kolkata</p>
      </footer>
    </div>
  );
}
