"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings2, Star, Crown, Mail, BarChart3, Plus, Save, Trash2,
  AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import {
  LoyaltyConfig,
  LoyaltyTierConfig,
  LoyaltyActionPoints,
  DEFAULT_LOYALTY_CONFIG,
} from '@/data/loyalty';

// ═══════════════════════════════════════════════════════════
// LoyaltyConfigPanel — Admin panel for full loyalty config.
// Reads/writes /api/loyalty/config (Supabase loyalty_config).
// Changes reflect immediately in checkout + frontend.
// ═══════════════════════════════════════════════════════════

type Section = 'general' | 'rules' | 'tiers' | 'emails' | 'metrics';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

const COLOR_PRESETS = [
  { label: 'Pino (arena)', from: '#E8D5B7', via: '#C4A882', to: '#8B6F47' },
  { label: 'Nogal (café)', from: '#8B6F47', via: '#5D4532', to: '#3A2A1C' },
  { label: 'Parota (dorado)', from: '#D4A76A', via: '#B8860B', to: '#8B6914' },
  { label: 'Ébano (azul)', from: '#1A1A2E', via: '#16213E', to: '#0F3460' },
  { label: 'Rosa Morada', from: '#D4A0C0', via: '#9B4DCA', to: '#6B2FA0' },
  { label: 'Cedro Rojo', from: '#E8B4A0', via: '#CD5C5C', to: '#8B2500' },
];

function centavosToPesos(c: number): number { return Math.round(c / 100); }
function pesosToCentavos(p: number): number { return Math.round(p * 100); }

// ── Small reusable pieces ───────────────────────────────

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({ enabled, onChange }) => (
  <div
    onClick={() => onChange(!enabled)}
    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${enabled ? 'bg-green-500' : 'bg-wood-200'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
  </div>
);

const ToggleWithLabel: React.FC<{ label: string; enabled: boolean; onChange: (v: boolean) => void }> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-wood-600">{label}</span>
    <ToggleSwitch enabled={enabled} onChange={onChange} />
  </div>
);

const SaveButton: React.FC<{ onClick: () => void; saving: boolean; hasChanges: boolean }> = ({ onClick, saving, hasChanges }) => (
  <button
    onClick={onClick}
    disabled={saving || !hasChanges}
    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#2d2419] text-[#F5F3F0] rounded-lg hover:bg-[#3d3429] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
    {saving ? 'Guardando...' : hasChanges ? 'Guardar cambios' : 'Sin cambios'}
  </button>
);

