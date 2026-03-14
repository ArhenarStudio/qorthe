"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid, Search, CheckCircle2, XCircle, Clock, Lock,
  Zap, ShoppingBag, Package, Users, TrendingUp, DollarSign,
  FileEdit, Settings, ToggleLeft, ToggleRight, Star, Plus,
  RefreshCw, ChevronRight, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleStatus = 'active' | 'coming_soon' | 'deprecated';
type GroupFilter = 'all' | 'ventas' | 'catalogo' | 'clientes' | 'crecimiento' | 'finanzas' | 'contenido' | 'sistema';

interface PlatformModule {
  id: string;
  name: string;
  description: string;
  group_id: GroupFilter;
  group_name: string;
  icon_name: string;
  addon_price_monthly_usd: number;
  addon_price_yearly_usd: number;
  status: ModuleStatus;
  is_core: boolean;
  sort_order: number;
  metadata: { eta?: string };
  // enriched by API
  included_in_plan: boolean;
  is_addon: boolean;
  is_disabled: boolean;
  is_active: boolean;
}

interface PlanInfo {
  id: string;
  name: string;
  price_monthly_usd: number;
  badge_style: string;
}

interface ModulesResponse {
  modules: PlatformModule[];
  subscription: { plan_id: string; tenant_name: string } | null;
  plan: PlanInfo | null;
}

// ─── Group tabs ────────────────────────────────────────────────────────────────

