// ═══════════════════════════════════════════════════════════════
// Admin Theme Registry — 24 temas para RockSage Commerce
// ═══════════════════════════════════════════════════════════════

import type { AdminUITheme } from '@/src/admin/types';
import { DefaultSidebar } from './default/Sidebar';
import { AdminHeader as DefaultHeader } from './default/Header';
import { IndigoGlassSidebar } from './indigo-glass/Sidebar';
import { IndigoGlassHeader } from './indigo-glass/Header';
import { TealNoirSidebar } from './teal-noir/Sidebar';
import { TealNoirHeader } from './teal-noir/Header';
import { CoralForgeSidebar } from './coral-forge/Sidebar';
import { CoralForgeHeader } from './coral-forge/Header';
import { SageCommandSidebar } from './sage-command/Sidebar';
import { SageCommandHeader } from './sage-command/Header';
import { ArcticLightSidebar } from './arctic-light/Sidebar';
import { ArcticLightHeader } from './arctic-light/Header';

import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from './default/components';
import { IndigoGlassCard, IndigoGlassBadge, IndigoGlassButton, IndigoGlassTable, IndigoGlassStatCard } from './indigo-glass/components';
import { TealNoirCard, TealNoirBadge, TealNoirButton, TealNoirTable, TealNoirStatCard } from './teal-noir/components';
import { CoralForgeCard, CoralForgeBadge, CoralForgeButton, CoralForgeTable, CoralForgeStatCard } from './coral-forge/components';
import { SageCard, SageBadge, SageButton, SageTable, SageStatCard } from './sage-command/components';
import { ArcticCard, ArcticBadge, ArcticButton, ArcticTable, ArcticStatCard } from './arctic-light/components';

// ── Shorthand helpers ──────────────────────────────────────────
const lightFonts = { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" };
const serifFonts = { heading: "'Playfair Display', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" };
const darkFonts  = { heading: "'Sora', sans-serif",  body: "'DM Sans', sans-serif",  mono: "'JetBrains Mono', monospace" };
const baseAnims  = {
  pageTransition: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } },
  sidebarExpand: 'transition-all duration-200', cardHover: 'hover:shadow-md transition-shadow', modalEnter: 'transition-all duration-200',
};
const defaultComps = { Card: DefaultCard, Badge: DefaultBadge, Button: DefaultButton, Table: DefaultTable, StatCard: DefaultStatCard };
const darkComps    = { Card: TealNoirCard, Badge: TealNoirBadge, Button: TealNoirButton, Table: TealNoirTable, StatCard: TealNoirStatCard };
const coralComps   = { Card: CoralForgeCard, Badge: CoralForgeBadge, Button: CoralForgeButton, Table: CoralForgeTable, StatCard: CoralForgeStatCard };

// ── 1. DSD Classic (original) ─────────────────────────────────
const defaultTheme: AdminUITheme = {
  id: 'dsd-classic', name: 'DSD Classic', mode: 'light',
  description: "El tema original de DavidSon's Design. Tonos cálidos de madera con acentos dorados.",
  preview: { sidebar: '#2d2419', bg: '#FAF8F5', accent: '#C5A065', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FAF8F5', surface: '#FFFFFF', surface2: '#F5F3F0',
    text: '#2d2419', textSecondary: '#8B7355', muted: '#B8A88A',
    border: '#E8E0D4', accent: '#C5A065', accentHover: '#B8933D', accentText: '#FFFFFF',
    sidebarBg: '#2d2419', sidebarText: '#E8E0D4', sidebarActive: 'rgba(197,160,101,0.15)',
    sidebarAccent: '#C5A065', sidebarBorder: 'rgba(255,255,255,0.08)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(0,0,0,0.06)', shadowLg: '0 4px 12px rgba(0,0,0,0.08)',
  },
  components: defaultComps, fonts: serifFonts, animations: baseAnims,
};

