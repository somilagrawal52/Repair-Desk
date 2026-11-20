# RepairDesk — Smart Electronics Repair Management System

> **Tagline:** Every Repair. One Organized Workspace.  
> **Currency:** INR (₹) | **Default Timezone:** Asia/Kolkata  
> **Flagship Full-Stack SaaS Application** for independent mobile, laptop, and electronics repair centers across India.

---

## 1. Overview & Product Vision

**RepairDesk** is a production-ready, commercial-grade SaaS platform engineered specifically for electronics repair businesses servicing smartphones, laptops, desktops, tablets, and consumer appliances.

It replaces misplaced paper registers, lost job cards, and endless customer phone calls with an organized workspace:
- **Device Intake & Inspection:** Category, brand, model, physical condition checklist (screen, body, liquid indicators, accessories), photo upload evidence, and instant printable Job Cards in both **Standard A4** and **80mm POS Thermal** layouts.
- **Unguessable Customer Tracking Portal:** Real-time customer tracking via `/track/[token]`. No customer login required; zero leakage of internal notes, IMEI/serial numbers, or parts purchase costs.
- **Dedicated Technician Workbench:** Filtered workbench for assigned repairs, multimeter/diagnostic findings, parts requisition, and quality check sign-off.
- **Estimates & WhatsApp Approvals:** Itemized parts and labour quotes with formal customer decision logging (Phone, In-Person, WhatsApp, Email).
- **Payments & Thermal Invoicing:** Cash, UPI QR, and Card payments, partial advances, balance tracking, and auto-generated receipts with tear guides (`RCP-YYYY-XXXXXX`).
- **Spare Parts Inventory:** SKU tracking, cost vs. selling prices, low-stock threshold warnings, and transactional deduction on job completion.
- **Multi-Tenant MongoDB Backend:** Fast document database, atomic concurrency-safe ticket generators (`RD-YYYY-XXXXXX`), JWT session authentication, and rate-limiting security.

---

