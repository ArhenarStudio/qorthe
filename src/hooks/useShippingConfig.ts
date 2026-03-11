"use client";
// ─────────────────────────────────────────────────────────────
// useShippingConfig — hook compartido
// Consumido por: POSPage, ShippingConfigPanel, SetupWizard
// Lee desde /api/admin/shipping-config (Supabase admin_panel_config)
// Expone: config, loading, save(), posOptions activos
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import type { ShippingConfig, POSShippingOption } from "@/app/api/admin/shipping-config/route";
export type { ShippingConfig, POSShippingOption };
export type { ShippingZone, ShippingRate, ShippingCondition } from "@/app/api/admin/shipping-config/route";

interface UseShippingConfigReturn {
  config: ShippingConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  posOptions: POSShippingOption[];
  save: (updated: ShippingConfig) => Promise<boolean>;
  reload: () => void;
}

let _cached: ShippingConfig | null = null;

export function useShippingConfig(): UseShippingConfigReturn {
  const [config, setConfig] = useState<ShippingConfig | null>(_cached);
  const [loading, setLoading] = useState(_cached === null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shipping-config");
      const json = await res.json();
      _cached = json.config;
      setConfig(json.config);
    } catch (e) {
      setError("No se pudo cargar la configuración de envíos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_cached) load();
  }, [load]);

  const save = useCallback(async (updated: ShippingConfig): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: updated }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      _cached = updated;
      setConfig(updated);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const posOptions: POSShippingOption[] = (config?.pos_options ?? [])
    .filter((o) => o.active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return { config, loading, saving, error, posOptions, save, reload: load };
}
