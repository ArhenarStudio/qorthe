"use client";
// ═══════════════════════════════════════════════════════════════
// src/contexts/AdminThemeContext.tsx
// RockSage Commerce — Fuente única de verdad para el tema admin
// Un solo sistema. Un solo hook: useAdminTheme()
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import type { AdminUITheme, AdminThemeComponents } from '@/src/admin/types';
import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from '@/src/admin/themes/default/components';
import { getTheme, allThemes } from '@/src/admin/themes/themeRegistry';
import { adminNavigation } from '@/src/admin/navigation';
import type { NavGroup } from '@/src/admin/navigation';
import { logger } from '@/src/lib/logger';

// ── Tipos del context ──────────────────────────────────────────
interface AdminThemeContextType {
  /** Tema activo completo */
  theme: AdminUITheme;
  /** ID del tema activo */
  themeId: string;
  /** Cambia el tema y lo persiste */
  setTheme: (id: string) => void;
  /** Lista de temas disponibles */
  themes: AdminUITheme[];
  /** Estado de carga inicial */
  loading: boolean;
  /** Navegación del admin */
  navigation: NavGroup[];
  /** Componentes UI del tema activo */
  components: Required<AdminThemeComponents>;
}

const defaultComponents: Required<AdminThemeComponents> = {
  Card: DefaultCard,
  Badge: DefaultBadge,
  Button: DefaultButton,
  Table: DefaultTable,
  StatCard: DefaultStatCard,
};

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: getTheme('dsd-classic'),
  themeId: 'dsd-classic',
  setTheme: () => {},
  themes: allThemes,
  loading: true,
  navigation: adminNavigation,
  components: defaultComponents,
});

export const useAdminTheme = () => useContext(AdminThemeContext);

// ── Token defaults — fallback si un tema parcial omite tokens ──
const DEFAULT_TOKENS = getTheme('dsd-classic').tokens;

// ── Helper: aplica un token con fallback y warn en dev ─────────
function applyToken(r: HTMLElement, cssVar: string, value: string | undefined, fallback: string) {
  const resolved = value ?? fallback;
  if (process.env.NODE_ENV === 'development' && !value) {
    console.warn('[RockSage] Token \'' + cssVar + '\' undefined en tema activo — fallback: ' + fallback);
  }
  r.style.setProperty(cssVar, resolved);
}

// ── Helper: convierte hex #RRGGBB → "R, G, B" para rgba() ─────
function hexToRgbComponents(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return isNaN(r) ? '255, 255, 255' : r + ', ' + g + ', ' + b;
}

