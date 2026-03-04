// ═══════════════════════════════════════════════════════════
// src/data/loyalty.ts — Loyalty types + config reader
// Reads from /api/loyalty/config (Supabase), with hardcoded fallback
// ═══════════════════════════════════════════════════════════

import type React from "react";

// ── Types ──────────────────────────────────────────────

export interface LoyaltyTierColors {
  gradient_from: string;
  gradient_via: string;
  gradient_to: string;
}

export interface LoyaltyTierConfig {
  id: string;
  name: string;
  min_spend: number;       // in centavos
  max_spend: number | null; // in centavos, null = unlimited
  discount_percent: number;
  early_access_hours: number;
  upgrade_gift: string | null;
  priority_support: boolean;
  colors: LoyaltyTierColors;
}

export interface LoyaltyActionPoints {
  registration: number;
  newsletter: number;
  review: number;
  review_max_per_month: number;
  referral_referrer: number;
  referral_referred: number;
  referral_min_purchase: number;
  referral_max_per_month: number;
  birthday: number;
  birthday_min_purchases: number;
  birthday_validity_days: number;
  social_share: number;
  social_share_max_per_week: number;
}

export interface LoyaltyConfig {
  tiers: LoyaltyTierConfig[];
  points_per_mxn: number;
  point_value_mxn: number;
  points_expiry_days: number;
  points_expiry_warning_days: number[];
  min_redeem_points: number;
  max_redeem_percent: number;
  max_combined_discount_percent: number;
  redeem_step: number;
  action_points: LoyaltyActionPoints;
  evaluation_period: string;
  evaluation_lookback_months: number;
  max_tier_drop: number;
  grace_periods: number;
  free_shipping_threshold: number;
  free_shipping_all_tiers: boolean;
  program_active: boolean;
  referrals_active: boolean;
  birthday_active: boolean;
  social_share_active: boolean;
}

// ── Legacy interface (backward compat) ─────────────────
// Components that used the old LOYALTY_TIERS can use this adapter

export interface LoyaltyTier {
  id: string;
  name: string;
  minSpend: number;        // in centavos
  maxSpend: number | null;  // in centavos
  benefits: string[];
  discountPercent: number;
  styles: {
    card: string;
    icon: string;
    badge: string;
    text: string;
    border: string;
  };
}

// ── Default config (fallback if API fails) ─────────────

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  tiers: [
    {
      id: "pino",
      name: "Pino",
      min_spend: 0,
      max_spend: 299999,
      discount_percent: 0,
      early_access_hours: 0,
      upgrade_gift: null,
      priority_support: false,
      colors: { gradient_from: "#F2E6D0", gradient_via: "#D4B896", gradient_to: "#A08060" },
    },
    {
      id: "nogal",
      name: "Nogal",
      min_spend: 300000,
      max_spend: 799999,
      discount_percent: 2,
      early_access_hours: 48,
      upgrade_gift: null,
      priority_support: false,
      colors: { gradient_from: "#8B7355", gradient_via: "#5C4033", gradient_to: "#3B2716" },
    },
    {
      id: "parota",
      name: "Parota",
      min_spend: 800000,
      max_spend: 1499999,
      discount_percent: 5,
      early_access_hours: 48,
      upgrade_gift: "coupon_15",
      priority_support: false,
      colors: { gradient_from: "#E8C87A", gradient_via: "#C49A3C", gradient_to: "#8B6F1E" },
    },
    {
      id: "ebano",
      name: "Ébano",
      min_spend: 1500000,
      max_spend: null,
      discount_percent: 10,
      early_access_hours: 72,
      upgrade_gift: "gift_and_coupons",
      priority_support: true,
      colors: { gradient_from: "#2D2D3D", gradient_via: "#1A1A28", gradient_to: "#0D0D14" },
    },
  ],
  points_per_mxn: 1,
  point_value_mxn: 0.01,
  points_expiry_days: 180,
  points_expiry_warning_days: [30, 7],
  min_redeem_points: 100,
  max_redeem_percent: 70,
  max_combined_discount_percent: 70,
  redeem_step: 100,
  action_points: {
    registration: 500,
    newsletter: 300,
    review: 200,
    review_max_per_month: 3,
    referral_referrer: 1000,
    referral_referred: 500,
    referral_min_purchase: 50000,
    referral_max_per_month: 10,
    birthday: 10000,
    birthday_min_purchases: 1,
    birthday_validity_days: 30,
    social_share: 100,
    social_share_max_per_week: 1,
  },
  evaluation_period: "quarterly",
  evaluation_lookback_months: 12,
  max_tier_drop: 1,
  grace_periods: 1,
  free_shipping_threshold: 250000,
  free_shipping_all_tiers: true,
  program_active: true,
  referrals_active: false,
  birthday_active: false,
  social_share_active: false,
};

