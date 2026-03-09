"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/GlassLayout.tsx — Indigo Glass
// Rail 68px con tooltips, sin labels, glassmorphism en todo
// Header con blur backdrop, barra de búsqueda amplia
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, LogOut, Search, Bell, Calendar, ChevronDown, Menu, X } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminPage, NavGroup } from "@/src/admin/navigation";
import { logger } from "@/src/lib/logger";
import { ThemeSelector } from "@/src/components/admin/ThemeSelector";

interface SidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const GlassSidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, navigation,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer, signOut } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const flatItems = navigation.flatMap((g) => g.items);

  useEffect(() => {
    fetch("/api/admin/dashboard?period=30d")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.kpis?.pending_orders > 0) setBadges({ orders: d.kpis.pending_orders }); })
      .catch((e) => logger.warn("[GlassSidebar]", e));
  }, []);

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || "")[0]}${(medusaCustomer.last_name || "")[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col items-center z-50"
      style={{
        width: `${t.sidebarWidth}px`,
        backgroundColor: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
      }}
    >
      {/* Logo */}
      <div className="w-full flex justify-center py-4 mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: t.gradientAccent || t.accent, boxShadow: `0 4px 14px ${t.accent}44` }}
        >
          <Store className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {flatItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          const badge = badges[item.id] ?? 0;
          const isHov = hovered === item.id;

          return (
            <div key={item.id} className="relative w-full flex justify-center">
              <button
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{
                  backgroundColor: isActive ? t.sidebarActive : isHov ? "rgba(255,255,255,0.06)" : "transparent",
                  color: isActive ? "#FFFFFF" : t.sidebarText,
                  boxShadow: isActive ? `0 2px 8px ${t.accent}33` : "none",
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
                {badge > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: t.accent, color: t.accentText }}
                  >
                    {badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="glass-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ backgroundColor: t.sidebarAccent }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
              {/* Tooltip */}
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-[70] pointer-events-none"
                  >
                    <div
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: t.surface,
                        color: t.text,
                        border: `1px solid ${t.border}`,
                        boxShadow: t.shadowLg,
                        fontFamily: t.fontBody,
                      }}
                    >
                      {item.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer — avatar + logout */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <button
          onClick={signOut}
          onMouseEnter={() => setHovered("logout")}
          onMouseLeave={() => setHovered(null)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: t.sidebarTextMuted }}
        >
          <LogOut size={16} />
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

// ── Glass Header ──────────────────────────────────────────────
interface HeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const GlassHeader: React.FC<HeaderProps> = ({
  period, onPeriodChange, onMobileMenuToggle,
}) => {
  const { t } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const periodLabels: Record<string, string> = {
    today: "Hoy", "7days": "7 días", "30days": "30 días", custom: "Personalizado",
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-2.5"
      style={{
        backgroundColor: t.headerBg,
        backdropFilter: t.glassBlur || "blur(12px)",
        WebkitBackdropFilter: t.glassBlur || "blur(12px)",
        borderBottom: `1px solid ${t.headerBorder}`,
        boxShadow: `0 1px 0 ${t.border}`,
        fontFamily: t.fontBody,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="lg:hidden p-1.5" style={{ color: t.textMuted }}>
          <Menu size={18} />
        </button>
        {/* Search amplio estilo Glass */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl w-64"
          style={{
            backgroundColor: t.glassBg || t.surface2,
            backdropFilter: "blur(8px)",
            border: `1px solid ${t.glassBorder || t.border}`,
          }}
        >
          <Search size={13} style={{ color: t.textMuted }} />
          <span className="text-xs" style={{ color: t.textMuted }}>Buscar en el panel...</span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: t.surface3, color: t.textMuted, border: `1px solid ${t.border}` }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Period */}
        <div className="relative">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl transition-colors"
            style={{
              backgroundColor: t.glassBg || t.surface2,
              backdropFilter: "blur(8px)",
              border: `1px solid ${t.glassBorder || t.border}`,
              color: t.textSecondary,
            }}
          >
            <Calendar size={11} />
            {periodLabels[period] || "7 días"}
            <ChevronDown size={11} />
          </button>
        </div>

        <ThemeSelector compact />
        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl transition-colors"
            style={{ color: t.textMuted, backgroundColor: "transparent" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1 w-72 rounded-2xl overflow-hidden z-50"
                style={{
                  backgroundColor: t.glassBg || t.surface,
                  backdropFilter: t.glassBlur || "blur(16px)",
                  border: `1px solid ${t.glassBorder || t.border}`,
                  boxShadow: t.shadowLg,
                }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <span className="text-xs font-semibold" style={{ color: t.text }}>Notificaciones</span>
                  <button onClick={() => setNotifOpen(false)} style={{ color: t.textMuted }}><X size={12} /></button>
                </div>
                <div className="py-8 text-center">
                  <p className="text-xs" style={{ color: t.textMuted }}>Sin notificaciones nuevas</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
