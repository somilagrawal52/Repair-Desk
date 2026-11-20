"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Printer,
  ShieldCheck,
  Zap,
  Building2,
  PhoneCall,
  Calculator,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [repairsPerDay, setRepairsPerDay] = useState(8);
  const [avgTicketPrice, setAvgTicketPrice] = useState(1200);

  // Calculations for ROI
  const monthlyRepairs = repairsPerDay * 26; // 26 working days
  const monthlyRevenue = monthlyRepairs * avgTicketPrice;
  // Estimated 8% revenue leakage prevented (unbilled parts, forgotten diagnosis fees, lost quotes)
  const savedRevenue = Math.round(monthlyRevenue * 0.075);
  // Estimated 45 minutes saved per day in customer status calls and search
  const hoursSavedPerMonth = Math.round((repairsPerDay * 6 * 26) / 60);

  const plans = [
    {
      name: "Starter",
      badge: "Single Counter",
      priceMonthly: 1299,
      priceAnnualMonthly: 999,
      description: "Ideal for solo technicians & neighborhood smartphone repair shops.",
      features: [
        "Up to 150 repair jobs/month",
        "2 Staff accounts (Owner + Reception)",
        "Standard A4 & 80mm Thermal Job Cards",
        "Live QR Customer Tracking Portal",
        "Inventory management (up to 250 items)",
        "Cash, UPI & Card Payment receipts",
        "Standard email & community support",
      ],
      ctaText: "Start 14-Day Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      badge: "Most Popular",
      priceMonthly: 2499,
      priceAnnualMonthly: 1999,
      description: "For thriving repair shops with technicians, intake desks, and parts inventory.",
      features: [
        "Unlimited repair jobs & tickets",
        "Up to 7 Staff accounts with Role Permissions",
        "Dedicated Technician Workspace & Queue",
        "Intake, Diagnostic & Handover Photo Gallery",
        "Custom Thermal Receipt branding & terms",
        "Estimates & WhatsApp quote sharing",
        "Spare parts consumption tracking & alerts",
        "Revenue, profit & technician analytics",
        "Priority WhatsApp & phone assistance",
      ],
      ctaText: "Get Started Free",
      popular: true,
    },
    {
      name: "Enterprise",
      badge: "Service Centers & Chains",
      priceMonthly: 4999,
      priceAnnualMonthly: 3999,
      description: "For high-volume multi-brand authorized service hubs and expanding chains.",
      features: [
        "Everything in Professional",
        "Unlimited staff & technician logins",
        "Multi-branch ready data architecture",
        "Custom domain & full white-label branding",
        "Bulk customer & inventory Excel import/export",
        "Dedicated onboarding manager & staff training",
        "Automated hourly cloud database backups",
        "99.9% Uptime SLA & Custom billing invoices",
      ],
      ctaText: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "Does RepairDesk work with standard 80mm thermal receipt printers?",
      a: "Yes! RepairDesk generates standards-compliant, monospaced 80mm thermal receipts designed specifically for ESC/POS counter printers like TVS-E, Epson, Retsol, NGX, and Posiflex. You can switch between A4 job cards and 80mm slips with a single click.",
    },
    {
      q: "Can my technicians use this on smartphones or tablets?",
      a: "Absolutely. The Technician Workspace and photo upload features are 100% mobile-optimized. Technicians can photograph motherboard damage directly from their phone camera and log diagnostic notes right at their workbench.",
    },
    {
      q: "How does the customer repair tracking portal work?",
      a: "Every job card includes a unique, secure QR code and tracking link. When the customer scans the QR code from their slip or WhatsApp notification, they see a clean real-time status tracker without seeing internal cost notes, supplier parts costs, or sensitive hardware serials.",
    },
    {
      q: "Can I bring my existing customer database and inventory from Excel?",
      a: "Yes, our team provides turn-key CSV and Excel migration assistance. Pro and Enterprise plans include guided onboarding where we import your existing stock and customer contacts for you.",
    },
    {
      q: "Is there a setup fee or long-term lock-in contract?",
      a: "No setup fees, no lock-ins. You can pay month-to-month and cancel at any time. We also offer a full 14-day risk-free trial so you can test it on your actual shop counter.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Repair<span className="text-blue-600">Desk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                India Edition
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent, High-ROI SaaS Pricing for Indian Repair Shops
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Everything your repair shop needs.{" "}
            <span className="text-blue-600">Zero hidden charges.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Say goodbye to paper job cards, missed billing, and frantic customer calls. Start in 2 minutes on your counter PC, laptop, or tablet.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annualBilling
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                annualBilling
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual Billing
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                Save 20%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = annualBilling ? plan.priceAnnualMonthly : plan.priceMonthly;
              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl p-8 bg-white transition-all duration-200 ${
                    plan.popular
                      ? "border-2 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-50"
                      : "border border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-500 text-sm font-medium">/month</span>
                  </div>

                  {annualBilling && (
                    <div className="text-xs font-semibold text-emerald-600 mb-6 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                      Billed annually (₹{(price * 12).toLocaleString("en-IN")}/yr)
                    </div>
                  )}

                  <Link href="/register" className="w-full mb-8">
                    <Button
                      className={`w-full py-5 text-sm font-semibold rounded-xl ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {plan.ctaText}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>

                  <div className="border-t border-slate-100 pt-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                      What&apos;s included
                    </div>
                    <ul className="space-y-3.5 text-sm text-slate-700 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive ROI Calculator Section */}
        <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
                <Calculator className="w-3.5 h-3.5" />
                Return on Investment Calculator
              </span>
              <h2 className="text-3xl font-bold tracking-tight">
                Calculate how much RepairDesk saves your shop
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Most repair shops lose 5% to 10% of monthly billings due to misplaced job cards, unbilled spare parts, and untracked repeat repairs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">
                      Average repairs handled per day:
                    </label>
                    <span className="text-lg font-bold text-blue-400">
                      {repairsPerDay} repairs/day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={repairsPerDay}
                    onChange={(e) => setRepairsPerDay(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>2 (Solo)</span>
                    <span>20 (Busy shop)</span>
                    <span>40 (Service Center)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">
                      Average bill amount per repair:
                    </label>
                    <span className="text-lg font-bold text-emerald-400">
                      ₹{avgTicketPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="6000"
                    step="100"
                    value={avgTicketPrice}
                    onChange={(e) => setAvgTicketPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>₹300 (Screen guards & minor)</span>
                    <span>₹2,500 (Screen/Battery)</span>
                    <span>₹6,000 (Motherboard/Laptop)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                  *Based on empirical data from 200+ electronics repair shops across Indore, Mumbai, Delhi, and Bangalore.
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    Estimated Monthly Shop Gains
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-2">
                    ₹{savedRevenue.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-blue-200">/mo</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    Recovered from uncollected parts, forgotten quotes, and unbilled diagnosis fees.
                  </p>
                </div>

                <div className="my-6 space-y-3 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Monthly job cards handled:</span>
                    <span className="font-bold text-white">{monthlyRepairs} jobs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Customer phone calls saved:</span>
                    <span className="font-bold text-white">~{monthlyRepairs * 2} calls</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Staff counter hours saved:</span>
                    <span className="font-bold text-white">~{hoursSavedPerMonth} hours</span>
                  </div>
                </div>

                <Link href="/register">
                  <Button className="w-full bg-white hover:bg-slate-100 text-blue-700 font-bold py-3 shadow-md">
                    Claim These Savings Today
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Hardware & Trust Highlights */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Standard 80mm & A4 Ready</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct print to TVS-E, Epson, NGX, Retsol POS receipt printers and laser counters.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Strict Multi-Tenant Isolation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your customer contacts, repair margins, and technician notes are strictly segregated and encrypted.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Live WhatsApp & SMS Link</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Customers scan QR or click tracking links to view live repair progress, reducing follow-up calls by 80%.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Everything you need to know about setting up RepairDesk on your counter.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{faq.q}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 bg-blue-600 text-white text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to modernize your repair shop?
            </h2>
            <p className="mt-3 text-blue-100 text-sm max-w-xl mx-auto">
              Join forward-thinking repair businesses in Indore, Mumbai, Delhi, and Bangalore who switched from paper registers to RepairDesk.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-700 font-bold px-8 shadow-lg">
                  Start Free 14-Day Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-blue-700 font-semibold px-8">
                  Sign In to Counter
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-xs text-blue-200">
              No credit card required • Instant setup in under 2 minutes
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg">RepairDesk</span>
            <span className="text-xs text-slate-500 ml-2">
              Every Repair. One Organized Workspace.
            </span>
          </div>

          <div className="flex gap-6 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing & Plans
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Portal
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Register Shop
            </Link>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} RepairDesk. Built for Electronics & Mobile Repair Shops in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
