"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Building, Save, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { isOwner, isAdmin, organizationId } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Indore");
  const [state, setState] = useState("Madhya Pradesh");
  const [prefix, setPrefix] = useState("RD");
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/settings?orgId=${organizationId}`);
      const data = await res.json();
      if (data.success && data.organization) {
        setName(data.organization.name);
        setPhone(data.organization.phone);
        setEmail(data.organization.email);
        setAddress(data.organization.address);
        setCity(data.organization.city);
        setState(data.organization.state);
        setPrefix(data.organization.ticket_prefix);
        setTerms(data.organization.repair_terms);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name,
          phone,
          email,
          address,
          city,
          state,
          ticket_prefix: prefix.toUpperCase().trim(),
          repair_terms: terms,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Shop settings updated successfully in database!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shop Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure shop profile, contact info, job card numbering prefix, and printed repair terms.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="h-9 text-xs gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading shop settings...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Building className="h-4 w-4 text-blue-600" />
                Store Identity & Contact
              </h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Shop / Business Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={!isOwner && !isAdmin}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Customer Support Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={!isOwner && !isAdmin}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!isOwner && !isAdmin}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Street Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={!isOwner && !isAdmin}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!isOwner && !isAdmin}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">State</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!isOwner && !isAdmin}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Operational & Ticketing Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Job Card Prefix</Label>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                    disabled={!isOwner && !isAdmin}
                    className="text-xs h-9 font-mono uppercase"
                  />
                  <p className="text-[11px] text-slate-400">
                    E.g. &ldquo;RD&rdquo; produces tickets like {prefix || "RD"}-2026-000001
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Currency & Timezone</Label>
                  <Input
                    value="INR (₹) • Asia/Kolkata (IST)"
                    disabled
                    className="text-xs h-9 bg-slate-50 text-slate-500"
                  />
                  <p className="text-[11px] text-slate-400">Fixed for Indian electronics repair shops</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Standard Repair Terms & Policies
                </Label>
                <Textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  disabled={!isOwner && !isAdmin}
                  className="text-xs font-sans leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Printed automatically on counter job cards, payment receipts, and customer tracking slips.
                </p>
              </div>
            </div>

            {(isOwner || isAdmin) && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving Changes..." : "Save Settings"}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </AppShell>
  );
}