// ── Helper: Map tier ID to display name ────────────────

const TIER_NAMES: Record<string, string> = {
  pino: "Pino",
  nogal: "Nogal",
  parota: "Parota",
  ebano: "Ébano",
  // Legacy fallbacks
  bronze: "Pino",
  silver: "Nogal",
  gold: "Parota",
  platinum: "Ébano",
};

export function getTierName(tierId: string): string {
  return TIER_NAMES[tierId] || tierId;
}

// ── Helper: Map legacy tier ID to new tier ID ──────────

const TIER_MIGRATION: Record<string, string> = {
  bronze: "pino",
  silver: "nogal",
  gold: "parota",
  platinum: "ebano",
  bronce: "pino",
  plata: "nogal",
  oro: "parota",
  platino: "ebano",
};

export function normalizeTierId(tierId: string): string {
  return TIER_MIGRATION[tierId] || tierId;
}

// ── Helper: Get tier config by ID ──────────────────────

export function getTierConfig(
  tierId: string,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): LoyaltyTierConfig | undefined {
  const normalizedId = normalizeTierId(tierId);
  return config.tiers.find((t) => t.id === normalizedId);
}

// ── Helper: Get next tier (for progress bars) ──────────

export function getNextTier(
  currentTierId: string,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): LoyaltyTierConfig | null {
  const normalizedId = normalizeTierId(currentTierId);
  const currentIndex = config.tiers.findIndex((t) => t.id === normalizedId);
  if (currentIndex === -1 || currentIndex >= config.tiers.length - 1) return null;
  return config.tiers[currentIndex + 1];
}

// ── Helper: Calculate tier from spend (centavos) ───────

export function calculateTierFromSpend(
  spendCentavos: number,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): LoyaltyTierConfig {
  let result = config.tiers[0];
  for (const tier of config.tiers) {
    if (spendCentavos >= tier.min_spend) {
      result = tier;
    }
  }
  return result;
}

// ── Helper: Build benefits list for a tier ─────────────

export function getTierBenefits(tier: LoyaltyTierConfig): string[] {
  const benefits: string[] = ["Acumulación de puntos (1 pt = $1 MXN)"];

  if (tier.discount_percent > 0) {
    benefits.push(`${tier.discount_percent}% de descuento permanente`);
  }

  if (tier.early_access_hours > 0) {
    benefits.push(`Acceso anticipado ${tier.early_access_hours}h a nuevos productos`);
  }

  if (tier.priority_support) {
    benefits.push("Soporte prioritario (<24h)");
  }

  if (tier.upgrade_gift === "coupon_15") {
    benefits.push("Cupón 15% al subir de nivel");
  } else if (tier.upgrade_gift === "gift_and_coupons") {
    benefits.push("Regalo exclusivo + cuponera al subir de nivel");
  }

  return benefits;
}

// ── Helper: Convert tier config to legacy LoyaltyTier ──
// For backward compatibility with components that use the old format
// NOTE: styles.card etc use Tailwind arbitrary values — these only work
// if the exact string is present at build time. For dynamic colors from
// the DB, components should use getTierInlineStyles() instead.

