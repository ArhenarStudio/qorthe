"use client";
// ═══════════════════════════════════════════════════════════════
// src/contexts/AdminThemeContext.tsx
// RockSage Commerce — Fuente única de verdad para el tema admin
// Un solo sistema. Un solo hook: useAdminTheme()
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

// ── Aplica tokens como CSS vars en :root ───────────────────────
function applyTokensToDOM(theme: AdminUITheme) {
  const t = theme.tokens;
  const r = document.documentElement;

  // Fondos
  r.style.setProperty('--bg',       t.bg);
  r.style.setProperty('--surface',  t.surface);
  r.style.setProperty('--surface2', t.surface2);
  r.style.setProperty('--surface3', t.surface3);

  // Texto
  r.style.setProperty('--text',           t.text);
  r.style.setProperty('--text-secondary', t.textSecondary);
  r.style.setProperty('--text-muted',     t.muted);

  // Bordes y sombras
  r.style.setProperty('--border',        t.border);
  r.style.setProperty('--border-strong', t.borderStrong);
  r.style.setProperty('--shadow',        t.shadow);
  r.style.setProperty('--shadow-lg',     t.shadowLg);

  // Acento
  r.style.setProperty('--accent',        t.accent);
  r.style.setProperty('--accent-hover',  t.accentHover);
  r.style.setProperty('--accent-subtle', t.accentSubtle);
  r.style.setProperty('--accent-text',   t.accentText);

  // Sidebar
  r.style.setProperty('--sidebar-bg',          t.sidebarBg);
  r.style.setProperty('--sidebar-text',        t.sidebarText);
  r.style.setProperty('--sidebar-text-muted',  t.sidebarTextMuted);
  r.style.setProperty('--sidebar-active',      t.sidebarActive);
  r.style.setProperty('--sidebar-active-text', t.sidebarActiveText);
  r.style.setProperty('--sidebar-hover',       t.sidebarHover);
  r.style.setProperty('--sidebar-accent',      t.sidebarAccent);
  r.style.setProperty('--sidebar-border',      t.sidebarBorder);
  r.style.setProperty('--sidebar-width',       t.sidebarWidth);

  // Header
  r.style.setProperty('--header-bg',     t.headerBg);
  r.style.setProperty('--header-border', t.headerBorder);
  r.style.setProperty('--header-text',   t.headerText);

  // Estados semánticos
  r.style.setProperty('--success',        t.success);
  r.style.setProperty('--success-subtle', t.successSubtle);
  r.style.setProperty('--error',          t.error);
  r.style.setProperty('--error-subtle',   t.errorSubtle);
  r.style.setProperty('--warning',        t.warning);
  r.style.setProperty('--warning-subtle', t.warningSubtle);
  r.style.setProperty('--info',           t.info);
  r.style.setProperty('--info-subtle',    t.infoSubtle);

  // Radios
  r.style.setProperty('--radius-card',   t.cardRadius);
  r.style.setProperty('--radius-button', t.buttonRadius);
  r.style.setProperty('--radius-input',  t.inputRadius);
  r.style.setProperty('--radius-badge',  t.badgeRadius);

  // Tipografía
  r.style.setProperty('--font-heading',   t.fontHeading);
  r.style.setProperty('--font-body',      t.fontBody);
  r.style.setProperty('--font-mono',      t.fontMono);
  r.style.setProperty('--font-size-base', t.fontSizeBase);

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

  const resolvedComponents: Required<AdminThemeComponents> = {
    ...defaultComponents,
    ...(theme.components ?? {}),
  };

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