// ── Aplica tokens como CSS vars en :root ───────────────────────
function applyTokensToDOM(theme: AdminUITheme) {
  const t = theme.tokens;
  const d = DEFAULT_TOKENS;
  const r = document.documentElement;

  // Fondos
  applyToken(r, '--bg',       t.bg,       d.bg);
  applyToken(r, '--surface',  t.surface,  d.surface);
  applyToken(r, '--surface2', t.surface2, d.surface2);
  applyToken(r, '--surface3', t.surface3, d.surface3);

  // --surface-rgb para rgba(var(--surface-rgb), opacity) en módulos
  const surfaceRgb = hexToRgbComponents(t.surface ?? d.surface);
  r.style.setProperty('--surface-rgb', surfaceRgb);

  // Texto
  applyToken(r, '--text',           t.text,          d.text);
  applyToken(r, '--text-secondary', t.textSecondary, d.textSecondary);
  applyToken(r, '--text-muted',     t.muted,         d.muted);

  // Bordes y sombras
  applyToken(r, '--border',        t.border,      d.border);
  applyToken(r, '--border-strong', t.borderStrong, d.borderStrong);
  applyToken(r, '--shadow',        t.shadow,      d.shadow);
  applyToken(r, '--shadow-lg',     t.shadowLg,    d.shadowLg);

  // Acento
  applyToken(r, '--accent',        t.accent,       d.accent);
  applyToken(r, '--accent-hover',  t.accentHover,  d.accentHover);
  applyToken(r, '--accent-subtle', t.accentSubtle, d.accentSubtle);
  applyToken(r, '--accent-text',   t.accentText,   d.accentText);

  // Sidebar
  applyToken(r, '--sidebar-bg',          t.sidebarBg,         d.sidebarBg);
  applyToken(r, '--sidebar-text',        t.sidebarText,       d.sidebarText);
  applyToken(r, '--sidebar-text-muted',  t.sidebarTextMuted,  d.sidebarTextMuted);
  applyToken(r, '--sidebar-active',      t.sidebarActive,     d.sidebarActive);
  applyToken(r, '--sidebar-active-text', t.sidebarActiveText, d.sidebarActiveText);
  applyToken(r, '--sidebar-hover',       t.sidebarHover,      d.sidebarHover);
  applyToken(r, '--sidebar-accent',      t.sidebarAccent,     d.sidebarAccent);
  applyToken(r, '--sidebar-border',      t.sidebarBorder,     d.sidebarBorder);
  applyToken(r, '--sidebar-width',       t.sidebarWidth,      d.sidebarWidth);

  // Header
  applyToken(r, '--header-bg',     t.headerBg,     d.headerBg);
  applyToken(r, '--header-border', t.headerBorder, d.headerBorder);
  applyToken(r, '--header-text',   t.headerText,   d.headerText);

  // Estados semánticos
  applyToken(r, '--success',        t.success,       d.success);
  applyToken(r, '--success-subtle', t.successSubtle, d.successSubtle);
  applyToken(r, '--error',          t.error,         d.error);
  applyToken(r, '--error-subtle',   t.errorSubtle,   d.errorSubtle);
  applyToken(r, '--warning',        t.warning,       d.warning);
  applyToken(r, '--warning-subtle', t.warningSubtle, d.warningSubtle);
  applyToken(r, '--info',           t.info,          d.info);
  applyToken(r, '--info-subtle',    t.infoSubtle,    d.infoSubtle);

  // Radios
  applyToken(r, '--radius-card',   t.cardRadius,   d.cardRadius);
  applyToken(r, '--radius-button', t.buttonRadius, d.buttonRadius);
  applyToken(r, '--radius-input',  t.inputRadius,  d.inputRadius);
  applyToken(r, '--radius-badge',  t.badgeRadius,  d.badgeRadius);

  // Tipografía
  applyToken(r, '--font-heading',   t.fontHeading,   d.fontHeading);
  applyToken(r, '--font-body',      t.fontBody,      d.fontBody);
  applyToken(r, '--font-mono',      t.fontMono,      d.fontMono);
  applyToken(r, '--font-size-base', t.fontSizeBase,  d.fontSizeBase);

  // Data attributes en admin-root
  const adminRoot = document.getElementById('admin-root');
  if (adminRoot) {
    adminRoot.setAttribute('data-theme', theme.id);
    adminRoot.setAttribute('data-mode', theme.mode);
  }
}

// ── Provider ───────────────────────────────────────────────────
export const AdminThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState('dsd-classic');
  const [loading, setLoading] = useState(true);
  const theme = getTheme(themeId);

  const resolvedComponents: Required<AdminThemeComponents> = useMemo(() => ({
    ...defaultComponents,
    ...(theme.components ?? {}),
  }), [theme]);

  // Cargar tema persistido
  useEffect(() => {
    fetch('/api/admin/panel-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.config?.theme_id) setThemeId(d.config.theme_id); })
      .catch((e) => logger.warn('[AdminTheme] load error', e))
      .finally(() => setLoading(false));
  }, []);

  // Aplicar tokens al DOM
  useEffect(() => { applyTokensToDOM(theme); }, [theme]);

  const setTheme = useCallback(async (id: string) => {
    setThemeId(id);
    try {
      await fetch('/api/admin/panel-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_id: id }),
      });
    } catch (e) { logger.warn('[AdminTheme] persist error', e); }
  }, []);

  return (
    <AdminThemeContext.Provider value={{
      theme, themeId, setTheme,
      themes: allThemes, loading,
      navigation: adminNavigation,
      components: resolvedComponents,
    }}>
      {children}
    </AdminThemeContext.Provider>
  );
};
