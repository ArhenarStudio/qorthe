// ═══════════════════════════════════════════════════════════════
// Admin Icon System — Themes can swap entire icon sets
// Default uses Lucide icons from navigation.ts
// ═══════════════════════════════════════════════════════════════

import type { LucideIcon } from 'lucide-react';
import type { AdminPage } from '@/src/admin/navigation';
import { adminIcons } from '@/src/admin/navigation';
import type { AdminUITheme } from '@/src/admin/types';

// Get icon for a page — checks theme overrides first, then falls back to defaults
export function getIcon(theme: AdminUITheme, page: AdminPage): LucideIcon {
  if (theme.icons && theme.icons[page]) {
    return theme.icons[page]!;
  }
  return adminIcons[page];
}

// Get all icons for current theme (merged with defaults)
export function getThemeIcons(theme: AdminUITheme): Record<AdminPage, LucideIcon> {
  return { ...adminIcons, ...(theme.icons || {}) };
}
