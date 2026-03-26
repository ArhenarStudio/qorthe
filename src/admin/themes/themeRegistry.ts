// ═══════════════════════════════════════════════════════════════
// src/admin/themes/themeRegistry.ts
// Komerzly — Registro de temas del panel admin
// Tema activo: dsd-classic (Tenant 0 — Qorthe)
// ═══════════════════════════════════════════════════════════════

import type { AdminUITheme } from '@/src/admin/types';
import { DefaultSidebar } from './default/Sidebar';
import { AdminHeader as DefaultHeader } from './default/Header';
import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from './default/components';
import { komerzlyTealDarkTheme } from './komerzly-teal-dark';
import nintendoRetroTheme from './nintendo-retro';

// ── DSD Classic — tema único activo ───────────────────────────
const dsdClassicTheme: AdminUITheme = {
  id: 'dsd-classic',
  name: 'DSD Classic',
  mode: 'light',
  description: "Tonos cálidos de madera artesanal con acentos dorados. Tema oficial de Qorthe.",
  preview: { sidebar: '#2D2419', bg: '#FAF8F5', accent: '#C5A065', card: '#FFFFFF' },
  Sidebar: DefaultSidebar,
  Header: DefaultHeader,
  tokens: {
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    surface2: '#F5F2EE',
    surface3: '#EDE8E1',
    text: '#2D2419',
    textSecondary: '#7A6148',
    muted: '#B09878',
    border: '#E8E0D4',
    borderStrong: '#C8B89A',
    accent: '#C5A065',
    accentHover: '#A8844E',
    accentSubtle: 'rgba(197,160,101,0.12)',
    accentText: '#FFFFFF',
    sidebarBg: '#2D2419',
    sidebarText: '#E8E0D4',
    sidebarTextMuted: '#8B7355',
    sidebarActive: 'rgba(197,160,101,0.18)',
    sidebarActiveText: '#C5A065',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarAccent: '#C5A065',
    sidebarBorder: 'rgba(255,255,255,0.07)',
    sidebarWidth: '260px',
    headerBg: '#FFFFFF',
    headerBorder: '#E8E0D4',
    headerText: '#2D2419',
    success: '#16A34A',
    successSubtle: 'rgba(22,163,74,0.10)',
    error: '#DC2626',
    errorSubtle: 'rgba(220,38,38,0.10)',
    warning: '#D97706',
    warningSubtle: 'rgba(217,119,6,0.10)',
    info: '#2563EB',
    infoSubtle: 'rgba(37,99,235,0.10)',
    cardRadius: '12px',
    buttonRadius: '8px',
    inputRadius: '8px',
    badgeRadius: '6px',
    shadow: '0 1px 3px rgba(45,36,25,0.07)',
    shadowLg: '0 8px 24px rgba(45,36,25,0.10)',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontSizeBase: '13px',
  },
  components: {
    Card: DefaultCard,
    Badge: DefaultBadge,
    Button: DefaultButton,
    Table: DefaultTable,
    StatCard: DefaultStatCard,
  },
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

// ── Registro — agregar nuevos temas aquí (RockSage fase futura) ──
export const adminThemes: Record<string, AdminUITheme> = {
  'dsd-classic': dsdClassicTheme,
  'komerzly-teal-dark': komerzlyTealDarkTheme,
  'nintendo-retro': nintendoRetroTheme,
};

export const getTheme = (id: string): AdminUITheme =>
  adminThemes[id] ?? dsdClassicTheme;

export const allThemes = Object.values(adminThemes);
