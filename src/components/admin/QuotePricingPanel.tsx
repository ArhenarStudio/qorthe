"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, RotateCcw, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Edit3, GripVertical } from 'lucide-react';
import { FullQuoteConfig, DEFAULT_FULL_CONFIG } from '@/components/quote/quoteConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ═══════════════════════════════════════════════════════════════
// QuotePricingPanel — Admin panel completo para configurar
// TODOS los aspectos del cotizador: productos, materiales,
// precios, bundles, extras, zonas, acabados
// ═══════════════════════════════════════════════════════════════

type Section = 'productos' | 'maderas' | 'textil' | 'grabado' | 'diseno' | 'descuentos' | 'bundles' | 'galeria';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'productos', label: 'Productos' },
  { id: 'maderas', label: 'Maderas' },
  { id: 'textil', label: 'Textil' },
  { id: 'grabado', label: 'Grabado' },
  { id: 'diseno', label: 'Diseño' },
  { id: 'descuentos', label: 'Descuentos' },
  { id: 'bundles', label: 'Paquetes' },
  { id: 'galeria', label: 'Galería' },
];


// Inline delete confirmation (replaces browser confirm() dialogs)
const InlineConfirm: React.FC<{ label: string; onConfirm: () => void; children: React.ReactNode }> = ({ label, onConfirm, children }) => {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button onClick={() => { onConfirm(); setConfirming(false); }} className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors">Sí, eliminar</button>
        <button onClick={() => setConfirming(false)} className="px-2 py-0.5 bg-wood-200 text-[var(--text)] text-[10px] font-bold rounded hover:bg-wood-300 transition-colors">Cancelar</button>
      </span>
    );
  }
  return <span onClick={() => setConfirming(true)}>{children}</span>;
};

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
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>;
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
                ? 'bg-wood-900 dark:bg-[var(--surface2)] text-sand-100 dark:text-[var(--text)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface2)] dark:hover:bg-wood-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[var(--surface)] dark:bg-wood-950 rounded-xl border border-[var(--border)] dark:border-wood-800 p-6 min-h-[400px]">
        {section === 'productos' && <ProductosSection config={config} onChange={updateConfig} />}
        {section === 'maderas' && <MaderasSection config={config} onChange={updateConfig} />}
        {section === 'textil' && <TextilSection config={config} onChange={updateConfig} />}
        {section === 'grabado' && <GrabadoSection config={config} onChange={updateConfig} />}
        {section === 'diseno' && <DisenoSection config={config} onChange={updateConfig} />}
        {section === 'descuentos' && <DescuentosSection config={config} onChange={updateConfig} />}
        {section === 'bundles' && <BundlesSection config={config} onChange={updateConfig} />}
        {section === 'galeria' && <GaleriaSection config={config} onChange={updateConfig} />}
      </div>

      {/* Save bar */}
      {dirty && (
        <div className="sticky bottom-4 flex items-center justify-between bg-wood-900 dark:bg-[var(--surface2)] text-sand-100 dark:text-[var(--text)] rounded-xl px-6 py-4 shadow-xl">
          <span className="text-sm font-medium">Cambios sin guardar</span>
          <div className="flex gap-3">
            <button onClick={handleUndo} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 text-xs font-bold uppercase">
              <RotateCcw className="w-3.5 h-3.5" /> Deshacer
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-[var(--accent)] text-[var(--text)] text-xs font-bold uppercase hover:shadow-lg disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-wood-900 dark:bg-[var(--surface2)] text-sand-100 dark:text-[var(--text)] px-6 py-3 rounded-xl shadow-xl text-sm font-medium z-50">
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
      {enabled ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-[var(--text-muted)]" />}
    </button>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-serif font-bold text-[var(--text)] dark:text-sand-100">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Reusable CRUD row helpers ───────────────────────────────

function MoveButtons({ index, total, onMove }: { index: number; total: number; onMove: (from: number, to: number) => void }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <button disabled={index === 0} onClick={() => onMove(index, index - 1)}
        className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-20 transition-colors">
        <ChevronUp className="w-3 h-3" />
      </button>
      <button disabled={index === total - 1} onClick={() => onMove(index, index + 1)}
        className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-20 transition-colors">
        <ChevronDown className="w-3 h-3" />
      </button>
    </div>
  );
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// ── PRODUCTOS ───────────────────────────────────────────────

function ProductosSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [addingTo, setAddingTo] = useState<'wood' | 'textile' | null>(null);
  const [newProd, setNewProd] = useState({ type: '', label: '', desc: '' });

  const handleAddProduct = (cat: 'wood' | 'textile') => {
    if (!newProd.label.trim()) return;
    const product = { type: newProd.type || newProd.label, category: (cat === 'wood' ? 'madera' : 'textil') as 'madera' | 'textil', label: newProd.label, desc: newProd.desc, enabled: true };
    if (cat === 'wood') onChange({ woodProducts: [...config.woodProducts, product] });
    else onChange({ textileProducts: [...config.textileProducts, product] });
    setNewProd({ type: '', label: '', desc: '' });
    setAddingTo(null);
  };

  const removeProduct = (cat: 'wood' | 'textile', idx: number) => {
        if (cat === 'wood') onChange({ woodProducts: config.woodProducts.filter((_, i) => i !== idx) });
    else onChange({ textileProducts: config.textileProducts.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Productos de Madera" subtitle="Agrega, reordena o desactiva productos de madera del cotizador" />
      <div className="space-y-2">
        {config.woodProducts.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.woodProducts.length} onMove={(from, to) => onChange({ woodProducts: moveItem(config.woodProducts, from, to) })} />
            <EnableToggle enabled={p.enabled} onChange={(v) => {
              const arr = [...config.woodProducts]; arr[i] = { ...p, enabled: v }; onChange({ woodProducts: arr });
            }} />
            <div className="flex-1 min-w-0">
              <input value={p.label} onChange={(e) => { const arr = [...config.woodProducts]; arr[i] = { ...p, label: e.target.value }; onChange({ woodProducts: arr }); }}
                className="font-medium text-sm text-[var(--text)] dark:text-sand-100 bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full" />
              <input value={p.desc} onChange={(e) => { const arr = [...config.woodProducts]; arr[i] = { ...p, desc: e.target.value }; onChange({ woodProducts: arr }); }}
                className="text-xs text-[var(--text-muted)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full mt-0.5" placeholder="Descripción..." />
            </div>
            <button onClick={() => removeProduct('wood', i)} className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingTo === 'wood' ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newProd.label} onChange={e => setNewProd(p => ({ ...p, label: e.target.value, type: e.target.value }))} placeholder="Nombre del producto" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input value={newProd.desc} onChange={e => setNewProd(p => ({ ...p, desc: e.target.value }))} placeholder="Descripción" className="flex-1 text-xs bg-transparent outline-none text-[var(--text-muted)]" />
          <button onClick={() => handleAddProduct('wood')} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => { setAddingTo(null); setNewProd({ type: '', label: '', desc: '' }); }} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingTo('wood')} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar producto de madera</button>
      )}

      <SectionTitle title="Productos Textiles" subtitle="Agrega, reordena o desactiva productos textiles" />
      <div className="space-y-2">
        {config.textileProducts.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.textileProducts.length} onMove={(from, to) => onChange({ textileProducts: moveItem(config.textileProducts, from, to) })} />
            <EnableToggle enabled={p.enabled} onChange={(v) => {
              const arr = [...config.textileProducts]; arr[i] = { ...p, enabled: v }; onChange({ textileProducts: arr });
            }} />
            <div className="flex-1 min-w-0">
              <input value={p.label} onChange={(e) => { const arr = [...config.textileProducts]; arr[i] = { ...p, label: e.target.value }; onChange({ textileProducts: arr }); }}
                className="font-medium text-sm text-[var(--text)] dark:text-sand-100 bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full" />
              <input value={p.desc} onChange={(e) => { const arr = [...config.textileProducts]; arr[i] = { ...p, desc: e.target.value }; onChange({ textileProducts: arr }); }}
                className="text-xs text-[var(--text-muted)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full mt-0.5" placeholder="Descripción..." />
            </div>
            <button onClick={() => removeProduct('textile', i)} className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingTo === 'textile' ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newProd.label} onChange={e => setNewProd(p => ({ ...p, label: e.target.value, type: e.target.value }))} placeholder="Nombre del producto" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input value={newProd.desc} onChange={e => setNewProd(p => ({ ...p, desc: e.target.value }))} placeholder="Descripción" className="flex-1 text-xs bg-transparent outline-none text-[var(--text-muted)]" />
          <button onClick={() => handleAddProduct('textile')} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => { setAddingTo(null); setNewProd({ type: '', label: '', desc: '' }); }} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingTo('textile')} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar producto textil</button>
      )}

      <SectionTitle title="Servicio de Grabado" subtitle="Categoría de grabado láser como servicio" />
      <div className="flex items-center gap-4 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
        <EnableToggle enabled={config.serviceProduct.enabled} onChange={(v) => {
          onChange({ serviceProduct: { ...config.serviceProduct, enabled: v } });
        }} />
        <input value={config.serviceProduct.label} onChange={(e) => onChange({ serviceProduct: { ...config.serviceProduct, label: e.target.value } })}
          className="font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
      </div>
    </div>
  );
}

