// ═══════════════════════════════════════════════════════════
// Hook: useQuoteConfig
// Loads FULL quotation config from Supabase via API
// Single source of truth for all cotizador components
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { FullQuoteConfig, DEFAULT_FULL_CONFIG } from "@/components/quote/quoteConfig";
import { useAuth } from "@/contexts/AuthContext";

// Cache
let configCache: FullQuoteConfig | null = null;
let cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000;

interface QuoteConfigContextType {
  config: FullQuoteConfig;
  tierName: string;
  tierDiscountPercent: number;
  isLoggedIn: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const QuoteConfigContext = createContext<QuoteConfigContextType>({
  config: DEFAULT_FULL_CONFIG,
  tierName: 'Pino',
  tierDiscountPercent: 0,
  isLoggedIn: false,
  loading: false,
  refresh: async () => {},
});

export function useQuoteConfig() {
  return useContext(QuoteConfigContext);
}

// Provider component to wrap the quotation module
export function QuoteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FullQuoteConfig>(configCache || DEFAULT_FULL_CONFIG);
  const [loading, setLoading] = useState(!configCache);
  const [tierName, setTierName] = useState("Pino");
  const [tierDiscount, setTierDiscount] = useState(0);

  const { user } = useAuth();

  const fetchConfig = useCallback(async (force = false) => {
    if (!force && configCache && Date.now() - cacheTs < CACHE_TTL) {
      setConfig(configCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/quote-pricing");
      if (res.ok) {
        const data = await res.json();
        // The API may return the old flat format or the new full format
        // Merge with defaults to ensure all fields exist
        const merged = mergeConfig(data);
        configCache = merged;
        cacheTs = Date.now();
        setConfig(merged);
      }
    } catch {
      // Use defaults silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user tier
  useEffect(() => {
    if (!user?.email) {
      setTierName("Pino");
      setTierDiscount(0);
      return;
    }

    const fetchTier = async () => {
      try {
        const res = await fetch("/api/loyalty");
        if (!res.ok) return;
        const data = await res.json();
        if (data.profile?.tier) {
          // Fetch loyalty config for tier details
          const lcRes = await fetch("/api/loyalty/config");
          if (lcRes.ok) {
            const lc = await lcRes.json();
            const tierCfg = lc.tiers?.find((t: { id: string }) => t.id === data.profile.tier);
            if (tierCfg) {
              setTierName(tierCfg.name);
              setTierDiscount(tierCfg.discount_percent || 0);
            }
          }
        }
      } catch {
        // Silent
      }
    };

    fetchTier();
  }, [user?.email]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <QuoteConfigContext.Provider value={{
      config,
      tierName,
      tierDiscountPercent: tierDiscount,
      isLoggedIn: !!user,
      loading,
      refresh: () => fetchConfig(true),
    }}>
      {children}
    </QuoteConfigContext.Provider>
  );
}

// ── Merge helper ────────────────────────────────────────────
// Handles both old flat format and new full format from API

function mergeConfig(apiData: Record<string, unknown>): FullQuoteConfig {
  const base = { ...DEFAULT_FULL_CONFIG };

  // If API returns the new full format (has woodProducts key)
  if (apiData.woodProducts) {
    return { ...base, ...apiData } as FullQuoteConfig;
  }

  // Old flat format compatibility (wood_prices_m2, etc.)
  if (apiData.wood_prices_m2) {
    const wp = apiData.wood_prices_m2 as Record<string, number>;
    base.woodOptions = base.woodOptions.map(w => ({
      ...w,
      priceM2: wp[w.label] ?? w.priceM2,
    }));
  }
  if (apiData.textile_base_prices) {
    const tp = apiData.textile_base_prices as Record<string, number>;
    // Update textile product prices via textileTechniques
    base.textileProducts = base.textileProducts.map(p => ({ ...p }));
    // Store for use in pricing
    (base as Record<string, unknown>)._textileBasePrices = tp;
  }
  if (apiData.engraving_prices) {
    const ep = apiData.engraving_prices as Record<string, number>;
    base.engravingPrices = Object.entries(ep).map(([complexity, price]) => ({ complexity, price }));
  }
  if (apiData.volume_discounts) {
    base.volumeDiscounts = apiData.volume_discounts as QuoteConfigContextType['config']['volumeDiscounts'];
  }
  if (typeof apiData.engraving_zone_extra === 'number') base.engravingZoneExtra = apiData.engraving_zone_extra;
  if (typeof apiData.engraving_qr_extra === 'number') base.engravingQrExtra = apiData.engraving_qr_extra;
  if (typeof apiData.wood_min_price === 'number') base.woodMinPrice = apiData.wood_min_price;
  if (typeof apiData.tier_discount_enabled === 'boolean') base.tierDiscountEnabled = apiData.tier_discount_enabled;

  // Bundles from API
  if (Array.isArray(apiData.bundles)) {
    base.bundles = apiData.bundles as FullQuoteConfig['bundles'];
  }

  return base;
}
