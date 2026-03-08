"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AdminTheme, getThemeById, ADMIN_THEMES } from "@/src/themes/admin-themes";

interface AdminThemeContextType {
  theme: AdminTheme;
  themeId: string;
  setTheme: (id: string) => void;
  themes: AdminTheme[];
  loading: boolean;
  setupCompleted: boolean;
  setSetupCompleted: (v: boolean) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: ADMIN_THEMES[0],
  themeId: "dsd-classic",
  setTheme: () => {},
  themes: ADMIN_THEMES,
  loading: true,
  setupCompleted: false,
  setSetupCompleted: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export const AdminThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState("dsd-classic");
  const [loading, setLoading] = useState(true);
  const [setupCompleted, setSetupCompletedState] = useState(false);
  const theme = getThemeById(themeId);

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
    const root = document.documentElement;
    // Apply all tokens
    for (const [key, value] of Object.entries(theme.tokens)) {
      root.style.setProperty(key, value as string);
    }
    // Apply fonts
    root.style.setProperty("--admin-font-heading", theme.fonts.heading);
    root.style.setProperty("--admin-font-body", theme.fonts.body);
    root.style.setProperty("--admin-font-mono", theme.fonts.mono);
    // Apply mode class
    const adminRoot = document.getElementById("admin-root");
    if (adminRoot) {
      adminRoot.setAttribute("data-admin-theme", theme.id);
      adminRoot.setAttribute("data-admin-mode", theme.mode);
    }
  }, [theme]);

  const setTheme = async (id: string) => {
    setThemeId(id);
    // Persist to API
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_id: id }),
      });
    } catch {}
  };

  const setSetupCompleted = async (v: boolean) => {
    setSetupCompletedState(v);
    try {
      await fetch("/api/admin/panel-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup_completed: v }),
      });
    } catch {}
  };

  return (
    <AdminThemeContext.Provider value={{ theme, themeId, setTheme, themes: ADMIN_THEMES, loading, setupCompleted, setSetupCompleted }}>
      {children}
    </AdminThemeContext.Provider>
  );
};