// ── 2. Indigo Glass ────────────────────────────────────────────
const indigoGlassTheme: AdminUITheme = {
  id: 'indigo-glass', name: 'Indigo Glass', mode: 'light',
  description: 'Diseño luminoso con glassmorphism, sidebar rail compacto y acentos índigo.',
  preview: { sidebar: '#0f0f1a', bg: '#f5f5f7', accent: '#6366f1', card: '#FFFFFF' },
  Sidebar: IndigoGlassSidebar as any, Header: IndigoGlassHeader as any,
  tokens: {
    bg: '#f5f5f7', surface: '#FFFFFF', surface2: '#f1f5f9',
    text: '#0f172a', textSecondary: '#64748b', muted: '#94a3b8',
    border: '#e2e8f0', accent: '#6366f1', accentHover: '#4f46e5', accentText: '#FFFFFF',
    sidebarBg: '#0f0f1a', sidebarText: '#94a3b8', sidebarActive: 'rgba(99,102,241,0.12)',
    sidebarAccent: '#6366f1', sidebarBorder: 'rgba(255,255,255,0.06)', sidebarWidth: '72px',
    success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#06b6d4',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(0,0,0,0.04)', shadowLg: '0 8px 24px rgba(0,0,0,0.06)',
  },
  components: { Card: IndigoGlassCard, Badge: IndigoGlassBadge, Button: IndigoGlassButton, Table: IndigoGlassTable, StatCard: IndigoGlassStatCard },
  fonts: lightFonts, animations: baseAnims,
};

// ── 3. Teal Noir ───────────────────────────────────────────────
const tealNoirTheme: AdminUITheme = {
  id: 'teal-noir', name: 'Teal Noir', mode: 'dark',
  description: 'Modo oscuro elegante con acentos teal. Orientado a analytics y datos.',
  preview: { sidebar: '#111114', bg: '#08080A', accent: '#14B8A6', card: '#111114' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#08080A', surface: '#111114', surface2: '#1A1A1F',
    text: '#E8E8EC', textSecondary: '#9999A5', muted: '#6B6B78',
    border: '#222228', accent: '#14B8A6', accentHover: '#0D9488', accentText: '#08080A',
    sidebarBg: '#111114', sidebarText: '#E8E8EC', sidebarActive: 'rgba(20,184,166,0.12)',
    sidebarAccent: '#14B8A6', sidebarBorder: '#222228', sidebarWidth: '260px',
    success: '#16A34A', error: '#ef4444', warning: '#f59e0b', info: '#6366f1',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(0,0,0,0.3)', shadowLg: '0 8px 24px rgba(0,0,0,0.4)',
  },
  components: darkComps, fonts: darkFonts, animations: baseAnims,
};

// ── 4. Coral Forge ─────────────────────────────────────────────
const coralForgeTheme: AdminUITheme = {
  id: 'coral-forge', name: 'Coral Forge', mode: 'dark',
  description: 'Modo oscuro con toques cálidos de coral y naranja. Escala de color completa.',
  preview: { sidebar: '#0F1114', bg: '#08090B', accent: '#F97316', card: '#0F1114' },
  Sidebar: CoralForgeSidebar as any, Header: CoralForgeHeader as any,
  tokens: {
    bg: '#08090B', surface: '#0F1114', surface2: '#161A1F',
    text: '#E8ECF0', textSecondary: '#9BA5B0', muted: '#6B7A85',
    border: '#1A2228', accent: '#F97316', accentHover: '#FB923C', accentText: '#FFFFFF',
    sidebarBg: '#0F1114', sidebarText: '#E8ECF0', sidebarActive: 'rgba(249,115,22,0.12)',
    sidebarAccent: '#F97316', sidebarBorder: '#1A2228', sidebarWidth: '72px',
    success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(0,0,0,0.3)', shadowLg: '0 8px 24px rgba(0,0,0,0.4)',
  },
  components: coralComps, fonts: darkFonts, animations: baseAnims,
};

// ── 5. Sage Command ────────────────────────────────────────────
const sageCommandTheme: AdminUITheme = {
  id: 'sage-command', name: 'Sage Command', mode: 'dark',
  description: 'Diseño oscuro limpio con keyboard shortcuts, spotlight search y paneles modulares.',
  preview: { sidebar: '#111114', bg: '#08080A', accent: '#14B8A6', card: '#111114' },
  Sidebar: SageCommandSidebar as any, Header: SageCommandHeader as any,
  tokens: {
    bg: '#08080A', surface: '#111114', surface2: '#1A1A1F',
    text: '#E8E8EC', textSecondary: '#9999A5', muted: '#6B6B78',
    border: '#222228', accent: '#14B8A6', accentHover: '#0D9488', accentText: '#08080A',
    sidebarBg: '#111114', sidebarText: '#E8E8EC', sidebarActive: 'rgba(20,184,166,0.12)',
    sidebarAccent: '#14B8A6', sidebarBorder: '#222228', sidebarWidth: '240px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(0,0,0,0.3)', shadowLg: '0 8px 24px rgba(0,0,0,0.4)',
  },
  components: { Card: SageCard, Badge: SageBadge, Button: SageButton, Table: SageTable, StatCard: SageStatCard },
  fonts: darkFonts, animations: baseAnims,
};

