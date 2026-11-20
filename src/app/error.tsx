"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or telemetry service
    console.error("Unhandled Application Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/60 text-rose-700 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          Application Error Encountered
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          An unexpected error occurred while processing your request. Don&apos;t worry, your repair records and customer data are safe.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-32">
            <span className="font-semibold text-rose-600">Error: </span>
            {error.message}
            {error.digest && (
              <div className="text-slate-400 mt-1 text-[10px]">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 font-medium gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Need urgent help? Support contact: <a href="mailto:support@repairdesk.in" className="text-blue-600 underline">support@repairdesk.in</a>
        </div>
      </div>
    </div>
  );
}
