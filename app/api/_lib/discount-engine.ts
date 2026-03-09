import { createClient } from '@supabase/supabase-js';
import { logger } from '@/src/lib/logger';

// ═══════════════════════════════════════════════════════════════
// discount-engine.ts — Motor de descuentos centralizado
// Fase 9.C: Single source of truth para TODOS los descuentos
//
// Recibe: userEmail, cartSubtotalCentavos, pointsToRedeem, promoDiscountCentavos
// Valida: tier en Supabase, puntos en Supabase, config en Supabase
// Aplica: enforcement del max_combined_discount_percent (70%)
// Retorna: DiscountBreakdown con montos verificados en centavos
//
// Prioridad de descuentos cuando se excede el máximo:
//   1. Tier discount (nunca se recorta — es beneficio permanente)
//   2. Promo/cupón de Medusa (ya aplicado al cart.total, se reporta)
//   3. Puntos de lealtad (se recortan si excede el máximo combinado)
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── Types ──────────────────────────────────────────────────────

interface TierConfigRow {
  id: string;
  name: string;
  min_spend: number;
  discount_percent: number;
}

interface LoyaltyConfigRow {
  tiers: TierConfigRow[];
  points_per_mxn: number;
  point_value_mxn: number;
  min_redeem_points: number;
  max_redeem_percent: number;
  max_combined_discount_percent: number;
  redeem_step: number;
  program_active: boolean;
}

export interface DiscountBreakdown {
  /** Verified tier discount in centavos */
  tierDiscountCentavos: number;
  /** Tier name for metadata/display */
  tierName: string;
  /** Tier discount percentage */
  tierDiscountPercent: number;

  /** Promo/coupon discount already in Medusa cart (reported, not recalculated) */
  promoDiscountCentavos: number;

  /** Verified loyalty points discount in centavos (may be capped) */
  pointsDiscountCentavos: number;
  /** Actual points being redeemed (after cap) */
  pointsRedeemed: number;

  /** Total combined discount in centavos */
  totalDiscountCentavos: number;

  /** Final amount to charge in centavos */
  finalAmountCentavos: number;

  /** Max combined discount % from config */
  maxCombinedPercent: number;

  /** Whether points were capped to enforce the combined max */
  pointsWereCapped: boolean;

  /** Debug info */
  debug: string;
}

// Default fallback config (matches loyalty_config in Supabase)
const DEFAULT_CONFIG: LoyaltyConfigRow = {
  tiers: [
    { id: 'pino', name: 'Pino', min_spend: 0, discount_percent: 0 },
    { id: 'nogal', name: 'Nogal', min_spend: 300000, discount_percent: 2 },
    { id: 'parota', name: 'Parota', min_spend: 800000, discount_percent: 5 },
    { id: 'ebano', name: 'Ébano', min_spend: 1500000, discount_percent: 10 },
  ],
  points_per_mxn: 1,
  point_value_mxn: 0.01,
  min_redeem_points: 100,
  max_redeem_percent: 70,
  max_combined_discount_percent: 70,
  redeem_step: 100,
  program_active: true,
};

/**
 * Central discount engine — calculates ALL discounts server-side
 * and enforces the maximum combined discount cap.
 *
 * @param userEmail - User email (for tier lookup)
 * @param cartSubtotalCentavos - Item subtotal from Medusa (centavos), BEFORE any discounts
 * @param cartTotalCentavos - Cart total from Medusa (centavos), AFTER Medusa promos applied
 * @param pointsToRedeem - Points the user wants to redeem (from frontend, will be validated)
 * @returns DiscountBreakdown with all verified amounts
 */
