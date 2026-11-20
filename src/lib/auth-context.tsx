"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OrganizationMember, UserRole } from "@/types";
import { initialStaff, INITIAL_ORG_ID } from "./mock-data";

interface AuthContextType {
  currentUser: OrganizationMember | null;
  currentRole: UserRole;
  organizationId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isReceptionist: boolean;
  isTechnician: boolean;
  canManageSettings: boolean;
  canViewFinancials: boolean;
  canEditPricing: boolean;
  canIntakeDevices: boolean;
  switchUser: (staffId: string) => void;
  logout: () => void;
  loginAs: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Owner for initial rich experience
  const [currentUser, setCurrentUser] = useState<OrganizationMember | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("repairdesk_user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return initialStaff[0]; // Owner Vikram Patel
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("repairdesk_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("repairdesk_user");
    }
  }, [currentUser]);

  const switchUser = (staffId: string) => {
    const target = initialStaff.find((s) => s.id === staffId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const loginAs = (role: UserRole) => {
    const target = initialStaff.find((s) => s.role === role) || initialStaff[0];
    setCurrentUser(target);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const currentRole: UserRole = currentUser?.role || "owner";
  const organizationId = currentUser?.organization_id || INITIAL_ORG_ID;

  const isOwner = currentRole === "owner";
  const isAdmin = currentRole === "admin" || isOwner;
  const isReceptionist = currentRole === "receptionist";
  const isTechnician = currentRole === "technician";

  const canManageSettings = isOwner || isAdmin;
  const canViewFinancials = isOwner || isAdmin;
  const canEditPricing = isOwner || isAdmin || isReceptionist;
  const canIntakeDevices = isOwner || isAdmin || isReceptionist;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        organizationId,
        isOwner,
        isAdmin,
        isReceptionist,
        isTechnician,
        canManageSettings,
        canViewFinancials,
        canEditPricing,
        canIntakeDevices,
        switchUser,
        logout,
        loginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
