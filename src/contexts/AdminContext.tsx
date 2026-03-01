"use client";

// ═══════════════════════════════════════════════════════════════
// Admin Context — Shares state between layout and admin pages
// Period selector, navigation, and shared admin state
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AdminPage } from "@/components/admin/AdminSidebar";
import type { Period } from "@/components/admin/AdminHeader";

interface AdminContextValue {
  period: Period;
  setPeriod: (p: Period) => void;
  currentPage: AdminPage;
  navigate: (page: AdminPage) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// Map URL segments to AdminPage IDs
const pathToPage: Record<string, AdminPage> = {
  "": "dashboard",
  shipping: "shipping",
  orders: "orders",
  products: "products",
  categories: "categories",
  customers: "customers",
  reviews: "reviews",
  quotes: "quotes",
  marketing: "marketing",
  finances: "finances",
  reports: "reports",
  cms: "cms",
  notifications: "notifications",
  settings: "settings",
  automations: "automations",
  integrations: "integrations",
  theme: "theme",
  returns: "returns",
  helpdesk: "helpdesk",
  importexport: "importexport",
  goals: "goals",
};

// Map AdminPage IDs to URL segments
const pageToPath: Record<AdminPage, string> = {
  dashboard: "",
  shipping: "shipping",
  orders: "orders",
  products: "products",
  categories: "categories",
  customers: "customers",
  reviews: "reviews",
  quotes: "quotes",
  marketing: "marketing",
  finances: "finances",
  reports: "reports",
  cms: "cms",
  notifications: "notifications",
  settings: "settings",
  automations: "automations",
  integrations: "integrations",
  theme: "theme",
  returns: "returns",
  helpdesk: "helpdesk",
  importexport: "importexport",
  goals: "goals",
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>("7days");
  const pathname = usePathname();
  const router = useRouter();

  // Derive current page from URL
  const segment =
    pathname.replace("/admin", "").replace(/^\//, "").split("/")[0] || "";
  const currentPage: AdminPage = pathToPage[segment] || "dashboard";

  const navigate = (page: AdminPage) => {
    const path = pageToPath[page];
    router.push(path ? `/admin/${path}` : "/admin");
  };

  return (
    <AdminContext.Provider value={{ period, setPeriod, currentPage, navigate }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
