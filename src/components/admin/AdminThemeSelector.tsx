"use client";
// ═══════════════════════════════════════════════════════════════
// src/components/admin/AdminThemeSelector.tsx
// Catálogo de temas — lee directamente de themeRegistry
// Agregar un tema al registry = aparece automáticamente aquí
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { Check, Crown, Monitor, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { allThemes } from '@/src/admin/themes/themeRegistry';

// Colores de preview por tema (visuales del thumbnail)
const PREVIEW_COLORS: Record<string, { bg: string; surface: string; accent: string; text: string }> = {
  'dsd-classic':        { bg: '#F8F5F0', surface: '#FFFFFF',  accent: '#C5A065', text: '#2d2419' },
  'komerzly-teal-dark': { bg: '#08090B', surface: '#0F1114',  accent: '#0D9488', text: '#E8ECF0' },
  'nintendo-retro':     { bg: '#0D0D1A', surface: '#1A1A2E',  accent: '#E52521', text: '#F8F8F8' },
};

// Descripciones por tema
const DESCRIPTIONS: Record<string, string> = {
  'dsd-classic':        "Tema clásico de Qorthe. Sidebar oscuro madera + acento ámbar.",
  'komerzly-teal-dark': 'Panel estilo OS. Menubar top + dock inferior. Paleta teal oscura de Komerzly.',
  'nintendo-retro':     'Escritorio retro pixel-art. Colores Mario Bros: rojo, verde Luigi, moneda dorada. Ventanas estilo NES.',
};

// Thumbnail visual del tema
function ThemeThumbnail({ colors, layout }: {
  colors: { bg: string; surface: string; accent: string; text: string };
  layout: string;
}) {
  const isOS = layout === 'os-panel';
  return (
    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.bg, border: '1px solid rgba(0,0,0,0.10)' }}>
      {isOS ? (
        <div className="flex flex-col h-full">
          {/* Menubar */}
          <div className="h-4 flex items-center px-2 gap-1.5 flex-shrink-0"
            style={{ backgroundColor: colors.surface, borderBottom: `2px solid ${colors.accent}` }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
            <div className="w-8 h-1 rounded-sm" style={{ backgroundColor: colors.text + '60' }} />
            <div className="flex-1" />
            <div className="w-5 h-1 rounded-sm" style={{ backgroundColor: colors.accent + '80' }} />
          </div>
          {/* KPI bar */}
          <div className="flex gap-1 px-2 py-1 flex-shrink-0"
            style={{ borderBottom: `1px solid ${colors.text}15` }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex-1 h-4 rounded"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.accent}30` }} />
            ))}
          </div>
          {/* Apps grid */}
          <div className="flex-1 p-2">
            <div className="grid grid-cols-4 gap-1">
              {[colors.accent, '#4CAF50', '#4FC3F7', '#FFD700', '#9B27AF', '#FF6B00', colors.accent, '#4CAF50'].map((c, i) => (
                <div key={i} className="rounded h-4"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${c}50` }} />
              ))}
            </div>
          </div>
          {/* Dock */}
          <div className="h-5 flex items-center justify-center gap-1.5 flex-shrink-0"
            style={{ backgroundColor: colors.surface + 'EE', borderTop: `2px solid ${colors.accent}` }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-3 h-3 rounded"
                style={{ backgroundColor: i === 1 ? colors.accent : colors.text + '20',
                  border: `1px solid ${i === 1 ? colors.accent : colors.text + '30'}` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-8 h-full flex-shrink-0"
            style={{ backgroundColor: colors.accent + '20', borderRight: `1px solid ${colors.accent}25` }}>
            <div className="p-1 space-y-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-1 rounded-sm mx-0.5"
                  style={{ backgroundColor: colors.accent + (i === 1 ? 'CC' : '40') }} />
              ))}
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-3 rounded flex items-center px-1.5 mb-2"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.text}10` }}>
              <div className="w-12 h-1 rounded-sm" style={{ backgroundColor: colors.text + '30' }} />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="rounded h-5"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.text}10` }} />
              ))}
            </div>
            <div className="w-8 h-2 rounded-sm" style={{ backgroundColor: colors.accent }} />
          </div>
        </div>
      )}
    </div>
  );
}

export const AdminThemeSelector: React.FC = () => {
  const { themeId, setTheme } = useAdminTheme();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleActivate = async (id: string) => {
    if (id === themeId) return;
    setActivatingId(id);
    try {
      await setTheme(id);
      const name = allThemes.find(t => t.id === id)?.name ?? id;
      toast.success(`Tema "${name}" activado`);
    } catch {
      toast.error('Error al activar el tema');
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[var(--text)]"
          style={{ fontFamily: 'var(--font-heading)' }}>
          Apariencia del Panel
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Selecciona el tema visual del panel de administración
        </p>
      </div>

      {/* Counter */}
      <p className="text-[11px] text-[var(--text-muted)]">
        {allThemes.length} tema{allThemes.length !== 1 ? 's' : ''} disponible{allThemes.length !== 1 ? 's' : ''}
      </p>

      {/* Grid — se auto-puebla desde themeRegistry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allThemes.map(theme => {
          const isActive    = themeId === theme.id;
          const isActivating = activatingId === theme.id;
          const colors      = PREVIEW_COLORS[theme.id] ?? {
            bg: theme.tokens?.bg ?? '#ffffff',
            surface: theme.tokens?.surface ?? '#f0f0f0',
            accent:  theme.tokens?.accent  ?? '#0066cc',
            text:    theme.tokens?.text    ?? '#111111',
          };
          const layout = theme.layout ?? 'sidebar';
          const desc   = DESCRIPTIONS[theme.id] ?? `Tema ${theme.name}.`;
          const mode   = theme.mode ?? 'light';

          return (
            <div
              key={theme.id}
              className={
                'rounded-[var(--radius-card)] border overflow-hidden transition-all hover:shadow-md ' +
                (isActive
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/40')
              }
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <div className="p-3">
                <ThemeThumbnail colors={colors} layout={layout} />
              </div>

              <div className="px-3 pb-3 space-y-2">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[13px] font-semibold text-[var(--text)] truncate">{theme.name}</p>
                    {isActive && (
                      <span className="text-[9px] bg-[var(--success)]/10 text-[var(--success)] px-1.5 py-0.5 rounded-[var(--radius-badge)] font-semibold flex items-center gap-0.5 shrink-0">
                        <Check size={8} /> Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{desc}</p>
                </div>

                {/* Paleta + meta */}
                <div className="flex items-center gap-1.5">
                  {[colors.bg, colors.surface, colors.accent, colors.text].map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-[var(--border)] shadow-sm"
                      style={{ backgroundColor: c }} />
                  ))}
                  <span className="ml-auto text-[9px] text-[var(--text-muted)] capitalize">{mode}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">·</span>
                  {layout === 'os-panel'
                    ? <Layers size={9} className="text-[var(--text-muted)]" />
                    : <Monitor size={9} className="text-[var(--text-muted)]" />}
                  <span className="text-[9px] text-[var(--text-muted)]">
                    {layout === 'os-panel' ? 'OS Panel' : 'Sidebar'}
                  </span>
                </div>

                {/* Botón */}
                {isActive ? (
                  <div className="w-full py-1.5 text-[11px] font-semibold rounded-[var(--radius-button)] border border-[var(--accent)] text-[var(--accent)] text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Check size={10} /> Tema activo
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleActivate(theme.id)}
                    disabled={isActivating}
                    className="w-full py-1.5 text-[11px] font-semibold rounded-[var(--radius-button)] transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    {isActivating
                      ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Activando...</>
                      : <><Crown size={10} /> Activar</>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
