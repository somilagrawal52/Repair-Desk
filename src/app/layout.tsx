import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://repairdesk.in"
  ),
  title: {
    default: "RepairDesk — Smart Electronics Repair Management System",
    template: "%s | RepairDesk",
  },
  description:
    "Every Repair. One Organized Workspace. The all-in-one shop management platform for mobile, laptop, and electronics repair businesses in India. Streamlined intake, job cards, tracking QR, estimates, thermal receipts, and inventory.",
  keywords: [
    "repair shop software",
    "electronics repair CRM",
    "mobile repair management",
    "laptop repair shop system",
    "job card generator",
    "thermal receipt POS",
    "repair tracking portal",
    "India repair shop software",
    "repairdesk",
  ],
  authors: [{ name: "RepairDesk Team", url: "https://repairdesk.in" }],
  creator: "RepairDesk",
  publisher: "RepairDesk Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "RepairDesk — Smart Electronics Repair Management System",
    description:
      "Every Repair. One Organized Workspace. Modern device intake, 80mm thermal receipts, live customer tracking, estimates, and inventory.",
    url: "https://repairdesk.in",
    siteName: "RepairDesk",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepairDesk — Smart Electronics Repair Management",
    description:
      "Every Repair. One Organized Workspace. Modern shop software for independent electronics repair shops.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-slate-50/50 text-slate-900 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
