-- ==============================================================================
-- RepairDesk Database Schema (PostgreSQL with Row Level Security)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'receptionist', 'technician');
CREATE TYPE device_category AS ENUM ('smartphone', 'laptop', 'desktop', 'tablet', 'smartwatch', 'audio', 'appliance', 'other');
CREATE TYPE repair_status AS ENUM (
  'received',
  'under_diagnosis',
  'awaiting_approval',
  'waiting_for_parts',
  'in_repair',
  'quality_check',
  'ready_for_pickup',
  'delivered',
  'cancelled',
  'unrepairable'
);
CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'fully_paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'bank_transfer', 'card', 'other');
CREATE TYPE estimate_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'revised');
CREATE TYPE inventory_movement_type AS ENUM ('initial', 'restock', 'repair_consumed', 'adjustment', 'return');

-- 3. ORGANIZATIONS (Multi-tenant root)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Indore',
  state VARCHAR(100) DEFAULT 'Madhya Pradesh',
  country VARCHAR(100) DEFAULT 'India',
  currency VARCHAR(10) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  logo_url TEXT,
  ticket_prefix VARCHAR(10) DEFAULT 'RD',
  repair_terms TEXT DEFAULT '1. All repairs carry 30 days warranty on replaced parts unless specified.\n2. Devices not collected within 60 days of completion may incur storage charges.\n3. Water-damaged devices carry no warranty on unrelated subsequent faults.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USERS & MEMBERSHIPS
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users(id) in Supabase Auth
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'technician',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- 5. CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_customers_org_phone ON customers(organization_id, phone);
CREATE INDEX idx_customers_org_name ON customers(organization_id, full_name);

-- 6. DEVICES
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category device_category NOT NULL DEFAULT 'smartphone',
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  color VARCHAR(50),
  serial_number VARCHAR(100), -- IMEI or Serial (restricted)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_devices_org_customer ON devices(organization_id, customer_id);

-- 7. TICKET NUMBER SEQUENCE PER ORG (Safe Concurrent Ticket Generation)
CREATE TABLE organization_ticket_sequences (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  current_year INT NOT NULL,
  last_number INT NOT NULL DEFAULT 0
);

-- Function to generate next ticket number safely
CREATE OR REPLACE FUNCTION generate_ticket_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM CURRENT_TIMESTAMP);
  v_seq INT;
  v_prefix VARCHAR(10);
  v_ticket_num TEXT;
BEGIN
  -- Get org ticket prefix
  SELECT ticket_prefix INTO v_prefix FROM organizations WHERE id = org_id;
  IF v_prefix IS NULL THEN
    v_prefix := 'RD';
  END IF;

  -- Upsert sequence counter atomically
  INSERT INTO organization_ticket_sequences (organization_id, current_year, last_number)
  VALUES (org_id, v_year, 1)
  ON CONFLICT (organization_id) DO UPDATE
  SET 
    last_number = CASE 
      WHEN organization_ticket_sequences.current_year = v_year THEN organization_ticket_sequences.last_number + 1
      ELSE 1
    END,
    current_year = v_year
  RETURNING last_number INTO v_seq;

  -- Format: RD-2026-000001
  v_ticket_num := v_prefix || '-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN v_ticket_num;
END;
$$ LANGUAGE plpgsql;

-- 8. REPAIR TICKETS
CREATE TABLE repair_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  assigned_technician_id UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  current_status repair_status NOT NULL DEFAULT 'received',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  reported_problem TEXT NOT NULL,
  intake_notes TEXT,
  accessories_received TEXT,
  condition_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_delivery_date TIMESTAMPTZ,
  estimate_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  final_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  delivered_at TIMESTAMPTZ,
  delivered_to_name VARCHAR(255),
  handover_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, ticket_number)
);
CREATE INDEX idx_tickets_org_status ON repair_tickets(organization_id, current_status);
CREATE INDEX idx_tickets_org_tech ON repair_tickets(organization_id, assigned_technician_id);
CREATE INDEX idx_tickets_org_customer ON repair_tickets(organization_id, customer_id);

-- 9. TICKET STATUS HISTORY
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  old_status repair_status,
  new_status repair_status NOT NULL,
  changed_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_status_hist_ticket ON ticket_status_history(ticket_id);

-- 10. TICKET NOTES (Diagnostic & Internal vs Customer-visible)
CREATE TABLE ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  note_type VARCHAR(30) NOT NULL DEFAULT 'internal', -- 'internal', 'diagnostic', 'customer_visible'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notes_ticket ON ticket_notes(ticket_id);

-- 11. TICKET ATTACHMENTS (Photos)
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL DEFAULT 'intake', -- 'intake', 'diagnosis', 'repair', 'handover'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ESTIMATES & LINE ITEMS
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  revision_number INT NOT NULL DEFAULT 1,
  status estimate_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL DEFAULT 'part', -- 'part', 'labour'
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estimate_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- 'approved', 'rejected'
  channel VARCHAR(50) NOT NULL, -- 'in_person', 'phone_call', 'whatsapp', 'email'
  recorded_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. INVENTORY ITEMS & MOVEMENTS
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  compatible_models TEXT,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 3,
  supplier VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES repair_tickets(id) ON DELETE SET NULL,
  movement_type inventory_movement_type NOT NULL,
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PAYMENTS & RECEIPTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  reference_number VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  total_charges NUMERIC(12, 2) NOT NULL,
  total_paid NUMERIC(12, 2) NOT NULL,
  balance_remaining NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SECURE TRACKING TOKENS
CREATE TABLE tracking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tracking_hash ON tracking_tokens(token_hash);

-- 16. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid() AND is_active = TRUE
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Sample RLS policy template applied across tables:
CREATE POLICY "Users can only access records in their organization"
ON customers FOR ALL
USING (organization_id = current_user_org_id());

CREATE POLICY "Users can only access tickets in their organization"
ON repair_tickets FOR ALL
USING (organization_id = current_user_org_id());

CREATE POLICY "Users can only access inventory in their organization"
ON inventory_items FOR ALL
USING (organization_id = current_user_org_id());

CREATE POLICY "Users can only access payments in their organization"
ON payments FOR ALL
USING (organization_id = current_user_org_id());