// ════════════════════════════════════════════════════════════════
// NUEVOS TEMAS — Token-only (usan Sidebar/Header del default/dark)
// ════════════════════════════════════════════════════════════════

// ── 6. Obsidian Pro — Dark premium, violeta profundo ──────────
const obsidianProTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'obsidian-pro', name: 'Obsidian Pro', mode: 'dark',
  description: 'Oscuro premium con violeta profundo. Ideal para tiendas de lujo.',
  preview: { sidebar: '#0D0D14', bg: '#07070E', accent: '#8B5CF6', card: '#0D0D14' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#07070E', surface: '#0D0D14', surface2: '#13131E',
    text: '#EEEEF8', textSecondary: '#9898B4', muted: '#5C5C7A',
    border: '#1C1C2E', accent: '#8B5CF6', accentHover: '#7C3AED', accentText: '#FFFFFF',
    sidebarBg: '#0D0D14', sidebarText: '#EEEEF8', sidebarActive: 'rgba(139,92,246,0.12)',
    sidebarAccent: '#8B5CF6', sidebarBorder: '#1C1C2E', sidebarWidth: '260px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#6366F1',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(0,0,0,0.5)', shadowLg: '0 8px 28px rgba(0,0,0,0.6)',
  },
  components: darkComps, fonts: darkFonts, animations: baseAnims,
};

// ── 7. Arctic Light — Nórdico único con Sidebar+Header propios ─
const arcticComps = { Card: ArcticCard, Badge: ArcticBadge, Button: ArcticButton, Table: ArcticTable, StatCard: ArcticStatCard };
const arcticFonts = { heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" };
const arcticLightTheme: AdminUITheme = {
  id: 'arctic-light', name: 'Arctic Light', mode: 'light',
  description: 'Nórdico ultra-limpio. Barra lateral con indicador izquierdo, tipografía Plus Jakarta Sans, máxima claridad.',
  preview: { sidebar: '#F0F4F8', bg: '#F8FAFC', accent: '#38BDF8', card: '#FFFFFF' },
  Sidebar: ArcticLightSidebar as any, Header: ArcticLightHeader as any,
  tokens: {
    bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F0F4F8',
    text: '#0C1A2E', textSecondary: '#4A6080', muted: '#94A3B8',
    border: '#DDE5EF', accent: '#38BDF8', accentHover: '#0EA5E9', accentText: '#FFFFFF',
    sidebarBg: '#F0F4F8', sidebarText: '#0C1A2E', sidebarActive: 'rgba(56,189,248,0.1)',
    sidebarAccent: '#38BDF8', sidebarBorder: '#DDE5EF', sidebarWidth: '248px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#6366F1',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(12,26,46,0.06)', shadowLg: '0 4px 16px rgba(12,26,46,0.08)',
  },
  components: arcticComps, fonts: arcticFonts, animations: baseAnims,
};

// ── 8. Midnight Rose — Oscuro con rosa vibrante ───────────────
const midnightRoseTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'midnight-rose', name: 'Midnight Rose', mode: 'dark',
  description: 'Oscuro profundo con acentos rosa vibrante. Dinámico y moderno.',
  preview: { sidebar: '#120D18', bg: '#09060D', accent: '#EC4899', card: '#120D18' },
  Sidebar: CoralForgeSidebar as any, Header: CoralForgeHeader as any,
  tokens: {
    bg: '#09060D', surface: '#120D18', surface2: '#18101F',
    text: '#F0ECF8', textSecondary: '#A090B8', muted: '#6A5878',
    border: '#221530', accent: '#EC4899', accentHover: '#DB2777', accentText: '#FFFFFF',
    sidebarBg: '#120D18', sidebarText: '#F0ECF8', sidebarActive: 'rgba(236,72,153,0.12)',
    sidebarAccent: '#EC4899', sidebarBorder: '#221530', sidebarWidth: '72px',
    success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#818CF8',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(0,0,0,0.5)', shadowLg: '0 8px 28px rgba(0,0,0,0.6)',
  },
  components: coralComps, fonts: darkFonts, animations: baseAnims,
};

