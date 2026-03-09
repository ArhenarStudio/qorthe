"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/NoirLayout.tsx — Teal Noir
// Dark analytics: sidebar ancho con secciones colapsadas,
// métricas en el sidebar, header minimalista
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, LogOut, ExternalLink, Search, Bell,
  Calendar, ChevronDown, Menu, X, TrendingUp, PanelLeft, PanelLeftClose,
} from "lucide-react";
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

export const NoirSidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, collapsed, onToggleCollapse, navigation,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer, signOut } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [kpis, setKpis] = useState<{ revenue?: string; orders?: number } | null>(null);

  useEffect(() => {
    const group = navigation.find((g) => g.items.some((i) => i.id === currentPage));
    if (group) setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
  }, [currentPage, navigation]);

  useEffect(() => {
    fetch("/api/admin/dashboard?period=7days")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.kpis) {
          setBadges({ orders: d.kpis.pending_orders ?? 0 });
          setKpis({
            revenue: d.kpis.revenue
              ? `$${Number(d.kpis.revenue).toLocaleString("es-MX", { minimumFractionDigits: 0 })}`
              : undefined,
            orders: d.kpis.total_orders,
          });
        }
      })
      .catch((e) => logger.warn("[NoirSidebar]", e));
  }, []);

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || "")[0]}${(medusaCustomer.last_name || "")[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className="fixed left-0 top-0 h-full flex flex-col z-50 transition-all duration-250"
      style={{
        width: collapsed ? "64px" : `${t.sidebarWidth}px`,
        backgroundColor: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
      }}
    >
      {/* Header del sidebar */}
      <div
        className="flex items-center gap-2.5 px-3 py-4"
        style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: t.accent }}
        >
          <Store className="w-4 h-4" style={{ color: t.accentText }} />
        </div>
        {!collapsed && (
          <span className="text-xs font-bold flex-1 truncate" style={{ color: t.sidebarText, fontFamily: t.fontHeading, letterSpacing: "0.04em" }}>
            ADMIN PANEL
          </span>
        )}
        <button onClick={onToggleCollapse} style={{ color: t.sidebarTextMuted }} className="flex-shrink-0">
          {collapsed ? <PanelLeft size={13} /> : <PanelLeftClose size={13} />}
        </button>
      </div>

      {/* Mini KPIs — solo expandido */}
      {!collapsed && kpis && (
        <div
          className="mx-3 my-2 p-2.5 rounded-lg"
          style={{ backgroundColor: t.accentSubtle, border: `1px solid ${t.accent}30` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={10} style={{ color: t.accent }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.accent, fontFamily: t.fontBody }}>
              7 días
            </span>
          </div>
          <div className="flex justify-between">
            {kpis.revenue && (
              <div>
                <p className="text-sm font-bold" style={{ color: t.sidebarText, fontFamily: t.fontHeading }}>{kpis.revenue}</p>
                <p className="text-[9px]" style={{ color: t.sidebarTextMuted }}>ingresos</p>
              </div>
            )}
            {kpis.orders !== undefined && (
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: t.sidebarText, fontFamily: t.fontHeading }}>{kpis.orders}</p>
                <p className="text-[9px]" style={{ color: t.sidebarTextMuted }}>pedidos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: "none" }}>
        {navigation.map((group) => {
          const isExpanded = expandedGroups[group.id] !== false;
          return (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded"
                  style={{ color: t.sidebarTextMuted }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ fontFamily: t.fontBody, letterSpacing: "0.1em" }}>
                    {group.label}
                  </span>
                  <ChevronDown
                    size={10}
                    style={{ transform: isExpanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                  />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(collapsed || isExpanded) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const isActive = currentPage === item.id;
                      const Icon = item.icon;
                      const badge = badges[item.id] ?? 0;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-all"
                          style={{
                            backgroundColor: isActive ? t.sidebarActive : "transparent",
                            color: isActive ? t.sidebarActiveText : t.sidebarText,
                            borderLeft: isActive ? `2px solid ${t.sidebarAccent}` : "2px solid transparent",
                          }}
                          onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover; }}
                          onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                        >
                          <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-[11px] text-left truncate" style={{ fontFamily: t.fontBody }}>
                                {item.label}
                              </span>
                              {badge > 0 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: t.accent, color: t.accentText }}>
                                  {badge}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
        <a
          href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 transition-colors"
          style={{ color: t.sidebarTextMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <ExternalLink size={12} />
          {!collapsed && <span className="text-[11px]" style={{ fontFamily: t.fontBody }}>Ver tienda</span>}
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
          style={{ color: t.sidebarTextMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <LogOut size={12} />
          {!collapsed && <span className="text-[11px]" style={{ fontFamily: t.fontBody }}>Salir</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: t.accent, color: t.accentText }}
            >
              {initials}
            </div>
            <div>
              <p className="text-[10px] font-medium" style={{ color: t.sidebarText, fontFamily: t.fontBody }}>
                {medusaCustomer?.first_name || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[9px]" style={{ color: t.sidebarTextMuted }}>Owner</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Noir Header ───────────────────────────────────────────────
interface HeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const NoirHeader: React.FC<HeaderProps> = ({
  period, onPeriodChange, onMobileMenuToggle,
}) => {
  const { t } = useTheme();
  const periodLabels: Record<string, string> = {
    today: "Hoy", "7days": "7 días", "30days": "30 días", custom: "Custom",
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        backgroundColor: t.headerBg,
        borderBottom: `1px solid ${t.headerBorder}`,
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="lg:hidden p-1.5" style={{ color: t.textMuted }}>
          <Menu size={16} />
        </button>
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}` }}
        >
          <Search size={12} style={{ color: t.textMuted }} />
          <span className="text-xs w-44" style={{ color: t.textMuted, fontFamily: t.fontBody }}>Buscar...</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg cursor-pointer"
          style={{ backgroundColor: t.surface2, border: `1px solid ${t.border}`, color: t.textSecondary }}
        >
          <Calendar size={11} />
          {periodLabels[period] || "7 días"}
          <ChevronDown size={10} />
        </div>
        <ThemeSelector compact />
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: t.textMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.error }} />
        </button>
      </div>
    </header>
  );
};
