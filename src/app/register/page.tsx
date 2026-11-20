"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Check,
  Building2,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileText,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function RegisterShopPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    owner_name: "",
    email: "",
    password: "",
    shop_name: "",
    phone: "",
    address: "",
    city: "Indore",
    state: "Madhya Pradesh",
    ticket_prefix: "RD",
    repair_terms:
      "1. Minimum inspection fee of ₹200 applies if device is diagnosed as unrepairable.\n2. Repair warranty is 30 days covering replaced parts only.\n3. Shop is not liable for data loss during repairs. Backups are customer responsibility.\n4. Unclaimed devices past 60 days will be disposed of to recover costs.",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.owner_name.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error("Please fill in your owner name, email, and password");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    } else if (step === 2) {
      if (!formData.shop_name.trim() || !formData.phone.trim()) {
        toast.error("Please provide your repair shop name and contact phone number");
        return;
      }
    } else if (step === 3) {
      if (!formData.city.trim() || !formData.state.trim()) {
        toast.error("Please specify your shop city and state");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Congratulations! ${formData.shop_name} has been onboarded successfully.`);
      router.push("/dashboard");
    } else {
      toast.error(res.error || "Failed to onboard shop. Please try again.");
    }
  };

  const fillExampleShop = () => {
    setFormData({
      owner_name: "Vikram Patel",
      email: `vikram.${Date.now().toString().slice(-4)}@techfix.in`,
      password: "password123",
      shop_name: "TechFix Mobile & Laptop Repair",
      phone: "+91 98260 12345",
      address: "Shop 14, Treasure Island Mall Complex, MG Road",
      city: "Indore",
      state: "Madhya Pradesh",
      ticket_prefix: "TF",
      repair_terms:
        "1. Minimum inspection fee of ₹200 applies if device is diagnosed as unrepairable.\n2. Repair warranty is 30 days covering replaced parts only.\n3. Shop is not liable for data loss during repairs. Backups are customer responsibility.\n4. Unclaimed devices past 60 days will be disposed of to recover costs.",
    });
    toast.info("Populated fictional demo shop data for TechFix Indore");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Repair<span className="text-blue-600">Desk</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Onboard Your Electronics Repair Shop
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Set up your organization workspace in less than 2 minutes.
        </p>

        {/* Step Progress Indicators */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[
            { num: 1, label: "Owner" },
            { num: 2, label: "Shop" },
            { num: 3, label: "Location" },
            { num: 4, label: "Job Cards" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? "bg-blue-600 text-white"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step === s.num ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
              {s.num < 4 && <div className="w-6 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {step === 1 && (
                <>
                  <User className="w-4 h-4 text-blue-600" /> Step 1: Owner Account
                </>
              )}
              {step === 2 && (
                <>
                  <Building2 className="w-4 h-4 text-blue-600" /> Step 2: Shop Details
                </>
              )}
              {step === 3 && (
                <>
                  <MapPin className="w-4 h-4 text-blue-600" /> Step 3: Location & Currency
                </>
              )}
              {step === 4 && (
                <>
                  <FileText className="w-4 h-4 text-blue-600" /> Step 4: Job-Card Numbering & Terms
                </>
              )}
            </h3>
            <button
              type="button"
              onClick={fillExampleShop}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" /> Fill Demo Info
            </button>
          </div>

          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            {/* STEP 1: OWNER */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Owner Full Name *</Label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => handleChange("owner_name", e.target.value)}
                    placeholder="e.g. Vikram Patel"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Owner Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="vikram@techfix.in"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Create Password *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="mt-1"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Secured with salted bcrypt encryption.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SHOP DETAILS */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Repair Business / Shop Name *</Label>
                  <Input
                    value={formData.shop_name}
                    onChange={(e) => handleChange("shop_name", e.target.value)}
                    placeholder="e.g. TechFix Mobile & Laptop Repair"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Shop Contact Phone *</Label>
                  <div className="relative mt-1">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 98260 12345"
                      className="pl-9"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Printed on job cards and customer receipts.
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Shop Type / Specialization</Label>
                  <Input
                    defaultValue="Mobile phones, Laptops, Tablets & Electronics"
                    disabled
                    className="mt-1 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION & CURRENCY */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Counter Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="e.g. Shop 14, Treasure Island Mall Complex"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Indore"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Madhya Pradesh"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Currency</Label>
                    <Input value="INR (₹)" disabled className="mt-1 bg-slate-50 text-slate-500" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Timezone</Label>
                    <Input value="Asia/Kolkata (IST)" disabled className="mt-1 bg-slate-50 text-slate-500" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: JOB CARDS & TERMS */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Job-Card Number Prefix *</Label>
                  <Input
                    value={formData.ticket_prefix}
                    onChange={(e) => handleChange("ticket_prefix", e.target.value.toUpperCase())}
                    placeholder="RD"
                    maxLength={5}
                    className="mt-1 font-mono uppercase"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tickets will format as {formData.ticket_prefix || "RD"}-{new Date().getFullYear()}-000001
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Repair Terms & Policies</Label>
                  <Textarea
                    rows={4}
                    value={formData.repair_terms}
                    onChange={(e) => handleChange("repair_terms", e.target.value)}
                    className="mt-1 text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Included on printable A4 job cards, receipts, and customer live tracking view.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                >
                  {submitting ? "Creating Organization..." : "Launch Repair Workspace"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in to your shop
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Multi-Tenant SaaS
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500" /> Dedicated Organization
          </span>
        </div>
      </div>
    </div>
  );
}