## 2. Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Route Handlers, Edge Middleware)
- **Language:** TypeScript 5 (Strict Mode)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) (14 models, automated index synchronization)
- **Authentication:** Salted `bcryptjs` password hashing + `jose` JWT cookies (`repairdesk_session`)
- **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner Toaster
- **Hardware Print Support:** Dual-mode printable sheets: Standard A4 & 80mm POS Thermal slip
- **QR Code Engine:** `qrcode` dynamic vector and data-URL generation
- **Testing:** [Vitest](https://vitest.dev/) automated test suite (16 tests across 4 suites)
- **Deployment:** Vercel / Docker / VPS + MongoDB Atlas or Local MongoDB

---

## 3. Architecture & Data Model

```
organizations (Multi-tenant root boundary)
 ├── users (Owner, Admin, Receptionist, Technician)
 ├── shop_settings (Currency, timezone, ticket prefix, repair terms)
 ├── customers (Phone duplicate detection, address, notes)
 │    └── devices (Category, brand, model, color, serial/IMEI)
 ├── repair_tickets (RD-YYYY-XXXXXX atomic sequence)
 │    ├── ticket_status_history (Audit trail with timestamps & staff)
 │    ├── ticket_notes (Diagnostic, Internal vs Customer-Visible)
 │    ├── ticket_attachments (Pre-repair photos: intake, diagnosis, handover)
 │    ├── tracking_tokens (Unguessable cryptographic tracking tokens)
 │    ├── estimates & estimate_items (Parts & labour line items)
 │    │    └── estimate_approvals (In-person, Phone, WhatsApp, Email)
 │    ├── payments (Cash, UPI, Card, partial balances)
 │    └── receipts (RCP-YYYY-XXXXXX printable payment acknowledgments)
 ├── inventory_items (SKU, cost, selling price, stock, threshold)
 │    └── inventory_movements (Intake, consumed, restock audit)
 ├── sequences (Atomic counter generator per organization/year)
 └── audit_logs (Complete operational activity log)
```

### Atomic Ticket Number Generation
RepairDesk uses atomic MongoDB `$inc` updates via `SequenceModel.findOneAndUpdate` to guarantee collision-free, sequential ticket numbers per organization even under heavy concurrent intake:
$$\text{Ticket Format: } \text{RD-YYYY-XXXXXX} \quad (\text{e.g. } \text{RD-2026-000001})$$

---

## 4. User Roles & Permission Matrix

| Capability | Owner / Admin | Receptionist | Technician | Customer (No login) |
| :--- | :---: | :---: | :---: | :---: |
| **Shop Settings & Staff** | Full | None | None | None |
| **Revenue & Financial Reports** | Full | View Balance | None | None |
| **Device Intake & Job Card** | Yes | Yes | None | None |
| **Photo Upload & Lightbox** | Yes | Yes | Yes | View Sanitized |
| **Pricing & Estimates** | Edit | Edit Draft | Read-Only | View Estimate |
| **Technician Workbench & Notes**| Yes | None | Assigned Jobs| None |
| **Payment Recording & Receipts**| Yes | Yes | None | View Receipts |
| **Handover & Delivery** | Yes | Yes | None | None |
| **Public Status Tracking** | Link | Link | Link | `/track/[token]` |

---

## 5. Pre-Seeded Demo Environment

The application comes pre-loaded with **TechFix Repair Center** in Indore, Madhya Pradesh:
- **Shop Address:** Shop 104, Silver Arcade, Near TI Mall, New Palasia, Indore - 452001
- **Demo Credentials:**
  - **Owner:** `owner@techfix.in` / `password123`
  - **Receptionist:** `reception@techfix.in` / `password123`
  - **Technician:** `tech1@techfix.in` / `password123`
- **Instant Role Switcher:** Quick 1-click login buttons on `/login` to switch between Owner, Receptionist, and Technician personas.

---

## 6. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node v22.17.0)
- MongoDB instance running (Local `mongodb://localhost:27017` or MongoDB Atlas)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "Repair desk"
npm install
```

### 2. Environment Configuration
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/repairdesk
JWT_SECRET=repairdesk_super_secret_jwt_key_2026_kolkata_indore
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. One-Command Production Setup
Run the initialization script to create upload directories, synchronize MongoDB indexes, and seed demo records:
```bash
npm run setup
```

### 4. Run Automated Tests
```bash
npm test
```
All 16 test suites pass verifying ticket generation, rate limiting, data privacy, and RBAC security.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Key Features & Hardware Compatibility

### Dual-Format Printing Engine
- **Standard A4:** Formal full-page job sheet with customer acknowledgment tear-off, shop header, terms, and QR code.
- **80mm POS Thermal:** Monospaced 80mm slip formatted for standard ESC/POS counter printers (TVS-E, Epson, Retsol, NGX, Posiflex) with dashed cut lines (`- - - [ TEAR HERE ] - - -`).

### Device Photo Gallery
- Upload intake condition photos (front screen, back cover, motherboard corrosion).
- Image lightbox with zoom and category tags (`intake`, `diagnosis`, `repair`, `handover`).
- Prevents post-repair customer disputes regarding pre-existing scratches or water damage.

### System Health Monitoring
- Endpoint `/api/health` reports uptime, MongoDB latency, memory usage, and version info.

---

## 8. Production Deployment

### Option A: Vercel + MongoDB Atlas
1. Deploy your repository to [Vercel](https://vercel.com).
2. Set Environment Variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure 64-character random string.
   - `NEXT_PUBLIC_APP_URL`: Your custom domain (e.g., `https://repairdesk.in`).
3. Vercel automatically runs `npm run build` and deploys globally.

### Option B: Docker / VPS (Ubuntu + PM2)
```bash
npm run build
pm2 start npm --name "repairdesk" -- start
```

---

## 9. Commercial & White-Label Guide

See [COMMERCIAL_GUIDE.md](file:///c:/Users/somil/OneDrive/Documents/project/Repair%20desk/COMMERCIAL_GUIDE.md) for sales scripts, pricing plans (Starter ₹999/mo, Pro ₹1,999/mo, Enterprise ₹3,999/mo), client onboarding checklists, and white-labeling instructions.
