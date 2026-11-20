# RepairDesk — Smart Electronics Repair Management System

> **Tagline:** Every Repair. One Organized Workspace.  
> **Currency:** INR (₹) | **Default Timezone:** Asia/Kolkata  
> **Flagship Full-Stack SaaS Application** for independent electronics repair centers across India.

---

## 1. Overview

**RepairDesk** is a production-oriented, multi-tenant web application engineered specifically for electronics repair businesses servicing smartphones, laptops, desktops, tablets, and consumer electronics.

It replaces disconnected paper registers, untracked job cards, and messy WhatsApp chat threads with a single operational workspace:
- **Intake & Physical Inspection:** Device category, brand, model, condition checklist (screen, power, charging, liquid indicators, accessories), and instant printable A4 Job Cards with tracking QR codes.
- **Unguessable Customer Tracking Portal:** Secure public progress tracking via `/track/[token]`. No customer login required; strictly zero leakage of private notes, IMEI/serial numbers, or technician internal cost figures.
- **Dedicated Technician Workbench:** Benches for assigned jobs, multimeter & diagnostic logs, parts requisition, and quality check progression without tampering with financial records.
- **Estimates & Revisions:** Itemized parts and labour quotes with customer decision logging (Phone, In-Person, WhatsApp, Email).
- **Payments & Instant Invoicing:** Cash, UPI QR, and Card recording, partial deposits, balance tracking, and auto-generated printable payment receipts.
- **Spare Parts Inventory:** SKU catalog, cost vs. selling prices, low-stock threshold alerts, and transactional consumption deduction.
- **Executive Command Center:** Real-time KPI cards, revenue metrics, pipeline status distribution, technician workloads, and CSV exports.

---

## 2. Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner Toaster
- **Database Architecture:** PostgreSQL with Row Level Security (RLS) & Supabase Client/Server integration
- **QR Code Engine:** `qrcode` dynamic vector and data-URL generation
- **Testing:** [Vitest](https://vitest.dev/) automated test suite for critical business workflows
- **Deployment:** Vercel + Supabase PostgreSQL & Storage

---

## 3. Architecture & Data Model

```
organizations (Multi-tenant root boundary)
 ├── organization_members (Owner, Admin, Receptionist, Technician)
 ├── shop_settings (Currency, timezone, ticket prefix, repair terms)
 ├── customers (Phone duplicate detection, address, notes)
 │    └── devices (Category, brand, model, color, serial/IMEI)
 ├── repair_tickets (RD-YYYY-XXXXXX concurrency-safe sequence)
 │    ├── ticket_status_history (Audit trail with timestamps & staff)
 │    ├── ticket_notes (Diagnostic, Internal vs Customer-Visible)
 │    ├── tracking_tokens (Unguessable cryptographic tracking tokens)
 │    ├── estimates & estimate_items (Parts & labour line items)
 │    │    └── estimate_approvals (In-person, Phone, WhatsApp, Email)
 │    ├── payments (Cash, UPI, Card, partial balances)
 │    └── receipts (RCP-YYYY-XXXXXX printable payment acknowledgments)
 ├── inventory_items (SKU, cost, selling price, stock, threshold)
 │    └── inventory_movements (Intake, consumed, restock audit)
 └── audit_logs (Complete operational activity log)
```

### Concurrency-Safe Ticket Number Generation
RepairDesk uses an atomic sequence generator to guarantee collision-free, sequential ticket numbers per organization even under simultaneous intakes:
$$\text{Ticket Format: } \text{RD-YYYY-XXXXXX} \quad (\text{e.g. } \text{RD-2026-000001})$$

---

## 4. User Roles & Permission Hierarchy

| Capability | Owner / Admin | Receptionist | Technician | Customer (No login) |
| :--- | :---: | :---: | :---: | :---: |
| **Shop Settings & Staff** |  Full |  None |  None |  None |
| **Revenue & Financial Reports** |  Full |  View Balance |  None |  None |
| **Device Intake & Job Card** |  Yes |  Yes |  None |  None |
| **Pricing & Estimates** |  Edit |  Edit Draft |  Read-Only |  View Estimate |
| **Technician Workbench & Notes**|  Yes |  None |  Assigned Jobs|  None |
| **Payment Recording & Receipts**|  Yes |  Yes |  None |  View Receipts |
| **Handover & Delivery** |  Yes |  Yes |  None |  None |
| **Public Status Tracking** |  Link |  Link |  Link |  `/track/[token]` |

---

## 5. Pre-Seeded Demo Environment

The application comes pre-loaded with **TechFix Repair Center** in Indore, Madhya Pradesh:
- **Shop Address:** Shop 104, Silver Arcade, Near 56 Dukan, New Palasia, Indore
- **Active Team Members:**
  - `Vikram Patel` — Owner / Administrator
  - `Sneha Kulkarni` — Receptionist
  - `Amit Joshi` — Senior Mobile & Micro-soldering Technician
  - `Rajesh Kumar` — Laptop & Hardware Specialist
- **Realistic Seed Repairs:**
  - `RD-2026-000001`: Samsung Galaxy S23 (Broken AMOLED, In Repair, UPI advance paid)
  - `RD-2026-000002`: Dell Inspiron 15 (No power / DC Jack, Under Diagnosis)
  - `RD-2026-000003`: iPhone 13 (Battery degraded, Ready for Pickup, Fully paid)
  - `RD-2026-000004`: HP Pavilion 14 (Keyboard spill, Waiting for Parts)
  - `RD-2026-000005`: OnePlus 11 (Charging port replaced, Delivered & settled)
- **Pre-Configured Inventory:**
  - Samsung Galaxy S23 Dynamic AMOLED 2X Panel (SKU: `DISP-SAM-S23`)
  - iPhone 13 Replacement Battery 3227mAh (SKU: `BATT-IPH13`)
  - HP Pavilion 14 Backlit Keyboard (SKU: `KB-HP-PAV14`, Low-stock alert!)
  - Dell Inspiron DC Jack Cable Type-C (SKU: `JACK-DELL-TYPC`)

---

## 6. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v22.17.0)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "Repair desk"
npm install
```

### 2. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
*(When running without Supabase credentials, RepairDesk automatically uses the high-performance built-in memory/state store with pre-seeded demo data).*

### 3. Run Automated Tests
```bash
npm test
```
Runs the Vitest test suite verifying:
- Concurrency-safe ticket numbering
- Organization data isolation
- Public tracking token data privacy (sanitization of IMEI, phone, internal notes)
- Status transition validations (blocking edits to delivered repairs)
- Estimate approval logging
- Partial payments & balance computations
- Inventory stock safeguards against negative values
- End-to-end intake-to-delivery lifecycle

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Production Deployment (Vercel + Supabase)

### Deploying Database Schema to Supabase
1. Create a new PostgreSQL database in your [Supabase Dashboard](https://supabase.com).
2. Open the SQL Editor and execute `supabase/migrations/0001_initial_schema.sql`.
3. In Project Settings > API, copy your `Project URL`, `anon` public key, and `service_role` secret.

### Deploying to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the project into Vercel.
3. Configure the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://your-domain.vercel.app`)
4. Click **Deploy**.

---

## 8. License & Commercial Customization

Developed for independent electronics repair businesses and SaaS deployment. Designed with modular architecture for easy customization for freelance clients.
