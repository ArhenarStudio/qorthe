"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, RotateCcw, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Edit3, GripVertical } from 'lucide-react';
import { FullQuoteConfig, DEFAULT_FULL_CONFIG } from '@/components/quote/quoteConfig';
import { useAuth } from '@/contexts/AuthContext';

// ═══════════════════════════════════════════════════════════════
// QuotePricingPanel — Admin panel completo para configurar
// TODOS los aspectos del cotizador: productos, materiales,
// precios, bundles, extras, zonas, acabados
// ═══════════════════════════════════════════════════════════════

type Section = 'productos' | 'maderas' | 'textil' | 'grabado' | 'diseno' | 'descuentos' | 'bundles';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'productos', label: 'Productos' },
  { id: 'maderas', label: 'Maderas' },
  { id: 'textil', label: 'Textil' },
  { id: 'grabado', label: 'Grabado' },
  { id: 'diseno', label: 'Diseño' },
  { id: 'descuentos', label: 'Descuentos' },
  { id: 'bundles', label: 'Paquetes' },
];

export const QuotePricingPanel: React.FC = () => {
  const { session } = useAuth();
  const [config, setConfig] = useState<FullQuoteConfig>(DEFAULT_FULL_CONFIG);
  const [original, setOriginal] = useState<FullQuoteConfig>(DEFAULT_FULL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [section, setSection] = useState<Section>('productos');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/quote-pricing');
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_FULL_CONFIG, ...data };
        setConfig(merged);
        setOriginal(merged);
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  useEffect(() => {
    setDirty(JSON.stringify(config) !== JSON.stringify(original));
  }, [config, original]);

  // Save
  const handleSave = async () => {
    if (!session?.access_token) { showToast('Error: no autenticado'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quote-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setOriginal({ ...config });
        setDirty(false);
        showToast('Configuración guardada');
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error || res.status}`);
      }
    } catch {
      showToast('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    setConfig({ ...original });
  };

  // Update helpers
  const updateConfig = (partial: Partial<FullQuoteConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-wood-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              section === s.id
                ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900'
                : 'text-wood-400 hover:bg-wood-100 dark:hover:bg-wood-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 p-6 min-h-[400px]">
        {section === 'productos' && <ProductosSection config={config} onChange={updateConfig} />}
        {section === 'maderas' && <MaderasSection config={config} onChange={updateConfig} />}
        {section === 'textil' && <TextilSection config={config} onChange={updateConfig} />}
        {section === 'grabado' && <GrabadoSection config={config} onChange={updateConfig} />}
        {section === 'diseno' && <DisenoSection config={config} onChange={updateConfig} />}
        {section === 'descuentos' && <DescuentosSection config={config} onChange={updateConfig} />}
        {section === 'bundles' && <BundlesSection config={config} onChange={updateConfig} />}
      </div>

      {/* Save bar */}
      {dirty && (
        <div className="sticky bottom-4 flex items-center justify-between bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl px-6 py-4 shadow-xl">
          <span className="text-sm font-medium">Cambios sin guardar</span>
          <div className="flex gap-3">
            <button onClick={handleUndo} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold uppercase">
              <RotateCcw className="w-3.5 h-3.5" /> Deshacer
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-accent-gold text-wood-900 text-xs font-bold uppercase hover:shadow-lg disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 px-6 py-3 rounded-xl shadow-xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

// ── Toggle helper ───────────────────────────────────────────

function EnableToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)} className="shrink-0">
      {enabled ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-wood-300" />}
    </button>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-serif font-bold text-wood-900 dark:text-sand-100">{title}</h3>
      {subtitle && <p className="text-xs text-wood-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── PRODUCTOS ───────────────────────────────────────────────

function ProductosSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Productos de Madera" subtitle="Activa o desactiva tipos de producto disponibles en el cotizador" />
      <div className="space-y-2">
        {config.woodProducts.map((p, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={p.enabled} onChange={(v) => {
              const arr = [...config.woodProducts]; arr[i] = { ...p, enabled: v }; onChange({ woodProducts: arr });
            }} />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm text-wood-900 dark:text-sand-100">{p.label}</span>
              <span className="text-xs text-wood-400 ml-2">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle title="Productos Textiles" />
      <div className="space-y-2">
        {config.textileProducts.map((p, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={p.enabled} onChange={(v) => {
              const arr = [...config.textileProducts]; arr[i] = { ...p, enabled: v }; onChange({ textileProducts: arr });
            }} />
            <div className="flex-1">
              <span className="font-medium text-sm">{p.label}</span>
              <span className="text-xs text-wood-400 ml-2">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle title="Servicio de Grabado" />
      <div className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
        <EnableToggle enabled={config.serviceProduct.enabled} onChange={(v) => {
          onChange({ serviceProduct: { ...config.serviceProduct, enabled: v } });
        }} />
        <span className="font-medium text-sm">{config.serviceProduct.label}</span>
      </div>
    </div>
  );
}

// ── MADERAS ─────────────────────────────────────────────────

function MaderasSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Tipos de Madera" subtitle="Precio por m², colores y disponibilidad" />
      <div className="space-y-3">
        {config.woodOptions.map((w, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={w.enabled} onChange={(v) => {
              const arr = [...config.woodOptions]; arr[i] = { ...w, enabled: v }; onChange({ woodOptions: arr });
            }} />
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: w.gradient }} />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{w.label}</span>
              <span className="text-xs text-wood-400 ml-2">{w.description}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-wood-400">$/m²</span>
              <input
                type="number"
                value={w.priceM2}
                onChange={(e) => {
                  const arr = [...config.woodOptions]; arr[i] = { ...w, priceM2: Number(e.target.value) }; onChange({ woodOptions: arr });
                }}
                className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-1">Precio mínimo pieza</label>
          <input type="number" value={config.woodMinPrice}
            onChange={(e) => onChange({ woodMinPrice: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-1">Espesor estándar (cm)</label>
          <input type="number" value={config.woodThicknessStandard}
            onChange={(e) => onChange({ woodThicknessStandard: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
        </div>
      </div>
    </div>
  );
}

// ── TEXTIL ──────────────────────────────────────────────────

function TextilSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Colores de Tela" />
      <div className="space-y-2">
        {config.textileColors.map((c, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={c.enabled} onChange={(v) => {
              const arr = [...config.textileColors]; arr[i] = { ...c, enabled: v }; onChange({ textileColors: arr });
            }} />
            <div className="w-6 h-6 rounded-full border border-wood-200 shrink-0" style={{ backgroundColor: c.hex }} />
            <span className="font-medium text-sm">{c.label}</span>
          </div>
        ))}
      </div>

      <SectionTitle title="Técnicas de Estampado" subtitle="Precio por técnica" />
      <div className="space-y-2">
        {config.textileTechniques.map((t, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={t.enabled} onChange={(v) => {
              const arr = [...config.textileTechniques]; arr[i] = { ...t, enabled: v }; onChange({ textileTechniques: arr });
            }} />
            <span className="font-medium text-sm flex-1">{t.label}</span>
            <input type="number" value={t.price}
              onChange={(e) => {
                const arr = [...config.textileTechniques]; arr[i] = { ...t, price: Number(e.target.value) }; onChange({ textileTechniques: arr });
              }}
              className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-1">Extra panel completo ($)</label>
        <input type="number" value={config.textileFullPanelExtra}
          onChange={(e) => onChange({ textileFullPanelExtra: Number(e.target.value) })}
          className="w-32 px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
      </div>
    </div>
  );
}

// ── GRABADO ─────────────────────────────────────────────────

function GrabadoSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Precios por Complejidad" />
      <div className="space-y-2">
        {config.engravingPrices.map((e, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <span className="font-medium text-sm flex-1">{e.complexity}</span>
            <span className="text-[10px] text-wood-400">$</span>
            <input type="number" value={e.price}
              onChange={(ev) => {
                const arr = [...config.engravingPrices]; arr[i] = { ...e, price: Number(ev.target.value) }; onChange({ engravingPrices: arr });
              }}
              className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-1">Extra por zona adicional ($)</label>
          <input type="number" value={config.engravingZoneExtra}
            onChange={(e) => onChange({ engravingZoneExtra: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-1">Extra código QR ($)</label>
          <input type="number" value={config.engravingQrExtra}
            onChange={(e) => onChange({ engravingQrExtra: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
        </div>
      </div>

      <SectionTitle title="Materiales para Servicio de Grabado" />
      <div className="space-y-2">
        {config.engraveMaterials.map((m, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-2 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={m.enabled} onChange={(v) => {
              const arr = [...config.engraveMaterials]; arr[i] = { ...m, enabled: v }; onChange({ engraveMaterials: arr });
            }} />
            <span className="text-sm">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DISEÑO ──────────────────────────────────────────────────

function DisenoSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Formas Disponibles" />
      <div className="space-y-2">
        {config.boardShapes.map((s, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-2 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={s.enabled} onChange={(v) => {
              const arr = [...config.boardShapes]; arr[i] = { ...s, enabled: v }; onChange({ boardShapes: arr });
            }} />
            <span className="text-sm">{s.label}</span>
          </div>
        ))}
      </div>

      <SectionTitle title="Extras y Acabados" subtitle="Precio extra por cada complemento" />
      <div className="space-y-2">
        {config.boardExtras.map((ex, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={ex.enabled} onChange={(v) => {
              const arr = [...config.boardExtras]; arr[i] = { ...ex, enabled: v }; onChange({ boardExtras: arr });
            }} />
            <div className="flex-1">
              <span className="font-medium text-sm">{ex.label}</span>
              <span className="text-xs text-wood-400 ml-2">{ex.desc}</span>
            </div>
            <input type="number" value={ex.priceExtra} placeholder="0"
              onChange={(e) => {
                const arr = [...config.boardExtras]; arr[i] = { ...ex, priceExtra: Number(e.target.value) }; onChange({ boardExtras: arr });
              }}
              className="w-20 px-2 py-1 text-right text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
          </div>
        ))}
      </div>

      <SectionTitle title="Tipos de Acabado" />
      <div className="space-y-2">
        {config.boardFinishes.map((f, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-2 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <EnableToggle enabled={f.enabled} onChange={(v) => {
              const arr = [...config.boardFinishes]; arr[i] = { ...f, enabled: v }; onChange({ boardFinishes: arr });
            }} />
            <span className="text-sm">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DESCUENTOS ──────────────────────────────────────────────

function DescuentosSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const addDiscount = () => {
    onChange({ volumeDiscounts: [...config.volumeDiscounts, { min_qty: 100, percent: 25 }] });
  };
  const removeDiscount = (i: number) => {
    onChange({ volumeDiscounts: config.volumeDiscounts.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Descuentos por Volumen" subtitle="A partir de X piezas, se aplica descuento automático" />
      <div className="space-y-2">
        {config.volumeDiscounts.map((d, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
            <span className="text-xs text-wood-400 shrink-0">A partir de</span>
            <input type="number" value={d.min_qty}
              onChange={(e) => {
                const arr = [...config.volumeDiscounts]; arr[i] = { ...d, min_qty: Number(e.target.value) }; onChange({ volumeDiscounts: arr });
              }}
              className="w-16 px-2 py-1 text-center text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
            <span className="text-xs text-wood-400">piezas →</span>
            <input type="number" value={d.percent}
              onChange={(e) => {
                const arr = [...config.volumeDiscounts]; arr[i] = { ...d, percent: Number(e.target.value) }; onChange({ volumeDiscounts: arr });
              }}
              className="w-16 px-2 py-1 text-center text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
            <span className="text-xs text-wood-400">%</span>
            <button onClick={() => removeDiscount(i)} className="p-1 text-wood-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={addDiscount} className="flex items-center gap-2 text-xs font-bold text-accent-gold hover:underline">
        <Plus className="w-3.5 h-3.5" /> Agregar nivel de descuento
      </button>

      <SectionTitle title="Descuento por Membresía" subtitle="Aplicar descuento automático según el tier de lealtad del cliente" />
      <div className="flex items-center gap-4 px-4 py-3 bg-sand-50 dark:bg-wood-900/50 rounded-lg">
        <EnableToggle enabled={config.tierDiscountEnabled} onChange={(v) => onChange({ tierDiscountEnabled: v })} />
        <span className="text-sm">{config.tierDiscountEnabled ? 'Activo — se aplica descuento por tier' : 'Desactivado'}</span>
      </div>
    </div>
  );
}

// ── BUNDLES ─────────────────────────────────────────────────

function BundlesSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBundle, setNewBundle] = useState({ name: '', desc: '', segment: '', discountPercent: 10 });

  const handleAdd = () => {
    if (!newBundle.name.trim()) return;
    const id = `bundle-${Date.now()}`;
    onChange({
      bundles: [...config.bundles, {
        id,
        name: newBundle.name,
        desc: newBundle.desc,
        segment: newBundle.segment,
        discountPercent: newBundle.discountPercent,
        enabled: true,
        items: [],
      }],
    });
    setNewBundle({ name: '', desc: '', segment: '', discountPercent: 10 });
    setShowAddForm(false);
    setExpandedId(id);
  };

  const handleDelete = (idx: number) => {
    if (!confirm(`¿Eliminar paquete "${config.bundles[idx].name}"?`)) return;
    onChange({ bundles: config.bundles.filter((_, i) => i !== idx) });
  };

  const updateBundle = (idx: number, updates: Partial<FullQuoteConfig['bundles'][0]>) => {
    const arr = [...config.bundles];
    arr[idx] = { ...arr[idx], ...updates };
    onChange({ bundles: arr });
  };

  const addItem = (bundleIdx: number) => {
    const bundle = config.bundles[bundleIdx];
    updateBundle(bundleIdx, {
      items: [...bundle.items, { category: 'madera' as const, type: 'Tabla de picar', quantity: 1 }],
    });
  };

  const updateItem = (bundleIdx: number, itemIdx: number, updates: Partial<FullQuoteConfig['bundles'][0]['items'][0]>) => {
    const bundle = config.bundles[bundleIdx];
    const items = [...bundle.items];
    items[itemIdx] = { ...items[itemIdx], ...updates };
    updateBundle(bundleIdx, { items });
  };

  const removeItem = (bundleIdx: number, itemIdx: number) => {
    const bundle = config.bundles[bundleIdx];
    updateBundle(bundleIdx, { items: bundle.items.filter((_, i) => i !== itemIdx) });
  };

  const allProducts = [...config.woodProducts, ...config.textileProducts].filter(p => p.enabled);
  const categoryOptions = [
    { value: 'madera', label: 'Madera' },
    { value: 'textil', label: 'Textil' },
    { value: 'grabado', label: 'Grabado' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Paquetes Predefinidos" subtitle="Crea, edita y gestiona paquetes con descuento para el cotizador" />

      {/* Bundle list */}
      <div className="space-y-3">
        {config.bundles.map((b, i) => {
          const isExpanded = expandedId === b.id;
          return (
            <div key={b.id} className="bg-sand-50 dark:bg-wood-900/50 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <EnableToggle enabled={b.enabled} onChange={(v) => updateBundle(i, { enabled: v })} />
                <button onClick={() => setExpandedId(isExpanded ? null : b.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-wood-900 dark:text-sand-100 block truncate">{b.name}</span>
                    <span className="text-[10px] text-wood-400">{b.segment || 'Sin segmento'} · {b.items.length} items</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-wood-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-wood-400 shrink-0" />}
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input type="number" value={b.discountPercent}
                    onChange={(e) => updateBundle(i, { discountPercent: Number(e.target.value) })}
                    className="w-14 px-2 py-1 text-center text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded focus:border-accent-gold outline-none" />
                  <span className="text-[10px] text-wood-400">%</span>
                </div>
                <button onClick={() => handleDelete(i)} className="p-1.5 text-wood-300 hover:text-red-500 shrink-0 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-wood-100 dark:border-wood-800 pt-3">
                  {/* Editable fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Nombre</label>
                      <input value={b.name} onChange={(e) => updateBundle(i, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Segmento</label>
                      <input value={b.segment} onChange={(e) => updateBundle(i, { segment: e.target.value })}
                        placeholder="B2B, Novios, Restaurantes..."
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Descuento %</label>
                      <input type="number" value={b.discountPercent} onChange={(e) => updateBundle(i, { discountPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Descripción</label>
                    <input value={b.desc} onChange={(e) => updateBundle(i, { desc: e.target.value })}
                      placeholder="Describe el paquete..."
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-[10px] font-bold text-wood-400 uppercase block mb-2">Productos del paquete</label>
                    <div className="space-y-2">
                      {b.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 bg-white dark:bg-wood-800 rounded-lg p-2 border border-wood-100 dark:border-wood-700">
                          <select value={item.category} onChange={(e) => {
                            const cat = e.target.value as 'madera' | 'textil' | 'grabado';
                            const defaultType = cat === 'madera' ? 'Tabla de picar' : cat === 'textil' ? 'Tote bag' : 'Servicio de Grabado';
                            updateItem(i, j, { category: cat, type: defaultType });
                          }} className="text-xs bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded px-2 py-1.5 outline-none">
                            {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                          <select value={item.type} onChange={(e) => updateItem(i, j, { type: e.target.value })}
                            className="flex-1 text-xs bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded px-2 py-1.5 outline-none min-w-0">
                            {allProducts.filter(p => p.category === item.category).map(p => <option key={p.type} value={p.type}>{p.label}</option>)}
                            {item.category === 'grabado' && <option value="Servicio de Grabado">Servicio de Grabado</option>}
                          </select>
                          <span className="text-[10px] text-wood-400 shrink-0">×</span>
                          <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, j, { quantity: Number(e.target.value) || 1 })}
                            className="w-14 text-center text-xs bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded px-1 py-1.5 outline-none" />
                          <button onClick={() => removeItem(i, j)} className="p-1 text-wood-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addItem(i)} className="flex items-center gap-1.5 text-xs font-bold text-accent-gold hover:underline mt-2">
                      <Plus className="w-3.5 h-3.5" /> Agregar producto al paquete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new bundle */}
      {showAddForm ? (
        <div className="bg-white dark:bg-wood-900 rounded-xl border border-accent-gold/30 p-4 space-y-3">
          <h4 className="text-sm font-medium text-wood-900 dark:text-sand-100">Nuevo Paquete</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Nombre *</label>
              <input value={newBundle.name} onChange={e => setNewBundle(p => ({ ...p, name: e.target.value }))}
                placeholder="Kit Corporativo"
                className="w-full px-3 py-2 text-sm bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Segmento</label>
              <input value={newBundle.segment} onChange={e => setNewBundle(p => ({ ...p, segment: e.target.value }))}
                placeholder="B2B / Empresas"
                className="w-full px-3 py-2 text-sm bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Descripción</label>
            <input value={newBundle.desc} onChange={e => setNewBundle(p => ({ ...p, desc: e.target.value }))}
              placeholder="10 tablas con logo + 10 tote bags"
              className="w-full px-3 py-2 text-sm bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Descuento %</label>
              <input type="number" value={newBundle.discountPercent} onChange={e => setNewBundle(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                className="w-20 px-3 py-2 text-sm bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:border-accent-gold outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs text-wood-500 hover:text-wood-700">Cancelar</button>
              <button onClick={handleAdd} disabled={!newBundle.name.trim()} className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">Crear Paquete</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-xs font-bold text-accent-gold hover:underline">
          <Plus className="w-3.5 h-3.5" /> Crear nuevo paquete
        </button>
      )}
    </div>
  );
}