// ── 9. Forest Ink — Verde bosque oscuro ───────────────────────
const forestInkTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'forest-ink', name: 'Forest Ink', mode: 'dark',
  description: 'Verde bosque profundo con tintas verdes vivas. Natural y sofisticado.',
  preview: { sidebar: '#0A1A0F', bg: '#070E09', accent: '#22C55E', card: '#0A1A0F' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#070E09', surface: '#0A1A0F', surface2: '#102015',
    text: '#E8F5EC', textSecondary: '#88B896', muted: '#4E7A5C',
    border: '#163320', accent: '#22C55E', accentHover: '#16A34A', accentText: '#07150A',
    sidebarBg: '#0A1A0F', sidebarText: '#E8F5EC', sidebarActive: 'rgba(34,197,94,0.12)',
    sidebarAccent: '#22C55E', sidebarBorder: '#163320', sidebarWidth: '260px',
    success: '#16A34A', error: '#EF4444', warning: '#F59E0B', info: '#38BDF8',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(0,0,0,0.4)', shadowLg: '0 8px 24px rgba(0,0,0,0.5)',
  },
  components: darkComps, fonts: darkFonts, animations: baseAnims,
};

// ── 10. Sand Dune — Beige arena premium ───────────────────────
const sandDuneTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'sand-dune', name: 'Sand Dune', mode: 'light',
  description: 'Paleta arena suave con acentos terracota. Elegante y cálido.',
  preview: { sidebar: '#3D2E1E', bg: '#FDFAF6', accent: '#C2410C', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FDFAF6', surface: '#FFFFFF', surface2: '#F5EFE6',
    text: '#2C1A0E', textSecondary: '#7A5C40', muted: '#B89876',
    border: '#E8DDD0', accent: '#C2410C', accentHover: '#9A3412', accentText: '#FFFFFF',
    sidebarBg: '#3D2E1E', sidebarText: '#EDE0D0', sidebarActive: 'rgba(194,65,12,0.14)',
    sidebarAccent: '#C2410C', sidebarBorder: 'rgba(255,255,255,0.08)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(60,30,10,0.07)', shadowLg: '0 4px 14px rgba(60,30,10,0.09)',
  },
  components: defaultComps, fonts: serifFonts, animations: baseAnims,
};

// ── 11. Neon Terminal — Dark hacker / developer ───────────────
const neonTerminalTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'neon-terminal', name: 'Neon Terminal', mode: 'dark',
  description: 'Oscuro con verde neón terminal. Para devs y power users.',
  preview: { sidebar: '#080C08', bg: '#050805', accent: '#39FF14', card: '#080C08' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#050805', surface: '#080C08', surface2: '#0C1209',
    text: '#C8F7C0', textSecondary: '#6EA864', muted: '#3D6635',
    border: '#142210', accent: '#39FF14', accentHover: '#2DE010', accentText: '#020A00',
    sidebarBg: '#080C08', sidebarText: '#C8F7C0', sidebarActive: 'rgba(57,255,20,0.10)',
    sidebarAccent: '#39FF14', sidebarBorder: '#142210', sidebarWidth: '260px',
    success: '#22C55E', error: '#FF3B3B', warning: '#FFD700', info: '#00E5FF',
    cardRadius: '6px', buttonRadius: '4px', inputRadius: '4px',
    shadow: '0 0 8px rgba(57,255,20,0.08)', shadowLg: '0 0 24px rgba(57,255,20,0.12)',
  },
  components: darkComps, fonts: { heading: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace", mono: "'JetBrains Mono', monospace" },
  animations: baseAnims,
};

