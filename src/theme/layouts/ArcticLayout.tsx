"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/ArcticLayout.tsx — Arctic Light
// Nordic minimal: sidebar blanco con borde izquierdo suave,
// sin grupos, iconos outline, header ultra limpio
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, LogOut, ExternalLink, Search, Bell, Menu } from "lucide-react";
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

export const ArcticSidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, collapsed, navigation,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer, signOut } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const flatItems = navigation.flatMap((g) => g.items);

  useEffect(() => {
    fetch("/api/admin/dashboard?period=30d")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.kpis?.pending_orders > 0) setBadges({ orders: d.kpis.pending_orders }); })
      .catch((e) => logger.warn("[ArcticSidebar]", e));
  }, []);

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || "")[0]}${(medusaCustomer.last_name || "")[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <div
      className="fixed left-0 top-0 h-full flex flex-col z-50 transition-all duration-250"
      style={{
        width: collapsed ? "56px" : `${t.sidebarWidth}px`,
        backgroundColor: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-3 py-4"
        style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: t.accentSubtle }}
        >
          <Store className="w-4 h-4" style={{ color: t.accent }} />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold" style={{ color: t.text, fontFamily: t.fontHeading }}>
            Admin
          </span>
        )}
      </div>

      {/* Nav — flat list, sin grupos */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "none" }}>
        {flatItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          const badge = badges[item.id] ?? 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition-all relative"
              style={{
                backgroundColor: isActive ? t.sidebarActive : "transparent",
                color: isActive ? t.sidebarActiveText : t.sidebarText,
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {isActive && (
                <motion.div
                  layoutId="arctic-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ backgroundColor: t.accent }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-xs text-left truncate" style={{ fontFamily: t.fontBody }}>
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: t.accentSubtle, color: t.accent }}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
        {!collapsed && (
          <>
            <a
              href="/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 transition-colors text-xs"
              style={{ color: t.textMuted, fontFamily: t.fontBody }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              <ExternalLink size={12} /> Ver tienda
            </a>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-2 transition-colors text-xs"
              style={{ color: t.textMuted, fontFamily: t.fontBody }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              <LogOut size={12} /> Salir
            </button>
          </>
        )}
        <div className="flex items-center gap-2 px-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: t.accentSubtle, color: t.accent }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div>
              <p className="text-[10px] font-semibold" style={{ color: t.text, fontFamily: t.fontBody }}>
                {medusaCustomer?.first_name || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[9px]" style={{ color: t.textMuted }}>Owner</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Arctic Header — ultra minimal ─────────────────────────────
interface HeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const ArcticHeader: React.FC<HeaderProps> = ({
  period, onPeriodChange, onMobileMenuToggle,
}) => {
  const { t } = useTheme();
  const periodLabels: Record<string, string> = {
    today: "Hoy", "7days": "7 días", "30days": "30 días", custom: "Custom",
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
      style={{
        backgroundColor: t.headerBg,
        borderBottom: `1px solid ${t.headerBorder}`,
        boxShadow: "0 1px 0 " + t.border,
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="lg:hidden" style={{ color: t.textMuted }}>
          <Menu size={16} />
        </button>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-60"
          style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}` }}
        >
          <Search size={13} style={{ color: t.textMuted }} />
          <span className="text-xs" style={{ color: t.textMuted, fontFamily: t.fontBody }}>Buscar...</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Period tabs estilo pill */}
        <div
          className="hidden sm:flex items-center gap-1 rounded-lg p-1"
          style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}` }}
        >
          {["today", "7days", "30days"].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all"
              style={{
                backgroundColor: period === p ? t.surface : "transparent",
                color: period === p ? t.accent : t.textMuted,
                boxShadow: period === p ? t.shadow : "none",
                fontFamily: t.fontBody,
              }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: t.textMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
};
