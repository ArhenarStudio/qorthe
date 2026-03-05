"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ───────────────────────────────────────────────

interface VolumeDiscount {
  min_qty: number;
  percent: number;
}

interface PricingConfig {
  wood_prices_m2: Record<string, number>;
  textile_base_prices: Record<string, number>;
  engraving_prices: Record<string, number>;
  engraving_zone_extra: number;
  engraving_qr_extra: number;
  textile_technique_prices: Record<string, number>;
  textile_full_panel_extra: number;
  wood_min_price: number;
  wood_thickness_standard: number;
  volume_discounts: VolumeDiscount[];
  tier_discount_enabled: boolean;
}

// ── Price input ─────────────────────────────────────────

const PriceField = ({
  label,
  value,
  onChange,
  suffix = "MXN",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-wood-100 dark:border-wood-800">
    <span className="text-sm text-wood-700 dark:text-wood-300">{label}</span>
    <div className="flex items-center gap-1">
      <span className="text-xs text-wood-400">$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 text-right bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded px-2 py-1 text-sm font-medium focus:border-accent-gold outline-none"
      />
      <span className="text-[10px] text-wood-400 w-8">{suffix}</span>
    </div>
  </div>
);

// ── Component ───────────────────────────────────────────

export const QuotePricingPanel = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [original, setOriginal] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/quote-pricing");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setOriginal(data);
        }
      } catch (err) {
        console.error("[PricingPanel] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Save config
  const handleSave = async () => {
    if (!config || !user) return;
    setSaving(true);
    setSaved(false);
    try {
      const session = await (window as any).__supabase?.auth?.getSession?.();
      const token = session?.data?.session?.access_token;

      const res = await fetch("/api/admin/quote-pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setOriginal({ ...config });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("[PricingPanel] Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (original) setConfig({ ...original });
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(original);

  // Update nested field
  const updateMap = (
    field: "wood_prices_m2" | "textile_base_prices" | "engraving_prices" | "textile_technique_prices",
    key: string,
    value: number
  ) => {
    if (!config) return;
    setConfig({ ...config, [field]: { ...config[field], [key]: value } });
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-wood-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-wood-900 dark:text-sand-100">
            Precios del Cotizador
          </h2>
          <p className="text-xs text-wood-500 mt-1">
            Configura los precios base que se usan para calcular cotizaciones automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-wood-500 hover:text-wood-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Deshacer
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              saved
                ? "bg-green-600 text-white"
                : hasChanges
                ? "bg-accent-gold text-wood-900 hover:shadow-md"
                : "bg-wood-200 text-wood-400 cursor-not-allowed"
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Guardado" : saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wood prices */}
        <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-wood-400 mb-4">
            Maderas (precio por m²)
          </h3>
          {Object.entries(config.wood_prices_m2).map(([wood, price]) => (
            <PriceField
              key={wood}
              label={wood}
              value={price}
              onChange={(v) => updateMap("wood_prices_m2", wood, v)}
              suffix="/m²"
            />
          ))}
          <PriceField
            label="Precio mínimo pieza"
            value={config.wood_min_price}
            onChange={(v) => setConfig({ ...config, wood_min_price: v })}
          />
          <div className="flex items-center justify-between py-2 mt-2">
            <span className="text-sm text-wood-700 dark:text-wood-300">Espesor estándar</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={config.wood_thickness_standard}
                onChange={(e) => setConfig({ ...config, wood_thickness_standard: Number(e.target.value) })}
                className="w-16 text-right bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded px-2 py-1 text-sm font-medium focus:border-accent-gold outline-none"
              />
              <span className="text-[10px] text-wood-400">cm</span>
            </div>
          </div>
        </div>

        {/* Engraving prices */}
        <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-wood-400 mb-4">
            Grabado Láser
          </h3>
          {Object.entries(config.engraving_prices).map(([level, price]) => (
            <PriceField
              key={level}
              label={level}
              value={price}
              onChange={(v) => updateMap("engraving_prices", level, v)}
            />
          ))}
          <PriceField
            label="Extra por zona adicional"
            value={config.engraving_zone_extra}
            onChange={(v) => setConfig({ ...config, engraving_zone_extra: v })}
          />
          <PriceField
            label="Extra por QR"
            value={config.engraving_qr_extra}
            onChange={(v) => setConfig({ ...config, engraving_qr_extra: v })}
          />
        </div>

        {/* Textile prices */}
        <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-wood-400 mb-4">
            Productos Textiles (precio base)
          </h3>
          {Object.entries(config.textile_base_prices).map(([product, price]) => (
            <PriceField
              key={product}
              label={product}
              value={price}
              onChange={(v) => updateMap("textile_base_prices", product, v)}
            />
          ))}
          <h4 className="text-xs font-bold uppercase tracking-widest text-wood-400 mt-4 mb-2">
            Técnicas de personalización
          </h4>
          {Object.entries(config.textile_technique_prices).map(([tech, price]) => (
            <PriceField
              key={tech}
              label={tech}
              value={price}
              onChange={(v) => updateMap("textile_technique_prices", tech, v)}
            />
          ))}
          <PriceField
            label="Extra panel completo"
            value={config.textile_full_panel_extra}
            onChange={(v) => setConfig({ ...config, textile_full_panel_extra: v })}
          />
        </div>

        {/* Volume discounts */}
        <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-wood-400 mb-4">
            Descuentos por Volumen
          </h3>
          {config.volume_discounts.map((vd, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-wood-100 dark:border-wood-800">
              <span className="text-sm text-wood-500 w-8">+</span>
              <input
                type="number"
                value={vd.min_qty}
                onChange={(e) => {
                  const newVd = [...config.volume_discounts];
                  newVd[i] = { ...newVd[i], min_qty: Number(e.target.value) };
                  setConfig({ ...config, volume_discounts: newVd });
                }}
                className="w-16 bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded px-2 py-1 text-sm font-medium text-center focus:border-accent-gold outline-none"
              />
              <span className="text-xs text-wood-400">piezas →</span>
              <input
                type="number"
                value={vd.percent}
                onChange={(e) => {
                  const newVd = [...config.volume_discounts];
                  newVd[i] = { ...newVd[i], percent: Number(e.target.value) };
                  setConfig({ ...config, volume_discounts: newVd });
                }}
                className="w-16 bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded px-2 py-1 text-sm font-medium text-center focus:border-accent-gold outline-none"
              />
              <span className="text-xs text-wood-400">%</span>
              <button
                onClick={() => {
                  setConfig({
                    ...config,
                    volume_discounts: config.volume_discounts.filter((_, idx) => idx !== i),
                  });
                }}
                className="p-1 text-wood-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const lastQty = config.volume_discounts.length > 0
                ? config.volume_discounts[config.volume_discounts.length - 1].min_qty * 2
                : 5;
              setConfig({
                ...config,
                volume_discounts: [
                  ...config.volume_discounts,
                  { min_qty: lastQty, percent: 25 },
                ],
              });
            }}
            className="flex items-center gap-1.5 mt-3 text-xs font-bold text-accent-gold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar nivel
          </button>

          {/* Tier toggle */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-wood-200 dark:border-wood-700">
            <div>
              <span className="text-sm font-medium text-wood-700 dark:text-wood-300">
                Descuento por membresía
              </span>
              <p className="text-[10px] text-wood-400 mt-0.5">
                Aplica el % de descuento del tier del cliente
              </p>
            </div>
            <button
              onClick={() => setConfig({ ...config, tier_discount_enabled: !config.tier_discount_enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.tier_discount_enabled
                  ? "bg-accent-gold"
                  : "bg-wood-200 dark:bg-wood-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  config.tier_discount_enabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
