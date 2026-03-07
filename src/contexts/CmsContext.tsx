"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ── Types ──
export interface CmsMenuItem {
  label: string;
  url: string;
  open_new_tab: boolean;
  icon: string | null;
}

export interface CmsSection {
  id: string;
  type: string;
  title: string;
  content: Record<string, any>;
  position: number;
}

export interface CmsPopup {
  id: string;
  name: string;
  type: string;
  trigger_type: string;
  trigger_value: string;
  content: Record<string, any>;
  show_on: string[];
  display_frequency: string;
}

export interface CmsData {
  menus: Record<string, CmsMenuItem[]>;
  sections: CmsSection[];
  texts: Record<string, { es: string; en: string }>;
  popups: CmsPopup[];
  loading: boolean;
  loaded: boolean;
}

// ── Helpers ──
/** Get a text value by key with language fallback */
export function getCmsText(texts: CmsData["texts"], key: string, lang: "es" | "en" = "es"): string | undefined {
  const entry = texts[key];
  if (!entry) return undefined;
  return lang === "en" ? (entry.en || entry.es) : (entry.es || entry.en);
}

// ── Context ──
const CmsContext = createContext<CmsData>({
  menus: {},
  sections: [],
  texts: {},
  popups: [],
  loading: true,
  loaded: false,
});

export const useCms = () => useContext(CmsContext);

// ── Provider ──
const CACHE_KEY = "dsd_cms_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const CmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CmsData>({
    menus: {},
    sections: [],
    texts: {},
    popups: [],
    loading: true,
    loaded: false,
  });

  useEffect(() => {
    // Try reading from sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed._ts && Date.now() - parsed._ts < CACHE_TTL) {
          setData({ menus: parsed.menus || {}, sections: parsed.sections || [], texts: parsed.texts || {}, popups: parsed.popups || [], loading: false, loaded: true });
          return;
        }
      }
    } catch {}

    // Fetch from API
    fetch("/api/public/cms")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d && !d._error) {
          const cmsData = { menus: d.menus || {}, sections: d.sections || [], texts: d.texts || {}, popups: d.popups || [] };
          setData({ ...cmsData, loading: false, loaded: true });
          // Cache in sessionStorage
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...cmsData, _ts: Date.now() })); } catch {}
        } else {
          setData((prev) => ({ ...prev, loading: false, loaded: true }));
        }
      })
      .catch(() => {
        setData((prev) => ({ ...prev, loading: false, loaded: true }));
      });
  }, []);

  return <CmsContext.Provider value={data}>{children}</CmsContext.Provider>;
};
