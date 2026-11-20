export type UserRole = "owner" | "admin" | "receptionist" | "technician";

export type DeviceCategory =
  | "smartphone"
  | "laptop"
  | "desktop"
  | "tablet"
  | "smartwatch"
  | "audio"
  | "appliance"
  | "other";

export type RepairStatus =
  | "received"
  | "under_diagnosis"
  | "awaiting_approval"
  | "waiting_for_parts"
  | "in_repair"
  | "quality_check"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled"
  | "unrepairable";

export type PaymentStatus = "unpaid" | "partially_paid" | "fully_paid" | "refunded";

export type PaymentMethod = "cash" | "upi" | "bank_transfer" | "card" | "other";

export type EstimateStatus = "draft" | "sent" | "approved" | "rejected" | "revised";

export type InventoryMovementType =
  | "initial"
  | "restock"
  | "repair_consumed"
  | "adjustment"
  | "return";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  currency: string;
  timezone: string;
  logo_url?: string | null;
  ticket_prefix: string;
  repair_terms: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  organization_id: string;
  customer_id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  color?: string | null;
  serial_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConditionChecklist {
  screen_condition: "flawless" | "scratched" | "cracked" | "shattered" | "unresponsive";
  power_status: "turns_on" | "dead" | "reboot_loop" | "intermittent";
  charging_status: "charges_normally" | "loose_port" | "not_charging";
  liquid_damage: "none_visible" | "suspected" | "confirmed_corrosion";
  body_condition: "excellent" | "minor_scratches" | "dented" | "bent_chassis";
  camera_working?: boolean;
  speaker_working?: boolean;
  buttons_working?: boolean;
  missing_components?: string;
  accessories_received: string[];
}

export interface RepairTicket {
  id: string;
  organization_id: string;
  ticket_number: string;
  customer_id: string;
  device_id: string;
  assigned_technician_id?: string | null;
  current_status: RepairStatus;
  payment_status: PaymentStatus;
  reported_problem: string;
  intake_notes?: string | null;
  accessories_received?: string | null;
  condition_checklist: ConditionChecklist;
  estimated_delivery_date?: string | null;
  estimate_amount: number;
  final_charge: number;
  delivered_at?: string | null;
  delivered_to_name?: string | null;
  handover_notes?: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  customer?: Customer;
  device?: Device;
  technician?: OrganizationMember;
  tracking_token?: string;
}

export interface TicketStatusHistory {
  id: string;
  ticket_id: string;
  old_status?: RepairStatus | null;
  new_status: RepairStatus;
  changed_by?: string | null;
  changed_by_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  author_id?: string | null;
  author_name?: string | null;
  note_type: "internal" | "diagnostic" | "customer_visible";
  content: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  category: "intake" | "diagnosis" | "repair" | "handover";
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface EstimateItem {
  id: string;
  estimate_id: string;
  item_type: "part" | "labour";
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface EstimateApproval {
  id: string;
  estimate_id: string;
  status: "approved" | "rejected";
  channel: "in_person" | "phone_call" | "whatsapp" | "email";
  recorded_by?: string | null;
  recorded_by_name?: string | null;
  decision_notes?: string | null;
  decided_at: string;
}

export interface Estimate {
  id: string;
  organization_id: string;
  ticket_id: string;
  revision_number: number;
  status: EstimateStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  items: EstimateItem[];
  approval?: EstimateApproval | null;
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  category: string;
  compatible_models?: string | null;
  cost_price: number;
  selling_price: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
  supplier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  item_name?: string;
  ticket_id?: string | null;
  movement_type: InventoryMovementType;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  ticket_id: string;
  ticket_number?: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  recorded_by_name?: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  organization_id: string;
  ticket_id: string;
  receipt_number: string;
  total_charges: number;
  total_paid: number;
  balance_remaining: number;
  notes?: string | null;
  created_at: string;
}

export interface TrackingToken {
  id: string;
  ticket_id: string;
  token_hash: string;
  token_value?: string; // used when returning newly created token
  is_revoked: boolean;
  expires_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}
