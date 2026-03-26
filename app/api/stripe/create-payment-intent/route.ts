import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getVerifiedCartTotal, medusaFetch, jsonError } from '../../_lib/medusa-helpers';
import { calculateDiscounts } from '../../_lib/discount-engine';
import { logger } from '@/src/lib/logger';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { cart_id, email, loyalty_discount: frontendLoyaltyPoints } = body;

    if (!cart_id) {
      return jsonError('cart_id es requerido');
    }

    // ═══════════════════════════════════════════════════════
    // Server-side amount validation — NEVER trust frontend
    // ═══════════════════════════════════════════════════════
    const cartData = await medusaFetch(`/carts/${cart_id}`);
    const cart = cartData.cart;
    if (!cart) return jsonError('Cart not found', 404);

    const cartTotalCentavos = cart.total || 0;
    const cartSubtotalCentavos = cart.item_subtotal || cart.subtotal || cartTotalCentavos;

    // ═══════════════════════════════════════════════════════
    // CENTRALIZED DISCOUNT ENGINE — tier + points + cap
    // ═══════════════════════════════════════════════════════
    const discounts = await calculateDiscounts({
      userEmail: email,
      cartSubtotalCentavos,
      cartTotalCentavos,
      // Frontend sends points as centavos value — convert to points count
      // 1 point = $0.01 MXN = 1 centavo, so centavos ≈ points
      pointsToRedeem: Math.round((frontendLoyaltyPoints || 0) / 1),
    });

    logger.debug(`[Stripe] Discount engine: ${discounts.debug}`);

    // ═══════════════════════════════════════════════════════
    // IDEMPOTENCY: Same cart_id → same PaymentIntent
    // ═══════════════════════════════════════════════════════
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: discounts.finalAmountCentavos,
        currency: 'mxn',
        metadata: {
          cart_id,
          source: 'qorthe',
          verified_cart_total: String(cartTotalCentavos),
          verified_subtotal: String(cartSubtotalCentavos),
          tier_discount: String(discounts.tierDiscountCentavos),
          tier_name: discounts.tierName,
          tier_discount_percent: String(discounts.tierDiscountPercent),
          loyalty_points_discount: String(discounts.pointsDiscountCentavos),
          loyalty_points_redeemed: String(discounts.pointsRedeemed),
          promo_discount: String(discounts.promoDiscountCentavos),
          total_discount: String(discounts.totalDiscountCentavos),
          max_combined_percent: String(discounts.maxCombinedPercent),
          points_were_capped: String(discounts.pointsWereCapped),
        },
        receipt_email: email || undefined,
        description: `Qorthe — Orden (Cart: ${cart_id})`,
        statement_descriptor_suffix: 'DSD',
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `pi_create_${cart_id}`,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      // Return discount info for frontend display
      discountBreakdown: {
        tierDiscount: discounts.tierDiscountCentavos,
        tierName: discounts.tierName,
        tierPercent: discounts.tierDiscountPercent,
        pointsDiscount: discounts.pointsDiscountCentavos,
        pointsRedeemed: discounts.pointsRedeemed,
        pointsCapped: discounts.pointsWereCapped,
        promoDiscount: discounts.promoDiscountCentavos,
        totalDiscount: discounts.totalDiscountCentavos,
        finalAmount: discounts.finalAmountCentavos,
      },
    });
  } catch (error: unknown) {
    console.error('[Stripe] Error creating payment intent:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error al crear intención de pago' },
      { status: 500 }
    );
  }
}