const MetricCard: React.FC<{ label: string; value: string; sub?: string; highlight?: boolean }> = ({ label, value, sub, highlight }) => (
  <div className="bg-white rounded-xl border border-wood-100 p-4">
    <p className={`text-lg ${highlight ? 'text-green-600' : 'text-[#2d2419]'}`}>{value}</p>
    <p className="text-[10px] text-wood-500">{label}</p>
    {sub && <p className="text-[10px] text-wood-400">{sub}</p>}
  </div>
);

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export const LoyaltyConfigPanel: React.FC = () => {
  const { session } = useAuth();
  const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_LOYALTY_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<LoyaltyConfig>(DEFAULT_LOYALTY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [section, setSection] = useState<Section>('general');
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── Fetch ─────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/loyalty/config');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setConfig(data);
      setOriginalConfig(data);
    } catch (err: any) {
      console.error('[LoyaltyConfig] Fetch error:', err);
      showToast('error', 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  // ── Save ──────────────────────────────────────────────
  const saveConfig = async () => {
    if (!session?.access_token) {
      showToast('error', 'Sesión no válida. Inicia sesión como admin.');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/loyalty/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setOriginalConfig(data.config);
      setConfig(data.config);
      showToast('success', 'Configuración guardada correctamente');
    } catch (err: any) {
      console.error('[LoyaltyConfig] Save error:', err);
      showToast('error', err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Update helpers ────────────────────────────────────
  const updateField = <K extends keyof LoyaltyConfig>(field: K, value: LoyaltyConfig[K]) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateTier = (index: number, updates: Partial<LoyaltyTierConfig>) => {
    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => i === index ? { ...t, ...updates } : t),
    }));
  };

  const updateActionPoints = (field: keyof LoyaltyActionPoints, value: number) => {
    setConfig(prev => ({
      ...prev,
      action_points: { ...prev.action_points, [field]: value },
    }));
  };

  const addTier = () => {
    const lastTier = config.tiers[config.tiers.length - 1];
    const newMinSpend = (lastTier?.max_spend || 0) + 1;
    const newTier: LoyaltyTierConfig = {
      id: `tier_${Date.now()}`,
      name: 'Nuevo Tier',
      min_spend: newMinSpend,
      max_spend: null,
      discount_percent: 0,
      early_access_hours: 0,
      upgrade_gift: null,
      priority_support: false,
      colors: { gradient_from: '#E8D5B7', gradient_via: '#C4A882', gradient_to: '#8B6F47' },
    };
    const updatedTiers = config.tiers.map((t, i) =>
      i === config.tiers.length - 1 ? { ...t, max_spend: newMinSpend - 1 } : t
    );
    setConfig(prev => ({ ...prev, tiers: [...updatedTiers, newTier] }));
    setEditingTierIndex(config.tiers.length);
  };

  const removeTier = (index: number) => {
    if (config.tiers.length <= 2) {
      showToast('error', 'Mínimo 2 tiers requeridos');
      return;
    }
    setConfig(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));
    setEditingTierIndex(null);
  };

  // ── Section nav items ─────────────────────────────────
  const sections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'Programa general', icon: Settings2 },
    { id: 'rules', label: 'Reglas de puntos', icon: Star },
    { id: 'tiers', label: 'Tiers de membresía', icon: Crown },
    { id: 'emails', label: 'Emails automáticos', icon: Mail },
    { id: 'metrics', label: 'Resumen', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-wood-400" />
        <span className="ml-2 text-sm text-wood-500">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-6 relative">
      {/* ── Toast ─────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar nav ──────────────────────────────── */}
      <div className="w-48 flex-shrink-0 hidden lg:block">
        <nav className="sticky top-4 space-y-0.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                section === s.id ? 'bg-[#C5A065]/10 text-[#C5A065]' : 'text-wood-500 hover:text-wood-700 hover:bg-sand-50'
              }`}
            >
              <s.icon size={13} /> {s.label}
            </button>
          ))}
        </nav>

        {hasChanges && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[10px] text-amber-700 font-medium">Cambios sin guardar</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-[#2d2419] text-[#F5F3F0] rounded-md hover:bg-[#3d3429] disabled:opacity-50"
              >
                {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                Guardar
              </button>
              <button
                onClick={() => { setConfig(originalConfig); setEditingTierIndex(null); }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-wood-600 bg-white border border-wood-200 rounded-md hover:bg-sand-50"
              >
                Deshacer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="flex-1 space-y-6 min-w-0">

        {/* ═══ GENERAL ═══════════════════════════════════ */}
        {section === 'general' && (
          <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-5">
            <h4 className="text-xs text-wood-400 uppercase tracking-wider">Programa general</h4>

            <div>
              <label className="text-xs text-wood-600 block mb-1.5">Estado del programa</label>
              <div className="space-y-2">
                {[
                  { value: true, label: 'Activo', desc: 'Clientes ganan y canjean puntos normalmente' },
                  { value: false, label: 'Pausado', desc: 'Clientes mantienen puntos pero no ganan ni canjean' },
                ].map(opt => (
                  <label key={String(opt.value)} className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="programActive"
                      checked={config.program_active === opt.value}
                      onChange={() => updateField('program_active', opt.value)}
                      className="accent-[#C5A065] mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-wood-700 group-hover:text-wood-900">{opt.label}</span>
                      <p className="text-[10px] text-wood-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-wood-600 block mb-1.5">Envío gratis desde</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-wood-500">$</span>
                  <input
                    type="number"
                    value={centavosToPesos(config.free_shipping_threshold)}
                    onChange={e => updateField('free_shipping_threshold', pesosToCentavos(Number(e.target.value)))}
                    className="w-28 px-3 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]"
                  />
                  <span className="text-xs text-wood-500">MXN</span>
                </div>
              </div>
              <ToggleWithLabel
                label="Envío gratis aplica a todos los tiers"
                enabled={config.free_shipping_all_tiers}
                onChange={v => updateField('free_shipping_all_tiers', v)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ToggleWithLabel label="Referidos activo" enabled={config.referrals_active} onChange={v => updateField('referrals_active', v)} />
              <ToggleWithLabel label="Cumpleaños activo" enabled={config.birthday_active} onChange={v => updateField('birthday_active', v)} />
              <ToggleWithLabel label="Social share activo" enabled={config.social_share_active} onChange={v => updateField('social_share_active', v)} />
            </div>

            <SaveButton onClick={saveConfig} saving={saving} hasChanges={hasChanges} />
          </div>
        )}

        {/* ═══ RULES ═════════════════════════════════════ */}
        {section === 'rules' && (
          <div className="space-y-4">
            {/* Acumulación */}
            <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-4">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider">Acumulación de puntos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Puntos por cada $1 MXN</label>
                  <input type="number" value={config.points_per_mxn} onChange={e => updateField('points_per_mxn', Number(e.target.value))} min={1}
                    className="w-24 px-3 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Valor de 1 punto</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-wood-500">$</span>
                    <input type="number" value={config.point_value_mxn} onChange={e => updateField('point_value_mxn', Number(e.target.value))} step={0.001} min={0.001}
                      className="w-24 px-3 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                    <span className="text-xs text-wood-500">MXN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Canje */}
            <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-4">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider">Canje</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Mínimo para canjear</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={config.min_redeem_points} onChange={e => updateField('min_redeem_points', Number(e.target.value))} min={1}
                      className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                    <span className="text-xs text-wood-500">pts</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Paso de canje</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={config.redeem_step} onChange={e => updateField('redeem_step', Number(e.target.value))} min={1}
                      className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                    <span className="text-xs text-wood-500">pts</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Máx canje por orden</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={config.max_redeem_percent} onChange={e => updateField('max_redeem_percent', Number(e.target.value))} min={1} max={100}
                      className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                    <span className="text-xs text-wood-500">% del total</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-wood-400 block mb-1">Descuento combinado máximo (tier + cupón + puntos)</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={config.max_combined_discount_percent} onChange={e => updateField('max_combined_discount_percent', Number(e.target.value))} min={10} max={100}
                    className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                  <span className="text-xs text-wood-500">% del subtotal</span>
                </div>
                <p className="text-[10px] text-wood-400 mt-1">Protege contra descuentos apilados excesivos. Se aplica server-side en el motor de descuentos.</p>
              </div>
            </div>

            {/* Vigencia */}
            <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-4">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider">Vigencia de puntos</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-wood-500">Expiran después de</span>
                <input type="number" value={config.points_expiry_days} onChange={e => updateField('points_expiry_days', Number(e.target.value))} min={30}
                  className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                <span className="text-xs text-wood-500">días</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 text-xs text-wood-700">
                  <input type="checkbox" checked={config.points_expiry_warning_days.includes(30)}
                    onChange={e => {
                      const days = e.target.checked
                        ? [...config.points_expiry_warning_days, 30].sort((a, b) => b - a)
                        : config.points_expiry_warning_days.filter(d => d !== 30);
                      updateField('points_expiry_warning_days', days);
                    }}
                    className="accent-[#C5A065] rounded" />
                  Recordatorio 30 días antes
                </label>
                <label className="flex items-center gap-1.5 text-xs text-wood-700">
                  <input type="checkbox" checked={config.points_expiry_warning_days.includes(7)}
                    onChange={e => {
                      const days = e.target.checked
                        ? [...config.points_expiry_warning_days, 7].sort((a, b) => b - a)
                        : config.points_expiry_warning_days.filter(d => d !== 7);
                      updateField('points_expiry_warning_days', days);
                    }}
                    className="accent-[#C5A065] rounded" />
                  Recordatorio 7 días antes
                </label>
              </div>
            </div>

            {/* Puntos bonus */}
            <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-4">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider">Puntos bonus por acciones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'registration' as const, label: 'Bono de bienvenida' },
                  { key: 'newsletter' as const, label: 'Suscripción newsletter' },
                  { key: 'review' as const, label: 'Dejar una review' },
                  { key: 'referral_referrer' as const, label: 'Referir a un amigo' },
                  { key: 'referral_referred' as const, label: 'Bono para referido' },
                  { key: 'birthday' as const, label: 'Bono de cumpleaños' },
                  { key: 'social_share' as const, label: 'Compartir en redes' },
                ]).map(b => (
                  <div key={b.key} className="flex items-center gap-2">
                    <label className="text-xs text-wood-600 flex-1">{b.label}</label>
                    <input type="number" value={config.action_points[b.key]}
                      onChange={e => updateActionPoints(b.key, Number(e.target.value))} min={0}
                      className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                    <span className="text-[10px] text-wood-400">pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluación */}
            <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-4">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider">Evaluación de tier</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Periodo de evaluación</label>
                  <select value={config.evaluation_period} onChange={e => updateField('evaluation_period', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none focus:border-[#C5A065]">
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Meses de lookback</label>
                  <input type="number" value={config.evaluation_lookback_months} onChange={e => updateField('evaluation_lookback_months', Number(e.target.value))} min={1} max={36}
                    className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 block mb-1">Máx tiers de bajada</label>
                  <input type="number" value={config.max_tier_drop} onChange={e => updateField('max_tier_drop', Number(e.target.value))} min={0} max={5}
                    className="w-20 px-2 py-2 text-xs border border-wood-200 rounded-lg text-center outline-none focus:border-[#C5A065]" />
                </div>
              </div>
            </div>

            <SaveButton onClick={saveConfig} saving={saving} hasChanges={hasChanges} />
          </div>
        )}

        {/* ═══ TIERS ═════════════════════════════════════ */}
        {section === 'tiers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
                <h4 className="text-xs text-wood-400 uppercase tracking-wider">Tiers de membresía ({config.tiers.length})</h4>
                <button onClick={addTier} className="text-[11px] text-[#C5A065] hover:underline flex items-center gap-1">
                  <Plus size={11} /> Agregar tier
                </button>
              </div>

              <div className="divide-y divide-wood-50">
                {config.tiers.map((tier, index) => (
                  <div key={tier.id} className="px-5 py-4">
                    {/* Header row */}
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${tier.colors.gradient_from}, ${tier.colors.gradient_via}, ${tier.colors.gradient_to})` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {editingTierIndex === index ? (
                            <input value={tier.name} onChange={e => updateTier(index, { name: e.target.value })}
                              className="text-sm font-medium text-[#2d2419] px-2 py-0.5 border border-[#C5A065] rounded outline-none w-36" autoFocus />
                          ) : (
                            <span className="text-sm font-medium text-[#2d2419]">{tier.name}</span>
                          )}
                          {index === 0 && <span className="text-[9px] bg-sand-50 text-wood-400 px-1.5 py-0.5 rounded">Base</span>}
                          {index === config.tiers.length - 1 && <span className="text-[9px] bg-[#C5A065]/10 text-[#C5A065] px-1.5 py-0.5 rounded">Máximo</span>}
                        </div>
                        <p className="text-[10px] text-wood-500">
                          ${centavosToPesos(tier.min_spend).toLocaleString()} — {tier.max_spend ? `$${centavosToPesos(tier.max_spend).toLocaleString()}` : 'Sin límite'}
                          {tier.discount_percent > 0 && ` · ${tier.discount_percent}% desc.`}
                          {tier.early_access_hours > 0 && ` · ${tier.early_access_hours}h anticipado`}
                          {tier.priority_support && ' · Soporte VIP'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingTierIndex(editingTierIndex === index ? null : index)}
                          className="text-[10px] text-[#C5A065] hover:underline">
                          {editingTierIndex === index ? 'Cerrar' : 'Editar'}
                        </button>
                        {config.tiers.length > 2 && (
                          <button onClick={() => removeTier(index)} className="text-[10px] text-red-400 hover:text-red-600">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded edit */}
                    <AnimatePresence>
                      {editingTierIndex === index && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-4 pt-4 border-t border-wood-50 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">ID (slug)</label>
                                <input value={tier.id} onChange={e => updateTier(index, { id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg outline-none focus:border-[#C5A065]" />
                              </div>
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">Desde (MXN)</label>
                                <input type="number" value={centavosToPesos(tier.min_spend)} onChange={e => updateTier(index, { min_spend: pesosToCentavos(Number(e.target.value)) })}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg outline-none focus:border-[#C5A065]" />
                              </div>
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">Hasta (MXN)</label>
                                <input type="number" value={tier.max_spend ? centavosToPesos(tier.max_spend) : ''} placeholder="Sin límite"
                                  onChange={e => updateTier(index, { max_spend: e.target.value ? pesosToCentavos(Number(e.target.value)) : null })}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg outline-none focus:border-[#C5A065]" />
                              </div>
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">Descuento %</label>
                                <input type="number" value={tier.discount_percent} onChange={e => updateTier(index, { discount_percent: Number(e.target.value) })} min={0} max={50}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg outline-none focus:border-[#C5A065]" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">Acceso anticipado (horas)</label>
                                <input type="number" value={tier.early_access_hours} onChange={e => updateTier(index, { early_access_hours: Number(e.target.value) })} min={0}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg outline-none focus:border-[#C5A065]" />
                              </div>
                              <div>
                                <label className="text-[10px] text-wood-400 block mb-1">Regalo al subir</label>
                                <select value={tier.upgrade_gift || ''} onChange={e => updateTier(index, { upgrade_gift: e.target.value || null })}
                                  className="w-full px-2 py-1.5 text-xs border border-wood-200 rounded-lg bg-white outline-none focus:border-[#C5A065]">
                                  <option value="">Ninguno</option>
                                  <option value="coupon_15">Cupón 15%</option>
                                  <option value="gift_and_coupons">Regalo + cuponera</option>
                                </select>
                              </div>
                              <div className="flex items-end pb-1">
                                <label className="flex items-center gap-1.5 text-xs text-wood-700">
                                  <input type="checkbox" checked={tier.priority_support} onChange={e => updateTier(index, { priority_support: e.target.checked })}
                                    className="accent-[#C5A065] rounded" />
                                  Soporte prioritario
                                </label>
                              </div>
                            </div>

                            {/* Colors */}
                            <div>
                              <label className="text-[10px] text-wood-400 block mb-2">Paleta de colores</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {COLOR_PRESETS.map(preset => (
                                  <button key={preset.label}
                                    onClick={() => updateTier(index, { colors: { gradient_from: preset.from, gradient_via: preset.via, gradient_to: preset.to } })}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-wood-100 hover:border-[#C5A065] transition-colors">
                                    <div className="w-4 h-4 rounded" style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.via}, ${preset.to})` }} />
                                    <span className="text-[10px] text-wood-600">{preset.label}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                {(['gradient_from', 'gradient_via', 'gradient_to'] as const).map(key => (
                                  <div key={key} className="flex items-center gap-1">
                                    <input type="color" value={tier.colors[key]}
                                      onChange={e => updateTier(index, { colors: { ...tier.colors, [key]: e.target.value } })}
                                      className="w-6 h-6 rounded cursor-pointer border border-wood-200" />
                                    <span className="text-[9px] text-wood-400">{key.replace('gradient_', '')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-wood-400">
              Al cambiar rangos, los clientes se reclasifican automáticamente. Los cambios de descuento se aplican en checkout al instante.
            </p>
            <SaveButton onClick={saveConfig} saving={saving} hasChanges={hasChanges} />
          </div>
        )}

        {/* ═══ EMAILS ════════════════════════════════════ */}
        {section === 'emails' && (
          <div className="bg-white rounded-xl border border-wood-100 p-6 space-y-1">
            <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Emails automáticos del programa</h4>
            <p className="text-[10px] text-wood-400 mb-4">Se activan cuando se implementen los subscribers en backend. Solo &ldquo;Bienvenida&rdquo; está live.</p>
            {[
              { name: 'Bienvenida al programa', trigger: 'Al registrarse', live: true },
              { name: 'Puntos ganados', trigger: 'Después de cada compra', live: false },
              { name: 'Subiste de tier', trigger: 'Al cambiar de nivel', live: false },
              { name: 'Puntos por vencer (30d)', trigger: '30 días antes de vencer', live: false },
              { name: 'Puntos por vencer (7d)', trigger: '7 días antes de vencer', live: false },
              { name: 'Resumen mensual', trigger: 'Primer día del mes', live: false },
              { name: 'Reactivación', trigger: 'Cliente inactivo >90d', live: false },
            ].map((em, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-wood-50 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#2d2419]">{em.name}</p>
                    {em.live
                      ? <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full border border-green-200">Live</span>
                      : <span className="text-[8px] bg-wood-50 text-wood-400 px-1.5 py-0.5 rounded-full border border-wood-200">Pendiente</span>
                    }
                  </div>
                  <p className="text-[10px] text-wood-400">{em.trigger}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ METRICS / RESUMEN ═════════════════════════ */}
        {section === 'metrics' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-wood-100 p-5">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Configuración actual</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard label="Tiers" value={String(config.tiers.length)} sub={config.tiers.map(t => t.name).join(' → ')} />
                <MetricCard label="Puntos/MXN" value={String(config.points_per_mxn)} sub={`1 pt = $${config.point_value_mxn} MXN`} />
                <MetricCard label="Expiración" value={`${config.points_expiry_days}d`} sub={`Avisos: ${config.points_expiry_warning_days.join('d, ')}d`} />
                <MetricCard label="Desc. máx combinado" value={`${config.max_combined_discount_percent}%`} sub="tier+cupón+pts" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <MetricCard label="Envío gratis" value={`$${centavosToPesos(config.free_shipping_threshold).toLocaleString()}`} sub="Umbral MXN" />
                <MetricCard label="Min. canje" value={`${config.min_redeem_points} pts`} sub={`Paso: ${config.redeem_step} pts`} />
                <MetricCard label="Evaluación" value={config.evaluation_period} sub={`Lookback: ${config.evaluation_lookback_months}m`} />
                <MetricCard label="Programa" value={config.program_active ? 'Activo' : 'Pausado'} highlight={config.program_active} sub={`Refs: ${config.referrals_active ? 'Sí' : 'No'}`} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-wood-100 p-5">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Tiers configurados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {config.tiers.map(tier => (
                  <div key={tier.id} className="rounded-xl p-4 text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${tier.colors.gradient_from}, ${tier.colors.gradient_via}, ${tier.colors.gradient_to})` }}>
                    <p className="text-sm font-medium">{tier.name}</p>
                    <p className="text-[10px] opacity-80">${centavosToPesos(tier.min_spend).toLocaleString()} — {tier.max_spend ? `$${centavosToPesos(tier.max_spend).toLocaleString()}` : '∞'}</p>
                    <div className="mt-2 space-y-0.5">
                      {tier.discount_percent > 0 && <p className="text-[10px] opacity-90">{tier.discount_percent}% descuento</p>}
                      {tier.early_access_hours > 0 && <p className="text-[10px] opacity-90">{tier.early_access_hours}h acceso anticipado</p>}
                      {tier.priority_support && <p className="text-[10px] opacity-90">Soporte prioritario</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile save bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-wood-200 p-3 flex gap-2 z-40">
          <button onClick={saveConfig} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#2d2419] text-[#F5F3F0] rounded-lg hover:bg-[#3d3429] disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Guardar cambios
          </button>
          <button onClick={() => { setConfig(originalConfig); setEditingTierIndex(null); }}
            className="px-4 py-2.5 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50">
            Deshacer
          </button>
        </div>
      )}
    </div>
  );
};