// ── MADERAS ─────────────────────────────────────────────────

function MaderasSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newWood, setNewWood] = useState({ label: '', color: '#8B6914', description: '', priceM2: 4000 });

  return (
    <div className="space-y-6">
      <SectionTitle title="Tipos de Madera" subtitle="Agrega, reordena, cambia precios y colores" />
      <div className="space-y-3">
        {config.woodOptions.map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.woodOptions.length} onMove={(from, to) => onChange({ woodOptions: moveItem(config.woodOptions, from, to) })} />
            <EnableToggle enabled={w.enabled} onChange={(v) => {
              const arr = [...config.woodOptions]; arr[i] = { ...w, enabled: v }; onChange({ woodOptions: arr });
            }} />
            <input type="color" value={w.color} onChange={(e) => {
              const arr = [...config.woodOptions]; arr[i] = { ...w, color: e.target.value, gradient: `linear-gradient(135deg, ${e.target.value} 0%, ${e.target.value}88 100%)` }; onChange({ woodOptions: arr });
            }} className="w-8 h-8 rounded-lg border-0 cursor-pointer shrink-0" />
            <div className="flex-1 min-w-0">
              <input value={w.label} onChange={(e) => { const arr = [...config.woodOptions]; arr[i] = { ...w, label: e.target.value }; onChange({ woodOptions: arr }); }}
                className="font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full" />
              <input value={w.description} onChange={(e) => { const arr = [...config.woodOptions]; arr[i] = { ...w, description: e.target.value }; onChange({ woodOptions: arr }); }}
                className="text-xs text-[var(--text-muted)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full mt-0.5" />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-[var(--text-muted)]">$/m²</span>
              <input type="number" value={w.priceM2} onChange={(e) => {
                const arr = [...config.woodOptions]; arr[i] = { ...w, priceM2: Number(e.target.value) }; onChange({ woodOptions: arr });
              }} className="w-20 px-2 py-1 text-right text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            </div>
            <button onClick={() => { onChange({ woodOptions: config.woodOptions.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input type="color" value={newWood.color} onChange={e => setNewWood(p => ({ ...p, color: e.target.value }))} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
          <input value={newWood.label} onChange={e => setNewWood(p => ({ ...p, label: e.target.value }))} placeholder="Nombre" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input value={newWood.description} onChange={e => setNewWood(p => ({ ...p, description: e.target.value }))} placeholder="Descripción" className="flex-1 text-xs bg-transparent outline-none text-[var(--text-muted)]" />
          <input type="number" value={newWood.priceM2} onChange={e => setNewWood(p => ({ ...p, priceM2: Number(e.target.value) }))} className="w-20 px-2 py-1 text-right text-sm border border-[var(--border)] rounded outline-none" />
          <button onClick={() => { if (!newWood.label.trim()) return; onChange({ woodOptions: [...config.woodOptions, { ...newWood, gradient: `linear-gradient(135deg, ${newWood.color} 0%, ${newWood.color}88 100%)`, enabled: true }] }); setNewWood({ label: '', color: '#8B6914', description: '', priceM2: 4000 }); setAdding(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAdding(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar tipo de madera</button>
      )}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Precio mínimo pieza</label>
          <input type="number" value={config.woodMinPrice} onChange={(e) => onChange({ woodMinPrice: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Espesor estándar (cm)</label>
          <input type="number" value={config.woodThicknessStandard} onChange={(e) => onChange({ woodThicknessStandard: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
        </div>
      </div>
    </div>
  );
}

// ── TEXTIL ──────────────────────────────────────────────────

function TextilSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [addingColor, setAddingColor] = useState(false);
  const [newColor, setNewColor] = useState({ label: '', hex: '#CCCCCC' });
  const [addingTech, setAddingTech] = useState(false);
  const [newTech, setNewTech] = useState({ label: '', price: 50 });

  return (
    <div className="space-y-6">
      <SectionTitle title="Colores de Tela" subtitle="Agrega, reordena o desactiva colores disponibles" />
      <div className="space-y-2">
        {config.textileColors.map((c, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.textileColors.length} onMove={(from, to) => onChange({ textileColors: moveItem(config.textileColors, from, to) })} />
            <EnableToggle enabled={c.enabled} onChange={(v) => {
              const arr = [...config.textileColors]; arr[i] = { ...c, enabled: v }; onChange({ textileColors: arr });
            }} />
            <input type="color" value={c.hex} onChange={(e) => { const arr = [...config.textileColors]; arr[i] = { ...c, hex: e.target.value }; onChange({ textileColors: arr }); }}
              className="w-6 h-6 rounded-full border-0 cursor-pointer shrink-0" />
            <input value={c.label} onChange={(e) => { const arr = [...config.textileColors]; arr[i] = { ...c, label: e.target.value }; onChange({ textileColors: arr }); }}
              className="flex-1 font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ textileColors: config.textileColors.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingColor ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input type="color" value={newColor.hex} onChange={e => setNewColor(p => ({ ...p, hex: e.target.value }))} className="w-6 h-6 rounded-full border-0 cursor-pointer" />
          <input value={newColor.label} onChange={e => setNewColor(p => ({ ...p, label: e.target.value }))} placeholder="Nombre del color" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <button onClick={() => { if (!newColor.label.trim()) return; onChange({ textileColors: [...config.textileColors, { ...newColor, enabled: true }] }); setNewColor({ label: '', hex: '#CCCCCC' }); setAddingColor(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingColor(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingColor(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar color</button>
      )}

      <SectionTitle title="Técnicas de Estampado" subtitle="Agrega, reordena y configura precios por técnica" />
      <div className="space-y-2">
        {config.textileTechniques.map((t, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.textileTechniques.length} onMove={(from, to) => onChange({ textileTechniques: moveItem(config.textileTechniques, from, to) })} />
            <EnableToggle enabled={t.enabled} onChange={(v) => {
              const arr = [...config.textileTechniques]; arr[i] = { ...t, enabled: v }; onChange({ textileTechniques: arr });
            }} />
            <input value={t.label} onChange={(e) => { const arr = [...config.textileTechniques]; arr[i] = { ...t, label: e.target.value }; onChange({ textileTechniques: arr }); }}
              className="flex-1 font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <input type="number" value={t.price} onChange={(e) => {
              const arr = [...config.textileTechniques]; arr[i] = { ...t, price: Number(e.target.value) }; onChange({ textileTechniques: arr });
            }} className="w-20 px-2 py-1 text-right text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ textileTechniques: config.textileTechniques.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingTech ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newTech.label} onChange={e => setNewTech(p => ({ ...p, label: e.target.value }))} placeholder="Nombre de técnica" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input type="number" value={newTech.price} onChange={e => setNewTech(p => ({ ...p, price: Number(e.target.value) }))} className="w-20 px-2 py-1 text-right text-sm border border-[var(--border)] rounded outline-none" />
          <button onClick={() => { if (!newTech.label.trim()) return; onChange({ textileTechniques: [...config.textileTechniques, { ...newTech, enabled: true }] }); setNewTech({ label: '', price: 50 }); setAddingTech(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingTech(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingTech(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar técnica</button>
      )}
      <div>
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Extra panel completo ($)</label>
        <input type="number" value={config.textileFullPanelExtra} onChange={(e) => onChange({ textileFullPanelExtra: Number(e.target.value) })}
          className="w-32 px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
      </div>
    </div>
  );
}

// ── GRABADO ─────────────────────────────────────────────────

function GrabadoSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [addingLevel, setAddingLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({ complexity: '', price: 100 });
  const [addingMat, setAddingMat] = useState(false);
  const [newMat, setNewMat] = useState('');

  return (
    <div className="space-y-6">
      <SectionTitle title="Precios por Complejidad" subtitle="Agrega, reordena niveles de complejidad y precios" />
      <div className="space-y-2">
        {config.engravingPrices.map((e, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.engravingPrices.length} onMove={(from, to) => onChange({ engravingPrices: moveItem(config.engravingPrices, from, to) })} />
            <input value={e.complexity} onChange={(ev) => { const arr = [...config.engravingPrices]; arr[i] = { ...e, complexity: ev.target.value }; onChange({ engravingPrices: arr }); }}
              className="flex-1 font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <span className="text-[10px] text-[var(--text-muted)]">$</span>
            <input type="number" value={e.price} onChange={(ev) => {
              const arr = [...config.engravingPrices]; arr[i] = { ...e, price: Number(ev.target.value) }; onChange({ engravingPrices: arr });
            }} className="w-20 px-2 py-1 text-right text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ engravingPrices: config.engravingPrices.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingLevel ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newLevel.complexity} onChange={e => setNewLevel(p => ({ ...p, complexity: e.target.value }))} placeholder="Nivel (ej: Ultra Premium)" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input type="number" value={newLevel.price} onChange={e => setNewLevel(p => ({ ...p, price: Number(e.target.value) }))} className="w-20 px-2 py-1 text-right text-sm border border-[var(--border)] rounded outline-none" />
          <button onClick={() => { if (!newLevel.complexity.trim()) return; onChange({ engravingPrices: [...config.engravingPrices, newLevel] }); setNewLevel({ complexity: '', price: 100 }); setAddingLevel(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingLevel(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingLevel(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar nivel de complejidad</button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Extra por zona adicional ($)</label>
          <input type="number" value={config.engravingZoneExtra} onChange={(e) => onChange({ engravingZoneExtra: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Extra código QR ($)</label>
          <input type="number" value={config.engravingQrExtra} onChange={(e) => onChange({ engravingQrExtra: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
        </div>
      </div>

      <SectionTitle title="Materiales para Servicio de Grabado" subtitle="Materiales que el cliente puede traer para grabado" />
      <div className="space-y-2">
        {config.engraveMaterials.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.engraveMaterials.length} onMove={(from, to) => onChange({ engraveMaterials: moveItem(config.engraveMaterials, from, to) })} />
            <EnableToggle enabled={m.enabled} onChange={(v) => {
              const arr = [...config.engraveMaterials]; arr[i] = { ...m, enabled: v }; onChange({ engraveMaterials: arr });
            }} />
            <input value={m.label} onChange={(e) => { const arr = [...config.engraveMaterials]; arr[i] = { ...m, label: e.target.value }; onChange({ engraveMaterials: arr }); }}
              className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ engraveMaterials: config.engraveMaterials.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingMat ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newMat} onChange={e => setNewMat(e.target.value)} placeholder="Nombre del material" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <button onClick={() => { if (!newMat.trim()) return; onChange({ engraveMaterials: [...config.engraveMaterials, { label: newMat, enabled: true }] }); setNewMat(''); setAddingMat(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingMat(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingMat(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar material</button>
      )}
    </div>
  );
}

// ── DISEÑO ──────────────────────────────────────────────────

function DisenoSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [addingShape, setAddingShape] = useState(false);
  const [newShape, setNewShape] = useState('');
  const [addingExtra, setAddingExtra] = useState(false);
  const [newExtra, setNewExtra] = useState({ label: '', desc: '', priceExtra: 0 });
  const [addingFinish, setAddingFinish] = useState(false);
  const [newFinish, setNewFinish] = useState('');

  return (
    <div className="space-y-6">
      <SectionTitle title="Formas Disponibles" subtitle="Agrega o desactiva formas de tabla" />
      <div className="space-y-2">
        {config.boardShapes.map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.boardShapes.length} onMove={(from, to) => onChange({ boardShapes: moveItem(config.boardShapes, from, to) })} />
            <EnableToggle enabled={s.enabled} onChange={(v) => {
              const arr = [...config.boardShapes]; arr[i] = { ...s, enabled: v }; onChange({ boardShapes: arr });
            }} />
            <input value={s.label} onChange={(e) => { const arr = [...config.boardShapes]; arr[i] = { ...s, label: e.target.value, value: e.target.value }; onChange({ boardShapes: arr }); }}
              className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ boardShapes: config.boardShapes.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingShape ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newShape} onChange={e => setNewShape(e.target.value)} placeholder="Nombre de la forma" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <button onClick={() => { if (!newShape.trim()) return; onChange({ boardShapes: [...config.boardShapes, { value: newShape, label: newShape, enabled: true }] }); setNewShape(''); setAddingShape(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingShape(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingShape(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar forma</button>
      )}

      <SectionTitle title="Extras y Acabados" subtitle="Complementos con precio extra opcional" />
      <div className="space-y-2">
        {config.boardExtras.map((ex, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.boardExtras.length} onMove={(from, to) => onChange({ boardExtras: moveItem(config.boardExtras, from, to) })} />
            <EnableToggle enabled={ex.enabled} onChange={(v) => {
              const arr = [...config.boardExtras]; arr[i] = { ...ex, enabled: v }; onChange({ boardExtras: arr });
            }} />
            <div className="flex-1 min-w-0">
              <input value={ex.label} onChange={(e) => { const arr = [...config.boardExtras]; arr[i] = { ...ex, label: e.target.value }; onChange({ boardExtras: arr }); }}
                className="font-medium text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full" />
              <input value={ex.desc} onChange={(e) => { const arr = [...config.boardExtras]; arr[i] = { ...ex, desc: e.target.value }; onChange({ boardExtras: arr }); }}
                className="text-xs text-[var(--text-muted)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full mt-0.5" />
            </div>
            <input type="number" value={ex.priceExtra} placeholder="0" onChange={(e) => {
              const arr = [...config.boardExtras]; arr[i] = { ...ex, priceExtra: Number(e.target.value) }; onChange({ boardExtras: arr });
            }} className="w-20 px-2 py-1 text-right text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ boardExtras: config.boardExtras.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingExtra ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newExtra.label} onChange={e => setNewExtra(p => ({ ...p, label: e.target.value }))} placeholder="Nombre" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <input value={newExtra.desc} onChange={e => setNewExtra(p => ({ ...p, desc: e.target.value }))} placeholder="Descripción" className="flex-1 text-xs bg-transparent outline-none text-[var(--text-muted)]" />
          <input type="number" value={newExtra.priceExtra} onChange={e => setNewExtra(p => ({ ...p, priceExtra: Number(e.target.value) }))} className="w-16 px-2 py-1 text-right text-sm border border-[var(--border)] rounded outline-none" placeholder="$" />
          <button onClick={() => { if (!newExtra.label.trim()) return; onChange({ boardExtras: [...config.boardExtras, { key: newExtra.label.toLowerCase().replace(/\s+/g, '_'), ...newExtra, enabled: true }] }); setNewExtra({ label: '', desc: '', priceExtra: 0 }); setAddingExtra(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingExtra(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingExtra(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar extra</button>
      )}

      <SectionTitle title="Tipos de Acabado" subtitle="Acabados disponibles para tablas" />
      <div className="space-y-2">
        {config.boardFinishes.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={config.boardFinishes.length} onMove={(from, to) => onChange({ boardFinishes: moveItem(config.boardFinishes, from, to) })} />
            <EnableToggle enabled={f.enabled} onChange={(v) => {
              const arr = [...config.boardFinishes]; arr[i] = { ...f, enabled: v }; onChange({ boardFinishes: arr });
            }} />
            <input value={f.label} onChange={(e) => { const arr = [...config.boardFinishes]; arr[i] = { ...f, label: e.target.value }; onChange({ boardFinishes: arr }); }}
              className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ boardFinishes: config.boardFinishes.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingFinish ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newFinish} onChange={e => setNewFinish(e.target.value)} placeholder="Nombre del acabado" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <button onClick={() => { if (!newFinish.trim()) return; onChange({ boardFinishes: [...config.boardFinishes, { label: newFinish, enabled: true }] }); setNewFinish(''); setAddingFinish(false); }} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingFinish(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingFinish(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar acabado</button>
      )}
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
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <span className="text-xs text-[var(--text-muted)] shrink-0">A partir de</span>
            <input type="number" value={d.min_qty}
              onChange={(e) => {
                const arr = [...config.volumeDiscounts]; arr[i] = { ...d, min_qty: Number(e.target.value) }; onChange({ volumeDiscounts: arr });
              }}
              className="w-16 px-2 py-1 text-center text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            <span className="text-xs text-[var(--text-muted)]">piezas →</span>
            <input type="number" value={d.percent}
              onChange={(e) => {
                const arr = [...config.volumeDiscounts]; arr[i] = { ...d, percent: Number(e.target.value) }; onChange({ volumeDiscounts: arr });
              }}
              className="w-16 px-2 py-1 text-center text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
            <span className="text-xs text-[var(--text-muted)]">%</span>
            <button onClick={() => removeDiscount(i)} className="p-1 text-[var(--text-muted)] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={addDiscount} className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline">
        <Plus className="w-3.5 h-3.5" /> Agregar nivel de descuento
      </button>

      <SectionTitle title="Descuento por Membresía" subtitle="Aplicar descuento automático según el tier de lealtad del cliente" />
      <div className="flex items-center gap-4 px-4 py-3 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
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
            <div key={b.id} className="bg-[var(--surface2)] dark:bg-wood-900/50 rounded-xl border border-[var(--border)] dark:border-wood-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <EnableToggle enabled={b.enabled} onChange={(v) => updateBundle(i, { enabled: v })} />
                <button onClick={() => setExpandedId(isExpanded ? null : b.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-[var(--text)] dark:text-sand-100 block truncate">{b.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{b.segment || 'Sin segmento'} · {b.items.length} items</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input type="number" value={b.discountPercent}
                    onChange={(e) => updateBundle(i, { discountPercent: Number(e.target.value) })}
                    className="w-14 px-2 py-1 text-center text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded focus:border-[var(--accent)] outline-none" />
                  <span className="text-[10px] text-[var(--text-muted)]">%</span>
                </div>
                <button onClick={() => handleDelete(i)} className="p-1.5 text-[var(--text-muted)] hover:text-red-500 shrink-0 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)] dark:border-wood-800 pt-3">
                  {/* Editable fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Nombre</label>
                      <input value={b.name} onChange={(e) => updateBundle(i, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Segmento</label>
                      <input value={b.segment} onChange={(e) => updateBundle(i, { segment: e.target.value })}
                        placeholder="B2B, Novios, Restaurantes..."
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descuento %</label>
                      <input type="number" value={b.discountPercent} onChange={(e) => updateBundle(i, { discountPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descripción</label>
                    <input value={b.desc} onChange={(e) => updateBundle(i, { desc: e.target.value })}
                      placeholder="Describe el paquete..."
                      className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-2">Productos del paquete</label>
                    <div className="space-y-2">
                      {b.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 bg-[var(--surface)] dark:bg-wood-800 rounded-lg p-2 border border-[var(--border)] dark:border-wood-700">
                          <select value={item.category} onChange={(e) => {
                            const cat = e.target.value as 'madera' | 'textil' | 'grabado';
                            const defaultType = cat === 'madera' ? 'Tabla de picar' : cat === 'textil' ? 'Tote bag' : 'Servicio de Grabado';
                            updateItem(i, j, { category: cat, type: defaultType });
                          }} className="text-xs bg-[var(--surface2)] dark:bg-wood-900 border border-[var(--border)] dark:border-wood-600 rounded px-2 py-1.5 outline-none">
                            {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                          <select value={item.type} onChange={(e) => updateItem(i, j, { type: e.target.value })}
                            className="flex-1 text-xs bg-[var(--surface2)] dark:bg-wood-900 border border-[var(--border)] dark:border-wood-600 rounded px-2 py-1.5 outline-none min-w-0">
                            {allProducts.filter(p => p.category === item.category).map(p => <option key={p.type} value={p.type}>{p.label}</option>)}
                            {item.category === 'grabado' && <option value="Servicio de Grabado">Servicio de Grabado</option>}
                          </select>
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">×</span>
                          <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, j, { quantity: Number(e.target.value) || 1 })}
                            className="w-14 text-center text-xs bg-[var(--surface2)] dark:bg-wood-900 border border-[var(--border)] dark:border-wood-600 rounded px-1 py-1.5 outline-none" />
                          <button onClick={() => removeItem(i, j)} className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addItem(i)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline mt-2">
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
        <div className="bg-[var(--surface)] dark:bg-wood-900 rounded-xl border border-[var(--accent)]/30 p-4 space-y-3">
          <h4 className="text-sm font-medium text-[var(--text)] dark:text-sand-100">Nuevo Paquete</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Nombre *</label>
              <input value={newBundle.name} onChange={e => setNewBundle(p => ({ ...p, name: e.target.value }))}
                placeholder="Kit Corporativo"
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Segmento</label>
              <input value={newBundle.segment} onChange={e => setNewBundle(p => ({ ...p, segment: e.target.value }))}
                placeholder="B2B / Empresas"
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descripción</label>
            <input value={newBundle.desc} onChange={e => setNewBundle(p => ({ ...p, desc: e.target.value }))}
              placeholder="10 tablas con logo + 10 tote bags"
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descuento %</label>
              <input type="number" value={newBundle.discountPercent} onChange={e => setNewBundle(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                className="w-20 px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">Cancelar</button>
              <button onClick={handleAdd} disabled={!newBundle.name.trim()} className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">Crear Paquete</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Crear nuevo paquete
        </button>
      )}
    </div>
  );
}


// ── GALERÍA DE DISEÑOS ──────────────────────────────────────

function GaleriaSection({ config, onChange }: { config: FullQuoteConfig; onChange: (p: Partial<FullQuoteConfig>) => void }) {
  const [addingCat, setAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [addingTemplate, setAddingTemplate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTpl, setNewTpl] = useState({
    name: '', category: config.designCategories?.[0]?.id || 'monograma', desc: '',
    svgCode: '', defaultText: '', tags: '', applicableTo: ['madera', 'textil', 'grabado'] as string[],
  });

  const categories = config.designCategories || [];
  const templates = config.designTemplates || [];

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const id = newCatLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onChange({ designCategories: [...categories, { id, label: newCatLabel, enabled: true }] });
    setNewCatLabel('');
    setAddingCat(false);
  };

  const handleAddTemplate = () => {
    if (!newTpl.name.trim()) return;
    const id = `tpl-${Date.now()}`;
    onChange({
      designTemplates: [...templates, {
        id, name: newTpl.name, category: newTpl.category, desc: newTpl.desc,
        svgCode: newTpl.svgCode, defaultText: newTpl.defaultText,
        tags: newTpl.tags.split(',').map(t => t.trim()).filter(Boolean),
        applicableTo: newTpl.applicableTo as ('madera' | 'textil' | 'grabado')[],
        enabled: true,
      }],
    });
    setNewTpl({ name: '', category: categories[0]?.id || '', desc: '', svgCode: '', defaultText: '', tags: '', applicableTo: ['madera', 'textil', 'grabado'] });
    setAddingTemplate(false);
  };

  const updateTemplate = (idx: number, updates: Partial<FullQuoteConfig['designTemplates'][0]>) => {
    const arr = [...templates]; arr[idx] = { ...arr[idx], ...updates };
    onChange({ designTemplates: arr });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <SectionTitle title="Categorías de Diseño" subtitle="Organiza los templates por categoría" />
      <div className="space-y-2">
        {categories.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)] dark:bg-wood-900/50 rounded-lg">
            <MoveButtons index={i} total={categories.length} onMove={(from, to) => onChange({ designCategories: moveItem(categories, from, to) })} />
            <EnableToggle enabled={c.enabled} onChange={(v) => {
              const arr = [...categories]; arr[i] = { ...c, enabled: v }; onChange({ designCategories: arr });
            }} />
            <input value={c.label} onChange={(e) => {
              const arr = [...categories]; arr[i] = { ...c, label: e.target.value }; onChange({ designCategories: arr });
            }} className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none" />
            <button onClick={() => { onChange({ designCategories: categories.filter((_, j) => j !== i) }); }}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      {addingCat ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg">
          <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Nombre de categoría" className="flex-1 text-sm bg-transparent outline-none" autoFocus />
          <button onClick={handleAddCategory} className="text-xs text-[var(--accent)] font-bold hover:underline">Agregar</button>
          <button onClick={() => setAddingCat(false)} className="text-xs text-[var(--text-muted)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setAddingCat(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar categoría</button>
      )}

      {/* Templates */}
      <SectionTitle title="Templates de Diseño" subtitle={`${templates.length} diseños disponibles para el cotizador`} />
      <div className="space-y-3">
        {templates.map((t, i) => {
          const isExpanded = expandedId === t.id;
          const cat = categories.find(c => c.id === t.category);
          return (
            <div key={t.id} className="bg-[var(--surface2)] dark:bg-wood-900/50 rounded-xl border border-[var(--border)] dark:border-wood-800 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <MoveButtons index={i} total={templates.length} onMove={(from, to) => onChange({ designTemplates: moveItem(templates, from, to) })} />
                <EnableToggle enabled={t.enabled} onChange={(v) => updateTemplate(i, { enabled: v })} />
                {/* SVG preview thumbnail */}
                <div className="w-10 h-10 shrink-0 text-[var(--text-secondary)] rounded-lg bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 overflow-hidden p-1">
                  {t.svgCode ? (
                    <div dangerouslySetInnerHTML={{ __html: t.svgCode }} className="w-full h-full [&>svg]:w-full [&>svg]:h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-muted)]">SVG</div>
                  )}
                </div>
                <button onClick={() => setExpandedId(isExpanded ? null : t.id)} className="flex-1 text-left min-w-0">
                  <span className="font-medium text-sm text-[var(--text)] dark:text-sand-100 block truncate">{t.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{cat?.label || t.category} · {t.applicableTo.join(', ')}</span>
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                <button onClick={() => { onChange({ designTemplates: templates.filter((_, j) => j !== i) }); }}
                  className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] dark:border-wood-800 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Nombre</label>
                      <input value={t.name} onChange={e => updateTemplate(i, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Categoría</label>
                      <select value={t.category} onChange={e => updateTemplate(i, { category: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg outline-none">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descripción</label>
                    <input value={t.desc} onChange={e => updateTemplate(i, { desc: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Código SVG</label>
                    <textarea value={t.svgCode} onChange={e => updateTemplate(i, { svgCode: e.target.value })}
                      rows={3} className="w-full px-3 py-2 text-xs font-mono bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Texto default</label>
                      <input value={t.defaultText || ''} onChange={e => updateTemplate(i, { defaultText: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Tags (coma separados)</label>
                      <input value={t.tags.join(', ')} onChange={e => updateTemplate(i, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Aplica a</label>
                    <div className="flex gap-2">
                      {(['madera', 'textil', 'grabado'] as const).map(cat => {
                        const active = t.applicableTo.includes(cat);
                        return (
                          <button key={cat} onClick={() => {
                            const newApplicable = active ? t.applicableTo.filter(a => a !== cat) : [...t.applicableTo, cat];
                            if (newApplicable.length > 0) updateTemplate(i, { applicableTo: newApplicable as ('madera' | 'textil' | 'grabado')[] });
                          }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add template */}
      {addingTemplate ? (
        <div className="bg-[var(--surface)] dark:bg-wood-900 rounded-xl border border-[var(--accent)]/30 p-4 space-y-3">
          <h4 className="text-sm font-medium text-[var(--text)] dark:text-sand-100">Nuevo Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Nombre *</label>
              <input value={newTpl.name} onChange={e => setNewTpl(p => ({ ...p, name: e.target.value }))} placeholder="Logo Empresa"
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Categoría</label>
              <select value={newTpl.category} onChange={e => setNewTpl(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Descripción</label>
            <input value={newTpl.desc} onChange={e => setNewTpl(p => ({ ...p, desc: e.target.value }))} placeholder="Descripción breve"
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Código SVG</label>
            <textarea value={newTpl.svgCode} onChange={e => setNewTpl(p => ({ ...p, svgCode: e.target.value }))}
              rows={3} placeholder='<svg viewBox="0 0 80 80">...</svg>'
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--surface2)] dark:bg-wood-800 border border-[var(--border)] dark:border-wood-700 rounded-lg focus:border-[var(--accent)] outline-none resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAddingTemplate(false)} className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">Cancelar</button>
            <button onClick={handleAddTemplate} disabled={!newTpl.name.trim()} className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">Crear Template</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingTemplate(true)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"><Plus className="w-3.5 h-3.5" /> Agregar template de diseño</button>
      )}
    </div>
  );
}
