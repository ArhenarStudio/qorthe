// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Motor de Precios
// Fase 10B: Configurable por admin + descuento por tier
//
// Prices can be overridden via QuotePricingConfig from Supabase.
// Tier discounts come from loyalty_config (same as checkout).
// ═══════════════════════════════════════════════════════════════

import {
  ProductItem,
  WoodType,
  EngravingComplexity,
  TextileTechnique,
} from './types';

// ── Pricing Config (can be overridden from API) ─────────────

export interface QuotePricingConfig {
  wood_prices_m2: Record<string, number>;
  textile_base_prices: Record<string, number>;
  engraving_prices: Record<string, number>;
  engraving_zone_extra: number;
  engraving_qr_extra: number;
  textile_technique_prices: Record<string, number>;
  textile_full_panel_extra: number;
  wood_min_price: number;
  wood_thickness_standard: number;
  volume_discounts: { min_qty: number; percent: number }[];
  tier_discount_enabled: boolean;
}

// ── Hardcoded defaults (fallback if API unavailable) ────────

export const DEFAULT_PRICING_CONFIG: QuotePricingConfig = {
  wood_prices_m2: {
    Cedro: 3500,
    Nogal: 5500,
    Encino: 3000,
    Parota: 6000,
    Combinación: 5000,
  },
  textile_base_prices: {
    'Tote bag': 180,
    'Mandil de cocina': 350,
    Servilletas: 120,
    'Funda de cojín': 280,
  },
  engraving_prices: {
    Básico: 70,
    Intermedio: 150,
    Detallado: 250,
    Premium: 400,
  },
  engraving_zone_extra: 50,
  engraving_qr_extra: 30,
  textile_technique_prices: {
    Sublimación: 80,
    'Vinilo HTV': 60,
    Transfer: 50,
  },
  textile_full_panel_extra: 40,
  wood_min_price: 350,
  wood_thickness_standard: 3,
  volume_discounts: [
    { min_qty: 5, percent: 5 },
    { min_qty: 10, percent: 10 },
    { min_qty: 20, percent: 15 },
    { min_qty: 50, percent: 20 },
  ],
  tier_discount_enabled: true,
};

// ── Volume Discount Lookup ──────────────────────────────────

function getVolumeDiscount(quantity: number, config: QuotePricingConfig): number {
  const sorted = [...config.volume_discounts].sort((a, b) => b.min_qty - a.min_qty);
  for (const tier of sorted) {
    if (quantity >= tier.min_qty) return tier.percent / 100;
  }
  return 0;
}

// ── Wood Price ──────────────────────────────────────────────

function calcWoodPrice(item: ProductItem, cfg: QuotePricingConfig): number {
  const { length, width, thickness } = item.dimensions;
  const area = (length * width) / 10000;

  const wood: WoodType = item.woods.length > 0 ? item.woods[0] : 'Cedro';
  let base = area * (cfg.wood_prices_m2[wood] ?? 3500);

  const thickFactor = Math.max(1, thickness / (cfg.wood_thickness_standard || 3));
  base *= thickFactor;

  base = Math.max(cfg.wood_min_price || 350, base);

  return Math.round(base);
}

// ── Textile Price ───────────────────────────────────────────

function calcTextilePrice(item: ProductItem, cfg: QuotePricingConfig): number {
  let base = cfg.textile_base_prices[item.type] ?? 200;

  if (item.textile) {
    base += cfg.textile_technique_prices[item.textile.technique] ?? 0;
    if (item.textile.printZone === 'Panel completo') {
      base += cfg.textile_full_panel_extra;
    }
  }

  return Math.round(base);
}

// ── Engraving Price ─────────────────────────────────────────

function calcEngravingPrice(item: ProductItem, cfg: QuotePricingConfig): number {
  if (!item.engraving.enabled) return 0;

  let price = cfg.engraving_prices[item.engraving.complexity] ?? 70;

  const extraZones = Math.max(0, item.engraving.zones.length - 1);
  price += extraZones * cfg.engraving_zone_extra;

  if (item.engraving.type === 'Código QR') {
    price += cfg.engraving_qr_extra;
  }

  return Math.round(price);
}