// ── 12. Lavender Cloud — Suave púrpura pastel ─────────────────
const lavenderCloudTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'lavender-cloud', name: 'Lavender Cloud', mode: 'light',
  description: 'Lavanda pastel suave con acentos violeta. Fresco y creativo.',
  preview: { sidebar: '#2D1F5E', bg: '#F8F7FF', accent: '#7C3AED', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#F8F7FF', surface: '#FFFFFF', surface2: '#F0EDFF',
    text: '#1E1040', textSecondary: '#6B5B9E', muted: '#A898D0',
    border: '#E4DDFF', accent: '#7C3AED', accentHover: '#6D28D9', accentText: '#FFFFFF',
    sidebarBg: '#2D1F5E', sidebarText: '#DDD8FF', sidebarActive: 'rgba(124,58,237,0.14)',
    sidebarAccent: '#A78BFA', sidebarBorder: 'rgba(255,255,255,0.08)', sidebarWidth: '260px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#0EA5E9',
    cardRadius: '14px', buttonRadius: '10px', inputRadius: '10px',
    shadow: '0 1px 3px rgba(100,80,200,0.07)', shadowLg: '0 6px 18px rgba(100,80,200,0.10)',
  },
  components: defaultComps, fonts: lightFonts, animations: baseAnims,
};

// ── 13. Amber Studio — Dorado cálido estudio creativo ─────────
const amberStudioTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'amber-studio', name: 'Amber Studio', mode: 'light',
  description: 'Ámbar y dorado cálido para marcas creativas artesanales.',
  preview: { sidebar: '#1A1200', bg: '#FFFCF0', accent: '#D97706', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FFFCF0', surface: '#FFFFFF', surface2: '#FEF9E7',
    text: '#1A1200', textSecondary: '#7A6010', muted: '#C49A28',
    border: '#F0E0A0', accent: '#D97706', accentHover: '#B45309', accentText: '#FFFFFF',
    sidebarBg: '#1A1200', sidebarText: '#F5E090', sidebarActive: 'rgba(217,119,6,0.14)',
    sidebarAccent: '#F59E0B', sidebarBorder: 'rgba(255,255,255,0.07)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(100,60,0,0.07)', shadowLg: '0 4px 14px rgba(100,60,0,0.10)',
  },
  components: defaultComps, fonts: serifFonts, animations: baseAnims,
};

// ── 14. Carbon Steel — Gris industrial oscuro ─────────────────
const carbonSteelTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'carbon-steel', name: 'Carbon Steel', mode: 'dark',
  description: 'Gris carbono industrial con acentos acero azulado. Robusto y preciso.',
  preview: { sidebar: '#141618', bg: '#0E1012', accent: '#64748B', card: '#141618' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#0E1012', surface: '#141618', surface2: '#1C1F22',
    text: '#E4E8EC', textSecondary: '#8C9BAA', muted: '#546070',
    border: '#242A30', accent: '#64748B', accentHover: '#475569', accentText: '#FFFFFF',
    sidebarBg: '#141618', sidebarText: '#E4E8EC', sidebarActive: 'rgba(100,116,139,0.14)',
    sidebarAccent: '#94A3B8', sidebarBorder: '#242A30', sidebarWidth: '260px',
    success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#38BDF8',
    cardRadius: '8px', buttonRadius: '6px', inputRadius: '6px',
    shadow: '0 1px 3px rgba(0,0,0,0.4)', shadowLg: '0 8px 24px rgba(0,0,0,0.5)',
  },
  components: darkComps, fonts: lightFonts, animations: baseAnims,
};

// ── 15. Sakura — Rosa japonés suave ───────────────────────────
const sakuraTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'sakura', name: 'Sakura', mode: 'light',
  description: 'Rosa sakura suave inspirado en el diseño japonés. Delicado y refinado.',
  preview: { sidebar: '#2D1420', bg: '#FFF7F9', accent: '#F43F5E', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FFF7F9', surface: '#FFFFFF', surface2: '#FFF0F3',
    text: '#2D1420', textSecondary: '#8B4560', muted: '#C490A0',
    border: '#FFD6E0', accent: '#F43F5E', accentHover: '#E11D48', accentText: '#FFFFFF',
    sidebarBg: '#2D1420', sidebarText: '#FFD6E0', sidebarActive: 'rgba(244,63,94,0.12)',
    sidebarAccent: '#FB7185', sidebarBorder: 'rgba(255,255,255,0.08)', sidebarWidth: '260px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#0EA5E9',
    cardRadius: '16px', buttonRadius: '12px', inputRadius: '12px',
    shadow: '0 1px 3px rgba(200,80,100,0.07)', shadowLg: '0 6px 18px rgba(200,80,100,0.10)',
  },
  components: defaultComps, fonts: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  animations: baseAnims,
};

