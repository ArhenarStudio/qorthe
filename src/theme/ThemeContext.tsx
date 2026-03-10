"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/ThemeContext.tsx
// Fuente única de verdad para el sistema de temas del admin.
// Todos los componentes consumen useTheme() — nunca hardcodean colores.
// ═══════════════════════════════════════════════════════════════

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { type ThemeTokens, getThemeTokens, THEME_LIST } from "./tokens";
import { logger } from "@/src/lib/logger";

// ── Tipos del context ──────────────────────────────────────────
interface ThemeContextType {
  /** Tokens activos del tema seleccionado */
  t: ThemeTokens;
  /** ID del tema activo */
  themeId: string;
  /** Cambia el tema y lo persiste en Supabase */
  setThemeId: (id: string) => void;
  /** Lista de todos los temas disponibles */
  themes: ThemeTokens[];
  /** Estado de carga inicial */
  loading: boolean;
  /** true si el tema activo es dark */
  isDark: boolean;
}

// ── Context con defaults del DSD Classic ──────────────────────
const ThemeContext = createContext<ThemeContextType>({
  t: getThemeTokens("dsd-classic"),
  themeId: "dsd-classic",
  setThemeId: () => {},
  themes: THEME_LIST,
  loading: true,
  isDark: false,
});

// ── Hook público ───────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);

