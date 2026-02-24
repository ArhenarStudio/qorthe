import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  getVerifiedCartTotal,
  completeCartToOrder,
  jsonError,
} from '../../_lib/medusa-helpers';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_intent_id, cart_id, shipping_address, email, payer } = body;

    if (!payment_intent_id || !cart_id) {
      return jsonError('payment_intent_id y cart_id son requeridos');
    }

    const customerEmail = email || payer?.email;

    // ═══════════════════════════════════════════════════════
    // ISSUE 2 FIX: Server-side payment verification
    // NEVER trust the frontend's claim that payment succeeded.
    // Always verify with Stripe API directly.
    // ═══════════════════════════════════════════════════════
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      console.error(`[Stripe] PaymentIntent ${payment_intent_id} status: ${paymentIntent.status}`);
      return jsonError(
        `Pago no completado. Estado: ${paymentIntent.status}`,
        402
      );
    }

    // Verify the PaymentIntent's cart_id matches (prevents using someone else's PI)
    if (paymentIntent.metadata.cart_id !== cart_id) {
      console.error(`[Stripe] Cart ID mismatch: PI has ${paymentIntent.metadata.cart_id}, request has ${cart_id}`);
      return jsonError('Cart ID no coincide con el pago', 403);
    }

    // ═══════════════════════════════════════════════════════
    // ISSUE 1 FIX (double-check): Verify amount matches cart
    // ═══════════════════════════════════════════════════════
    const verifiedTotal = await getVerifiedCartTotal(cart_id);
    const expectedCents = Math.round(verifiedTotal * 100);
    if (paymentIntent.amount !== expectedCents) {
      console.error(`[Stripe] Amount mismatch: PI=${paymentIntent.amount}, Cart=${expectedCents}`);
      return jsonError(
        `Monto del pago ($${paymentIntent.amount / 100}) no coincide con el carrito ($${verifiedTotal})`,
        400
      );
    }

    console.log(`[Stripe] ✅ Payment verified: ${payment_intent_id} = $${verifiedTotal} MXN`);

    // ═══════════════════════════════════════════════════════
    // Complete the order in Medusa (shared helper)
    // ═══════════════════════════════════════════════════════
    const result = await completeCartToOrder({
      cartId: cart_id,
      email: customerEmail,
      shippingAddress: shipping_address,
      providerLabel: 'Stripe',
    });

    if (result.error) {
      return NextResponse.json({
        status: 'approved',
        payment_intent_id,
        cart_id,
        order_id: null,
        order_display_id: null,
        warning: result.warning,
      });
    }

    return NextResponse.json({
      status: 'approved',
      payment_intent_id,
      cart_id,
      order_id: result.order.id,
      order_display_id: result.order.display_id,
    });
  } catch (error: unknown) {
    console.error('[Stripe] Server error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
