# RepairDesk — Commercial SaaS & Freelance Client Delivery Guide

This guide contains everything you need to sell, customize, and deliver **RepairDesk** to electronics and mobile repair shop clients across India as either:
1. **A Recurring Subscription SaaS** (₹999 to ₹3,999/month per shop).
2. **A Custom White-Labeled Software Project** (₹25,000 to ₹75,000 one-time delivery with ongoing maintenance).

---

## 1. Product Positioning & Client Value Proposition

### The Problem in Indian Repair Shops
Most independent repair shops in cities like Indore, Pune, Jaipur, Ahmedabad, Mumbai, and Delhi manage ₹1,50,000 to ₹8,00,000 in monthly turnover using:
- Physical paper registers or carbon-copy notebooks.
- Unsorted WhatsApp chats for status updates.
- Untracked spare screens and batteries lying in drawers.
- Handwritten slips that customers lose or tamper with.

### The Quantifiable Business Loss
- **Customer Disputes:** Customers arguing that their screen didn't have scratches before, or that their phone's camera was working when submitted.
- **Unbilled Spare Parts:** Technicians using a ₹1,200 IC or battery without recording it on the customer invoice.
- **Phone Distractions:** Counter staff spending 1.5 to 2.5 hours every day answering repeated *"Bhaiya phone ready ho gaya kya?"* calls.
- **Lost Repair History:** Inability to look up what repair was done 3 months ago when a customer claims warranty.

### The RepairDesk Solution & 7-Day Payback
| Feature | Direct Business Impact |
| :--- | :--- |
| **Intake Condition Checklist + Photo Upload** | Eliminates damage disputes with photographic timestamped evidence. |
| **80mm Thermal Receipt + Tear Off** | Prints in 3 seconds on existing counter POS printers. |
| **Live QR Tracking Portal** | Customers scan their slip to track progress. Reduces status inquiry calls by 80%. |
| **Spare Parts Consumption Link** | Parts are deducted directly from inventory as tickets complete. Stops parts leakage. |
| **Technician Workbench & Multimeter Logs** | Benchmarks staff efficiency and assigns accountability for repeat repairs. |

---

## 2. Pricing Models & Pitching Strategies

### Model A: Monthly / Annual SaaS Subscription
Best for building steady recurring revenue (MRR).

| Tier | Monthly | Annual (Save 20%) | Target Client |
| :--- | :--- | :--- | :--- |
| **Starter** | ₹1,299/mo | **₹999/mo** (₹11,988/yr) | Solo technician / neighborhood smartphone shop |
| **Professional** | ₹2,499/mo | **₹1,999/mo** (₹23,988/yr) | Multi-tech repair center with parts inventory |
| **Enterprise** | ₹4,999/mo | **₹3,999/mo** (₹47,988/yr) | Multi-branch service hubs / laptop centers |

### Model B: Turn-Key White-Label Project Sale
Best for immediate freelance cashflow.
- **Standard White-Label Package:** **₹35,000 to ₹50,000**
  - Includes: Custom branding (shop name, logo, custom color theme), custom domain setup (e.g., `repair.clientshop.com`), setup on client's local PC or cloud server, counter thermal printer configuration, and staff training.
- **Annual Maintenance Contract (AMC):** **₹10,000/year**
  - Includes cloud database backups, version updates, and phone support.

---

## 3. White-Labeling & Client Customization Checklist

To deploy a custom instance for a new client:

### Step 1: Shop Profile & Identity
Navigate to `/settings` or run initialization with the client's information:
- **Shop Name:** e.g., *"Star Mobile Solutions"*
- **Tagline:** e.g., *"Indore's Trusted iPhone & Android Specialist"*
- **Phone Number:** e.g., `+91 98260 00000`
- **Address & City:** Counter location printed on invoices
- **GSTIN / Tax ID:** Optional business tax number
- **Currency:** `₹` (INR)
- **Timezone:** `Asia/Kolkata`

### Step 2: Custom Ticket Prefix & Policies
In `src/app/settings/page.tsx` or database `shop_settings`:
- Set **Ticket Prefix:** Change `RD-` to the client's initials (e.g., `STAR-`, `IFIX-`, `APEX-`).
- Set **Repair Terms & Warranty:** Customize warranty terms (e.g., *90 days warranty on display assembly replacement. No warranty on water-damaged devices.*).

### Step 3: Brand Logo & Favicon
- Replace `public/favicon.ico` with the client's logo.
- Upload shop logo in `/settings` (automatically renders on A4 job cards and thermal receipts).

---

## 4. Hardware & Thermal Printer Setup Guide

RepairDesk is engineered to work out-of-the-box with standard 80mm ESC/POS counter printers.

