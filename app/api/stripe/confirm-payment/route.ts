import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
const DEFAULT_SHIPPING_OPTION = process.env.MEDUSA_DEFAULT_SHIPPING_OPTION || 'so_01KHYGRQ2SMPV2TQ29PKFGJWSD';

async function medusaFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${MEDUSA_URL}/store${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Medusa ${res.status}: ${err.message || res.statusText}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      payment_intent_id,
      cart_id,
      shipping_address,
      email,
      payer,
    } = body;

    if (!payment_intent_id || !cart_id) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const customerEmail = email || payer?.email;

    // Step 1: Update cart with shipping address
    console.log('[Stripe] Updating cart with shipping address...');
    if (shipping_address) {
      await medusaFetch(`/carts/${cart_id}`, {
        method: 'POST',
        body: JSON.stringify({
          email: customerEmail,
          shipping_address: {
            first_name: shipping_address.first_name || '',
            last_name: shipping_address.last_name || '',
            address_1: shipping_address.address_1 || '',
            address_2: shipping_address.address_2 || '',
            city: shipping_address.city || '',
            province: shipping_address.province || '',
            postal_code: shipping_address.postal_code || '',
            country_code: shipping_address.country_code || 'mx',
            phone: shipping_address.phone || '',
          },
        }),
      });
    }

    // Step 2: Add shipping method
    console.log('[Stripe] Adding shipping method...');
    try {
      await medusaFetch(`/carts/${cart_id}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: DEFAULT_SHIPPING_OPTION }),
      });
    } catch (e: unknown) {
      console.log('[Stripe] Shipping method note:', (e as Error).message);
    }

    // Step 3: Create payment collection + session
    console.log('[Stripe] Creating payment collection...');
    const pcData = await medusaFetch('/payment-collections', {
      method: 'POST',
      body: JSON.stringify({ cart_id }),
    });
    const pcId = pcData.payment_collection.id;

    console.log('[Stripe] Creating payment session...');
    await medusaFetch(`/payment-collections/${pcId}/payment-sessions`, {
      method: 'POST',
      body: JSON.stringify({ provider_id: 'pp_system_default' }),
    });

    // Step 4: Complete cart → create order
    console.log('[Stripe] Completing cart...');
    const completeData = await medusaFetch(`/carts/${cart_id}/complete`, {
      method: 'POST',
    });

    if (completeData.type !== 'order') {
      console.error('[Stripe] Cart completion failed:', completeData);
      return NextResponse.json({
        status: 'approved',
        payment_intent_id,
        cart_id,
        order_id: null,
        order_display_id: null,
        warning: 'Pago aprobado pero orden no creada. Contactar soporte.',
      });
    }

    const order = completeData.order;
    console.log(`[Stripe] Order created: ${order.id} (DSD-${order.display_id})`);

    return NextResponse.json({
      status: 'approved',
      payment_intent_id,
      cart_id,
      order_id: order.id,
      order_display_id: order.display_id,
    });

  } catch (error: unknown) {
    console.error('[Stripe] Server error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
