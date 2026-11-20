"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Settings, Building, Save, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialOrganization } from "@/lib/mock-data";

export default function SettingsPage() {
  const [name, setName] = useState(initialOrganization.name);
  const [phone, setPhone] = useState(initialOrganization.phone);
  const [email, setEmail] = useState(initialOrganization.email);
  const [address, setAddress] = useState(initialOrganization.address);
  const [city, setCity] = useState(initialOrganization.city);
  const [state, setState] = useState(initialOrganization.state);
  const [prefix, setPrefix] = useState(initialOrganization.ticket_prefix);
  const [terms, setTerms] = useState(initialOrganization.repair_terms);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Shop settings updated successfully!");
    }, 600);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shop Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure shop profile, contact info, job card numbering prefix, and printed repair terms.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <Building className="h-4 w-4 text-blue-600" />
              Store Identity & Contact
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Shop Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Customer Support Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Street Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">State</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Job Card Prefix & Warranty Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Ticket Number Prefix</Label>
                <Input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  className="text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-slate-400">e.g. {prefix}-2026-000001</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Input value="INR (₹)" disabled className="text-xs h-9 bg-slate-50" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Default Timezone</Label>
                <Input value="Asia/Kolkata (IST)" disabled className="text-xs h-9 bg-slate-50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Printed Job Card Terms & Conditions</Label>
              <Textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-5 gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving Changes..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
