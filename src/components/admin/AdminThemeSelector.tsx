"use client";
// ═══════════════════════════════════════════════════════════════
// src/components/admin/AdminThemeSelector.tsx
// Panel de selección de tema — RockSage Commerce
// Con 1 solo tema activo muestra info del tema actual.
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { Palette } from 'lucide-react';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';

export const AdminThemeSelector: React.FC = () => {
  const { theme } = useAdminTheme();
  const t = theme.tokens;

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: t.cardRadius,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Palette size={18} style={{ color: t.accent }} />
        <span className="text-sm font-semibold" style={{ color: t.text, fontFamily: t.fontHeading }}>
          Tema Activo
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: theme.preview.sidebar }}
        />
        <div>
          <p className="text-sm font-medium" style={{ color: t.text }}>{theme.name}</p>
          <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{theme.description}</p>
        </div>
      </div>
    </div>
  );
};
