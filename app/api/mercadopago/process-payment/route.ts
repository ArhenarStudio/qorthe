import { NextRequest, NextResponse } from 'next/server';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

// Shipping option ID for free standard shipping
const DEFAULT_SHIPPING_OPTION = process.env.MEDUSA_DEFAULT_SHIPPING_OPTION || 'so_01KJ619T56SW3JP5JSKEAWXC5V';

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
      token,
      transaction_amount,
      installments,
      payment_method_id,
      issuer_id,
      payer,
      cart_id,
      shipping_address,
    } = body;

    if (!token || !transaction_amount || !payment_method_id || !cart_id) {
      return NextResponse.json(
        { error: 'Datos de pago incompletos' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════
    // STEP 1: Process payment with MercadoPago
    // ═══════════════════════════════════════════════
    const mpBody: Record<string, unknown> = {
      token,
      transaction_amount: Number(transaction_amount),
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: payer?.email || 'guest@davidsonsdesign.com',
        identification: payer?.identification,
        first_name: payer?.first_name,
        last_name: payer?.last_name,
      },
      description: 'DavidSons Design - Orden',
      statement_descriptor: 'DAVIDSONS',
      external_reference: cart_id,
    };

    if (issuer_id) {
      mpBody.issuer_id = String(issuer_id);
    }

    console.log('[MP] Processing payment for cart:', cart_id);

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${cart_id}-${Date.now()}`,
      },
      body: JSON.stringify(mpBody),
    });

    const mpResult = await mpResponse.json();
    console.log('[MP] Response:', mpResult.status, mpResult.status_detail);

    if (!mpResponse.ok || mpResult.status !== 'approved') {
      console.error('[MP] Payment failed:', JSON.stringify(mpResult, null, 2));
      return NextResponse.json(
        {
          error: mpResult.message || 'Pago rechazado',
          status: mpResult.status || 'rejected',
          status_detail: mpResult.status_detail,
          cause: mpResult.cause,
        },
        { status: mpResponse.ok ? 400 : mpResponse.status }
      );
    }

    // ═══════════════════════════════════════════════
    // STEP 2: Update cart in Medusa with shipping info
    // ═══════════════════════════════════════════════
    console.log('[Medusa] Updating cart with shipping address...');
    
    if (shipping_address) {
      await medusaFetch(`/carts/${cart_id}`, {
        method: 'POST',
        body: JSON.stringify({
          email: payer?.email,
          shipping_address: {
            first_name: shipping_address.first_name || payer?.first_name || '',
            last_name: shipping_address.last_name || payer?.last_name || '',
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

    // ═══════════════════════════════════════════════
    // STEP 3: Add shipping method
    // ═══════════════════════════════════════════════
    console.log('[Medusa] Adding shipping method...');
    try {
      await medusaFetch(`/carts/${cart_id}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: DEFAULT_SHIPPING_OPTION }),
      });
    } catch (e: unknown) {
      // Might already have a shipping method
      console.log('[Medusa] Shipping method note:', (e as Error).message);
    }

    // ═══════════════════════════════════════════════
    // STEP 4: Create payment collection + session
    // ═══════════════════════════════════════════════
    console.log('[Medusa] Creating payment collection...');
    const pcData = await medusaFetch('/payment-collections', {
      method: 'POST',
      body: JSON.stringify({ cart_id }),
    });
    const pcId = pcData.payment_collection.id;

    console.log('[Medusa] Creating payment session...');
    await medusaFetch(`/payment-collections/${pcId}/payment-sessions`, {
      method: 'POST',
      body: JSON.stringify({ provider_id: 'pp_system_default' }),
    });

    // ═══════════════════════════════════════════════
    // STEP 5: Complete cart → create order
    // ═══════════════════════════════════════════════
    console.log('[Medusa] Completing cart...');
    const completeData = await medusaFetch(`/carts/${cart_id}/complete`, {
      method: 'POST',
    });

    if (completeData.type !== 'order') {
      console.error('[Medusa] Cart completion failed:', completeData);
      // Payment was already taken - log for manual resolution
      return NextResponse.json({
        id: mpResult.id,
        status: 'approved',
        status_detail: mpResult.status_detail,
        payment_method: mpResult.payment_method_id,
        transaction_amount: mpResult.transaction_amount,
        cart_id,
        order_id: null,
        order_display_id: null,
        warning: 'Pago aprobado pero orden no creada en sistema. Contactar soporte.',
      });
    }

    const order = completeData.order;
    console.log(`[Medusa] Order created: ${order.id} (DSD-${order.display_id})`);

    // ═══════════════════════════════════════════════
    // SUCCESS RESPONSE
    // ═══════════════════════════════════════════════
    return NextResponse.json({
      id: mpResult.id,
      status: 'approved',
      status_detail: mpResult.status_detail,
      payment_method: mpResult.payment_method_id,
      transaction_amount: mpResult.transaction_amount,
      installments: mpResult.installments,
      cart_id,
      order_id: order.id,
      order_display_id: order.display_id,
    });

  } catch (error: unknown) {
    console.error('[API] Server error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
