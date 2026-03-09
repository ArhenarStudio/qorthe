"use client";
// ═══════════════════════════════════════════════════════════════
// src/components/admin/ThemeSelector.tsx
// Selector de temas integrado con el nuevo ThemeContext
// Muestra preview visual de cada tema
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { Check, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/src/theme/ThemeContext";
import { Moon, Sun } from "lucide-react";

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, themeId, setThemeId, themes, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        title={`Tema: ${t.name}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: t.surface2,
          border: `1px solid ${t.border}`,
          color: t.text,
          fontFamily: t.fontBody,
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
        {!compact && <span className="max-w-[80px] truncate">{t.name}</span>}
        {isDark
          ? <Moon size={12} style={{ color: t.textMuted }} />
          : <Sun size={12} style={{ color: t.textMuted }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50 p-3"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.border}`,
                boxShadow: t.shadowLg,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: t.textMuted, fontFamily: t.fontBody }}>
                Seleccionar Tema
              </p>
              <div className="flex flex-col gap-1">
                {themes.map((theme) => {
                  const isActive = themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => { setThemeId(theme.id); setOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isActive ? t.accentSubtle : "transparent",
                        border: isActive ? `1px solid ${t.accent}40` : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = t.surface2; }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                    >
                      {/* Swatch */}
                      <div className="flex gap-1 flex-shrink-0">
                        <div className="w-4 h-7 rounded-l-md" style={{ backgroundColor: theme.sidebarBg }} />
                        <div className="w-6 h-7 rounded-r-md flex flex-col justify-center items-center gap-0.5" style={{ backgroundColor: theme.bg }}>
                          <div className="w-4 h-1 rounded" style={{ backgroundColor: theme.surface2 }} />
                          <div className="w-3 h-1 rounded" style={{ backgroundColor: theme.accent }} />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate" style={{ color: t.text, fontFamily: t.fontBody }}>
                            {theme.name}
                          </p>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.6)",
                              color: t.textMuted,
                              border: `1px solid ${t.border}`,
                            }}
                          >
                            {theme.mode}
                          </span>
                        </div>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: t.textMuted }}>
                          {theme.description.split(".")[0]}
                        </p>
                      </div>
                      {/* Check */}
                      {isActive && (
                        <Check size={14} style={{ color: t.accent, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
