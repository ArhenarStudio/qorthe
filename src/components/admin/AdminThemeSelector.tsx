"use client";
// ═══════════════════════════════════════════════════════════════
// src/components/admin/AdminThemeSelector.tsx
// Catálogo de temas del panel admin — RockSage Commerce
// Permite activar temas del panel desde /admin/appearance
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { Check, Crown, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';

interface CatalogTheme {
  id: string;
  name: string;
  desc: string;
  mode: 'light' | 'dark';
  layout: 'sidebar' | 'os-panel';
  colors: { bg: string; surface: string; accent: string; text: string };
}

const CATALOG_THEMES: CatalogTheme[] = [
  {
    id: 'dsd-classic',
    name: 'DSD Classic',
    desc: 'Tema clásico de DavidSon\'s Design. Sidebar oscuro madera + acento ámbar.',
    mode: 'light',
    layout: 'sidebar',
    colors: { bg: '#F8F5F0', surface: '#FFFFFF', accent: '#C5A065', text: '#2d2419' },
  },
  {
    id: 'rocksage-teal-dark',
    name: 'RockSage OS',
    desc: 'Panel estilo OS. Menubar top + dock inferior. Paleta teal oscura de RockSage Commerce.',
    mode: 'dark',
    layout: 'os-panel',
    colors: { bg: '#08090B', surface: '#0F1114', accent: '#0D9488', text: '#E8ECF0' },
  },
];

function ThemeThumbnail({ colors, layout }: { colors: CatalogTheme['colors']; layout: CatalogTheme['layout'] }) {
  return (
    <div
      className="w-full aspect-[4/3] rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.bg, border: '1px solid rgba(0,0,0,0.10)' }}
    >
      {layout === 'sidebar' ? (
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-8 h-full flex-shrink-0" style={{ backgroundColor: colors.accent + '25', borderRight: `1px solid ${colors.accent}20` }}>
            <div className="p-1 space-y-1 mt-2">
              {[1,2,3,4].map(i => <div key={i} className="h-1 rounded-sm mx-0.5" style={{ backgroundColor: colors.accent + (i === 1 ? 'CC' : '40') }} />)}
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-3 rounded flex items-center px-1.5 mb-2" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.text}10` }}>
              <div className="w-12 h-1 rounded-sm" style={{ backgroundColor: colors.text + '30' }} />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1,2,3].map(i => <div key={i} className="rounded h-5" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.text}10` }} />)}
            </div>
            <div className="w-8 h-2 rounded-sm" style={{ backgroundColor: colors.accent }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Top menubar */}
          <div className="h-4 flex items-center px-2 gap-1.5 flex-shrink-0" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.accent}30` }}>
            <div className="w-4 h-1.5 rounded-sm" style={{ backgroundColor: colors.accent }} />
            {[1,2,3,4].map(i => <div key={i} className="w-5 h-1 rounded-sm" style={{ backgroundColor: colors.text + '30' }} />)}
          </div>
          {/* Content */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="w-16 h-2 rounded-sm" style={{ backgroundColor: colors.text + '40' }} />
            <div className="grid grid-cols-2 gap-1">
              {[1,2,3,4].map(i => <div key={i} className="rounded h-5" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.text}15` }} />)}
            </div>
          </div>
          {/* Bottom dock */}
          <div className="h-4 flex items-center justify-center gap-2 flex-shrink-0" style={{ backgroundColor: colors.surface + 'CC', borderTop: `1px solid ${colors.accent}30` }}>
            {[1,2,3,4,5].map(i => <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: i === 1 ? colors.accent : colors.text + '25' }} />)}
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
      const name = CATALOG_THEMES.find(t => t.id === id)?.name ?? id;
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
        <h1 className="text-[28px] font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Apariencia del Panel
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Selecciona el tema visual del panel de administración
        </p>
      </div>

      {/* Grid de temas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CATALOG_THEMES.map(ct => {
          const isActive = themeId === ct.id;
          const isActivating = activatingId === ct.id;
          return (
            <div
              key={ct.id}
              className={'rounded-[var(--radius-card)] border overflow-hidden transition-all hover:shadow-md ' +
                (isActive ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20' : 'border-[var(--border)] hover:border-[var(--accent)]/40')}
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <div className="p-3">
                <ThemeThumbnail colors={ct.colors} layout={ct.layout} />
              </div>
              <div className="px-3 pb-3 space-y-2">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[13px] font-semibold text-[var(--text)] truncate">{ct.name}</p>
                    {isActive && (
                      <span className="text-[9px] bg-[var(--success)]/10 text-[var(--success)] px-1.5 py-0.5 rounded-[var(--radius-badge)] font-semibold flex items-center gap-0.5 shrink-0">
                        <Check size={8} /> Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{ct.desc}</p>
                </div>
                {/* Paleta + modo */}
                <div className="flex items-center gap-1.5">
                  {[ct.colors.bg, ct.colors.surface, ct.colors.accent, ct.colors.text].map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-[var(--border)] shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                  <span className="ml-auto text-[9px] text-[var(--text-muted)] capitalize">{ct.mode}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">·</span>
                  <Monitor size={9} className="text-[var(--text-muted)]" />
                  <span className="text-[9px] text-[var(--text-muted)]">{ct.layout === 'sidebar' ? 'Sidebar' : 'OS Panel'}</span>
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
                    onClick={() => handleActivate(ct.id)}
                    disabled={isActivating}
                    className="w-full py-1.5 text-[11px] font-semibold rounded-[var(--radius-button)] transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    {isActivating
                      ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Activando...</>
                      : <><Crown size={10} /> Activar</>
                    }
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
