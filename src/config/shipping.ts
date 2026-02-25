// ═══════════════════════════════════════════════════════════════
// SHIPPING CONFIG — Constantes centralizadas de envío
//
// Single source of truth para thresholds y tarifas de envío.
// Todos los componentes (CartDrawer, CartPage, CheckoutPage)
// importan de aquí. NO hardcodear valores en componentes.
//
// En SaaS multi-tenant, estos valores vendrán de la config
// del tenant (Medusa Store settings o DB). Por ahora son
// constantes que reflejan los shipping options de Medusa.
//
// Medusa Shipping Options (producción):
//   so_01KJ619T56SW3JP5JSKEAWXC5V — Envío Estándar ($150 MXN)
//   so_01KJ61A3JQW6X3RXS186XT17R1 — Envío Gratis (+$2,500)
// ═══════════════════════════════════════════════════════════════

/** Subtotal mínimo (en unidades de moneda, NO centavos) para envío gratis */
export const FREE_SHIPPING_THRESHOLD = 2500;

/** Tarifa plana estimada para envío estándar (en unidades de moneda) */
export const ESTIMATED_SHIPPING_FLAT = 150;

/** Moneda por defecto del store */
export const DEFAULT_CURRENCY = "MXN";

/** Locale para formateo de precios */
export const PRICE_LOCALE = "es-MX";

// ─── Helpers ───

/**
 * Calcula si el subtotal califica para envío gratis.
 * Usado en CartDrawer, CartPage y CheckoutPage para
 * mostrar barra de progreso y estimación de envío.
 */
export function getShippingEstimate(subtotal: number): {
  qualifiesFreeShipping: boolean;
  estimatedShipping: number;
  remainingForFree: number;
  progressPercent: number;
} {
  const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    qualifiesFreeShipping,
    estimatedShipping: qualifiesFreeShipping ? 0 : ESTIMATED_SHIPPING_FLAT,
    remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    progressPercent: Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  };
}

/**
 * Formatea un monto como precio en la moneda del store.
 * Centralizado para evitar formateos inconsistentes entre componentes.
 */
export function formatPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = PRICE_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
