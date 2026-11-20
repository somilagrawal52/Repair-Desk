"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  QrCode,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Wrench,
  Package,
  Layers,
  Sparkles,
  MapPin,
  FileText,
  Printer,
  Camera,
  Star,
  Laptop,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState<"thermal" | "jobcard" | "tracking" | "photos">("thermal");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">RepairDesk</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Commercial SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
            >
              Pricing
            </Link>
            <Link
              href="/track/token-s23-7721-a9b3"
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block"
            >
              Tracking Demo
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm h-9 px-3.5 sm:px-4 shadow-lg shadow-blue-600/25"
            >
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-400 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          The Operating System for Modern Electronics & Smartphone Repair Shops
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Every Repair. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
            One Organized Workspace.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Replace lost paper registers, missing repair parts, and endless customer status phone calls.
          RepairDesk delivers fast intake job cards, 80mm thermal receipts, live QR tracking, and multi-tenant security.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 h-12 shadow-xl shadow-blue-600/30 text-sm"
          >
            <Link href="/dashboard">
              Launch Live Demo Counter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold px-6 h-12 text-sm"
          >
            <Link href="/pricing">
              View Plans (₹999/mo)
            </Link>
          </Button>
        </div>

        {/* Highlight Stats / Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Built for Indian Repair Shops (INR ₹ & Kolkata Timezone)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Standard 80mm POS Thermal & A4 Printouts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Role-Based Access (Owner, Receptionist, Technician)</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            See RepairDesk in Action
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Real workflows designed for counter speed and workbench accuracy.
          </p>

          {/* Tab Selector */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActivePreview("thermal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activePreview === "thermal"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              80mm Thermal POS Slip
            </button>
            <button
              onClick={() => setActivePreview("jobcard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activePreview === "jobcard"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              A4 Counter Job Card
            </button>
            <button
              onClick={() => setActivePreview("tracking")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activePreview === "tracking"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Live QR Tracking
            </button>
            <button
              onClick={() => setActivePreview("photos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activePreview === "photos"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Device Photo Gallery
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex justify-center items-center">
          {activePreview === "thermal" && (
            <div className="max-w-xs w-full bg-amber-50 text-slate-900 p-5 rounded-lg shadow-lg font-mono text-xs border border-amber-200">
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <div className="font-extrabold text-sm uppercase">TechFix Indore</div>
                <div className="text-[11px] text-slate-600">MG Road, Opposite TI Mall</div>
                <div className="text-[11px] text-slate-600">Ph: +91 98260 12345</div>
                <div className="mt-2 font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                  REPAIR RECEIPT: RD-2026-000001
                </div>
              </div>
              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">Rahul Sharma</span>
                </div>
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="font-bold">Samsung Galaxy S23</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue:</span>
                  <span>Cracked Display</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-bold">READY FOR PICKUP</span>
                </div>
              </div>
              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Display Assembly:</span>
                  <span>₹7,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Labour Fee:</span>
                  <span>₹600</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>Total Amount:</span>
                  <span>₹7,800</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Paid (UPI):</span>
                  <span>₹7,800</span>
                </div>
              </div>
              <div className="pt-3 text-center text-[10px] text-slate-500">
                <div className="border border-slate-400 p-2 mx-auto w-24 h-24 mb-1 flex items-center justify-center bg-white">
                  <QrCode className="w-20 h-20 text-slate-800" />
                </div>
                <div>Scan to track repair status</div>
                <div className="mt-2 text-[9px] text-slate-400">- - - [ TEAR HERE ] - - -</div>
              </div>
            </div>
          )}

          {activePreview === "jobcard" && (
            <div className="max-w-xl w-full bg-white text-slate-900 p-6 rounded-xl shadow-lg text-xs space-y-4 border border-slate-200">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">TechFix Mobile & Laptop Repair</h3>
                  <p className="text-slate-500 text-[11px]">Intake Job Card • Formal A4 Counter Format</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold font-mono">
                    RD-2026-000002
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">20 Nov 2026, 11:30 AM</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-bold">Customer Details</span>
                  <div className="font-semibold text-slate-900">Priya Verma (+91 98261 54321)</div>
                  <div className="text-slate-500 text-[11px]">Palasia Square, Indore</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-bold">Device & Problem</span>
                  <div className="font-semibold text-slate-900">Apple MacBook Air M1 (Space Grey)</div>
                  <div className="text-rose-600 font-medium text-[11px]">No power, liquid spill reported</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-[11px] pt-2">
                <span>Accessories: MagSafe Charger</span>
                <span>Assigned Tech: Rajesh Kumar</span>
                <span className="text-blue-600 font-bold">Est: ₹4,500</span>
              </div>
            </div>
          )}

          {activePreview === "tracking" && (
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-blue-400">Public Customer Tracking Portal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Status
                </span>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <div className="text-xs text-slate-400">Device</div>
                <div className="text-sm font-bold text-white">OnePlus 11 5G (Titan Black)</div>
                <div className="text-xs text-slate-400 mt-2">Current Stage</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Waiting for Parts
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Progress Timeline:</div>
                <div className="text-xs text-slate-400 space-y-1.5 pl-2 border-l-2 border-blue-500">
                  <div className="text-white font-medium">✓ Received & Intake Inspection Completed</div>
                  <div className="text-white font-medium">✓ Diagnosis: Charging IC replacement required</div>
                  <div className="text-amber-400 font-medium">⏳ Spare IC ordered from Mumbai warehouse</div>
                </div>
              </div>
            </div>
          )}

          {activePreview === "photos" && (
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-400" />
                  Pre-Repair Condition Evidence
                </span>
                <span className="text-[11px] text-slate-400">3 Photos Uploaded</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center p-2">
                  <Smartphone className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-300 font-medium">Front Screen</span>
                  <span className="text-[9px] text-rose-400">Hairline crack</span>
                </div>
                <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center p-2">
                  <Smartphone className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-300 font-medium">Rear Glass</span>
                  <span className="text-[9px] text-emerald-400">Clean</span>
                </div>
                <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center p-2">
                  <Wrench className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-300 font-medium">Motherboard</span>
                  <span className="text-[9px] text-amber-400">Corrosion</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Eliminates customer disputes regarding pre-existing scratches and water damage indicators.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Complete Operations From Counter Intake to Cash Delivery
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Engineered with deep operational empathy for high-volume repair shops in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Device Intake & Condition Checklist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record screen damage, body condition, charging status, liquid indicators, and accessories deposited. Generate printable A4 and 80mm thermal slips instantly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secure Customer QR Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customers scan a QR code or tap WhatsApp links to view real-time repair progress without logging in. Zero leakage of technician costs or internal notes.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Estimates & Cash/UPI Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parts and labour estimates with customer approval status. Record Cash and UPI payments, track balances, and generate instant printable receipts upon delivery.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Spare Parts Inventory & Low Stock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track screens, batteries, and ICs with SKU codes, cost vs selling prices, low-stock threshold warnings, and transactional deduction upon repair completion.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-4">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dedicated Technician Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Technicians see only assigned jobs, add diagnostic findings, request replacement components, and update stages without tampering with financial records.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Tenant MongoDB Backend</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean organization isolation, atomic concurrency-safe ticket generators (`RD-YYYY-XXXXXX`), JWT authentication, and rate-limiting security.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Star className="w-3.5 h-3.5 fill-emerald-400" />
            Trusted by Independent Repair Centers
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hear from Shop Owners Who Switched
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Our technicians used to lose track of which iPhone belonged to whom. With RepairDesk&apos;s 80mm thermal barcode printer stickers and condition photos, customer arguments dropped to zero.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                AK
              </div>
              <div>
                <div className="text-xs font-bold text-white">Anil Khandelwal</div>
                <div className="text-[11px] text-slate-400">Om Electronics & Mobile Hub, Indore</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &ldquo;The QR code tracking feature alone saved us 2 hours a day. Customers no longer call every hour asking &lsquo;Bhaiya phone ban gaya kya?&rsquo; They just scan the slip and check online.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                VP
              </div>
              <div>
                <div className="text-xs font-bold text-white">Vikram Patel</div>
                <div className="text-[11px] text-slate-400">QuickFix Laptop Repair, Pune</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &ldquo;We manage 4 technicians across laptops, MacBooks, and Android phones. The Technician Workspace lets each staff member log parts and diagnosis notes on their phone at the counter.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-9 h-9 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs">
                RS
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ramesh Sundaram</div>
                <div className="text-[11px] text-slate-400">Silicon Care Solutions, Bengaluru</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Shop Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-800/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <MapPin className="h-3.5 w-3.5" />
              Active Pre-Configured Demo Shop
            </div>
            <h3 className="text-xl font-bold text-white">TechFix Repair Center — Indore</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Pre-seeded with real repair tickets, Indian customer records (Rahul Sharma, Priya Verma), inventory parts, and instant role switcher (Owner, Receptionist, Technician).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 px-6 shadow-lg shadow-blue-600/20"
            >
              <Link href="/dashboard">Launch Demo</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs h-10 px-4"
            >
              <Link href="/login">Switch Staff Role</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-300">RepairDesk</span> — Smart Electronics Repair Management System.
          </div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
            <Link href="/login" className="hover:text-slate-300">Staff Portal</Link>
            <Link href="/register" className="hover:text-slate-300">Register</Link>
            <Link href="/api/health" className="hover:text-slate-300">System Health</Link>
          </div>
          <div>
            Currency: INR (₹) | Default Timezone: Asia/Kolkata
          </div>
        </div>
      </footer>
    </div>
  );
}
