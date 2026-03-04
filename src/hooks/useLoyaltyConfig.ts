// ═══════════════════════════════════════════════════════════
// Hook: useLoyaltyConfig — fetch loyalty config from API
// Caches config in memory; refreshes on demand
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LoyaltyConfig,
  DEFAULT_LOYALTY_CONFIG,
  LoyaltyTier,
  buildLoyaltyTiers,
} from "@/data/loyalty";

// Simple in-memory cache (shared across hook instances)
let configCache: LoyaltyConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface UseLoyaltyConfigReturn {
  config: LoyaltyConfig;
  tiers: LoyaltyTier[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLoyaltyConfig(): UseLoyaltyConfigReturn {
  const [config, setConfig] = useState<LoyaltyConfig>(
    configCache || DEFAULT_LOYALTY_CONFIG
  );
  const [loading, setLoading] = useState(!configCache);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (force = false) => {
    // Use cache if fresh
    if (!force && configCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      setConfig(configCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/loyalty/config");
      if (!res.ok) {
        throw new Error(`Config API error: ${res.status}`);
      }

      const data: LoyaltyConfig = await res.json();

      // Update cache
      configCache = data;
      cacheTimestamp = Date.now();

      setConfig(data);
    } catch (err: any) {
      console.error("[useLoyaltyConfig] Error:", err.message);
      setError(err.message);
      // Keep using default/cached config on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const refresh = useCallback(() => fetchConfig(true), [fetchConfig]);

  return {
    config,
    tiers: buildLoyaltyTiers(config),
    loading,
    error,
    refresh,
  };
}