export async function calculateDiscounts(params: {
  userEmail?: string;
  cartSubtotalCentavos: number;
  cartTotalCentavos: number;
  pointsToRedeem: number;
}): Promise<DiscountBreakdown> {
  const { userEmail, cartSubtotalCentavos, cartTotalCentavos, pointsToRedeem } = params;

  // ── Base result (no discounts) ───────────────────────────
  const noDiscount: DiscountBreakdown = {
    tierDiscountCentavos: 0,
    tierName: 'Pino',
    tierDiscountPercent: 0,
    promoDiscountCentavos: 0,
    pointsDiscountCentavos: 0,
    pointsRedeemed: 0,
    totalDiscountCentavos: 0,
    finalAmountCentavos: cartTotalCentavos,
    maxCombinedPercent: 70,
    pointsWereCapped: false,
    debug: '',
  };

  // ── Calculate promo discount (Medusa already applied it) ──
  // The difference between item_subtotal and total includes shipping,
  // but for discount tracking we compare subtotal vs total when
  // total < subtotal (meaning Medusa applied a promo).
  const promoDiscountCentavos = Math.max(0, cartSubtotalCentavos - cartTotalCentavos);

  let config = DEFAULT_CONFIG;
  let userTierName = 'Pino';
  let tierDiscountPercent = 0;
  let tierDiscountCentavos = 0;
  let pointsBalance = 0;

  // ── Fetch from Supabase ──────────────────────────────────
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // 1. Get loyalty config
      const { data: configRow } = await supabase
        .from('loyalty_config')
        .select('tiers, points_per_mxn, point_value_mxn, min_redeem_points, max_redeem_percent, max_combined_discount_percent, redeem_step, program_active')
        .eq('id', 1)
        .single();

      if (configRow) {
        config = configRow as LoyaltyConfigRow;
      }

      // 2. Get user tier + points balance
      if (userEmail) {
        // Find Supabase user by email
        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === userEmail);

        if (user) {
          const { data: profile } = await supabase
            .from('loyalty_profiles')
            .select('tier, points_balance')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            pointsBalance = profile.points_balance || 0;

            // Find tier config
            const tiers = (config.tiers || []) as TierConfigRow[];
            const userTier = tiers.find(t => t.id === profile.tier);
            if (userTier) {
              userTierName = userTier.name;
              tierDiscountPercent = userTier.discount_percent || 0;
            }
          }
        }
      }
    } catch (err) {
      console.error('[DiscountEngine] Supabase error (using defaults):', err);
    }
  }

  // ── If program is not active, return no discounts ────────
  if (!config.program_active) {
    return { ...noDiscount, debug: 'Program inactive' };
  }

  // ── 1. Calculate tier discount ───────────────────────────
  if (tierDiscountPercent > 0 && cartSubtotalCentavos > 0) {
    tierDiscountCentavos = Math.round(cartSubtotalCentavos * tierDiscountPercent / 100);
  }

  // ── 2. Calculate max combined discount ceiling ───────────
  const maxCombinedPercent = config.max_combined_discount_percent || 70;
  const maxDiscountCentavos = Math.round(cartSubtotalCentavos * maxCombinedPercent / 100);

  // ── 3. Calculate room for points after tier + promo ──────
  // Priority: tier > promo > points
  const usedByTierAndPromo = tierDiscountCentavos + promoDiscountCentavos;
  const roomForPoints = Math.max(0, maxDiscountCentavos - usedByTierAndPromo);

  // ── 4. Validate and cap loyalty points ───────────────────
  let validatedPoints = 0;
  let pointsDiscountCentavos = 0;
  let pointsWereCapped = false;

  if (pointsToRedeem > 0 && config.program_active) {
    const pointValueMxn = config.point_value_mxn || 0.01;
    const minRedeem = config.min_redeem_points || 100;
    const redeemStep = config.redeem_step || 100;

    // Round down to nearest step
    let requestedPoints = Math.floor(pointsToRedeem / redeemStep) * redeemStep;

    // Cap at available balance
    requestedPoints = Math.min(requestedPoints, pointsBalance);

    // Check minimum
    if (requestedPoints < minRedeem) {
      requestedPoints = 0;
    }

    if (requestedPoints > 0) {
      // Calculate raw discount in centavos
      const rawPointsDiscount = Math.round(requestedPoints * pointValueMxn * 100);

      // Cap at room available (after tier + promo)
      if (rawPointsDiscount > roomForPoints) {
        // Recalculate points to redeem from capped amount
        pointsDiscountCentavos = roomForPoints;
        validatedPoints = Math.floor(roomForPoints / (pointValueMxn * 100) / redeemStep) * redeemStep;
        pointsWereCapped = true;
      } else {
        pointsDiscountCentavos = rawPointsDiscount;
        validatedPoints = requestedPoints;
      }

      // Also cap at cart total after tier (don't go below 0)
      const cartAfterTier = cartTotalCentavos - tierDiscountCentavos;
      if (pointsDiscountCentavos > cartAfterTier) {
        pointsDiscountCentavos = Math.max(0, cartAfterTier);
        validatedPoints = Math.floor(pointsDiscountCentavos / (pointValueMxn * 100) / redeemStep) * redeemStep;
        pointsWereCapped = true;
      }
    }
  }

  // ── 5. Calculate totals ──────────────────────────────────
  const totalDiscountCentavos = tierDiscountCentavos + pointsDiscountCentavos;
  // Note: promoDiscountCentavos is already applied in cartTotalCentavos,
  // so we only subtract tier + points from cartTotal
  const finalAmountCentavos = Math.max(
    100, // Stripe minimum: $1 MXN
    cartTotalCentavos - tierDiscountCentavos - pointsDiscountCentavos
  );

  const debug = `subtotal=${cartSubtotalCentavos} cartTotal=${cartTotalCentavos} promo=${promoDiscountCentavos} tier=${tierDiscountCentavos}(${userTierName}/${tierDiscountPercent}%) pts=${pointsDiscountCentavos}(${validatedPoints}pts) cap=${maxCombinedPercent}% maxDisc=${maxDiscountCentavos} final=${finalAmountCentavos}`;

  logger.debug(`[DiscountEngine] ${userEmail || 'guest'}: ${debug}`);

  return {
    tierDiscountCentavos,
    tierName: userTierName,
    tierDiscountPercent,
    promoDiscountCentavos,
    pointsDiscountCentavos,
    pointsRedeemed: validatedPoints,
    totalDiscountCentavos,
    finalAmountCentavos,
    maxCombinedPercent,
    pointsWereCapped,
    debug,
  };
}
