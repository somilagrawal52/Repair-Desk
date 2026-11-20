"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Watch,
  Cpu,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  Search,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Customer, DeviceCategory, OrganizationMember } from "@/types";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES: Array<{ id: DeviceCategory; label: string; icon: React.ElementType }> = [
  { id: "smartphone", label: "Smartphone", icon: Smartphone },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "desktop", label: "Desktop PC", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "smartwatch", label: "Smartwatch", icon: Watch },
  { id: "other", label: "Other Electronics", icon: Cpu },
];

export default function NewRepairIntakePage() {
  const router = useRouter();
  const { currentUser, canIntakeDevices } = useAuth();

  // Mode: "existing" or "new"
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");

  // Customer Form Fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneDuplicateWarning, setPhoneDuplicateWarning] = useState<Customer | null>(null);

  // Device Form Fields
  const [category, setCategory] = useState<DeviceCategory>("smartphone");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // Physical Condition Checklist
  const [screenCondition, setScreenCondition] = useState<"flawless" | "scratched" | "cracked" | "shattered" | "unresponsive">("flawless");
  const [powerStatus, setPowerStatus] = useState<"turns_on" | "dead" | "reboot_loop" | "intermittent">("turns_on");
  const [chargingStatus, setChargingStatus] = useState<"charges_normally" | "loose_port" | "not_charging">("charges_normally");
  const [liquidDamage, setLiquidDamage] = useState<"none_visible" | "suspected" | "confirmed_corrosion">("none_visible");
  const [bodyCondition, setBodyCondition] = useState<"excellent" | "minor_scratches" | "dented" | "bent_chassis">("excellent");
  const [accessoriesReceived, setAccessoriesReceived] = useState<string[]>([]);
  const [customAccessories, setCustomAccessories] = useState("");

  // Repair Problem & Estimate
  const [reportedProblem, setReportedProblem] = useState("");
  const [intakeNotes, setIntakeNotes] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [estimateAmount, setEstimateAmount] = useState<number | "">("");
  const [assignedTechnicianId, setAssignedTechnicianId] = useState("");
  const [staffList, setStaffList] = useState<OrganizationMember[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load existing customers & staff
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setExistingCustomers(data.customers);
      })
      .catch((err) => console.error("Error loading customers:", err));

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.metrics?.technicianWorkload) {
          // fetch staff
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Check phone duplication when typing phone number
  const handlePhoneBlur = () => {
    if (customerMode === "new" && phoneNumber.trim().length >= 8) {
      const match = existingCustomers.find((c) =>
        c.phone.replace(/\D/g, "").includes(phoneNumber.replace(/\D/g, ""))
      );
      if (match) {
        setPhoneDuplicateWarning(match);
      } else {
        setPhoneDuplicateWarning(null);
      }
    }
  };

  const handleUseExistingCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setCustomerMode("existing");
    setPhoneDuplicateWarning(null);
    toast.info(`Selected existing customer: ${c.full_name}`);
  };

  const toggleAccessory = (acc: string) => {
    setAccessoriesReceived((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportedProblem.trim()) {
      toast.error("Please enter the customer's reported complaint/fault");
      return;
    }

    if (!brand.trim() || !model.trim()) {
      toast.error("Please enter device Brand and Model");
      return;
    }

    if (customerMode === "new") {
      if (!fullName.trim() || !phoneNumber.trim()) {
        toast.error("Please enter Customer Full Name and Phone Number");
        return;
      }
    } else {
      if (!selectedCustomerId) {
        toast.error("Please select an existing customer");
        return;
      }
    }

    try {
      setSubmitting(true);

      const allAccessories = [
        ...accessoriesReceived,
        ...(customAccessories.trim() ? [customAccessories.trim()] : []),
      ];

      const payload = {
        customerId: customerMode === "existing" ? selectedCustomerId : undefined,
        customerData:
          customerMode === "new"
            ? {
                full_name: fullName,
                phone: phoneNumber,
                email: email || undefined,
                address: address || undefined,
              }
            : undefined,
        deviceData: {
          category,
          brand,
          model,
          color: color || undefined,
          serial_number: serialNumber || undefined,
        },
        reported_problem: reportedProblem,
        intake_notes: intakeNotes || undefined,
        accessories_received: allAccessories.length > 0 ? allAccessories.join(", ") : "None",
        condition_checklist: {
          screen_condition: screenCondition,
          power_status: powerStatus,
          charging_status: chargingStatus,
          liquid_damage: liquidDamage,
          body_condition: bodyCondition,
          accessories_received: allAccessories,
        },
        estimated_delivery_date: estimatedDeliveryDate
          ? new Date(estimatedDeliveryDate).toISOString()
          : undefined,
        estimate_amount: Number(estimateAmount) || 0,
        assigned_technician_id: assignedTechnicianId || undefined,
        created_by_staff_id: currentUser?.id,
      };

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create ticket");
      }

      if (selectedPhotos.length > 0) {
        for (const file of selectedPhotos) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "intake");
            formData.append("caption", "Intake condition record");
            if (currentUser?.id) formData.append("staffId", currentUser.id);
            await fetch(`/api/tickets/${data.ticket.id}/photos`, {
              method: "POST",
              body: formData,
            });
          } catch (uploadErr) {
            console.warn("Intake photo upload fallback:", uploadErr);
          }
        }
      }

      toast.success(`Job Card ${data.ticket.ticket_number} created successfully!`);
      router.push(`/repairs/${data.ticket.id}?autoPrint=true`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = existingCustomers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Device Intake & Job Card</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record customer information, physical condition checklist, reported fault, and generate job card.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Customer Selection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Step 1: Customer Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Register a new customer or select a returning client.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomerMode("new")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      customerMode === "new" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    New Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode("existing")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      customerMode === "existing" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Returning Customer
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {customerMode === "new" ? (
                <>
                  {phoneDuplicateWarning && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>
                          Phone number matches existing customer <strong>{phoneDuplicateWarning.full_name}</strong>.
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseExistingCustomer(phoneDuplicateWarning)}
                        className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100"
                      >
                        Use This Profile
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs">
                        Full Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">
                        Phone Number (10 digits) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +91 98260 11223"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onBlur={handlePhoneBlur}
                        required
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">
                        Email Address (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs">
                        Address / City (Optional)
                      </Label>
                      <Input
                        id="address"
                        placeholder="e.g. Scheme 54, Vijay Nagar, Indore"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search existing customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9 text-xs h-9"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No matching customers found. Switch to New Customer above.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            selectedCustomerId === cust.id
                              ? "bg-blue-50 border-l-4 border-blue-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">{cust.full_name}</div>
                            <div className="text-[11px] text-slate-500">{cust.phone} • {cust.address || "No address"}</div>
                          </div>
                          {selectedCustomerId === cust.id && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: Device Specifications */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                Step 2: Device Details
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Category Pills */}
              <div className="space-y-1.5">
                <Label className="text-xs">Device Category</Label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-xs">
                    Brand <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="brand"
                    placeholder="e.g. Samsung, Apple, Dell, HP"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="model" className="text-xs">
                    Model & Variant <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g. Galaxy S23 5G 128GB or Inspiron 15 3520"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="color" className="text-xs">
                    Color / Finish
                  </Label>
                  <Input
                    id="color"
                    placeholder="e.g. Phantom Black, Platinum Silver"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="serial" className="text-xs">
                      Serial Number / IMEI (Restricted Access)
                    </Label>
                    <span className="text-[10px] text-slate-400">Never publicly shown</span>
                  </div>
                  <Input
                    id="serial"
                    placeholder="e.g. SM-S911B-IND-9081"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: Physical Condition Checklist */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                Step 3: Physical Condition & Intake Checklist
              </CardTitle>
              <CardDescription className="text-xs">
                Accurately document device condition to prevent customer dispute upon handover.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Screen Condition</Label>
                  <select
                    value={screenCondition}
                    onChange={(e) => setScreenCondition(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="flawless">Flawless / Clean</option>
                    <option value="scratched">Minor Scratches</option>
                    <option value="cracked">Glass Cracked (Touch Works)</option>
                    <option value="shattered">Shattered / Dead AMOLED</option>
                    <option value="unresponsive">Touch Unresponsive</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Power State</Label>
                  <select
                    value={powerStatus}
                    onChange={(e) => setPowerStatus(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="turns_on">Powers On Normally</option>
                    <option value="dead">Dead / Completely No Power</option>
                    <option value="reboot_loop">Stuck on Boot Logo</option>
                    <option value="intermittent">Intermittent / Random Shutdown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Charging Condition</Label>
                  <select
                    value={chargingStatus}
                    onChange={(e) => setChargingStatus(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="charges_normally">Charges Normally</option>
                    <option value="loose_port">Loose / Angle Dependent</option>
                    <option value="not_charging">Does Not Charge / Pin Broken</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Liquid Damage Indicator</Label>
                  <select
                    value={liquidDamage}
                    onChange={(e) => setLiquidDamage(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="none_visible">None Visible / Dry</option>
                    <option value="suspected">Suspected (Spill Reported)</option>
                    <option value="confirmed_corrosion">Confirmed Red LDI / Internal Corrosion</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Body & Frame Condition</Label>
                  <select
                    value={bodyCondition}
                    onChange={(e) => setBodyCondition(e.target.value as any)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="excellent">Excellent / Like New</option>
                    <option value="minor_scratches">Normal Wear & Tear</option>
                    <option value="dented">Corner Dents / Chips</option>
                    <option value="bent_chassis">Bent Chassis / Warped Frame</option>
                  </select>
                </div>
              </div>

              {/* Accessories Received Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700">Deposited Accessories</Label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Original Charger", "Power Cord / Cable", "Back Protective Case", "SIM Tray / SIM Card", "Laptop Bag"].map((acc) => {
                    const isChecked = accessoriesReceived.includes(acc);
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => toggleAccessory(acc)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                          isChecked
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isChecked ? `✓ ${acc}` : `+ ${acc}`}
                      </button>
                    );
                  })}
                </div>
                <Input
                  placeholder="Other accessories (e.g. Wireless dongle, HDMI adapter)..."
                  value={customAccessories}
                  onChange={(e) => setCustomAccessories(e.target.value)}
                  className="text-xs h-8 mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3B: Intake Condition Photographs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-600" />
                    Step 3B: Device Photographs (Optional)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Attach counter inspection photos to record cosmetic scratches, screen cracks, and chassis integrity.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 border-slate-200"
                >
                  <Upload className="w-3.5 h-3.5" /> Select Photos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <input
                type="file"
                ref={photoInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setSelectedPhotos((prev) => [...prev, ...newFiles]);
                  }
                }}
              />

              {selectedPhotos.length === 0 ? (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Click to upload intake condition photos</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 10MB per file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedPhotos.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={objectUrl}
                            alt={file.name}
                            className="aspect-square w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="p-1.5 text-[10px] text-slate-600 truncate bg-white border-t border-slate-100">
                            {file.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => photoInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 h-7"
                    >
                      + Add More Photos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: Reported Issue & Estimate */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                Step 4: Complaint, Target Timeline & Initial Estimate
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="complaint" className="text-xs">
                  Customer Reported Complaint / Issue <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="complaint"
                  rows={3}
                  placeholder="Describe the defect reported by customer (e.g. Display broken after drop, green lines on screen, touch unresponsive on top half)..."
                  value={reportedProblem}
                  onChange={(e) => setReportedProblem(e.target.value)}
                  required
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="intakeNotes" className="text-xs">
                  Receptionist Visual Inspection & Intake Notes
                </Label>
                <Input
                  id="intakeNotes"
                  placeholder="e.g. Bottom left frame dented. Rear camera glass clean."
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="estDelivery" className="text-xs">
                    Promised Delivery Date
                  </Label>
                  <Input
                    id="estDelivery"
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="estAmount" className="text-xs">
                    Initial Estimate (₹ INR)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="estAmount"
                      type="number"
                      placeholder="e.g. 5000"
                      value={estimateAmount}
                      onChange={(e) => setEstimateAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assignTech" className="text-xs">
                    Assign Technician
                  </Label>
                  <select
                    id="assignTech"
                    value={assignedTechnicianId}
                    onChange={(e) => setAssignedTechnicianId(e.target.value)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Leave Unassigned</option>
                    <option value="staff-tech-1">Amit Joshi (Mobile & Soldering)</option>
                    <option value="staff-tech-2">Rajesh Kumar (Laptop & Hardware)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="text-xs border-slate-300"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 gap-2 shadow-md shadow-blue-600/20"
            >
              {submitting ? "Generating Ticket..." : "Generate Job Card & Proceed"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