// ── 16. Deep Ocean — Azul marino profundo ─────────────────────
const deepOceanTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'deep-ocean', name: 'Deep Ocean', mode: 'dark',
  description: 'Azul océano profundo con destellos cyan. Sereno y profesional.',
  preview: { sidebar: '#071428', bg: '#040D1C', accent: '#06B6D4', card: '#071428' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#040D1C', surface: '#071428', surface2: '#0A1D38',
    text: '#E0F0FF', textSecondary: '#7AACCC', muted: '#3A6888',
    border: '#0F2844', accent: '#06B6D4', accentHover: '#0891B2', accentText: '#020A14',
    sidebarBg: '#071428', sidebarText: '#E0F0FF', sidebarActive: 'rgba(6,182,212,0.12)',
    sidebarAccent: '#06B6D4', sidebarBorder: '#0F2844', sidebarWidth: '260px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#818CF8',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(0,20,50,0.5)', shadowLg: '0 8px 28px rgba(0,20,50,0.6)',
  },
  components: darkComps, fonts: darkFonts, animations: baseAnims,
};

// ── 17. Cream Linen — Crema y lino artesanal ─────────────────
const creamLinenTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'cream-linen', name: 'Cream Linen', mode: 'light',
  description: 'Crema y lino cálido. Perfecto para marcas artesanales y boutique.',
  preview: { sidebar: '#2A2018', bg: '#FAFAF5', accent: '#78716C', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FAFAF5', surface: '#FFFFFF', surface2: '#F5F3EE',
    text: '#1C1C18', textSecondary: '#6B6860', muted: '#A8A49C',
    border: '#E8E4DC', accent: '#78716C', accentHover: '#57534E', accentText: '#FFFFFF',
    sidebarBg: '#2A2018', sidebarText: '#E8E2D8', sidebarActive: 'rgba(120,113,108,0.14)',
    sidebarAccent: '#A8A29E', sidebarBorder: 'rgba(255,255,255,0.07)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '10px', buttonRadius: '6px', inputRadius: '6px',
    shadow: '0 1px 2px rgba(40,30,20,0.06)', shadowLg: '0 4px 12px rgba(40,30,20,0.08)',
  },
  components: defaultComps, fonts: serifFonts, animations: baseAnims,
};

// ── 18. Gunmetal — Gris oscuro metálico elegante ─────────────
const gunmetalTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'gunmetal', name: 'Gunmetal', mode: 'dark',
  description: 'Gris metálico elegante con acentos platino. Sobrio y premium.',
  preview: { sidebar: '#141414', bg: '#0C0C0C', accent: '#A0A0A8', card: '#141414' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#0C0C0C', surface: '#141414', surface2: '#1A1A1A',
    text: '#EFEFEF', textSecondary: '#9A9A9A', muted: '#5A5A5A',
    border: '#262626', accent: '#A0A0A8', accentHover: '#C0C0CC', accentText: '#0C0C0C',
    sidebarBg: '#141414', sidebarText: '#EFEFEF', sidebarActive: 'rgba(160,160,168,0.12)',
    sidebarAccent: '#C8C8D0', sidebarBorder: '#262626', sidebarWidth: '260px',
    success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#60A5FA',
    cardRadius: '8px', buttonRadius: '6px', inputRadius: '6px',
    shadow: '0 1px 3px rgba(0,0,0,0.5)', shadowLg: '0 8px 28px rgba(0,0,0,0.65)',
  },
  components: darkComps, fonts: lightFonts, animations: baseAnims,
};

// ── 19. Citrus Burst — Naranja y lima vibrante ────────────────
const citrusBurstTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'citrus-burst', name: 'Citrus Burst', mode: 'light',
  description: 'Naranja citrus con lima vivo. Energético para marcas jóvenes.',
  preview: { sidebar: '#1A1200', bg: '#FFFCF5', accent: '#EA580C', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FFFCF5', surface: '#FFFFFF', surface2: '#FFF7ED',
    text: '#1A1000', textSecondary: '#7A4010', muted: '#C08050',
    border: '#FFE5C0', accent: '#EA580C', accentHover: '#C2410C', accentText: '#FFFFFF',
    sidebarBg: '#1A1200', sidebarText: '#FFE8C0', sidebarActive: 'rgba(234,88,12,0.14)',
    sidebarAccent: '#FB923C', sidebarBorder: 'rgba(255,255,255,0.07)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#0EA5E9',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 3px rgba(100,40,0,0.07)', shadowLg: '0 4px 14px rgba(100,40,0,0.10)',
  },
  components: defaultComps, fonts: lightFonts, animations: baseAnims,
};

