// ═══════════════════════════════════════════════════════════════
// Komerzly OS — Tema "komerzly-teal-dark"
// Template 01 de Komerzly
// Paleta: Sage Teal Dark (fuente: rocksage-os-v3.html)
// ═══════════════════════════════════════════════════════════════

import type { AdminUITheme } from '@/src/admin/types';
import RockSageOSSidebar from './Sidebar';
import { RockSageOSHeader } from './Header';
import { OSCard, OSBadge, OSButton, OSTable, OSStatCard } from './components';

export const komerzlyTealDarkTheme: AdminUITheme = {
  id: 'komerzly-teal-dark',
  name: 'Komerzly OS',
  mode: 'dark',
  layout: 'os-panel',
  description: 'Panel estilo OS dark con menubar superior y dock. Paleta Sage Teal. Template 01 de Komerzly.',
  preview: {
    sidebar: '#0D9488',
    bg: '#08090B',
    accent: '#0D9488',
    card: '#0F1114',
  },

  Sidebar: RockSageOSSidebar,
  Header: RockSageOSHeader,

  components: {
    Card: OSCard,
    Badge: OSBadge,
    Button: OSButton,
    Table: OSTable,
    StatCard: OSStatCard,
  },

  tokens: {
    // Fondos
    bg:       '#08090B',
    surface:  '#0F1114',
    surface2: '#161A1F',
    surface3: '#1A2228',

    // Texto
    text:          '#E8ECF0',
    textSecondary: '#6B7A85',
    muted:         '#3A4A52',

    // Bordes y sombras
    border:      '#1A2228',
    borderStrong: '#243038',
    shadow:      '0 1px 3px rgba(0,0,0,0.4)',
    shadowLg:    '0 8px 24px rgba(0,0,0,0.6)',

    // Acento — Teal primario
    accent:       '#0D9488',
    accentHover:  '#14B8A6',
    accentSubtle: 'rgba(13,148,136,0.12)',
    accentText:   '#FFFFFF',

    // Sidebar — el OS sidebar es el top menubar (colores para CSS vars)
    sidebarBg:         '#0F1114',
    sidebarText:       '#E8ECF0',
    sidebarTextMuted:  '#6B7A85',
    sidebarActive:     'rgba(13,148,136,0.15)',
    sidebarActiveText: '#2DD4BF',
    sidebarHover:      'rgba(255,255,255,0.04)',
    sidebarAccent:     '#0D9488',
    sidebarBorder:     '#1A2228',
    sidebarWidth:      '0px',   // OS layout: no hay sidebar lateral

    // Header
    headerBg:     '#0F1114',
    headerBorder: '#1A2228',
    headerText:   '#E8ECF0',

    // Estados semánticos
    success:       '#22C55E',
    successSubtle: 'rgba(34,197,94,0.12)',
    error:         '#EF4444',
    errorSubtle:   'rgba(239,68,68,0.12)',
    warning:       '#F59E0B',
    warningSubtle: 'rgba(245,158,11,0.12)',
    info:          '#3B82F6',
    infoSubtle:    'rgba(59,130,246,0.12)',

    // Radios
    cardRadius:   '12px',
    buttonRadius: '8px',
    inputRadius:  '8px',
    badgeRadius:  '100px',

    // Tipografía — usa variables CSS inyectadas por next/font en el root layout
    fontHeading:  "var(--font-sora), system-ui, sans-serif",
    fontBody:     "var(--font-dm-sans), system-ui, sans-serif",
    fontMono:     "var(--font-jetbrains), 'Fira Code', monospace",
    fontSizeBase: '13px',
  },

  fonts: {
    heading: "var(--font-sora), system-ui, sans-serif",
    body:    "var(--font-dm-sans), system-ui, sans-serif",
    mono:    "var(--font-jetbrains), 'Fira Code', monospace",
  },
};
