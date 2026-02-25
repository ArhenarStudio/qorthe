import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { cartId, amount, email, firstName, lastName, shippingAddress } = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    // 1. Preflight: validate cart has all required data
    const cartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!cartRes.ok) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const { cart } = await cartRes.json();

    // Validate cart has items, email, shipping
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!cart.email) {
      return NextResponse.json({ error: 'Cart email not set' }, { status: 400 });
    }
    if (!cart.shipping_address) {
      return NextResponse.json({ error: 'Shipping address not set' }, { status: 400 });
    }

    // 2. Initialize PayPal payment session via Medusa
    const initRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/payment-collections/${cart.payment_collection?.id}/payment-sessions`,
      {
        method: 'POST',
        headers: {
          'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: 'pp_paypal_paypal',
        }),
      }
    );

    if (!initRes.ok) {
      const errorData = await initRes.json();
      console.error('[PayPal] Init payment session error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize PayPal payment session' },
        { status: 500 }
      );
    }

    const initData = await initRes.json();

    // The payment session data should contain the PayPal order ID
    const paymentSession = initData.payment_collection?.payment_sessions?.find(
      (s: any) => s.provider_id === 'pp_paypal_paypal'
    );

    if (!paymentSession?.data?.id) {
      console.error('[PayPal] No PayPal order ID in session:', initData);
      return NextResponse.json(
        { error: 'PayPal order ID not found in payment session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paypalOrderId: paymentSession.data.id,
      paymentSessionId: paymentSession.id,
    });
  } catch (error: any) {
    console.error('[PayPal] Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
