// ═══════════════════════════════════════════════════════════════
// src/admin/types.ts
// Komerzly — Tipos del sistema de temas admin
// Fuente única de verdad para tokens, componentes y layouts
// ═══════════════════════════════════════════════════════════════

import type { LucideIcon } from 'lucide-react';
import type { AdminPage, NavGroup } from '@/src/admin/navigation';

// ── Props de layout ────────────────────────────────────────────
export interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export interface AdminHeaderProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

// ── Design tokens completos ────────────────────────────────────
export interface AdminDesignTokens {
  // Fondos
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;

  // Texto
  text: string;
  textSecondary: string;
  muted: string;

  // Bordes y sombras
  border: string;
  borderStrong: string;
  shadow: string;
  shadowLg: string;

  // Acento
  accent: string;
  accentHover: string;
  accentSubtle: string;
  accentText: string;

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActive: string;
  sidebarActiveText: string;
  sidebarHover: string;
  sidebarAccent: string;
  sidebarBorder: string;
  sidebarWidth: string;

  // Header
  headerBg: string;
  headerBorder: string;
  headerText: string;

  // Estados semánticos
  success: string;
  successSubtle: string;
  error: string;
  errorSubtle: string;
  warning: string;
  warningSubtle: string;
  info: string;
  infoSubtle: string;

  // Radios
  cardRadius: string;
  buttonRadius: string;
  inputRadius: string;
  badgeRadius: string;

  // Tipografía
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  fontSizeBase: string;
}

// ── Componentes UI reemplazables por tema ──────────────────────
export interface AdminThemeComponents {
  Card?: React.ComponentType<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }>;
  Badge?: React.ComponentType<{ text: string; variant?: string; className?: string }>;
  Button?: React.ComponentType<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }>;
  Table?: React.ComponentType<{ children: React.ReactNode; className?: string }>;
  StatCard?: React.ComponentType<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }>;
}

// ── Tema completo ──────────────────────────────────────────────
export interface AdminUITheme {
  id: string;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  preview: { sidebar: string; bg: string; accent: string; card: string };

  /** Layout del shell: 'sidebar' = clásico vertical | 'os-panel' = menubar top + dock bottom */
  layout?: 'sidebar' | 'os-panel';

  // Layout components
  Sidebar: React.ComponentType<AdminSidebarProps>;
  Header: React.ComponentType<AdminHeaderProps>;

  // UI component overrides
  components?: AdminThemeComponents;

  // Tokens
  tokens: AdminDesignTokens;
  fonts: { heading: string; body: string; mono: string };

  // Overrides opcionales
  icons?: Partial<Record<AdminPage, LucideIcon>>;
}
