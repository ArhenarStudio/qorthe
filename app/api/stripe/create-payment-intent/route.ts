import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getVerifiedCartTotal, jsonError } from '../../_lib/medusa-helpers';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { cart_id, email } = body;

    if (!cart_id) {
      return jsonError('cart_id es requerido');
    }

    // ═══════════════════════════════════════════════════════
    // ISSUE 1 FIX: Server-side amount validation
    // NEVER trust the amount from the frontend.
    // Always recalculate from Medusa cart.
    // ═══════════════════════════════════════════════════════
    const verifiedTotal = await getVerifiedCartTotal(cart_id);
    console.log(`[Stripe] Verified cart total: $${verifiedTotal} MXN for cart ${cart_id}`);

    // Stripe expects amount in smallest currency unit (centavos for MXN)
    const amountInCents = Math.round(verifiedTotal * 100);

    // ═══════════════════════════════════════════════════════
    // ISSUE 3 FIX: Idempotency key
    // Same cart_id always produces same PaymentIntent.
    // Prevents double charges on retry/refresh.
    // ═══════════════════════════════════════════════════════
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: 'mxn',
        metadata: {
          cart_id,
          source: 'davidsons_design',
          verified_total: String(verifiedTotal),
        },
        receipt_email: email || undefined,
        description: `DavidSon's Design — Orden (Cart: ${cart_id})`,
        statement_descriptor_suffix: 'DSD',
        // Enable automatic payment methods for SCA/3DS compliance
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `pi_create_${cart_id}`,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error('[Stripe] Error creating payment intent:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error al crear intención de pago' },
      { status: 500 }
    );
  }
}
