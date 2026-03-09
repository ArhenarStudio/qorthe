// ═══════════════════════════════════════════════════════════════
// Admin Theme Registry — Maps theme IDs to full UI theme objects
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

// Theme component imports
import { DefaultCard, DefaultBadge, DefaultButton, DefaultTable, DefaultStatCard } from './default/components';
import { IndigoGlassCard, IndigoGlassBadge, IndigoGlassButton, IndigoGlassTable, IndigoGlassStatCard } from './indigo-glass/components';
import { TealNoirCard, TealNoirBadge, TealNoirButton, TealNoirTable, TealNoirStatCard } from './teal-noir/components';
import { CoralForgeCard, CoralForgeBadge, CoralForgeButton, CoralForgeTable, CoralForgeStatCard } from './coral-forge/components';
import { SageCard, SageBadge, SageButton, SageTable, SageStatCard } from './sage-command/components';

// Default theme — current DSD Classic
const defaultTheme: AdminUITheme = {
  id: 'dsd-classic',
  name: 'DSD Classic',
  description: 'El tema original de DavidSon\'s Design. Tonos cálidos de madera con acentos dorados.',
  mode: 'light',
  preview: { sidebar: '#2d2419', bg: '#FAF8F5', accent: '#C5A065', card: '#FFFFFF' },
  Sidebar: DefaultSidebar as any,
  Header: DefaultHeader as any,
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
  components: { Card: DefaultCard, Badge: DefaultBadge, Button: DefaultButton, Table: DefaultTable, StatCard: DefaultStatCard },
  fonts: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  animations: {
    pageTransition: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.2 },
    },
    sidebarExpand: 'transition-all duration-200',
    cardHover: 'hover:shadow-md transition-shadow',
    modalEnter: 'transition-all duration-200',
  },
};

// Indigo Glass
const indigoGlassTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'indigo-glass',
  Sidebar: IndigoGlassSidebar as any,
  Header: IndigoGlassHeader as any,
  name: 'Indigo Glass',
  description: 'Diseño luminoso con glassmorphism, sidebar rail compacto y acentos índigo.',
  mode: 'light',
  preview: { sidebar: '#0f0f1a', bg: '#f5f5f7', accent: '#6366f1', card: '#FFFFFF' },
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
  fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
};

// Teal Noir
const tealNoirTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'teal-noir',
  Sidebar: TealNoirSidebar as any,
  Header: TealNoirHeader as any,
  name: 'Teal Noir',
  description: 'Modo oscuro elegante con acentos teal. Orientado a analytics y datos.',
  mode: 'dark',
  preview: { sidebar: '#111114', bg: '#08080A', accent: '#14B8A6', card: '#111114' },
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
  components: { Card: TealNoirCard, Badge: TealNoirBadge, Button: TealNoirButton, Table: TealNoirTable, StatCard: TealNoirStatCard },
  fonts: { heading: "'Sora', sans-serif", body: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
};

// Coral Forge
const coralForgeTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'coral-forge',
  Sidebar: CoralForgeSidebar as any,
  Header: CoralForgeHeader as any,
  name: 'Coral Forge',
  description: 'Modo oscuro con toques cálidos de coral y naranja. Escala de color completa.',
  mode: 'dark',
  preview: { sidebar: '#0F1114', bg: '#08090B', accent: '#F97316', card: '#0F1114' },
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
  components: { Card: CoralForgeCard, Badge: CoralForgeBadge, Button: CoralForgeButton, Table: CoralForgeTable, StatCard: CoralForgeStatCard },
  fonts: { heading: "'Sora', sans-serif", body: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
};

// Sage Command
const sageCommandTheme: AdminUITheme = {
  ...defaultTheme,
  id: 'sage-command',
  Sidebar: SageCommandSidebar as any,
  Header: SageCommandHeader as any,
  name: 'Sage Command',
  description: 'Diseño oscuro limpio con keyboard shortcuts, spotlight search y paneles modulares.',
  mode: 'dark',
  preview: { sidebar: '#111114', bg: '#08080A', accent: '#14B8A6', card: '#111114' },
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
  fonts: { heading: "'Sora', sans-serif", body: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
};

// Theme registry
export const adminThemes: Record<string, AdminUITheme> = {
  'dsd-classic': defaultTheme,
  'indigo-glass': indigoGlassTheme,
  'teal-noir': tealNoirTheme,
  'coral-forge': coralForgeTheme,
  'sage-command': sageCommandTheme,
};

export const getTheme = (id: string): AdminUITheme => adminThemes[id] || defaultTheme;
export const allThemes = Object.values(adminThemes);
