"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/ClassicLayout.tsx  — DSD Classic
// Sidebar ancho 260px con grupos colapsables, serif headings
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, LogOut, ExternalLink, ChevronDown, Search,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminPage, NavGroup } from "@/src/admin/navigation";
import { logger } from "@/src/lib/logger";

interface SidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const ClassicSidebar: React.FC<SidebarProps> = ({
  currentPage, onNavigate, collapsed, onToggleCollapse, navigation,
}) => {
  const { t } = useTheme();
  const { user, medusaCustomer, signOut } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [badges, setBadges] = useState<Record<string, number>>({});

  // Auto-expand grupo del item activo
  useEffect(() => {
    const group = navigation.find((g) => g.items.some((i) => i.id === currentPage));
    if (group) setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
  }, [currentPage, navigation]);

  useEffect(() => {
    fetch("/api/admin/dashboard?period=30d")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.kpis?.pending_orders > 0)
          setBadges({ orders: d.kpis.pending_orders });
      })
      .catch((e) => logger.warn("[ClassicSidebar] badges", e));
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
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})` }}
        >
          <Store className="w-4 h-4" style={{ color: t.accentText }} />
        </div>
        {!collapsed && (
          <span
            className="text-sm font-bold truncate"
            style={{ color: t.sidebarText, fontFamily: t.fontHeading }}
          >
            DavidSon&apos;s
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto flex-shrink-0 p-1 rounded-md transition-colors"
          style={{ color: t.sidebarTextMuted }}
        >
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* Search — solo expandido */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: t.sidebarHover }}
          >
            <Search size={12} style={{ color: t.sidebarTextMuted }} />
            <span className="text-xs" style={{ color: t.sidebarTextMuted, fontFamily: t.fontBody }}>
              Buscar...
            </span>
          </div>
        </div>
      )}

      {/* Nav grupos */}
      <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: "none" }}>
        {navigation.map((group) => {
          const isExpanded = expandedGroups[group.id] !== false;
          return (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors"
                  style={{ color: t.sidebarTextMuted }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: t.fontBody }}>
                    {group.label}
                  </span>
                  <ChevronDown
                    size={11}
                    className="transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                  />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(collapsed || isExpanded) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
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
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition-all duration-150"
                          style={{
                            backgroundColor: isActive ? t.sidebarActive : "transparent",
                            color: isActive ? t.sidebarActiveText : t.sidebarText,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover;
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          }}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 w-0.5 h-5 rounded-r"
                              style={{ backgroundColor: t.sidebarAccent }}
                            />
                          )}
                          <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-xs text-left truncate" style={{ fontFamily: t.fontBody }}>
                                {item.label}
                              </span>
                              {badge > 0 && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: t.accent, color: t.accentText }}
                                >
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
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 transition-colors"
          style={{ color: t.sidebarTextMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <ExternalLink size={13} />
          {!collapsed && <span className="text-xs" style={{ fontFamily: t.fontBody }}>Ver tienda</span>}
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
          style={{ color: t.sidebarTextMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <LogOut size={13} />
          {!collapsed && <span className="text-xs" style={{ fontFamily: t.fontBody }}>Cerrar sesión</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: t.accent, color: t.accentText }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium truncate" style={{ color: t.sidebarText, fontFamily: t.fontBody }}>
                {medusaCustomer?.first_name || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[9px] truncate" style={{ color: t.sidebarTextMuted }}>Owner</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