// ── 20. Plum Velvet — Ciruela oscuro suntuoso ─────────────────
const plumVelvetTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'plum-velvet', name: 'Plum Velvet', mode: 'dark',
  description: 'Ciruela y vino oscuro con acentos oro viejo. Lujoso y suntuoso.',
  preview: { sidebar: '#1A0D1A', bg: '#100810', accent: '#C084FC', card: '#1A0D1A' },
  Sidebar: TealNoirSidebar as any, Header: TealNoirHeader as any,
  tokens: {
    bg: '#100810', surface: '#1A0D1A', surface2: '#221025',
    text: '#F0E8F8', textSecondary: '#A888C0', muted: '#6A4878',
    border: '#301840', accent: '#C084FC', accentHover: '#A855F7', accentText: '#100810',
    sidebarBg: '#1A0D1A', sidebarText: '#F0E8F8', sidebarActive: 'rgba(192,132,252,0.12)',
    sidebarAccent: '#D8B4FE', sidebarBorder: '#301840', sidebarWidth: '260px',
    success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#818CF8',
    cardRadius: '12px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(30,0,40,0.5)', shadowLg: '0 8px 28px rgba(30,0,40,0.65)',
  },
  components: darkComps, fonts: serifFonts, animations: baseAnims,
};

// ── 21. Slate Minimal — Gris pizarra ultra-limpio ─────────────
const slateMinimalTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'slate-minimal', name: 'Slate Minimal', mode: 'light',
  description: 'Pizarra gris ultra-limpio. Minimalismo funcional sin distracciones.',
  preview: { sidebar: '#1E293B', bg: '#F8FAFC', accent: '#334155', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9',
    text: '#0F172A', textSecondary: '#475569', muted: '#94A3B8',
    border: '#E2E8F0', accent: '#334155', accentHover: '#1E293B', accentText: '#FFFFFF',
    sidebarBg: '#1E293B', sidebarText: '#CBD5E1', sidebarActive: 'rgba(51,65,85,0.14)',
    sidebarAccent: '#64748B', sidebarBorder: 'rgba(255,255,255,0.07)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '8px', buttonRadius: '6px', inputRadius: '6px',
    shadow: '0 1px 2px rgba(0,0,0,0.04)', shadowLg: '0 4px 12px rgba(0,0,0,0.07)',
  },
  components: defaultComps, fonts: lightFonts, animations: baseAnims,
};

// ── 22. Volcano — Rojo lava oscuro intenso ────────────────────
const volcanoTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'volcano', name: 'Volcano', mode: 'dark',
  description: 'Rojo lava y naranja intenso oscuro. Apasionado y de alto contraste.',
  preview: { sidebar: '#140808', bg: '#0A0404', accent: '#EF4444', card: '#140808' },
  Sidebar: CoralForgeSidebar as any, Header: CoralForgeHeader as any,
  tokens: {
    bg: '#0A0404', surface: '#140808', surface2: '#1C0A0A',
    text: '#FCEAEA', textSecondary: '#B87878', muted: '#6B3A3A',
    border: '#2A1010', accent: '#EF4444', accentHover: '#DC2626', accentText: '#FFFFFF',
    sidebarBg: '#140808', sidebarText: '#FCEAEA', sidebarActive: 'rgba(239,68,68,0.12)',
    sidebarAccent: '#F87171', sidebarBorder: '#2A1010', sidebarWidth: '72px',
    success: '#22C55E', error: '#EF4444', warning: '#F97316', info: '#38BDF8',
    cardRadius: '10px', buttonRadius: '8px', inputRadius: '8px',
    shadow: '0 1px 4px rgba(60,0,0,0.5)', shadowLg: '0 8px 28px rgba(80,0,0,0.6)',
  },
  components: coralComps, fonts: darkFonts, animations: baseAnims,
};

