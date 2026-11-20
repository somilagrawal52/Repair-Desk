"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("vikram@techfixindore.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success("Welcome back! Signed in successfully.");
      router.push("/dashboard");
    } else {
      toast.error(res.error || "Invalid email or password");
    }
  };

  const fillDemo = (role: "owner" | "receptionist" | "technician") => {
    if (role === "owner") {
      setEmail("vikram@techfixindore.in");
      setPassword("password123");
    } else if (role === "receptionist") {
      setEmail("sneha@techfixindore.in");
      setPassword("password123");
    } else if (role === "technician") {
      setEmail("amit.tech@techfixindore.in");
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Sign in to your repair shop
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Every Repair. One Organized Workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                Staff Email Address
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
                  placeholder="name@shop.com"
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-sm shadow-sm"
            >
              {submitting ? "Signing in..." : "Sign in to Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Quick Sign-in
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("owner")}
                className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 text-center transition-all"
              >
                Owner
                <span className="block text-[10px] text-slate-400 font-normal">Vikram</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("receptionist")}
                className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 text-center transition-all"
              >
                Front Desk
                <span className="block text-[10px] text-slate-400 font-normal">Sneha</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("technician")}
                className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 text-center transition-all"
              >
                Technician
                <span className="block text-[10px] text-slate-400 font-normal">Amit</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New electronics repair shop?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Register & Onboard your Shop
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Multi-tenant Isolation
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" /> Bcrypt Password Security
          </span>
        </div>
      </div>
    </div>
  );
}