### Tested Counter Printers
- **TVS Electronics:** RP 3200 Star, RP 3160 Gold
- **Epson:** TM-T82, TM-T88
- **Retsol:** TP-806, TP-808
- **NGX / Posiflex / Everycom:** Standard 80mm USB & LAN receipt printers

### Recommended Chrome / Edge Print Settings
When pressing **Print 80mm Receipt** on counter:
1. **Destination:** Select the 80mm thermal receipt printer.
2. **Paper Size:** Select `80mm x Receipt` (or `3.15 x 11.69 in`).
3. **Margins:** Select **None**.
4. **Options:** Uncheck *Headers and Footers*.
5. Result: Clean, crisp, monospace slip with barcode/QR code and tear-off line.

---

## 5. Sales Conversation Blueprint & Pitch Script

### The 3-Minute Live Counter Demo
When walking into a repair shop or hopping on a demo call with an owner:

1. **Intake Flow (Minute 1):**
   - Open `/repairs/new`.
   - Enter a fictional device (e.g. *Samsung Galaxy S23, Cracked Display*).
   - Check condition boxes (*Touch working, Frame dented, Liquid indicator clean*).
   - Click **Create Job Card**. Show the generated ticket number (`RD-2026-000001`).

2. **The Receipt & QR Scan (Minute 2):**
   - Click **Print 80mm Thermal Slip**.
   - Show how the slip looks just like a professional retail receipt.
   - Ask the shop owner: *"Take out your phone and scan this QR code on the slip."*
   - Let them see the live tracking portal on their phone: *"Your customer sees this anywhere in the city. They know their phone is 'In Repair' without having to call your counter."*

3. **Technician & Financial Handover (Minute 3):**
   - Switch to Technician view. Show how the technician logs the diagnostic findings.
   - Return to counter, record payment (Cash or UPI), and mark **Delivered**.
   - Show how inventory auto-deducted the screen from stock.

### Common Objections & Rebuttals

> **Objection 1:** *"My technicians and counter staff are not very educated. Software is too complicated."*  
> **Rebuttal:** *"RepairDesk was specifically designed so anyone who can use WhatsApp can use it. Creating a job card takes less than 35 seconds, and status changes are 1 click. Let me set it up on your counter for 3 days free to see for yourself."*

> **Objection 2:** *"I already have a register and write customer slips by hand."*  
> **Rebuttal:** *"When a customer says 'You scratched my laptop body', what proof do you have? When a customer loses their slip, how do you find their phone among 40 items? RepairDesk stores photos of the device before opening and lets you search any phone by mobile number in 1 second."*

> **Objection 3:** *"Is my customer data safe? Will my competitors see my repair charges?"*  
> **Rebuttal:** *"Every shop has its own isolated database boundary. No one can see your customer records, parts supplier prices, or profit margins. Everything is password-protected and encrypted."*

---

## 6. Cloud & Local Deployment Runbooks

### Option 1: Cloud Deployment (Vercel + MongoDB Atlas)
- **Database:** Create a free M0 cluster or $9/mo dedicated cluster on [cloud.mongodb.com](https://cloud.mongodb.com).
- **Hosting:** Import the GitHub repository into [Vercel](https://vercel.com).
- **Environment Variables:**
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/repairdesk?retryWrites=true&w=majority
  JWT_SECRET=<your-custom-secure-secret>
  NEXT_PUBLIC_APP_URL=https://<your-custom-domain>
  NODE_ENV=production
  ```
- **Custom Domain:** Point `app.yourclientdomain.in` to `cname.vercel-dns.com`.

### Option 2: Local Shop Counter PC Deployment (Offline-First / On-Premise)
For shops with slow or unreliable internet that want data stored locally on their counter PC:
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) on the shop's main PC.
2. Install [Node.js LTS](https://nodejs.org/).
3. Clone project and run:
   ```bash
   npm install
   npm run setup
   npm run build
   ```
4. Install `pm2` and configure auto-start on Windows boot:
   ```bash
   npm install -g pm2
   pm2 start npm --name "repairdesk" -- start
   pm2 save
   ```
5. Other tablets and technician phones on the shop's local Wi-Fi can access the dashboard via `http://<COUNTER-PC-IP>:3000`.

---

## 7. Delivery Checklist for Client Handover
- [ ] MongoDB indexes synchronized (`npm run setup`).
- [ ] Shop name, phone, address, and logo updated in Settings.
- [ ] Ticket prefix customized.
- [ ] 80mm thermal printer test print verified.
- [ ] Staff accounts created for Owner, Receptionist, and Technicians.
- [ ] Initial spare parts catalog imported/entered.
- [ ] Staff trained on intake, status progression, and delivery receipts.
