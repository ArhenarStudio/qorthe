// ═══════════════════════════════════════════════════════════════
// early-access.ts — Acceso anticipado a productos por tier
// Fase 9.D: Productos con launch_date futura son visibles antes
// para usuarios de tiers con early_access_hours > 0
//
// Un producto con metadata "launch_date" = "2026-04-01T00:00:00Z"
// será visible para:
//   - Ébano (72h antes) a partir del 2026-03-29T00:00:00Z
//   - Parota/Nogal (48h antes) a partir del 2026-03-30T00:00:00Z
//   - Pino (0h) solo a partir del 2026-04-01T00:00:00Z
//
// Uso en admin: Medusa → product metadata → "launch_date" (ISO)
// ═══════════════════════════════════════════════════════════════

import type { CommerceProduct } from "@/lib/commerce";
import type { LoyaltyTierConfig, LoyaltyConfig } from "@/data/loyalty";
import { DEFAULT_LOYALTY_CONFIG, getTierConfig, normalizeTierId } from "@/data/loyalty";
import { getMetafield } from "@/lib/commerce/types";

export interface EarlyAccessInfo {
  /** Product has a future launch_date */
  hasLaunchDate: boolean;
  /** The launch date (null if not set or already past) */
  launchDate: Date | null;
  /** User can see this product (either public or has early access) */
  isVisible: boolean;
  /** User is seeing it via early access (before public launch) */
  isEarlyAccess: boolean;
  /** Hours remaining until public launch */
  hoursUntilPublic: number;
  /** User's early access window in hours */
  earlyAccessHours: number;
}

/**
 * Get the launch_date from a product's metadata.
 * Supports both "custom.launch_date" and "launch_date" formats.
 */
export function getProductLaunchDate(product: CommerceProduct): Date | null {
  // Try namespace.key format first (Medusa stores as "custom.launch_date")
  let dateStr: string | undefined = getMetafield(product, "custom", "launch_date");
  // Fallback: try direct key
  if (!dateStr) {
    const field = product.metafields.find(m => m.key === "launch_date");
    dateStr = field?.value;
  }
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Check early access status for a single product given user's tier.
 */
export function checkEarlyAccess(
  product: CommerceProduct,
  userTierId?: string | null,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG,
  now: Date = new Date()
): EarlyAccessInfo {
  const noAccess: EarlyAccessInfo = {
    hasLaunchDate: false,
    launchDate: null,
    isVisible: true,
    isEarlyAccess: false,
    hoursUntilPublic: 0,
    earlyAccessHours: 0,
  };

  const launchDate = getProductLaunchDate(product);
  if (!launchDate) return noAccess; // No launch_date = always visible

  const hoursUntilPublic = (launchDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Already launched — visible to everyone
  if (hoursUntilPublic <= 0) {
    return {
      hasLaunchDate: true,
      launchDate,
      isVisible: true,
      isEarlyAccess: false,
      hoursUntilPublic: 0,
      earlyAccessHours: 0,
    };
  }

  // Product is not yet public — check tier access
  const normalizedTier = userTierId ? normalizeTierId(userTierId) : "pino";
  const tierConfig = getTierConfig(normalizedTier, config);
  const earlyAccessHours = tierConfig?.early_access_hours ?? 0;

  const isVisible = earlyAccessHours >= hoursUntilPublic;

  return {
    hasLaunchDate: true,
    launchDate,
    isVisible,
    isEarlyAccess: isVisible && hoursUntilPublic > 0,
    hoursUntilPublic: Math.ceil(hoursUntilPublic),
    earlyAccessHours,
  };
}

/**
 * Filter products list based on user's tier early access.
 * Products without launch_date pass through unchanged.
 * Products with future launch_date are filtered by tier.
 */
export function filterProductsByAccess(
  products: CommerceProduct[],
  userTierId?: string | null,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG,
  now: Date = new Date()
): CommerceProduct[] {
  return products.filter((product) => {
    const access = checkEarlyAccess(product, userTierId, config, now);
    return access.isVisible;
  });
}

/**
 * Annotate products with early access info (for badges/UI).
 * Returns array of [product, earlyAccessInfo] tuples.
 */
export function annotateProductsWithAccess(
  products: CommerceProduct[],
  userTierId?: string | null,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG,
  now: Date = new Date()
): Array<{ product: CommerceProduct; earlyAccess: EarlyAccessInfo }> {
  return products
    .map((product) => ({
      product,
      earlyAccess: checkEarlyAccess(product, userTierId, config, now),
    }))
    .filter(({ earlyAccess }) => earlyAccess.isVisible);
}

/**
 * Format the early access countdown for display.
 * e.g., "Lanzamiento en 2 días" or "Lanzamiento en 12 horas"
 */
export function formatLaunchCountdown(hoursUntilPublic: number): string {
  if (hoursUntilPublic <= 0) return "Disponible";
  if (hoursUntilPublic < 1) return "Lanzamiento en menos de 1 hora";
  if (hoursUntilPublic < 24) {
    const h = Math.ceil(hoursUntilPublic);
    return `Lanzamiento en ${h} hora${h > 1 ? "s" : ""}`;
  }
  const days = Math.ceil(hoursUntilPublic / 24);
  return `Lanzamiento en ${days} día${days > 1 ? "s" : ""}`;
}