// ── 23. Ivory Serif — Marfil editorial serif ─────────────────
const ivorySerifTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'ivory-serif', name: 'Ivory Serif', mode: 'light',
  description: 'Marfil editorial con tipografía serif clásica. Premium y atemporal.',
  preview: { sidebar: '#1A1410', bg: '#FDFCF9', accent: '#92400E', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any, Header: DefaultHeader as any,
  tokens: {
    bg: '#FDFCF9', surface: '#FFFFFF', surface2: '#F9F7F2',
    text: '#1A1410', textSecondary: '#6B5B40', muted: '#B8A898',
    border: '#EAE4D8', accent: '#92400E', accentHover: '#78350F', accentText: '#FFFFFF',
    sidebarBg: '#1A1410', sidebarText: '#EAE0D0', sidebarActive: 'rgba(146,64,14,0.14)',
    sidebarAccent: '#B45309', sidebarBorder: 'rgba(255,255,255,0.07)', sidebarWidth: '260px',
    success: '#16A34A', error: '#DC2626', warning: '#D97706', info: '#2563EB',
    cardRadius: '10px', buttonRadius: '6px', inputRadius: '6px',
    shadow: '0 1px 3px rgba(30,20,10,0.06)', shadowLg: '0 4px 14px rgba(30,20,10,0.09)',
  },
  components: defaultComps, fonts: serifFonts, animations: baseAnims,
};

// ── 24. Cyberpunk Neon — Cyan y magenta futurista ────────────
const cyberpunkNeonTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'cyberpunk-neon', name: 'Cyberpunk Neon', mode: 'dark',
  description: 'Cyan y magenta futurista. Para marcas tech y digitales de vanguardia.',
  preview: { sidebar: '#09040E', bg: '#050208', accent: '#00FFFF', card: '#09040E' },
  Sidebar: CoralForgeSidebar as any, Header: CoralForgeHeader as any,
  tokens: {
    bg: '#050208', surface: '#09040E', surface2: '#0E0616',
    text: '#E0F8FF', textSecondary: '#80C8E0', muted: '#3A6878',
    border: '#140830', accent: '#00FFFF', accentHover: '#00E0E0', accentText: '#050208',
    sidebarBg: '#09040E', sidebarText: '#E0F8FF', sidebarActive: 'rgba(0,255,255,0.10)',
    sidebarAccent: '#00FFFF', sidebarBorder: '#140830', sidebarWidth: '72px',
    success: '#39FF14', error: '#FF2D55', warning: '#FFD700', info: '#00FFFF',
    cardRadius: '6px', buttonRadius: '4px', inputRadius: '4px',
    shadow: '0 0 10px rgba(0,255,255,0.08)', shadowLg: '0 0 30px rgba(0,255,255,0.14)',
  },
  components: coralComps, fonts: { heading: "'Sora', sans-serif", body: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
  animations: baseAnims,
};

// ════════════════════════════════════════════════════════════════
// Theme Registry — 24 temas totales
// ════════════════════════════════════════════════════════════════
export const adminThemes: Record<string, AdminUITheme> = {
  // Originales
  'dsd-classic':    defaultTheme,
  'indigo-glass':   indigoGlassTheme,
  'teal-noir':      tealNoirTheme,
  'coral-forge':    coralForgeTheme,
  'sage-command':   sageCommandTheme,
  // Nuevos — dark
  'obsidian-pro':   obsidianProTheme,
  'midnight-rose':  midnightRoseTheme,
  'forest-ink':     forestInkTheme,
  'neon-terminal':  neonTerminalTheme,
  'carbon-steel':   carbonSteelTheme,
  'deep-ocean':     deepOceanTheme,
  'gunmetal':       gunmetalTheme,
  'plum-velvet':    plumVelvetTheme,
  'volcano':        volcanoTheme,
  'cyberpunk-neon': cyberpunkNeonTheme,
  // Nuevos — light
  'arctic-light':   arcticLightTheme,
  'sand-dune':      sandDuneTheme,
  'lavender-cloud': lavenderCloudTheme,
  'amber-studio':   amberStudioTheme,
  'sakura':         sakuraTheme,
  'cream-linen':    creamLinenTheme,
  'citrus-burst':   citrusBurstTheme,
  'slate-minimal':  slateMinimalTheme,
  'ivory-serif':    ivorySerifTheme,
};

export const getTheme = (id: string): AdminUITheme => adminThemes[id] || defaultTheme;
export const allThemes = Object.values(adminThemes);
