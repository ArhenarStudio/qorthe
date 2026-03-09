"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/layouts/ClassicHeader.tsx — Header del DSD Classic
// ═══════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Calendar, ChevronDown, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeContext";
import type { AdminPage } from "@/src/admin/navigation";
import { ThemeSelector } from "@/src/components/admin/ThemeSelector";

type Period = "today" | "7days" | "30days" | "custom";
const periodLabels: Record<Period, string> = {
  today: "Hoy", "7days": "7 días", "30days": "30 días", custom: "Personalizado",
};

interface HeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const ClassicHeader: React.FC<HeaderProps> = ({
  period, onPeriodChange, onMobileMenuToggle,
}) => {
  const { t } = useTheme();
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node))
        setPeriodOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        backgroundColor: t.headerBg,
        borderBottom: `1px solid ${t.headerBorder}`,
        boxShadow: t.shadow,
        fontFamily: t.fontBody,
      }}
    >
      {/* Left — burger mobile + date */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-md"
          style={{ color: t.textMuted }}
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-sm font-semibold" style={{ color: t.text, fontFamily: t.fontHeading }}>
            {`Buenos días, ${t.id === "dsd-classic" ? "RockStage" : "Admin"}`}
          </p>
          <p className="text-[10px] capitalize" style={{ color: t.textMuted }}>
            {dateStr}
          </p>
        </div>
      </div>

      {/* Right — search / period / bell */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: t.textMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          <Search size={16} />
        </button>

        {/* Period selector */}
        <div ref={periodRef} className="relative">
          <button
            onClick={() => setPeriodOpen(!periodOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{
              backgroundColor: t.surface2,
              border: `1px solid ${t.border}`,
              color: t.textSecondary,
            }}
          >
            <Calendar size={12} />
            {periodLabels[period as keyof typeof periodLabels] || period}
            <ChevronDown size={11} />
          </button>
          <AnimatePresence>
            {periodOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-50"
                style={{
                  backgroundColor: t.surface,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowLg,
                }}
              >
                {(Object.keys(periodLabels) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { onPeriodChange(p); setPeriodOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: period === p ? t.accent : t.text,
                      backgroundColor: period === p ? t.accentSubtle : "transparent",
                      fontFamily: t.fontBody,
                    }}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ThemeSelector compact />
        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: t.textMuted }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = t.surface2)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <Bell size={16} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: t.error }}
            />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1 w-72 rounded-xl overflow-hidden z-50"
                style={{
                  backgroundColor: t.surface,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowLg,
                }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <span className="text-xs font-semibold" style={{ color: t.text, fontFamily: t.fontHeading }}>
                    Notificaciones
                  </span>
                  <button onClick={() => setNotifOpen(false)} style={{ color: t.textMuted }}>
                    <X size={12} />
                  </button>
                </div>
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: t.textMuted, fontFamily: t.fontBody }}>Sin notificaciones</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
