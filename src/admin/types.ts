// ═══════════════════════════════════════════════════════════════
// Admin Theme Types — Defines the shape of a UI theme
// ═══════════════════════════════════════════════════════════════

import type { LucideIcon } from 'lucide-react';
import type { AdminPage, NavGroup } from '@/src/admin/navigation';

// Props that layout components receive
export interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export interface AdminHeaderProps {
  period: any;
  onPeriodChange: (p: any) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

// Design tokens that themes can override
export interface AdminDesignTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textSecondary: string;
  muted: string;
  border: string;
  accent: string;
  accentHover: string;
  accentText: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarAccent: string;
  sidebarBorder: string;
  sidebarWidth: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  cardRadius: string;
  buttonRadius: string;
  inputRadius: string;
  shadow: string;
  shadowLg: string;
}

// Animation tokens
export interface AdminAnimationTokens {
  pageTransition: { initial: object; animate: object; exit: object; transition: object };
  sidebarExpand: string;
  cardHover: string;
  modalEnter: string;
}

// Theme UI components that can be overridden
export interface AdminThemeComponents {
  Card?: React.ComponentType<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }>;
  Badge?: React.ComponentType<{ text: string; variant?: string; className?: string }>;
  Button?: React.ComponentType<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }>;
  Table?: React.ComponentType<{ children: React.ReactNode; className?: string }>;
  StatCard?: React.ComponentType<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }>;
}

// A complete admin UI theme
export interface AdminUITheme {
  id: string;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  preview: { sidebar: string; bg: string; accent: string; card: string };

  // Component overrides — themes provide their own implementations
  Sidebar: React.ComponentType<AdminSidebarProps>;
  Header: React.ComponentType<AdminHeaderProps>;
  Layout?: React.ComponentType<AdminLayoutProps>;

  // UI component overrides (optional — defaults to default theme components)
  components?: AdminThemeComponents;

  // Design tokens
  tokens: AdminDesignTokens;
  fonts: { heading: string; body: string; mono: string };

  // Icon overrides (optional — defaults to lucide icons from navigation.ts)
  icons?: Partial<Record<AdminPage, LucideIcon>>;

  // Animation tokens (optional)
  animations?: Partial<AdminAnimationTokens>;

  // CSS stylesheet path (optional)
  stylesheet?: string;
}
