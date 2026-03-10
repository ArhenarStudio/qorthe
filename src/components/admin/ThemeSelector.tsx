"use client";
// ═══════════════════════════════════════════════════════════════
// src/components/admin/ThemeSelector.tsx
// Indicador del tema activo — RockSage Commerce
// Con 1 solo tema activo (dsd-classic), muestra badge informativo.
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { Palette } from 'lucide-react';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme } = useAdminTheme();
  const t = theme.tokens;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: t.surface2,
        border: `1px solid ${t.border}`,
        borderRadius: t.buttonRadius,
        color: t.textSecondary,
        fontFamily: t.fontBody,
      }}
    >
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
      {!compact && <span>{theme.name}</span>}
      <Palette size={11} />
    </div>
  );
};
