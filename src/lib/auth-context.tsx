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
  loading: boolean;
  switchUser: (staffId: string) => void;
  logout: () => Promise<void>;
  loginAs: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    return initialStaff[0]; // Owner Vikram Patel default
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("repairdesk_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("repairdesk_user");
    }
  }, [currentUser]);

  // Check /api/auth/me on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser({
              id: data.user.id,
              user_id: data.user.id,
              organization_id: data.user.organization_id,
              full_name: data.user.full_name,
              email: data.user.email,
              role: data.user.role,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch {
        // offline or memory fallback
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }

      const user: OrganizationMember = {
        id: data.user.id,
        user_id: data.user.id,
        organization_id: data.user.organization_id,
        full_name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentUser(user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during login" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      const user: OrganizationMember = {
        id: data.user.id,
        user_id: data.user.id,
        organization_id: data.user.organization_id,
        full_name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error during shop onboarding" };
    } finally {
      setLoading(false);
    }
  };

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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem("repairdesk_user");
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
        loading,
        switchUser,
        logout,
        loginAs,
        login,
        register,
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