// ── Aplica los tokens como CSS vars en :root ──────────────────
function applyTokensToDOM(tokens: ThemeTokens) {
  const r = document.documentElement;

  // Base
  r.style.setProperty("--t-bg", tokens.bg);
  r.style.setProperty("--t-surface", tokens.surface);
  r.style.setProperty("--t-surface2", tokens.surface2);
  r.style.setProperty("--t-surface3", tokens.surface3);

  // Texto
  r.style.setProperty("--t-text", tokens.text);
  r.style.setProperty("--t-text-2", tokens.textSecondary);
  r.style.setProperty("--t-text-muted", tokens.textMuted);

  // Bordes y sombras
  r.style.setProperty("--t-border", tokens.border);
  r.style.setProperty("--t-border-strong", tokens.borderStrong);
  r.style.setProperty("--t-shadow", tokens.shadow);
  r.style.setProperty("--t-shadow-lg", tokens.shadowLg);

  // Acento
  r.style.setProperty("--t-accent", tokens.accent);
  r.style.setProperty("--t-accent-hover", tokens.accentHover);
  r.style.setProperty("--t-accent-subtle", tokens.accentSubtle);
  r.style.setProperty("--t-accent-text", tokens.accentText);

  // Sidebar
  r.style.setProperty("--t-sidebar-bg", tokens.sidebarBg);
  r.style.setProperty("--t-sidebar-text", tokens.sidebarText);
  r.style.setProperty("--t-sidebar-text-muted", tokens.sidebarTextMuted);
  r.style.setProperty("--t-sidebar-active", tokens.sidebarActive);
  r.style.setProperty("--t-sidebar-active-text", tokens.sidebarActiveText);
  r.style.setProperty("--t-sidebar-hover", tokens.sidebarHover);
  r.style.setProperty("--t-sidebar-border", tokens.sidebarBorder);
  r.style.setProperty("--t-sidebar-accent", tokens.sidebarAccent);
  r.style.setProperty("--t-sidebar-width", `${tokens.sidebarWidth}px`);

  // Header
  r.style.setProperty("--t-header-bg", tokens.headerBg);
  r.style.setProperty("--t-header-border", tokens.headerBorder);
  r.style.setProperty("--t-header-text", tokens.headerText);

  // Estados semánticos
  r.style.setProperty("--t-success", tokens.success);
  r.style.setProperty("--t-success-subtle", tokens.successSubtle);
  r.style.setProperty("--t-error", tokens.error);
  r.style.setProperty("--t-error-subtle", tokens.errorSubtle);
  r.style.setProperty("--t-warning", tokens.warning);
  r.style.setProperty("--t-warning-subtle", tokens.warningSubtle);
  r.style.setProperty("--t-info", tokens.info);
  r.style.setProperty("--t-info-subtle", tokens.infoSubtle);

  // Tipografía
  r.style.setProperty("--t-font-heading", tokens.fontHeading);
  r.style.setProperty("--t-font-body", tokens.fontBody);
  r.style.setProperty("--t-font-mono", tokens.fontMono);
  r.style.setProperty("--t-font-size-base", tokens.fontSizeBase);

  // Radios
  r.style.setProperty("--t-radius-card", tokens.radiusCard);
  r.style.setProperty("--t-radius-button", tokens.radiusButton);
  r.style.setProperty("--t-radius-input", tokens.radiusInput);
  r.style.setProperty("--t-radius-badge", tokens.radiusBadge);

  // Efectos especiales
  if (tokens.glassBlur) r.style.setProperty("--t-glass-blur", tokens.glassBlur);
  if (tokens.glassBg) r.style.setProperty("--t-glass-bg", tokens.glassBg);
  if (tokens.glassBorder) r.style.setProperty("--t-glass-border", tokens.glassBorder);
  if (tokens.gradientAccent) r.style.setProperty("--t-gradient-accent", tokens.gradientAccent);

  // ── Sin prefijo → estándar industria (Shadcn, Radix, plantillas Figma) ──────
  // Las plantillas de temas usan --bg, --accent, etc. directamente.
  // Este bloque las hace funcionar sin modificar las plantillas generadas.
  r.style.setProperty("--bg",                  tokens.bg);
  r.style.setProperty("--surface",             tokens.surface);
  r.style.setProperty("--surface2",            tokens.surface2);
  r.style.setProperty("--surface3",            tokens.surface3);
  r.style.setProperty("--text",                tokens.text);
  r.style.setProperty("--text-secondary",      tokens.textSecondary);
  r.style.setProperty("--text-muted",          tokens.textMuted);
  r.style.setProperty("--border",              tokens.border);
  r.style.setProperty("--border-strong",       tokens.borderStrong);
  r.style.setProperty("--shadow",              tokens.shadow);
  r.style.setProperty("--shadow-lg",           tokens.shadowLg);
  r.style.setProperty("--accent",              tokens.accent);
  r.style.setProperty("--accent-hover",        tokens.accentHover);
  r.style.setProperty("--accent-subtle",       tokens.accentSubtle);
  r.style.setProperty("--accent-text",         tokens.accentText);
  r.style.setProperty("--sidebar-bg",          tokens.sidebarBg);
  r.style.setProperty("--sidebar-text",        tokens.sidebarText);
  r.style.setProperty("--sidebar-text-muted",  tokens.sidebarTextMuted);
  r.style.setProperty("--sidebar-active",      tokens.sidebarActive);
  r.style.setProperty("--sidebar-active-text", tokens.sidebarActiveText);
  r.style.setProperty("--sidebar-hover",       tokens.sidebarHover);
  r.style.setProperty("--sidebar-border",      tokens.sidebarBorder);
  r.style.setProperty("--sidebar-width",       `${tokens.sidebarWidth}px`);
  r.style.setProperty("--header-bg",           tokens.headerBg);
  r.style.setProperty("--header-border",       tokens.headerBorder);
  r.style.setProperty("--header-text",         tokens.headerText);
  r.style.setProperty("--success",             tokens.success);
  r.style.setProperty("--success-subtle",      tokens.successSubtle);
  r.style.setProperty("--error",               tokens.error);
  r.style.setProperty("--error-subtle",        tokens.errorSubtle);
  r.style.setProperty("--warning",             tokens.warning);
  r.style.setProperty("--warning-subtle",      tokens.warningSubtle);
  r.style.setProperty("--info",                tokens.info);
  r.style.setProperty("--info-subtle",         tokens.infoSubtle);
  r.style.setProperty("--font-heading",        tokens.fontHeading);
  r.style.setProperty("--font-body",           tokens.fontBody);
  r.style.setProperty("--font-mono",           tokens.fontMono);
  r.style.setProperty("--font-size-base",      tokens.fontSizeBase);
  r.style.setProperty("--radius-card",         tokens.radiusCard);
  r.style.setProperty("--radius-button",       tokens.radiusButton);
  r.style.setProperty("--radius-input",        tokens.radiusInput);
  r.style.setProperty("--radius-badge",        tokens.radiusBadge);
  if (tokens.glassBlur)      r.style.setProperty("--glass-blur",      tokens.glassBlur);
  if (tokens.glassBg)        r.style.setProperty("--glass-bg",        tokens.glassBg);
  if (tokens.glassBorder)    r.style.setProperty("--glass-border",    tokens.glassBorder);
  if (tokens.gradientAccent) r.style.setProperty("--gradient-accent", tokens.gradientAccent);

  // ── Aliases --admin-* → compatibilidad con módulos admin ─────
  // Módulos usan var(--admin-*); este bloque los sincroniza con los tokens activos
  r.style.setProperty("--admin-bg",              tokens.bg);
  r.style.setProperty("--admin-surface",         tokens.surface);
  r.style.setProperty("--admin-surface2",        tokens.surface2);
  r.style.setProperty("--admin-text",            tokens.text);
  r.style.setProperty("--admin-text-secondary",  tokens.textSecondary);
  r.style.setProperty("--admin-muted",           tokens.textMuted);
  r.style.setProperty("--admin-border",          tokens.border);
  r.style.setProperty("--admin-accent",          tokens.accent);
  r.style.setProperty("--admin-accent-hover",    tokens.accentHover);
  r.style.setProperty("--admin-accent-text",     tokens.accentText);
  r.style.setProperty("--admin-accent-subtle",   tokens.accentSubtle);
  r.style.setProperty("--admin-sidebar-bg",      tokens.sidebarBg);
  r.style.setProperty("--admin-sidebar-text",    tokens.sidebarText);
  r.style.setProperty("--admin-sidebar-active",  tokens.sidebarActive);
  r.style.setProperty("--admin-sidebar-accent",  tokens.sidebarAccent);
  r.style.setProperty("--admin-sidebar-border",  tokens.sidebarBorder);
  r.style.setProperty("--admin-sidebar-width",   `${tokens.sidebarWidth}px`);
  r.style.setProperty("--admin-success",         tokens.success);
  r.style.setProperty("--admin-success-subtle",  tokens.successSubtle);
  r.style.setProperty("--admin-error",           tokens.error);
  r.style.setProperty("--admin-error-subtle",    tokens.errorSubtle);
  r.style.setProperty("--admin-warning",         tokens.warning);
  r.style.setProperty("--admin-warning-subtle",  tokens.warningSubtle);
  r.style.setProperty("--admin-info",            tokens.info);
  r.style.setProperty("--admin-info-subtle",     tokens.infoSubtle);
  r.style.setProperty("--admin-card-radius",     tokens.radiusCard);
  r.style.setProperty("--admin-button-radius",   tokens.radiusButton);
  r.style.setProperty("--admin-input-radius",    tokens.radiusInput);
  r.style.setProperty("--admin-shadow",          tokens.shadow);
  r.style.setProperty("--admin-shadow-lg",       tokens.shadowLg);
  r.style.setProperty("--admin-font-heading",    tokens.fontHeading);
  r.style.setProperty("--admin-font-body",       tokens.fontBody);
  r.style.setProperty("--admin-font-mono",       tokens.fontMono);

  // Data attributes en admin-root para CSS targeting
  const root = document.getElementById("admin-root");
  if (root) {
    root.setAttribute("data-theme", tokens.id);
    root.setAttribute("data-mode", tokens.mode);
    root.setAttribute("data-sidebar", tokens.sidebarStyle);
  }
}

// ── Provider ───────────────────────────────────────────────────
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState("dsd-classic");
  const [loading, setLoading] = useState(true);
  const tokens = getThemeTokens(themeId);

  // Cargar tema desde API al montar
  useEffect(() => {
    fetch("/api/admin/panel-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.config?.theme_id) {
          setThemeIdState(d.config.theme_id);
        }
      })
      .catch((e) => logger.warn("[ThemeContext] load error", e))
      .finally(() => setLoading(false));
  }, []);

  // Aplicar tokens al DOM cuando cambia el tema
  useEffect(() => {
    applyTokensToDOM(tokens);
  }, [tokens]);

  // Cambiar tema + persistir
  const setThemeId = useCallback(async (id: string) => {
    setThemeIdState(id);
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_id: id }),
      });
    } catch (e) {
      logger.warn("[ThemeContext] persist error", e);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        t: tokens,
        themeId,
        setThemeId,
        isDark: tokens.mode === "dark",
        themes: THEME_LIST,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
