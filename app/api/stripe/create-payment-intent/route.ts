import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'mxn', cart_id, email } = body;

    if (!amount || !cart_id) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Stripe expects amount in smallest currency unit (centavos for MXN)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { cart_id },
      receipt_email: email || undefined,
      description: 'DavidSons Design - Orden',
      statement_descriptor_suffix: 'DSD',
    });

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
