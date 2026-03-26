"use client";
// ═══════════════════════════════════════════════════════════════
// ShippingConfigPanel — Panel de configuración de envíos
// Tab "Configuración" dentro de ShippingPageLive (/admin/shipping)
// Conexiones:
//   ① Lee/guarda en Supabase via /api/admin/shipping-config
//   ② SetupWizard hace deeplink → /admin/shipping?tab=config
//   ③ POSPage consume posOptions desde useShippingConfig()
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import {
  Truck, MapPin, Plus, Trash2, ChevronDown, ChevronRight,
  Settings, Zap, Package, RefreshCw, AlertCircle, Globe,
  DollarSign, Filter, Save, Key, GripVertical, Info, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useShippingConfig } from "@/src/hooks/useShippingConfig";
import type {
  ShippingConfig, ShippingZone, ShippingRate, ShippingCondition, POSShippingOption,
} from "@/src/hooks/useShippingConfig";

// ── Helpers ──────────────────────────────────────────────────
const fmtMXN = (cents: number) =>
  cents === 0 ? "Gratis" : `$${(cents / 100).toLocaleString("es-MX")} MXN`;

const CARRIER_LABELS: Record<string, { label: string; dot: string }> = {
  envia_dhl:      { label: "DHL via Envia",     dot: "#F59E0B" },
  envia_estafeta: { label: "Estafeta via Envia", dot: "#0D9488" },
  envia_fedex:    { label: "FedEx via Envia",    dot: "#A855F7" },
  manual:         { label: "Manual / Propio",    dot: "#6B7A85" },
  free:           { label: "Envío gratis",       dot: "#22C55E" },
  pickup:         { label: "Recoger en tienda",  dot: "#3B82F6" },
};