const groups: Array<{ id: GroupFilter; label: string; icon: React.ElementType }> = [
  { id: 'all',        label: 'Todos',      icon: LayoutGrid },
  { id: 'ventas',     label: 'Ventas',     icon: ShoppingBag },
  { id: 'catalogo',   label: 'Catálogo',   icon: Package },
  { id: 'clientes',   label: 'Clientes',   icon: Users },
  { id: 'crecimiento',label: 'Crecimiento',icon: TrendingUp },
  { id: 'finanzas',   label: 'Finanzas',   icon: DollarSign },
  { id: 'contenido',  label: 'Contenido',  icon: FileEdit },
  { id: 'sistema',    label: 'Sistema',    icon: Settings },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'FREE', starter: 'STARTER', pro: 'PRO', enterprise: 'ENTERPRISE',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(cents: number): string {
  if (cents === 0) return 'Gratis';
  return `$${(cents / 100).toFixed(0)} USD/mes`;
}

// ─── ModuleCard ───────────────────────────────────────────────────────────────

interface ModuleCardProps {
  mod: PlatformModule;
  onToggle: (id: string, action: 'enable' | 'disable' | 'add_addon' | 'remove_addon') => Promise<void>;
  tokens: ReturnType<typeof useAdminTheme>['theme']['tokens'];
}

function ModuleCard({ mod, onToggle, tokens: t }: ModuleCardProps) {
  const [loading, setLoading] = useState(false);

  const isComingSoon = mod.status === 'coming_soon';
  const canAddAddon  = !mod.included_in_plan && !isComingSoon && mod.addon_price_monthly_usd > 0;
  const canToggle    = mod.included_in_plan && !mod.is_core && !isComingSoon;

  async function handleAction() {
    if (loading) return;
    setLoading(true);
    try {
      if (canAddAddon) {
        await onToggle(mod.id, mod.is_addon ? 'remove_addon' : 'add_addon');
      } else if (canToggle) {
        await onToggle(mod.id, mod.is_disabled ? 'enable' : 'disable');
      }
    } finally {
      setLoading(false);
    }
  }


  // Status badge
  let statusLabel = '';
  let statusColor = '';
  if (isComingSoon) {
    statusLabel = `Próximamente${mod.metadata?.eta ? ` · ${mod.metadata.eta}` : ''}`;
    statusColor = t.warning;
  } else if (mod.is_core) {
    statusLabel = 'Incluido siempre';
    statusColor = t.info;
  } else if (mod.included_in_plan && !mod.is_disabled) {
    statusLabel = 'Activo en tu plan';
    statusColor = t.success;
  } else if (mod.is_addon) {
    statusLabel = 'Add-on activo';
    statusColor = t.accent;
  } else if (mod.included_in_plan && mod.is_disabled) {
    statusLabel = 'Desactivado';
    statusColor = t.muted;
  } else {
    statusLabel = canAddAddon ? `Add-on · ${fmtPrice(mod.addon_price_monthly_usd)}` : 'No disponible';
    statusColor = canAddAddon ? t.accent : t.muted;
  }

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${mod.is_active || mod.is_addon ? t.accentSubtle : t.border}`,
      borderRadius: t.cardRadius,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      opacity: isComingSoon ? 0.7 : 1,
      transition: 'box-shadow 0.15s',
      position: 'relative',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon placeholder — colored square */}
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: mod.is_active || mod.is_addon ? t.accentSubtle : t.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={16} style={{ color: mod.is_active || mod.is_addon ? t.accent : t.muted }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>{mod.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: t.textSecondary }}>{mod.group_name}</p>
          </div>
        </div>
        {/* Core lock icon */}
        {mod.is_core && <Lock size={13} style={{ color: t.muted, flexShrink: 0 }} />}
      </div>


      {/* Description */}
      <p style={{ margin: 0, fontSize: 12, color: t.textSecondary, lineHeight: 1.5 }}>
        {mod.description}
      </p>

      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isComingSoon ? (
          <Clock size={11} style={{ color: statusColor }} />
        ) : mod.is_active || mod.is_addon ? (
          <CheckCircle2 size={11} style={{ color: statusColor }} />
        ) : mod.included_in_plan && mod.is_disabled ? (
          <XCircle size={11} style={{ color: statusColor }} />
        ) : canAddAddon ? (
          <Plus size={11} style={{ color: statusColor }} />
        ) : (
          <Info size={11} style={{ color: statusColor }} />
        )}
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>{statusLabel}</span>
      </div>

      {/* Action button */}
      {!mod.is_core && !isComingSoon && (
        <button
          onClick={handleAction}
          disabled={loading || (!canToggle && !canAddAddon)}
          style={{
            marginTop: 4,
            padding: '6px 12px',
            borderRadius: t.buttonRadius,
            border: `1px solid ${canAddAddon || canToggle ? t.accent : t.border}`,
            background: 'transparent',
            color: canAddAddon || canToggle ? t.accent : t.muted,
            fontSize: 12,
            fontWeight: 500,
            cursor: canAddAddon || canToggle ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
          ) : canToggle ? (
            mod.is_disabled
              ? <><ToggleLeft size={13} /> Activar</>
              : <><ToggleRight size={13} /> Desactivar</>
          ) : canAddAddon ? (
            mod.is_addon
              ? <><XCircle size={13} /> Quitar add-on</>
              : <><Plus size={13} /> Agregar add-on</>
          ) : null}
        </button>
      )}
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModuleManagerPage() {
  const { theme } = useAdminTheme();
  const t = theme.tokens;

  const [data, setData]           = useState<ModulesResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeGroup, setGroup]   = useState<GroupFilter>('all');
  const [showCS, setShowCS]       = useState(false); // toggle coming_soon visibility

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/modules');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ModulesResponse;
      setData(json);
    } catch (err) {
      toast.error('Error cargando módulos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleToggle = useCallback(async (
    moduleId: string,
    action: 'enable' | 'disable' | 'add_addon' | 'remove_addon'
  ) => {
    const res = await fetch('/api/admin/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: moduleId, action }),
    });
    if (!res.ok) {
      toast.error('No se pudo actualizar el módulo');
      return;
    }
    const messages = {
      enable: 'Módulo activado',
      disable: 'Módulo desactivado',
      add_addon: 'Add-on agregado',
      remove_addon: 'Add-on removido',
    };
    toast.success(messages[action]);
    await fetchData();
  }, [fetchData]);


  // ── Derived data ──────────────────────────────────────────────────────────

  const allModules = data?.modules ?? [];
  const planLabel  = data?.plan ? PLAN_LABELS[data.plan.id] ?? data.plan.name : '—';

  const activeCount   = allModules.filter(m => m.is_active).length;
  const planCount     = allModules.filter(m => m.included_in_plan).length;
  const addonCount    = allModules.filter(m => m.is_addon).length;
  const comingSoonCnt = allModules.filter(m => m.status === 'coming_soon').length;

  const visible = allModules.filter(m => {
    if (m.status === 'coming_soon' && !showCS) return false;
    if (activeGroup !== 'all' && m.group_id !== activeGroup) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Spinner ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
      Cargando módulos…
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>
              Módulos del Plan
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textSecondary }}>
              Activa, desactiva y administra los módulos de tu suscripción RockSage Commerce
            </p>
          </div>
          {/* Plan badge */}
          <div style={{
            padding: '6px 14px', borderRadius: t.badgeRadius,
            background: t.accentSubtle, border: `1px solid ${t.accent}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Star size={13} style={{ color: t.accent }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, fontFamily: t.fontMono }}>
              Plan {planLabel}
            </span>
          </div>
        </div>
      </div>


      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Módulos activos',      value: activeCount,    icon: CheckCircle2, color: t.success },
          { label: 'Incluidos en tu plan', value: planCount,      icon: LayoutGrid,   color: t.accent  },
          { label: 'Add-ons activos',      value: addonCount,     icon: Plus,         color: t.info    },
          { label: 'Próximamente',         value: comingSoonCnt,  icon: Clock,        color: t.warning },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: t.cardRadius, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: t.surface2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <kpi.icon size={16} style={{ color: kpi.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, fontFamily: t.fontMono }}>
                {kpi.value}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: t.textSecondary }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls row ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar módulo…"
            style={{
              width: '100%', padding: '7px 10px 7px 30px',
              border: `1px solid ${t.border}`, borderRadius: t.inputRadius,
              background: t.surface2, color: t.text, fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {/* Toggle coming soon */}
        <button
          onClick={() => setShowCS(v => !v)}
          style={{
            padding: '7px 12px', borderRadius: t.buttonRadius,
            border: `1px solid ${showCS ? t.accent : t.border}`,
            background: showCS ? t.accentSubtle : 'transparent',
            color: showCS ? t.accent : t.textSecondary,
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Clock size={13} />
          {showCS ? 'Ocultar próximos' : 'Ver próximamente'}
        </button>
        {/* Refresh */}
        <button
          onClick={() => void fetchData()}
          style={{
            padding: '7px 10px', borderRadius: t.buttonRadius,
            border: `1px solid ${t.border}`, background: 'transparent',
            color: t.muted, cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>


      {/* ── Group tabs ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {groups.map(g => {
          const isActive = activeGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              style={{
                padding: '6px 13px', borderRadius: t.buttonRadius,
                border: `1px solid ${isActive ? t.accent : t.border}`,
                background: isActive ? t.accentSubtle : 'transparent',
                color: isActive ? t.accent : t.textSecondary,
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.12s',
              }}
            >
              <g.icon size={12} />
              {g.label}
              {/* Count badge */}
              {(() => {
                const cnt = allModules.filter(m =>
                  (g.id === 'all' || m.group_id === g.id) &&
                  (m.status !== 'coming_soon' || showCS)
                ).length;
                return (
                  <span style={{
                    padding: '1px 5px', borderRadius: 8,
                    background: isActive ? t.accent : t.surface2,
                    color: isActive ? t.accentText : t.muted,
                    fontSize: 10, fontWeight: 600,
                  }}>{cnt}</span>
                );
              })()}
            </button>
          );
        })}
      </div>

      {/* ── Module Grid ─────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div style={{
          padding: 48, textAlign: 'center', color: t.muted,
          border: `1px dashed ${t.border}`, borderRadius: t.cardRadius,
        }}>
          <LayoutGrid size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 14 }}>
            {search ? `Sin resultados para "${search}"` : 'Sin módulos en esta categoría'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {visible.map(mod => (
            <ModuleCard key={mod.id} mod={mod} onToggle={handleToggle} tokens={t} />
          ))}
        </div>
      )}

      {/* ── Upgrade CTA (si hay módulos de plan superior) ───────────────── */}
      {data?.plan && data.plan.id !== 'enterprise' && (
        <div style={{
          marginTop: 32, padding: '16px 20px',
          background: t.accentSubtle, border: `1px solid ${t.accent}`,
          borderRadius: t.cardRadius, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text }}>
              ¿Necesitas más módulos?
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: t.textSecondary }}>
              Habilita módulos individuales como add-on o actualiza tu plan para obtener acceso completo.
            </p>
          </div>
          <button style={{
            padding: '8px 16px', borderRadius: t.buttonRadius,
            background: t.accent, color: t.accentText,
            border: 'none', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Ver planes <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
