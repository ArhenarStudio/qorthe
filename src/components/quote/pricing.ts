// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Motor de Precios
// Calcula precio estimado por pieza y total del pedido
// ═══════════════════════════════════════════════════════════════

import {
  ProductItem,
  ProductCategory,
  WoodType,
  EngravingComplexity,
  TextileTechnique,
} from './types';

// ── Base Prices per m² (MXN) ────────────────────────────────

const WOOD_PRICE_M2: Record<WoodType, number> = {
  Cedro: 3500,
  Nogal: 5500,
  Encino: 3000,
  Parota: 6000,
  Combinación: 5000,
};

// Base prices for textile products (per unit)
const TEXTILE_BASE_PRICES: Record<string, number> = {
  'Tote bag': 180,
  'Mandil de cocina': 350,
  'Servilletas': 120,
  'Funda de cojín': 280,
};

// ── Engraving Prices ────────────────────────────────────────

const ENGRAVING_PRICES: Record<EngravingComplexity, number> = {
  Básico: 70,
  Intermedio: 150,
  Detallado: 250,
  Premium: 400,
};

// Extra per zone after the first
const ENGRAVING_ZONE_EXTRA = 50;

// QR type adds a small premium
const ENGRAVING_QR_EXTRA = 30;

// ── Textile Customization Prices ────────────────────────────

const TEXTILE_TECHNIQUE_PRICES: Record<TextileTechnique, number> = {
  Sublimación: 80,
  'Vinilo HTV': 60,
  Transfer: 50,
};

const TEXTILE_FULL_PANEL_EXTRA = 40;

// ── Volume Discounts ────────────────────────────────────────

function getVolumeDiscount(quantity: number): number {
  if (quantity >= 50) return 0.20;
  if (quantity >= 20) return 0.15;
  if (quantity >= 10) return 0.10;
  if (quantity >= 5) return 0.05;
  return 0;
}

// ── Calculate Wood Product Price ────────────────────────────

function calcWoodPrice(item: ProductItem): number {
  const { length, width, thickness } = item.dimensions;
  const area = (length * width) / 10000; // cm² → m²

  // Base: area × price per m²
  const wood = item.woods.length > 0 ? item.woods[0] : 'Cedro';
  let basePrice = area * (WOOD_PRICE_M2[wood] || 3500);

  // Thickness multiplier (standard = 3cm, thicker = more)
  const thickFactor = Math.max(1, thickness / 3);
  basePrice *= thickFactor;

  // Minimum $350 for any wood piece
  basePrice = Math.max(350, basePrice);

  return Math.round(basePrice);
}

// ── Calculate Textile Product Price ─────────────────────────

function calcTextilePrice(item: ProductItem): number {
  let base = TEXTILE_BASE_PRICES[item.type] || 200;

  // Add customization cost
  if (item.textile) {
    base += TEXTILE_TECHNIQUE_PRICES[item.textile.technique] || 0;
    if (item.textile.printZone === 'Panel completo') {
      base += TEXTILE_FULL_PANEL_EXTRA;
    }
  }

  return Math.round(base);
}

// ── Calculate Engraving Price ───────────────────────────────

function calcEngravingPrice(item: ProductItem): number {
  if (!item.engraving.enabled) return 0;

  let price = ENGRAVING_PRICES[item.engraving.complexity] || 70;

  // Extra zones
  const extraZones = Math.max(0, item.engraving.zones.length - 1);
  price += extraZones * ENGRAVING_ZONE_EXTRA;

  // QR premium
  if (item.engraving.type === 'Código QR') {
    price += ENGRAVING_QR_EXTRA;
  }

  return Math.round(price);
}

// ── Calculate Service Engraving Price ───────────────────────

function calcServicePrice(item: ProductItem): number {
  // Engraving-only service on external materials
  let base = ENGRAVING_PRICES[item.engraving.complexity] || 70;

  const extraZones = Math.max(0, item.engraving.zones.length - 1);
  base += extraZones * ENGRAVING_ZONE_EXTRA;

  if (item.engraving.type === 'Código QR') {
    base += ENGRAVING_QR_EXTRA;
  }

  return Math.round(Math.max(70, base));
}

// ── Public API ──────────────────────────────────────────────

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

export function calculateItemPrice(item: ProductItem): PriceBreakdown {
  let base: number;
  let engraving = 0;

  switch (item.category) {
    case 'madera':
      base = calcWoodPrice(item);
      engraving = calcEngravingPrice(item);
      break;
    case 'textil':
      base = calcTextilePrice(item);
      // Textiles can also have engraving (heat press = similar concept)
      break;
    case 'grabado':
      base = calcServicePrice(item);
      break;
    default:
      base = 0;
  }

  const subtotalUnit = base + engraving;
  const discountPct = getVolumeDiscount(item.quantity);
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

export function calculateTotalPrice(items: ProductItem[]): {
  subtotal: number;
  totalDiscount: number;
  total: number;
} {
  let subtotal = 0;
  let totalDiscount = 0;

  items.forEach((item) => {
    const bp = calculateItemPrice(item);
    subtotal += bp.subtotalUnit * bp.quantity;
    totalDiscount += bp.volumeDiscount * bp.quantity;
  });

  return {
    subtotal,
    totalDiscount,
    total: subtotal - totalDiscount,
  };
}

// ── Helpers for display ─────────────────────────────────────

export function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX')}`;
}

export { ENGRAVING_PRICES, WOOD_PRICE_M2, TEXTILE_BASE_PRICES, getVolumeDiscount };
