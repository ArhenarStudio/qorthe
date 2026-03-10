"use client";
// ═══════════════════════════════════════════════════════════════
// AdminThemeSelector.tsx — conectado a ThemeContext (fuente única)
// Muestra los 5 temas reales del sistema y aplica cambios reales
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, Moon, Sun, Palette, Search } from "lucide-react";
import { useTheme } from "@/src/theme/ThemeContext";

export const AdminThemeSelector: React.FC = () => {
  const { t, themeId, setThemeId, themes } = useTheme();
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "light" | "dark">("all");

  const filtered = themes.filter(theme => {
    const matchesMode = modeFilter === "all" || theme.mode === modeFilter;
    const q = query.toLowerCase();
    const matchesQuery = !q || theme.name.toLowerCase().includes(q) || theme.description.toLowerCase().includes(q);
    return matchesMode && matchesQuery;
  });

  const lightThemes = filtered.filter(theme => theme.mode === "light");
  const darkThemes  = filtered.filter(theme => theme.mode === "dark");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-serif" style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}>
          Apariencia del Panel
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {themes.length} temas disponibles. El cambio es inmediato y se guarda automáticamente.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Buscar tema..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "light", "dark"] as const).map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className="px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              style={{
                background: modeFilter === m ? "var(--accent)" : "var(--surface2)",
                color: modeFilter === m ? "var(--accent-text)" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {m === "light" && <Sun size={11} />}
              {m === "dark"  && <Moon size={11} />}
              {m === "all" ? "Todos" : m === "light" ? "Claros" : "Oscuros"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          Sin resultados para &quot;{query}&quot;
        </p>
      )}

      {/* Theme Groups */}
      {[
        { label: "Temas claros", list: lightThemes, icon: Sun },
        { label: "Temas oscuros", list: darkThemes,  icon: Moon },
      ].map(({ label, list, icon: GroupIcon }) => list.length > 0 && (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <GroupIcon size={12} style={{ color: "var(--text-muted)" }} />
            <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {list.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(theme => {
              const isActive = themeId === theme.id;
              const isRail = theme.sidebarStyle === "rail";
              return (
                <motion.button
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left rounded-xl overflow-hidden transition-all"
                  style={{
                    border: `2px solid ${isActive ? t.accent : t.border}`,
                    background: t.surface,
                    boxShadow: isActive ? `0 0 0 1px ${t.accent}, ${t.shadowLg}` : t.shadow,
                  }}
                >
                  {/* Preview mockup */}
                  <div className="relative h-28 overflow-hidden" style={{ background: theme.bg }}>
                    {/* Sidebar preview */}
                    <div className="absolute left-0 top-0 bottom-0" style={{ width: isRail ? "24px" : "52px", background: theme.sidebarBg }}>
                      <div className="flex flex-col items-center gap-1.5 pt-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="rounded" style={{
                            width: isRail ? "12px" : "26px", height: "5px",
                            background: i === 1 ? theme.accent : "rgba(255,255,255,0.1)"
                          }} />
                        ))}
                      </div>
                    </div>
                    {/* Content preview */}
                    <div className="absolute top-2 right-2 rounded-lg" style={{ left: isRail ? "32px" : "60px", bottom: "8px" }}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: "35%", background: theme.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)" }} />
                        <div className="flex-1" />
                        <div className="w-3 h-3 rounded-full" style={{ background: theme.accent, opacity: 0.7 }} />
                      </div>
                      <div className="flex gap-1 px-1.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex-1 rounded p-1" style={{ background: theme.surface2, border: `1px solid ${theme.border}` }}>
                            <div className="h-1 rounded-full mb-1" style={{ width: "60%", background: theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }} />
                            <div className="h-2 rounded" style={{ background: i === 1 ? `${theme.accent}33` : theme.surface3 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.accent }}>
                        <Check size={11} color="#FFF" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="px-3 py-2.5" style={{ borderTop: `1px solid ${t.border}` }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {theme.mode === "dark" ? <Moon size={10} style={{ color: t.textMuted }} /> : <Sun size={10} style={{ color: t.textMuted }} />}
                      <span className="text-xs font-medium" style={{ color: t.text, fontFamily: t.fontBody }}>{theme.name}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: t.textSecondary }}>
                      {theme.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[theme.sidebarBg, theme.bg, theme.accent, theme.surface2].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border" style={{ background: c, borderColor: t.border }} />
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tema activo */}
      <div className="p-4 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Palette size={14} style={{ color: t.accent }} />
          <span className="text-xs font-medium" style={{ color: t.text }}>Tema activo: {t.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: t.accent, color: t.accentText }}>
            {t.mode === "dark" ? "Oscuro" : "Claro"}
          </span>
        </div>
        <p className="text-[11px] mt-1" style={{ color: t.textSecondary }}>
          {t.description}
        </p>
      </div>
    </div>
  );
};
