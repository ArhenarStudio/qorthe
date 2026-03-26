// ═══════════════════════════════════════════════════════════════
// nintendo-retro/index.ts — Tema Nintendo Retro para Komerzly OS
// Inspirado en Mario Bros, paleta Nintendo, estilo pixel-art
// ═══════════════════════════════════════════════════════════════

import type { AdminUITheme } from '@/src/admin/types';
import NintendoSidebar from './Sidebar';
import NintendoHeader from './Header';
import { NintendoCard, NintendoBadge, NintendoButton, NintendoTable, NintendoStatCard } from './components';

const nintendoRetroTheme: AdminUITheme = {
  id: 'nintendo-retro',
  name: 'Nintendo Retro',
  description: 'Pixel-art retro gaming con paleta Nintendo y Mario Bros. Apps como cartuchos, ventanas con chrome NES.',
  mode: 'dark',
  layout: 'os-panel',
  preview: { sidebar: '#1A1A2E', bg: '#0D0D1A', accent: '#E52521', card: '#1A1A2E' },

  Sidebar: NintendoSidebar,
  Header: NintendoHeader,
  components: {
    Card: NintendoCard,
    Badge: NintendoBadge,
    Button: NintendoButton,
    Table: NintendoTable,
    StatCard: NintendoStatCard,
  },

  tokens: {
    // Fondos
    bg:             '#0D0D1A',
    surface:        '#1A1A2E',
    surface2:       '#16213E',
    surface3:       '#12121F',

    // Texto
    text:           '#F8F8F8',
    textSecondary:  '#A0A0C0',
    muted:          '#4A4A7A',

    // Bordes y sombras
    border:         '#2D2D5E',
    borderStrong:   '#4A4A8A',
    shadow:         '3px 3px 0px #000',
    shadowLg:       '6px 6px 0px #000',

    // Acento: Rojo Nintendo / Mario
    accent:         '#E52521',
    accentHover:    '#FF3B38',
    accentSubtle:   '#3D0A09',
    accentText:     '#FFFFFF',

    // Sidebar (no se usa en os-panel, pero requerido por el tipo)
    sidebarBg:      '#1A1A2E',
    sidebarText:    '#F8F8F8',
    sidebarTextMuted: '#A0A0C0',
    sidebarActive:  '#E52521',
    sidebarActiveText: '#FF6B6B',
    sidebarHover:   'rgba(229,37,33,0.1)',
    sidebarAccent:  '#E52521',
    sidebarBorder:  '#2D2D5E',
    sidebarWidth:   '0px',

    // Header (no se usa en os-panel)
    headerBg:       '#1A1A2E',
    headerBorder:   '#2D2D5E',
    headerText:     '#F8F8F8',

    // Estados semánticos
    success:        '#4CAF50',
    successSubtle:  '#0A2E0C',
    error:          '#E52521',
    errorSubtle:    '#3D0A09',
    warning:        '#FFD700',
    warningSubtle:  '#2E2500',
    info:           '#4FC3F7',
    infoSubtle:     '#0A1F2E',

    // Radios pixel-art
    cardRadius:     '4px',
    buttonRadius:   '4px',
    inputRadius:    '4px',
    badgeRadius:    '2px',

    // Tipografía
    fontBody:       "'Press Start 2P', 'DM Sans', monospace",
    fontHeading:    "'Press Start 2P', 'Sora', monospace",
    fontMono:       "'Press Start 2P', 'JetBrains Mono', monospace",
    fontSizeBase:   '11px',
  },
  fonts: {
    heading: "'Press Start 2P', monospace",
    body:    "'Press Start 2P', monospace",
    mono:    "'Press Start 2P', 'JetBrains Mono', monospace",
  },
};

export default nintendoRetroTheme;
