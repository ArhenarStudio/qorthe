import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// Shared Medusa helpers for payment API routes
// Used by both Stripe and MercadoPago routes
//
// ARCHITECTURE RULE (SaaS-ready):
// completeCartToOrder does NOT mutate the cart.
// The cart must arrive ready (email, address, shipping method)
// from the frontend checkout flow (handleContinue).
// This function only: payment collection → session → complete.
// ═══════════════════════════════════════════════════════════════

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

/**
 * Fetch from Medusa Store API with publishable key
 */
export async function medusaFetch(path: string, options?: RequestInit) {
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

/**
 * Validate amount server-side by fetching cart total from Medusa.
 * Returns the verified cart total in the currency's base unit.
 */
export async function getVerifiedCartTotal(cartId: string): Promise<number> {
  const data = await medusaFetch(`/carts/${cartId}`);
  const cart = data.cart;
  if (!cart) throw new Error('Cart not found');
  const total = cart.total;
  if (typeof total !== 'number' || total <= 0) {
    throw new Error(`Invalid cart total: ${total}`);
  }
  return total;
}

/**
 * Complete cart → create order in Medusa.
 *
 * CRITICAL ARCHITECTURE RULE:
 * This function does NOT update email, address, or shipping.
 * The cart must arrive FULLY READY from the checkout frontend.
 * Any mutation here would invalidate shipping methods and cause
 * "shipping profiles not satisfied" errors.
 *
 * Steps:
 * 1. Create payment collection for the cart
 * 2. Initialize payment session (system default)
 * 3. Complete cart → creates order
 */
export async function completeCartToOrder(opts: {
  cartId: string;
  providerLabel: string;
}): Promise<{ order?: any; error?: string; warning?: string }> {
  const { cartId, providerLabel } = opts;

  // Step 1: Create payment collection
  console.log(`[${providerLabel}] Creating payment collection...`);
  const pcData = await medusaFetch('/payment-collections', {
    method: 'POST',
    body: JSON.stringify({ cart_id: cartId }),
  });
  const pcId = pcData.payment_collection.id;

  // Step 2: Create payment session
  console.log(`[${providerLabel}] Creating payment session...`);
  await medusaFetch(`/payment-collections/${pcId}/payment-sessions`, {
    method: 'POST',
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  });

  // Step 3: Complete cart → create order
  // ─── DIAGNOSTIC LOG: cart state RIGHT BEFORE /complete ───
  try {
    const diagCart = await medusaFetch(`/carts/${cartId}?fields=*shipping_methods,*items`);
    const dc = diagCart.cart;
    console.log(JSON.stringify({
      event: 'pre_complete_diagnostic',
      provider: providerLabel,
      cart_id: cartId,
      email: dc?.email || null,
      has_shipping_address: !!dc?.shipping_address?.address_1,
      shipping_methods_count: dc?.shipping_methods?.length || 0,
      shipping_methods: (dc?.shipping_methods || []).map((sm: any) => ({
        id: sm.id,
        shipping_option_id: sm.shipping_option_id,
      })),
      items_count: dc?.items?.length || 0,
      items: (dc?.items || []).map((i: any) => ({
        id: i.id,
        title: i.title,
        variant_id: i.variant_id,
      })),
      total: dc?.total,
      completed_at: dc?.completed_at || null,
    }));
  } catch (diagErr) {
    console.error(`[${providerLabel}] Diagnostic fetch failed:`, diagErr);
  }

  console.log(`[${providerLabel}] Completing cart ${cartId}...`);
  const completeData = await medusaFetch(`/carts/${cartId}/complete`, {
    method: 'POST',
  });

  if (completeData.type !== 'order') {
    console.error(`[${providerLabel}] Cart completion failed:`, completeData);
    return {
      error: 'Cart completion failed',
      warning: 'Pago aprobado pero orden no creada. Contactar soporte.',
    };
  }

  const order = completeData.order;
  console.log(`[${providerLabel}] ✅ Order created: ${order.id} (DSD-${order.display_id})`);
  return { order };
}

/**
 * Standard JSON error response
 */
export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}