// ── Service Price ───────────────────────────────────────────

function calcServicePrice(item: ProductItem, cfg: QuotePricingConfig): number {
  let base = cfg.engraving_prices[item.engraving.complexity] ?? 70;

  const extraZones = Math.max(0, item.engraving.zones.length - 1);
  base += extraZones * cfg.engraving_zone_extra;

  if (item.engraving.type === 'Código QR') {
    base += cfg.engraving_qr_extra;
  }

  return Math.round(Math.max(70, base));
}

// ── Price Breakdown ─────────────────────────────────────────

export interface PriceBreakdown {
  base: number;
  engraving: number;
  subtotalUnit: number;
  volumeDiscount: number;
  volumeDiscountPercent: number;
  unitAfterDiscount: number;
  lineTotal: number;
  quantity: number;
}

export function calculateItemPrice(
  item: ProductItem,
  config: QuotePricingConfig = DEFAULT_PRICING_CONFIG
): PriceBreakdown {
  let base: number;
  let engraving = 0;

  switch (item.category) {
    case 'madera':
      base = calcWoodPrice(item, config);
      engraving = calcEngravingPrice(item, config);
      break;
    case 'textil':
      base = calcTextilePrice(item, config);
      break;
    case 'grabado':
      base = calcServicePrice(item, config);
      break;
    default:
      base = 0;
  }

  const subtotalUnit = base + engraving;
  const discountPct = getVolumeDiscount(item.quantity, config);
  const discountAmount = Math.round(subtotalUnit * discountPct);
  const unitAfterDiscount = subtotalUnit - discountAmount;
  const lineTotal = unitAfterDiscount * item.quantity;

  return {
    base,
    engraving,
    subtotalUnit,
    volumeDiscount: discountAmount,
    volumeDiscountPercent: discountPct,
    unitAfterDiscount,
    lineTotal,
    quantity: item.quantity,
  };
}

// ── Tier Discount ───────────────────────────────────────────

export interface TierDiscountInfo {
  tierName: string;
  tierDiscountPercent: number;
  tierDiscountAmount: number;
}

export function applyTierDiscount(
  subtotal: number,
  tierDiscountPercent: number,
  tierName: string
): TierDiscountInfo {
  if (tierDiscountPercent <= 0) {
    return { tierName, tierDiscountPercent: 0, tierDiscountAmount: 0 };
  }
  const tierDiscountAmount = Math.round(subtotal * tierDiscountPercent / 100);
  return { tierName, tierDiscountPercent, tierDiscountAmount };
}

// ── Total Calculation ───────────────────────────────────────

export interface TotalBreakdown {
  subtotal: number;
  volumeDiscount: number;
  tierDiscount: TierDiscountInfo;
  total: number;
}

export function calculateTotalPrice(
  items: ProductItem[],
  config: QuotePricingConfig = DEFAULT_PRICING_CONFIG,
  tierDiscountPercent = 0,
  tierName = 'Pino'
): TotalBreakdown {
  let subtotal = 0;
  let volumeDiscount = 0;

  items.forEach((item) => {
    const bp = calculateItemPrice(item, config);
    subtotal += bp.subtotalUnit * bp.quantity;
    volumeDiscount += bp.volumeDiscount * bp.quantity;
  });

  const afterVolume = subtotal - volumeDiscount;
  const tierDiscount = config.tier_discount_enabled
    ? applyTierDiscount(afterVolume, tierDiscountPercent, tierName)
    : { tierName, tierDiscountPercent: 0, tierDiscountAmount: 0 };

  const total = afterVolume - tierDiscount.tierDiscountAmount;

  return {
    subtotal,
    volumeDiscount,
    tierDiscount,
    total: Math.max(0, total),
  };
}

// ── Helpers ─────────────────────────────────────────────────

export function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX')}`;
}

// Re-export for convenience (used by EngravingConfigurator)
export { DEFAULT_PRICING_CONFIG as PRICING_CONFIG };

// Backward compat exports for components
export const ENGRAVING_PRICES = DEFAULT_PRICING_CONFIG.engraving_prices;
