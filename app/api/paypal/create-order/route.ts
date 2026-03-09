import { NextRequest, NextResponse } from 'next/server';
import { medusaFetch, getVerifiedCartTotal, jsonError } from '../../_lib/medusa-helpers';
import { calculateDiscounts } from '../../_lib/discount-engine';
import { logger } from '@/src/lib/logger';

// ═══════════════════════════════════════════════════════════════
// PayPal Create Order — via Medusa Payment Collection + Session
//
// Flow:
// 1. Verify cart total from Medusa (never trust frontend)
// 2. Calculate discounts via centralized engine (tier + points + cap)
// 3. Create payment collection for the cart
// 4. Initialize PayPal payment session via Medusa
// 5. Return the PayPal order ID (from session data) to frontend
//
// NOTE: PayPal amount is set by Medusa from the cart total.
// Tier and points discounts are tracked in metadata but the
// actual PayPal order amount comes from Medusa's cart.total.
// For tier/points discounts to affect PayPal amount, they need
// to be applied to the cart before payment collection creation.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { cartId, email, loyalty_points_to_redeem } = await req.json();

    if (!cartId) {
      return jsonError('cartId is required');
    }

    // 1. Verify cart exists and get details
    const cartData = await medusaFetch(`/carts/${cartId}`);
    const cart = cartData.cart;
    if (!cart) return jsonError('Cart not found', 404);

    const cartTotalCentavos = cart.total || 0;
    const cartSubtotalCentavos = cart.item_subtotal || cart.subtotal || cartTotalCentavos;
    logger.debug(`[PayPal] Cart total: ${cartTotalCentavos} centavos, subtotal: ${cartSubtotalCentavos} centavos`);

    // 2. Calculate discounts via centralized engine
    const discounts = await calculateDiscounts({
      userEmail: email || cart.email,
      cartSubtotalCentavos,
      cartTotalCentavos,
      pointsToRedeem: loyalty_points_to_redeem || 0,
    });
    logger.debug(`[PayPal] Discount engine: ${discounts.debug}`);

    // 3. Create payment collection for this cart
    logger.debug(`[PayPal] Creating payment collection for cart ${cartId}...`);
    const pcData = await medusaFetch('/payment-collections', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    });
    const pcId = pcData.payment_collection.id;
    logger.debug(`[PayPal] Payment collection created: ${pcId}`);

    // 4. Initialize PayPal payment session
    logger.debug(`[PayPal] Creating PayPal payment session...`);
    const sessionData = await medusaFetch(
      `/payment-collections/${pcId}/payment-sessions`,
      {
        method: 'POST',
        body: JSON.stringify({
          provider_id: 'pp_paypal_paypal',
        }),
      }
    );

    // Find the PayPal session in the collection
    const paypalSession = sessionData.payment_collection?.payment_sessions?.find(
      (s: any) => s.provider_id === 'pp_paypal_paypal'
    );

    if (!paypalSession?.data?.id) {
      console.error('[PayPal] No PayPal order ID in session data:', JSON.stringify(sessionData));
      return NextResponse.json(
        { error: 'PayPal order ID not found in payment session' },
        { status: 500 }
      );
    }

    const paypalOrderId = paypalSession.data.id;
    const approveUrl = paypalSession.data.approve_url;

    logger.debug(`[PayPal] ✅ PayPal order created: ${paypalOrderId}`);

    return NextResponse.json({
      paypalOrderId,
      approveUrl,
      paymentSessionId: paypalSession.id,
      paymentCollectionId: pcId,
      // Return discount info for frontend display + post-payment processing
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
  } catch (error: any) {
    console.error('[PayPal] Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
