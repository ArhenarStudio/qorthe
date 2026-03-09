"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Check, Moon, Sun, Palette, Search } from "lucide-react";
import { useAdminTheme } from "@/contexts/AdminThemeContext";
import { toast } from "sonner";

export const AdminThemeSelector: React.FC = () => {
  const { theme, themeId, setTheme, themes } = useAdminTheme();
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "light" | "dark">("all");

  const filtered = useMemo(() => {
    return themes.filter(t => {
      const matchesMode = modeFilter === "all" || t.mode === modeFilter;
      const q = query.toLowerCase();
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
      return matchesMode && matchesQuery;
    });
  }, [themes, query, modeFilter]);

  const lightThemes = filtered.filter(t => t.mode === "light");
  const darkThemes  = filtered.filter(t => t.mode === "dark");

  const isIconSidebar = (id: string) => ["indigo-glass", "coral-forge", "midnight-rose", "volcano", "cyberpunk-neon"].includes(id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-serif" style={{ color: "var(--admin-text)", fontFamily: "var(--admin-font-heading)" }}>
          Apariencia del Panel
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--admin-text-secondary)" }}>
          {themes.length} temas disponibles. La funcionalidad no cambia al cambiar de tema.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--admin-muted)" }} />
          <input
            type="text"
            placeholder="Buscar tema..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none"
            style={{ background: "var(--admin-surface2)", border: "1px solid var(--admin-border)", color: "var(--admin-text)" }}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "light", "dark"] as const).map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className="px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              style={{
                background: modeFilter === m ? "var(--admin-accent)" : "var(--admin-surface2)",
                color: modeFilter === m ? "var(--admin-accent-text)" : "var(--admin-muted)",
                border: "1px solid var(--admin-border)",
              }}
            >
              {m === "light" && <Sun size={11} />}
              {m === "dark" && <Moon size={11} />}
              {m === "all" ? "Todos" : m === "light" ? "Claros" : "Oscuros"}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Groups */}
      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--admin-muted)" }}>Sin resultados para &quot;{query}&quot;</p>
      )}

      {[
        { label: "Temas claros", list: lightThemes, icon: Sun },
        { label: "Temas oscuros", list: darkThemes, icon: Moon },
      ].map(({ label, list, icon: GroupIcon }) => list.length > 0 && (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <GroupIcon size={12} style={{ color: "var(--admin-muted)" }} />
            <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "var(--admin-muted)" }}>{label}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--admin-surface2)", color: "var(--admin-muted)", border: "1px solid var(--admin-border)" }}>{list.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(t => {
              const isActive = themeId === t.id;
              const iconSidebar = isIconSidebar(t.id);
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
                  <div className="relative h-28 overflow-hidden" style={{ background: t.preview.bg }}>
                    <div className="absolute left-0 top-0 bottom-0" style={{ width: iconSidebar ? "24px" : "52px", background: t.preview.sidebar }}>
                      <div className="flex flex-col items-center gap-1.5 pt-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="rounded" style={{ width: iconSidebar ? "12px" : "26px", height: "5px", background: i === 1 ? t.preview.accent : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 rounded-lg" style={{ left: iconSidebar ? "32px" : "60px", bottom: "8px" }}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: "35%", background: t.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)" }} />
                        <div className="flex-1" />
                        <div className="w-3 h-3 rounded-full" style={{ background: t.preview.accent, opacity: 0.7 }} />
                      </div>
                      <div className="flex gap-1 px-1.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex-1 rounded p-1" style={{ background: t.preview.card, border: `1px solid ${t.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}` }}>
                            <div className="h-1 rounded-full mb-1" style={{ width: "60%", background: t.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }} />
                            <div className="h-2 rounded" style={{ background: i === 1 ? `${t.preview.accent}22` : t.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t.preview.accent }}>
                        <Check size={11} color="#FFF" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="px-3 py-2.5" style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {t.mode === "dark" ? <Moon size={10} style={{ color: "var(--admin-muted)" }} /> : <Sun size={10} style={{ color: "var(--admin-muted)" }} />}
                      <span className="text-xs font-medium" style={{ color: "var(--admin-text)" }}>{t.name}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: "var(--admin-text-secondary)" }}>{t.description}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[t.preview.sidebar, t.preview.bg, t.preview.accent, t.preview.card].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border" style={{ background: c, borderColor: "var(--admin-border)" }} />
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Current theme info */}
      <div className="p-4 rounded-xl" style={{ background: "var(--admin-surface2)", border: "1px solid var(--admin-border)" }}>
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
