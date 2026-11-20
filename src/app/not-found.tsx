import Link from "next/link";
import { Wrench, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          The repair record, ticket, or workspace resource you are looking for does not exist or has been relocated.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