const CONDITION_TYPES = [
  { value: "subtotal",         label: "Subtotal del carrito" },
  { value: "weight",           label: "Peso (g)" },
  { value: "quantity",         label: "Cantidad de productos" },
  { value: "postal_code",      label: "Código postal destino" },
  { value: "product_category", label: "Categoría de producto" },
];
const OPERATORS_NUM  = [
  { value: "gte",     label: "≥ Mayor o igual" },
  { value: "lte",     label: "≤ Menor o igual" },
  { value: "eq",      label: "= Igual a" },
  { value: "between", label: "Entre (rango)" },
];
const OPERATORS_TEXT = [
  { value: "eq", label: "= Igual a" },
  { value: "in", label: "Está en lista" },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Primitivos ──────────────────────────────────────────────
function OSCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] p-4 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 36, height: 20 }} className="relative flex-shrink-0">
      <div className="absolute inset-0 rounded-full transition-colors"
        style={{ background: on ? "var(--primary)" : "var(--border2)" }} />
      <div className="absolute top-0.5 rounded-full transition-all"
        style={{ width: 16, height: 16, background: "#fff", left: on ? 18 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-[12px] rounded-[var(--radius-input)] outline-none"
      style={{ background: "var(--surface2)", border: "1.5px solid var(--border2)", color: "var(--text)" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
    />
  );
}

function Sel({ value, onChange, options, className = "" }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 text-[12px] rounded-[var(--radius-input)] outline-none ${className}`}
      style={{ background: "var(--surface2)", border: "1.5px solid var(--border2)", color: "var(--text)", cursor: "pointer" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── ConditionRow ────────────────────────────────────────────
function ConditionRow({ cond, onChange, onRemove }: {
  cond: ShippingCondition; onChange: (c: ShippingCondition) => void; onRemove: () => void;
}) {
  const isText = cond.type === "postal_code" || cond.type === "product_category";
  const ops = isText ? OPERATORS_TEXT : OPERATORS_NUM;
  return (
    <div className="flex items-center gap-2 flex-wrap p-2 rounded-[var(--radius-card)]"
      style={{ background: "var(--surf2)", border: "1px solid var(--border2)" }}>
      <Sel value={cond.type} onChange={(v) => onChange({ ...cond, type: v as ShippingCondition["type"] })}
        options={CONDITION_TYPES} className="flex-1 min-w-[130px]" />
      <Sel value={cond.operator} onChange={(v) => onChange({ ...cond, operator: v as ShippingCondition["operator"] })}
        options={ops} className="flex-1 min-w-[120px]" />
      <input type={isText ? "text" : "number"} value={String(cond.value)} placeholder="Valor"
        onChange={(e) => onChange({ ...cond, value: isText ? e.target.value : Number(e.target.value), label: `${cond.type} ${cond.operator} ${e.target.value}` })}
        className="w-24 px-2 py-1.5 text-[12px] rounded-[var(--radius-input)] outline-none"
        style={{ background: "var(--surf3,var(--surface2))", border: "1px solid var(--border2)", color: "var(--text)" }} />
      {cond.operator === "between" && (
        <>
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>y</span>
          <input type="number" value={cond.value2 ?? ""} placeholder="Máx"
            onChange={(e) => onChange({ ...cond, value2: Number(e.target.value) })}
            className="w-20 px-2 py-1.5 text-[12px] rounded-[var(--radius-input)] outline-none"
            style={{ background: "var(--surf3,var(--surface2))", border: "1px solid var(--border2)", color: "var(--text)" }} />
        </>
      )}
      <button onClick={onRemove} className="p-1 rounded hover:opacity-80"
        style={{ color: "var(--error,#ef4444)", background: "var(--error-subtle,#fef2f2)" }}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── RateCard ────────────────────────────────────────────────
function RateCard({ rate, onUpdate, onRemove }: {
  rate: ShippingRate; onUpdate: (r: ShippingRate) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const carrier = CARRIER_LABELS[rate.carrier] ?? { label: rate.carrier, dot: "#6B7A85" };

  return (
    <div className="rounded-[var(--radius-card)] overflow-hidden"
      style={{ border: `1.5px solid ${rate.active ? "var(--border2)" : "var(--border)"}`, background: "var(--surf2,var(--surface2))", opacity: rate.active ? 1 : 0.55 }}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: carrier.dot }} />
        <div className="flex-1 min-w-0">
          <input value={rate.label} onChange={(e) => onUpdate({ ...rate, label: e.target.value })}
            className="w-full bg-transparent text-[12px] font-semibold outline-none" style={{ color: "var(--text)" }} />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px]" style={{ color: "var(--primary)" }}>{carrier.label}</span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>·</span>
            <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{fmtMXN(rate.price)}</span>
            {rate.conditions.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "var(--primary-t,#0c2420)", color: "var(--primary-l,#2dd4bf)", border: "1px solid var(--primary)" }}>
                {rate.conditions.length} cond.
              </span>
            )}
          </div>
        </div>
        <Toggle on={rate.active} onChange={(v) => onUpdate({ ...rate, active: v })} />
        <button onClick={() => setOpen((p) => !p)} className="p-1 rounded hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <button onClick={onRemove} className="p-1 rounded hover:opacity-80"
          style={{ color: "var(--error,#ef4444)", background: "var(--error-subtle,#fef2f2)" }}>
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Carrier">
              <Sel value={rate.carrier} onChange={(v) => onUpdate({ ...rate, carrier: v as ShippingRate["carrier"] })}
                options={Object.entries(CARRIER_LABELS).map(([v, d]) => ({ value: v, label: d.label }))} />
            </Field>
            <Field label="Precio (MXN)">
              <input type="number" value={rate.price / 100} min={0}
                onChange={(e) => onUpdate({ ...rate, price: Math.round(Number(e.target.value) * 100) })}
                className="w-full px-3 py-2 text-[12px] rounded-[var(--radius-input)] outline-none"
                style={{ background: "var(--surf3,var(--surface2))", border: "1.5px solid var(--border2)", color: "var(--text)" }} />
            </Field>
          </div>
          <Field label="Tiempo estimado">
            <Input value={rate.estimated_days} onChange={(v) => onUpdate({ ...rate, estimated_days: v })}
              placeholder="Ej: 2–3 días hábiles" />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                <Filter size={9} className="inline mr-1" />Condiciones (AND lógico)
              </span>
              <button onClick={() => onUpdate({ ...rate, conditions: [...rate.conditions, { id: uid(), type: "subtotal", operator: "gte", value: 0, label: "subtotal ≥ 0" }] })}
                className="text-[10px] flex items-center gap-1 px-2 py-1 rounded hover:opacity-80"
                style={{ color: "var(--primary-l,#2dd4bf)", background: "var(--primary-t,#0c2420)", border: "1px solid var(--primary)" }}>
                <Plus size={10} /> Agregar
              </button>
            </div>
            {rate.conditions.length === 0
              ? <p className="text-[11px] py-2 text-center" style={{ color: "var(--text-muted)" }}>Sin condiciones — tarifa siempre disponible</p>
              : <div className="space-y-2">
                  {rate.conditions.map((c, ci) => (
                    <ConditionRow key={c.id} cond={c}
                      onChange={(u) => { const nc = [...rate.conditions]; nc[ci] = u; onUpdate({ ...rate, conditions: nc }); }}
                      onRemove={() => onUpdate({ ...rate, conditions: rate.conditions.filter((_, i) => i !== ci) })} />
                  ))}
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── ZoneCard ────────────────────────────────────────────────
function ZoneCard({ zone, onUpdate, onRemove }: {
  zone: ShippingZone; onUpdate: (z: ShippingZone) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const activeRates = zone.rates.filter((r) => r.active).length;

  const addRate = () => onUpdate({ ...zone, rates: [...zone.rates, {
    id: uid(), carrier: "manual", label: "Nueva tarifa",
    price: 0, estimated_days: "3–5 días", conditions: [], active: true, sort_order: zone.rates.length + 1,
  }]});

  return (
    <div className="rounded-[var(--radius-card)] overflow-hidden"
      style={{ border: "1.5px solid var(--border2)", background: "var(--surf2,var(--surface2))" }}>
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none", background: "var(--surface)" }}>
        <MapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <input value={zone.name} onChange={(e) => onUpdate({ ...zone, name: e.target.value })}
            className="w-full bg-transparent text-[13px] font-bold outline-none"
            style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }} />
          <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {zone.coverage || "Sin descripción"} · {activeRates} tarifa{activeRates !== 1 ? "s" : ""} activa{activeRates !== 1 ? "s" : ""}
          </p>
        </div>
        <Toggle on={zone.active} onChange={(v) => onUpdate({ ...zone, active: v })} />
        <button onClick={() => setOpen((p) => !p)} className="p-1.5 rounded hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <button onClick={onRemove} className="p-1.5 rounded hover:opacity-80"
          style={{ color: "var(--error,#ef4444)", background: "var(--error-subtle,#fef2f2)" }}>
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Descripción de cobertura">
              <Input value={zone.coverage} onChange={(v) => onUpdate({ ...zone, coverage: v })}
                placeholder="Ej: CP 83000–83999 y alrededores" />
            </Field>
            <Field label="Códigos postales (separados por coma)" hint="Puedes usar rangos: 83000-83999">
              <Input
                value={zone.postal_codes.join(", ")}
                onChange={(v) => onUpdate({ ...zone, postal_codes: v.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="83000-83999, 84000" />
            </Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                <Truck size={9} className="inline mr-1" />Tarifas
              </span>
              <button onClick={addRate}
                className="text-[10px] flex items-center gap-1 px-2 py-1 rounded hover:opacity-80"
                style={{ color: "var(--primary-l,#2dd4bf)", background: "var(--primary-t,#0c2420)", border: "1px solid var(--primary)" }}>
                <Plus size={10} /> Agregar tarifa
              </button>
            </div>
            {zone.rates.length === 0
              ? <div className="py-5 text-center rounded-[var(--radius-card)]" style={{ border: "1px dashed var(--border2)" }}>
                  <Truck size={18} className="mx-auto mb-1" style={{ color: "var(--text-muted)" }} />
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Sin tarifas</p>
                </div>
              : <div className="space-y-2">
                  {zone.rates.map((rate, ri) => (
                    <RateCard key={rate.id} rate={rate}
                      onUpdate={(r) => { const rates = [...zone.rates]; rates[ri] = r; onUpdate({ ...zone, rates }); }}
                      onRemove={() => onUpdate({ ...zone, rates: zone.rates.filter((_, i) => i !== ri) })} />
                  ))}
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── POSOptionsEditor ────────────────────────────────────────
function POSOptionsEditor({ options, onChange }: { options: POSShippingOption[]; onChange: (o: POSShippingOption[]) => void }) {
  const update = (idx: number, u: POSShippingOption) => { const n = [...options]; n[idx] = u; onChange(n); };
  const add = () => onChange([...options, { id: uid(), label: "Nueva opción", icon: "📦", price: 0, active: true, sort_order: options.length + 1 }]);

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2 p-3 rounded-[var(--radius-card)]"
          style={{ background: "var(--surf2,var(--surface2))", border: "1px solid var(--border2)", opacity: opt.active ? 1 : 0.5 }}>
          <GripVertical size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input value={opt.icon} onChange={(e) => update(i, { ...opt, icon: e.target.value })}
            className="w-9 text-center bg-transparent text-[14px] outline-none" style={{ color: "var(--text)" }} />
          <input value={opt.label} onChange={(e) => update(i, { ...opt, label: e.target.value })}
            className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: "var(--text)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>$</span>
          <input type="number" min={0} value={opt.price / 100}
            onChange={(e) => update(i, { ...opt, price: Math.round(Number(e.target.value) * 100) })}
            className="w-20 text-right px-2 py-1 text-[12px] rounded outline-none"
            style={{ background: "var(--surf3,var(--surface2))", border: "1px solid var(--border2)", color: "var(--text)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>MXN</span>
          <Toggle on={opt.active} onChange={(v) => update(i, { ...opt, active: v })} />
          <button onClick={() => onChange(options.filter((_, j) => j !== i))} className="p-1 rounded hover:opacity-80"
            style={{ color: "var(--error,#ef4444)", background: "var(--error-subtle,#fef2f2)" }}>
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button onClick={add}
        className="w-full py-2 text-[11px] flex items-center justify-center gap-1.5 rounded-[var(--radius-card)] hover:opacity-80 transition-opacity"
        style={{ border: "1px dashed var(--border2)", color: "var(--text-secondary)" }}>
        <Plus size={12} /> Agregar opción POS
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
type ConfigTab = "zones" | "pos" | "origin" | "api";
const CONFIG_TABS: { id: ConfigTab; label: string; icon: React.ElementType }[] = [
  { id: "zones",  label: "Zonas y Tarifas", icon: Globe },
  { id: "pos",    label: "Opciones POS",    icon: Zap },
  { id: "origin", label: "Remitente",       icon: MapPin },
  { id: "api",    label: "API Envia.com",   icon: Key },
];

export function ShippingConfigPanel() {
  const { config, loading, saving, error, save } = useShippingConfig();
  const [local, setLocal] = useState<ShippingConfig | null>(null);
  const [activeTab, setActiveTab] = useState<ConfigTab>("zones");
  const [dirty, setDirty] = useState(false);

  React.useEffect(() => {
    if (config && !local) setLocal(JSON.parse(JSON.stringify(config)));
  }, [config, local]);

  const update = useCallback((patch: Partial<ShippingConfig>) => {
    setLocal((prev) => prev ? { ...prev, ...patch } : prev);
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!local) return;
    const ok = await save(local);
    if (ok) { setDirty(false); toast.success("Configuración de envíos guardada"); }
    else { toast.error("Error al guardar — intenta de nuevo"); }
  };

  const handleDiscard = () => {
    if (!config) return;
    setLocal(JSON.parse(JSON.stringify(config)));
    setDirty(false);
    toast("Cambios descartados");
  };

  if (loading || !local) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--primary)" }} />
        <span className="ml-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>Cargando configuración…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-[var(--radius-card)]"
        style={{ background: "var(--error-subtle,#fef2f2)", border: "1px solid var(--error,#ef4444)" }}>
        <AlertCircle size={16} style={{ color: "var(--error,#ef4444)" }} />
        <p className="text-[13px]" style={{ color: "var(--error,#ef4444)" }}>{error}</p>
      </div>
    );
  }

  const addZone = () => {
    if (!local) return;
    update({ zones: [...local.zones, { id: uid(), name: "Nueva zona", coverage: "", postal_codes: [], rates: [], active: true }] });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}>
            Configuración de Envíos
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Define zonas, tarifas, condiciones y opciones del POS. Los cambios se reflejan en checkout y POS.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && (
            <button onClick={handleDiscard}
              className="px-3 py-1.5 text-[12px] rounded-[var(--radius-button)] hover:opacity-80"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border2)" }}>
              Descartar
            </button>
          )}
          <button onClick={handleSave} disabled={!dirty || saving}
            className="px-4 py-1.5 text-[12px] font-semibold rounded-[var(--radius-button)] flex items-center gap-1.5 disabled:opacity-40"
            style={{ background: dirty ? "var(--primary)" : "var(--surface2)", color: dirty ? "#fff" : "var(--text-muted)" }}>
            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Provider toggle */}
      <OSCard className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>Proveedor principal</p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {local.provider === "envia"
              ? "Envia.com — cotización automática con DHL, Estafeta, FedEx"
              : "Manual — tarifas fijas definidas por zona"}
          </p>
        </div>
        <div className="flex gap-1 rounded-[var(--radius-card)] overflow-hidden"
          style={{ border: "1px solid var(--border2)" }}>
          {(["envia", "manual"] as const).map((p) => (
            <button key={p} onClick={() => update({ provider: p })}
              className="px-3 py-1.5 text-[11px] font-semibold"
              style={{ background: local.provider === p ? "var(--primary)" : "transparent", color: local.provider === p ? "#fff" : "var(--text-secondary)" }}>
              {p === "envia" ? "Envia.com" : "Manual"}
            </button>
          ))}
        </div>
      </OSCard>

      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CONFIG_TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-[var(--radius-card)] whitespace-nowrap"
              style={{
                background: active ? "var(--primary-t,#0c2420)" : "transparent",
                color: active ? "var(--primary-l,#2dd4bf)" : "var(--text-secondary)",
                border: active ? "1px solid var(--primary)" : "1px solid transparent",
              }}>
              <Icon size={12} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Zonas y Tarifas */}
      {activeTab === "zones" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              {local.zones.length} zona{local.zones.length !== 1 ? "s" : ""} configurada{local.zones.length !== 1 ? "s" : ""}
            </p>
            <button onClick={addZone}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-[var(--radius-button)] hover:opacity-90"
              style={{ background: "var(--primary)", color: "#fff" }}>
              <Plus size={12} /> Nueva zona
            </button>
          </div>
          {local.zones.length === 0
            ? <OSCard className="py-10 text-center">
                <Globe size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>Sin zonas</p>
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Crea al menos una zona para habilitar envíos en el checkout</p>
              </OSCard>
            : <div className="space-y-3">
                {local.zones.map((zone, zi) => (
                  <ZoneCard key={zone.id} zone={zone}
                    onUpdate={(z) => { const zones = [...local.zones]; zones[zi] = z; update({ zones }); }}
                    onRemove={() => update({ zones: local.zones.filter((_, i) => i !== zi) })} />
                ))}
              </div>
          }
          <OSCard>
            <p className="text-[12px] font-bold mb-3" style={{ color: "var(--text)" }}>Umbral de envío gratis global</p>
            <div className="flex items-center gap-3 flex-wrap">
              <DollarSign size={14} style={{ color: "var(--accent)" }} />
              <input type="number" min={0} value={local.free_shipping_threshold}
                onChange={(e) => update({ free_shipping_threshold: Number(e.target.value) })}
                className="w-28 px-3 py-2 text-[13px] font-mono rounded-[var(--radius-input)] outline-none"
                style={{ background: "var(--surface2)", border: "1.5px solid var(--border2)", color: "var(--text)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>MXN</span>
              <Sel value={local.free_shipping_carrier} onChange={(v) => update({ free_shipping_carrier: v })}
                options={[
                  { value: "envia_estafeta", label: "Estafeta (económico)" },
                  { value: "envia_dhl",      label: "DHL Express" },
                  { value: "envia_fedex",    label: "FedEx" },
                  { value: "manual",         label: "Manual / Propio" },
                ]} className="w-44" />
            </div>
          </OSCard>
        </div>
      )}

      {/* Tab: Opciones POS */}
      {activeTab === "pos" && (
        <OSCard>
          <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text)" }}>Opciones rápidas de envío en POS</p>
          <p className="text-[11px] mb-3" style={{ color: "var(--text-secondary)" }}>
            Aparecen en el panel del POS al crear ventas manuales — conectadas en tiempo real.
          </p>
          <div className="mb-3 flex items-center gap-2 p-3 rounded-[var(--radius-card)]"
            style={{ background: "var(--primary-t,#0c2420)", border: "1px solid var(--primary)33" }}>
            <Info size={12} style={{ color: "var(--primary-l,#2dd4bf)" }} />
            <p className="text-[11px]" style={{ color: "var(--primary-l,#2dd4bf)" }}>
              Los precios son informativos para ventas manuales. El checkout en línea usa tarifas por zona.
            </p>
          </div>
          <POSOptionsEditor options={local.pos_options} onChange={(o) => update({ pos_options: o })} />
        </OSCard>
      )}

      {/* Tab: Remitente */}
      {activeTab === "origin" && (
        <OSCard>
          <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text)" }}>Dirección de origen (remitente)</p>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-secondary)" }}>
            Dirección desde donde salen los paquetes — usada para cotización y guías de Envia.com
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nombre / empresa">
              <Input value={local.origin_name} onChange={(v) => update({ origin_name: v })} placeholder="Qorthe" />
            </Field>
            <Field label="Teléfono">
              <Input value={local.origin_phone} onChange={(v) => update({ origin_phone: v })} placeholder="662-361-0742" />
            </Field>
            <Field label="Calle y número">
              <Input value={local.origin_street} onChange={(v) => update({ origin_street: v })} placeholder="Av. Rosales 123" />
            </Field>
            <Field label="Ciudad">
              <Input value={local.origin_city} onChange={(v) => update({ origin_city: v })} placeholder="Hermosillo" />
            </Field>
            <Field label="Estado">
              <Input value={local.origin_state} onChange={(v) => update({ origin_state: v })} placeholder="Sonora" />
            </Field>
            <Field label="Código postal">
              <Input value={local.origin_postal_code} onChange={(v) => update({ origin_postal_code: v })} placeholder="83000" />
            </Field>
          </div>
        </OSCard>
      )}

      {/* Tab: API Envia.com */}
      {activeTab === "api" && (
        <div className="space-y-3">
          <OSCard>
            <p className="text-[13px] font-bold mb-1" style={{ color: "var(--text)" }}>Envia.com API</p>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-secondary)" }}>
              Credenciales para cotización y generación de guías automáticas
            </p>
            <div className="space-y-3">
              <Field label="API Key" hint="Obtenla en app.envia.com → Configuración → API">
                <input type="password" value={local.envia_api_key}
                  onChange={(e) => { update({ envia_api_key: e.target.value }); setDirty(true); }}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 text-[12px] font-mono rounded-[var(--radius-input)] outline-none"
                  style={{ background: "var(--surface2)", border: "1.5px solid var(--border2)", color: "var(--text)" }} />
              </Field>
              <Field label="Modo">
                <div className="flex gap-2">
                  {(["test", "production"] as const).map((m) => (
                    <button key={m} onClick={() => update({ envia_mode: m })}
                      className="flex-1 py-2 text-[11px] font-semibold rounded-[var(--radius-button)]"
                      style={{
                        background: local.envia_mode === m ? (m === "production" ? "#16a34a" : "var(--accent)") : "var(--surface2)",
                        color: local.envia_mode === m ? "#fff" : "var(--text-secondary)",
                        border: "1px solid var(--border2)",
                      }}>
                      {m === "test" ? "Test / Sandbox" : "Producción"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </OSCard>
          <OSCard>
            <p className="text-[11px] flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <ExternalLink size={11} />
              <a href="https://app.envia.com" target="_blank" rel="noopener noreferrer"
                className="underline hover:opacity-70" style={{ color: "var(--primary-l,#2dd4bf)" }}>
                Ir a dashboard de Envia.com
              </a>
              {" · "}Soporta DHL, Estafeta y FedEx en México
            </p>
          </OSCard>
        </div>
      )}

      {/* Dirty banner */}
      {dirty && (
        <div className="flex items-center justify-between p-3 rounded-[var(--radius-card)] sticky bottom-0"
          style={{ background: "var(--accent)22", border: "1px solid var(--accent)55", backdropFilter: "blur(8px)" }}>
          <p className="text-[12px] font-semibold" style={{ color: "var(--accent)" }}>Tienes cambios sin guardar</p>
          <div className="flex gap-2">
            <button onClick={handleDiscard}
              className="px-3 py-1.5 text-[11px] rounded-[var(--radius-button)] hover:opacity-80"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border2)" }}>
              Descartar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-1.5 text-[11px] font-bold rounded-[var(--radius-button)] flex items-center gap-1 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "#fff" }}>
              {saving ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
