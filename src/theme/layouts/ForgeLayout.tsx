"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/ForgeLayout.tsx — Coral Forge
// Rail 72px: iconos grandes + label pequeño debajo, dark warm
// Header: breadcrumb + avatar prominente
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, LogOut, Search, Bell, Menu } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminPage, NavGroup } from "@/src/admin/navigation";
import { ThemeSelector } from "@/src/components/admin/ThemeSelector";
import { logger } from "@/src/lib/logger";

interface SidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const ForgeSidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, navigation,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer, signOut } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const flatItems = navigation.flatMap((g) => g.items);

  useEffect(() => {
    fetch("/api/admin/dashboard?period=30d")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.kpis?.pending_orders > 0) setBadges({ orders: d.kpis.pending_orders }); })
      .catch((e) => logger.warn("[ForgeSidebar]", e));
  }, []);

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || "")[0]}${(medusaCustomer.last_name || "")[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col items-center py-3 z-50"
      style={{
        width: `${t.sidebarWidth}px`,
        backgroundColor: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
      }}
    >
      {/* Logo */}
      <div className="mb-4 mt-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: t.gradientAccent || t.accent,
            boxShadow: `0 4px 16px ${t.accent}44`,
          }}
        >
          <Store className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px mb-3" style={{ backgroundColor: t.sidebarBorder }} />

      {/* Items con icon + label */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {flatItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          const badge = badges[item.id] ?? 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-150 relative"
              style={{
                backgroundColor: isActive ? t.sidebarActive : "transparent",
                color: isActive ? t.sidebarActiveText : t.sidebarText,
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {isActive && (
                <motion.div
                  layoutId="forge-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: t.sidebarActive, zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: t.accent, color: t.accentText }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span
                className="text-[8px] font-medium leading-none text-center truncate w-full"
                style={{ fontFamily: t.fontBody }}
              >
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 mt-3">
        <div className="w-8 h-px" style={{ backgroundColor: t.sidebarBorder }} />
        <button
          onClick={signOut}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: t.sidebarTextMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <LogOut size={14} />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: t.gradientAccent || t.accent, color: "#FFF" }}
        >
          {initials}
        </div>
      </div>
    </nav>
  );
};

// ── Forge Header — breadcrumb estilo ─────────────────────────
interface HeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const ForgeHeader: React.FC<HeaderProps> = ({
  period, onPeriodChange, onMobileMenuToggle,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer } = useAuth();
  const periodLabels: Record<string, string> = {
    today: "Hoy", "7days": "7d", "30days": "30d", custom: "Custom",
  };
  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || "")[0]}${(medusaCustomer.last_name || "")[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5"
      style={{
        backgroundColor: t.headerBg,
        borderBottom: `1px solid ${t.headerBorder}`,
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="lg:hidden" style={{ color: t.textMuted }}>
          <Menu size={16} />
        </button>
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}`, color: t.textMuted }}
        >
          <Search size={12} />
          <span style={{ fontFamily: t.fontBody }}>Buscar...</span>
        </button>
      </div>

      {/* Right — period pills + avatar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}` }}>
          {["today", "7days", "30days"].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className="px-2 py-1 text-[10px] font-semibold rounded-md transition-all"
              style={{
                backgroundColor: period === p ? t.accent : "transparent",
                color: period === p ? t.accentText : t.textMuted,
                fontFamily: t.fontBody,
              }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

                <ThemeSelector compact />
        <button
          className="relative p-2 rounded-lg"
          style={{ color: t.textMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: t.gradientAccent || t.accent, color: "#FFF" }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
