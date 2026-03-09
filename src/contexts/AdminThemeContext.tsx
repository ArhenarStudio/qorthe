"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AdminUITheme, AdminThemeComponents } from "@/src/admin/types";
import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from "@/src/admin/themes/default/components";
import { getTheme, allThemes } from "@/src/admin/themes/themeRegistry";
import { adminNavigation } from "@/src/admin/navigation";
import type { NavGroup } from "@/src/admin/navigation";

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

  root.style.setProperty("--admin-bg", t.bg);
  root.style.setProperty("--admin-surface", t.surface);
  root.style.setProperty("--admin-surface2", t.surface2);
  root.style.setProperty("--admin-text", t.text);
  root.style.setProperty("--admin-text-secondary", t.textSecondary);
  root.style.setProperty("--admin-muted", t.muted);
  root.style.setProperty("--admin-border", t.border);
  root.style.setProperty("--admin-accent", t.accent);
  root.style.setProperty("--admin-accent-hover", t.accentHover);
  root.style.setProperty("--admin-accent-text", t.accentText);
  root.style.setProperty("--admin-sidebar-bg", t.sidebarBg);
  root.style.setProperty("--admin-sidebar-text", t.sidebarText);
  root.style.setProperty("--admin-sidebar-active", t.sidebarActive);
  root.style.setProperty("--admin-sidebar-accent", t.sidebarAccent);
  root.style.setProperty("--admin-sidebar-border", t.sidebarBorder);
  root.style.setProperty("--admin-sidebar-width", t.sidebarWidth);
  root.style.setProperty("--admin-success", t.success);
  root.style.setProperty("--admin-error", t.error);
  root.style.setProperty("--admin-warning", t.warning);
  root.style.setProperty("--admin-info", t.info);
  root.style.setProperty("--admin-card-radius", t.cardRadius);
  root.style.setProperty("--admin-button-radius", t.buttonRadius);
  root.style.setProperty("--admin-input-radius", t.inputRadius);
  root.style.setProperty("--admin-shadow", t.shadow);
  root.style.setProperty("--admin-shadow-lg", t.shadowLg);
  root.style.setProperty("--admin-font-heading", theme.fonts.heading);
  root.style.setProperty("--admin-font-body", theme.fonts.body);
  root.style.setProperty("--admin-font-mono", theme.fonts.mono);

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
      .catch(() => {})
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
    } catch (_err) { void _err; }
  };

  const setSetupCompleted = async (v: boolean) => {
    setSetupCompletedState(v);
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup_completed: v }),
      });
    } catch (_err) { void _err; }
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
