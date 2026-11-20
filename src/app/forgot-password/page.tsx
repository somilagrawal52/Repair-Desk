"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSentMessage(data.message);
        toast.success("Password reset request processed!");
      } else {
        toast.error(data.error || "Failed to process request");
      }
    } catch {
      toast.error("Network error while submitting password reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Repair<span className="text-blue-600">Desk</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Reset Staff Password
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your registered shop staff email to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {sentMessage ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Instructions Sent</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-left leading-relaxed">
                {sentMessage}
              </p>
              <div className="pt-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/login" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Registered Staff Email
                </Label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@techfix.in"
                    className="pl-9 h-11"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Try default demo account: <span className="font-semibold text-slate-600">vikram@techfix.in</span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-sm"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
                <Send className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