export function tierConfigToLegacy(tier: LoyaltyTierConfig): LoyaltyTier {
  const { colors } = tier;
  const isDark = isColorDark(colors.gradient_to);
  return {
    id: tier.id,
    name: tier.name,
    minSpend: tier.min_spend,
    maxSpend: tier.max_spend,
    discountPercent: tier.discount_percent,
    benefits: getTierBenefits(tier),
    styles: {
      // These are kept for backward compat but components should prefer inline styles
      card: "", // Deprecated — use getTierInlineStyles().card
      icon: "", // Deprecated — use getTierInlineStyles().iconBg
      badge: "", // Deprecated — use getTierInlineStyles().badge
      text: "",  // Deprecated — use getTierInlineStyles().text
      border: "", // Deprecated
    },
  };
}

// ── NEW: Inline style objects for dynamic tier colors ───
// Use these in style={{}} props. Works with any colors from DB.

export interface TierInlineStyles {
  /** CSS for the main card/gradient background */
  card: React.CSSProperties;
  /** CSS for text on the gradient card */
  cardText: React.CSSProperties;
  /** CSS for the icon circle background */
  iconBg: React.CSSProperties;
  /** CSS for badge (light bg, dark text) */
  badge: React.CSSProperties;
  /** CSS for tier-colored text on light backgrounds */
  text: React.CSSProperties;
  /** CSS for border accent */
  border: React.CSSProperties;
  /** CSS for small avatar circle */
  avatar: React.CSSProperties;
  /** Whether the gradient_to color is dark (for choosing white vs dark text) */
  isDark: boolean;
  /** Raw color values for custom use */
  colors: LoyaltyTierColors;
}

/** Determine if a hex color is dark (for contrast decisions) */
function isColorDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Relative luminance
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

/** Convert hex to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getTierInlineStyles(tier: LoyaltyTierConfig): TierInlineStyles {
  const { colors } = tier;
  const isDark = isColorDark(colors.gradient_to);
  const textOnCard = isDark ? '#FFFFFF' : colors.gradient_to;
  const goldAccent = '#C5A065';

  return {
    card: {
      background: `linear-gradient(135deg, ${colors.gradient_from}, ${colors.gradient_via}, ${colors.gradient_to})`,
    },
    cardText: {
      color: isDark ? '#F5F3F0' : colors.gradient_to,
    },
    iconBg: {
      background: colors.gradient_to,
      color: isDark ? goldAccent : colors.gradient_from,
    },
    badge: {
      background: hexToRgba(colors.gradient_via, 0.12),
      color: colors.gradient_to,
      borderColor: hexToRgba(colors.gradient_via, 0.25),
      borderWidth: '1px',
      borderStyle: 'solid',
    },
    text: {
      color: colors.gradient_to,
    },
    border: {
      borderColor: hexToRgba(colors.gradient_from, 0.5),
    },
    avatar: {
      background: `linear-gradient(135deg, ${colors.gradient_from}, ${colors.gradient_to})`,
      color: '#FFFFFF',
    },
    isDark,
    colors,
  };
}

/** Get inline styles from a LoyaltyTier (legacy format) by looking up tier config */
export function getTierStylesFromId(
  tierId: string,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): TierInlineStyles {
  const normalized = normalizeTierId(tierId);
  const tierConfig = config.tiers.find(t => t.id === normalized) || config.tiers[0];
  return getTierInlineStyles(tierConfig);
}

// ── Build LOYALTY_TIERS from config (backward compat) ──

export function buildLoyaltyTiers(
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): LoyaltyTier[] {
  return config.tiers.map(tierConfigToLegacy);
}

// ── Default export for backward compatibility ──────────
// Components importing LOYALTY_TIERS get the default config
// For dynamic config, use the useLoyaltyConfig hook instead

export const LOYALTY_TIERS: LoyaltyTier[] = buildLoyaltyTiers(DEFAULT_LOYALTY_CONFIG);
