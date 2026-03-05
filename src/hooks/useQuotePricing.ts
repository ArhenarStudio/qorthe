// ═══════════════════════════════════════════════════════════
// Hook: useQuotePricing
// Loads pricing config from API + user's loyalty tier
// Provides everything the cotizador needs for price calculation
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import { QuotePricingConfig, DEFAULT_PRICING_CONFIG } from "@/components/quote/pricing";
import { useLoyaltyConfig } from "./useLoyaltyConfig";
import { useAuth } from "@/contexts/AuthContext";

// In-memory cache
let pricingCache: QuotePricingConfig | null = null;
let pricingCacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

interface UseQuotePricingReturn {
  config: QuotePricingConfig;
  tierName: string;
  tierDiscountPercent: number;
  isLoggedIn: boolean;
  loading: boolean;
}

export function useQuotePricing(): UseQuotePricingReturn {
  const [config, setConfig] = useState<QuotePricingConfig>(
    pricingCache || DEFAULT_PRICING_CONFIG
  );
  const [loading, setLoading] = useState(!pricingCache);

  // Get user auth and loyalty tier
  const { user, medusaCustomer } = useAuth();
  const { config: loyaltyConfig, tiers } = useLoyaltyConfig();

  // Determine user's tier discount
  let tierName = "Pino";
  let tierDiscountPercent = 0;

  if (user && medusaCustomer) {
    // Find the user's tier from loyalty tiers
    // The tier is stored in loyalty_profiles, but we can estimate from lifetime_spend
    // For the cotizador, we use the loyalty config tiers to show potential discount
    const userTier = tiers.find((t) => {
      // Check if user's spending qualifies for this tier
      // medusaCustomer doesn't have lifetime_spend, so we check loyalty profile
      return false; // Will be resolved by the profile fetch below
    });

    // If we have the user's tier from the tiers array, find the matching one
    // The simplest approach: fetch loyalty profile to get actual tier
  }

  // Fetch pricing config
  const fetchConfig = useCallback(async () => {
    if (pricingCache && Date.now() - pricingCacheTs < CACHE_TTL) {
      setConfig(pricingCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/quote-pricing");
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_PRICING_CONFIG, ...data };
        pricingCache = merged;
        pricingCacheTs = Date.now();
        setConfig(merged);
      }
    } catch {
      // Use defaults silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's loyalty tier
  const [userTierName, setUserTierName] = useState("Pino");
  const [userTierDiscount, setUserTierDiscount] = useState(0);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!user?.email) {
      setUserTierName("Pino");
      setUserTierDiscount(0);
      return;
    }

    // Fetch loyalty profile for this user
    const fetchTier = async () => {
      try {
        const res = await fetch("/api/loyalty");
        if (!res.ok) return;
        const data = await res.json();
        if (data.profile?.tier) {
          const tierId = data.profile.tier;
          // Find tier config
          const tierConfig = loyaltyConfig.tiers?.find(
            (t: { id: string }) => t.id === tierId
          );
          if (tierConfig) {
            setUserTierName(tierConfig.name);
            setUserTierDiscount(tierConfig.discount_percent || 0);
          }
        }
      } catch {
        // Silent fallback
      }
    };

    fetchTier();
  }, [user?.email, loyaltyConfig.tiers]);

  return {
    config,
    tierName: userTierName,
    tierDiscountPercent: userTierDiscount,
    isLoggedIn: !!user,
    loading,
  };
}
