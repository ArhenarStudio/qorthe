"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AdminUITheme, AdminThemeComponents } from "@/src/admin/types";
import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from "@/src/admin/themes/default/components";
import { getTheme, allThemes } from "@/src/admin/themes/themeRegistry";
import { adminNavigation } from "@/src/admin/navigation";
import type { NavGroup } from "@/src/admin/navigation";
import { logger } from '@/src/lib/logger';

interface AdminThemeContextType {
  theme: AdminUITheme;
  themeId: string;
  setTheme: (id: string) => void;
  themes: AdminUITheme[];
  loading: boolean;
  setupCompleted: boolean;
  setSetupCompleted: (v: boolean) => void;
  navigation: NavGroup[];
  components: Required<AdminThemeComponents>;
}

const defaultComponents: Required<AdminThemeComponents> = {
  Card: DefaultCard, Badge: DefaultBadge, Button: DefaultButton,
  Table: DefaultTable, StatCard: DefaultStatCard,
};

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: getTheme("dsd-classic"),
  themeId: "dsd-classic",
  setTheme: () => {},
  themes: allThemes,
  loading: true,
  setupCompleted: false,
  setSetupCompleted: () => {},
  navigation: adminNavigation,
  components: defaultComponents,
});

export const useAdminTheme = () => useContext(AdminThemeContext);

// Apply design tokens as CSS variables
function applyTokens(theme: AdminUITheme) {
  const root = document.documentElement;
  const t = theme.tokens;

  root.style.setProperty("--bg", t.bg);
  root.style.setProperty("--surface", t.surface);
  root.style.setProperty("--surface2", t.surface2);
  root.style.setProperty("--text", t.text);
  root.style.setProperty("--text-secondary", t.textSecondary);
  root.style.setProperty("--text-muted", t.muted);
  root.style.setProperty("--border", t.border);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-hover", t.accentHover);
  root.style.setProperty("--accent-text", t.accentText);
  root.style.setProperty("--sidebar-bg", t.sidebarBg);
  root.style.setProperty("--sidebar-text", t.sidebarText);
  root.style.setProperty("--sidebar-active", t.sidebarActive);
  root.style.setProperty("--sidebar-accent", t.sidebarAccent);
  root.style.setProperty("--sidebar-border", t.sidebarBorder);
  root.style.setProperty("--sidebar-width", t.sidebarWidth);
  root.style.setProperty("--success", t.success);
  root.style.setProperty("--error", t.error);
  root.style.setProperty("--warning", t.warning);
  root.style.setProperty("--info", t.info);
  root.style.setProperty("--radius-card", t.cardRadius);
  root.style.setProperty("--radius-button", t.buttonRadius);
  root.style.setProperty("--radius-input", t.inputRadius);
  root.style.setProperty("--shadow", t.shadow);
  root.style.setProperty("--shadow-lg", t.shadowLg);
  root.style.setProperty("--font-heading", theme.fonts.heading);
  root.style.setProperty("--font-body", theme.fonts.body);
  root.style.setProperty("--font-mono", theme.fonts.mono);

  // Apply mode and theme to admin-root
  const adminRoot = document.getElementById("admin-root");
  if (adminRoot) {
    adminRoot.setAttribute("data-admin-theme", theme.id);
    adminRoot.setAttribute("data-admin-mode", theme.mode);
  }
}

export const AdminThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState("dsd-classic");
  const [loading, setLoading] = useState(true);
  const [setupCompleted, setSetupCompletedState] = useState(false);
  const theme = getTheme(themeId);

  // Resolve components — theme overrides merge with defaults
  const resolvedComponents: Required<AdminThemeComponents> = {
    ...defaultComponents,
    ...(theme.components || {}),
  };

  // Load from API on mount
  useEffect(() => {
    fetch("/api/admin/panel-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.config) {
          setThemeId(d.config.theme_id || "dsd-classic");
          setSetupCompletedState(d.config.setup_completed || false);
        }
      })
      .catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e))
      .finally(() => setLoading(false));
  }, []);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    applyTokens(theme);
  }, [theme]);

  const setTheme = async (id: string) => {
    setThemeId(id);
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_id: id }),
      });
    } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }
  };

  const setSetupCompleted = async (v: boolean) => {
    setSetupCompletedState(v);
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup_completed: v }),
      });
    } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }
  };

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        themeId,
        setTheme,
        themes: allThemes,
        loading,
        setupCompleted,
        setSetupCompleted,
        navigation: adminNavigation,
        components: resolvedComponents,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
};
