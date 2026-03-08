"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, Monitor, Moon, Sun, Palette } from "lucide-react";
import { useAdminTheme } from "@/contexts/AdminThemeContext";
import { toast } from "sonner";

export const AdminThemeSelector: React.FC = () => {
  const { theme, themeId, setTheme, themes } = useAdminTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-serif" style={{ color: "var(--admin-text)", fontFamily: "var(--admin-font-heading)" }}>
          Apariencia del Panel
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--admin-text-secondary)" }}>
          Elige el diseño visual del panel de administración. La funcionalidad no cambia.
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => {
          const isActive = themeId === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => { setTheme(t.id); toast.success(`Tema "${t.name}" aplicado`); }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left rounded-xl overflow-hidden transition-all"
              style={{
                border: `2px solid ${isActive ? "var(--admin-accent)" : "var(--admin-border)"}`,
                background: "var(--admin-surface)",
                boxShadow: isActive ? `0 0 0 1px var(--admin-accent), var(--admin-shadow-lg)` : "var(--admin-shadow)",
              }}
            >
              {/* Preview mockup */}
              <div className="relative h-36 overflow-hidden" style={{ background: t.preview.bg }}>
                {/* Mini sidebar */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{ width: t.id === "indigo-glass" || t.id === "coral-forge" ? "28px" : "56px", background: t.preview.sidebar }}
                >
                  <div className="flex flex-col items-center gap-2 pt-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="rounded"
                        style={{
                          width: t.id === "indigo-glass" || t.id === "coral-forge" ? "14px" : "28px",
                          height: "6px",
                          background: i === 1 ? t.preview.accent : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Mini content area */}
                <div
                  className="absolute top-2 right-2 rounded-lg"
                  style={{
                    left: t.id === "indigo-glass" || t.id === "coral-forge" ? "36px" : "64px",
                    bottom: "8px",
                  }}
                >
                  {/* Mini header */}
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="h-2 rounded-full" style={{ width: "40%", background: t.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" }} />
                    <div className="flex-1" />
                    <div className="w-4 h-4 rounded-full" style={{ background: t.preview.accent, opacity: 0.6 }} />
                  </div>
                  {/* Mini cards */}
                  <div className="flex gap-1.5 px-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-md p-1.5"
                        style={{ background: t.preview.card, border: `1px solid ${t.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}
                      >
                        <div className="h-1.5 rounded-full mb-1" style={{ width: "60%", background: t.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }} />
                        <div className="h-3 rounded" style={{ background: i === 1 ? `${t.preview.accent}20` : t.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: t.preview.accent }}>
                    <Check size={14} color={t.mode === "dark" && t.id !== "coral-forge" ? "#08080A" : "#FFFFFF"} strokeWidth={3} />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4" style={{ borderTop: `1px solid var(--admin-border)` }}>
                <div className="flex items-center gap-2 mb-1">
                  {t.mode === "dark" ? <Moon size={12} style={{ color: "var(--admin-muted)" }} /> : <Sun size={12} style={{ color: "var(--admin-muted)" }} />}
                  <span className="text-sm font-medium" style={{ color: "var(--admin-text)" }}>{t.name}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--admin-text-secondary)" }}>
                  {t.description}
                </p>
                {/* Color swatches */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[t.preview.sidebar, t.preview.bg, t.preview.accent, t.preview.card].map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border" style={{ background: c, borderColor: "var(--admin-border)" }} />
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Current theme info */}
      <div className="p-4 rounded-xl" style={{ background: "var(--admin-surface2)", border: `1px solid var(--admin-border)` }}>
        <div className="flex items-center gap-2">
          <Palette size={14} style={{ color: "var(--admin-accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--admin-text)" }}>Tema activo: {theme.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--admin-accent)", color: "var(--admin-accent-text)" }}>
            {theme.mode === "dark" ? "Oscuro" : "Claro"}
          </span>
        </div>
        <p className="text-[11px] mt-1" style={{ color: "var(--admin-text-secondary)" }}>
          Tipografía: {theme.fonts.heading.split(",")[0].replace(/'/g, "")} + {theme.fonts.body.split(",")[0].replace(/'/g, "")}
        </p>
      </div>
    </div>
  );
};
