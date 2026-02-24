import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// Shared Medusa helpers for payment API routes
// Used by both Stripe and MercadoPago routes
// ═══════════════════════════════════════════════════════════════

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
const DEFAULT_SHIPPING_OPTION = process.env.MEDUSA_DEFAULT_SHIPPING_OPTION || 'so_01KJ619T56SW3JP5JSKEAWXC5V';

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
 * ISSUE 1 FIX: Validate amount server-side by fetching cart total from Medusa.
 * Returns the verified cart total in the currency's base unit (e.g. MXN pesos).
 * Throws if the cart doesn't exist or has no items.
 */
export async function getVerifiedCartTotal(cartId: string): Promise<number> {
  const data = await medusaFetch(`/carts/${cartId}`);
  const cart = data.cart;

  if (!cart) {
    throw new Error('Cart not found');
  }

  // cart.total is in the currency's base unit (pesos for MXN)
  const total = cart.total;
  if (typeof total !== 'number' || total <= 0) {
    throw new Error(`Invalid cart total: ${total}`);
  }

  return total;
}

interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
}

/**
 * Shared flow: update cart → add shipping → create payment collection → complete order.
 * Used by both Stripe and MercadoPago after payment is verified.
 */
export async function completeCartToOrder(opts: {
  cartId: string;
  email?: string;
  shippingAddress?: ShippingAddress;
  providerLabel: string;
}): Promise<{ order?: any; error?: string; warning?: string }> {
  const { cartId, email, shippingAddress, providerLabel } = opts;

  // Step 1: Update cart with shipping address
  if (shippingAddress) {
    console.log(`[${providerLabel}] Updating cart with shipping address...`);
    await medusaFetch(`/carts/${cartId}`, {
      method: 'POST',
      body: JSON.stringify({
        email: email || undefined,
        shipping_address: {
          first_name: shippingAddress.first_name || '',
          last_name: shippingAddress.last_name || '',
          address_1: shippingAddress.address_1 || '',
          address_2: shippingAddress.address_2 || '',
          city: shippingAddress.city || '',
          province: shippingAddress.province || '',
          postal_code: shippingAddress.postal_code || '',
          country_code: shippingAddress.country_code || 'mx',
          phone: shippingAddress.phone || '',
        },
      }),
    });
  }

  // Step 2: Add shipping method (only if cart doesn't already have one)
  const cartCheck = await medusaFetch(`/carts/${cartId}`);
  const existingShippingMethods = cartCheck.cart?.shipping_methods || [];
  
  if (existingShippingMethods.length === 0) {
    console.log(`[${providerLabel}] No shipping method found, adding default...`);
    try {
      await medusaFetch(`/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: DEFAULT_SHIPPING_OPTION }),
      });
    } catch (e: unknown) {
      console.log(`[${providerLabel}] Shipping method note:`, (e as Error).message);
    }
  } else {
    console.log(`[${providerLabel}] Cart already has ${existingShippingMethods.length} shipping method(s), skipping...`);
  }

  // Step 3: Create payment collection + session
  console.log(`[${providerLabel}] Creating payment collection...`);
  const pcData = await medusaFetch('/payment-collections', {
    method: 'POST',
    body: JSON.stringify({ cart_id: cartId }),
  });
  const pcId = pcData.payment_collection.id;

  console.log(`[${providerLabel}] Creating payment session...`);
  await medusaFetch(`/payment-collections/${pcId}/payment-sessions`, {
    method: 'POST',
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  });

  // Step 4: Complete cart → create order
  console.log(`[${providerLabel}] Completing cart...`);
  const completeData = await medusaFetch(`/carts/${cartId}/complete`, {
    method: 'POST',
  });

  if (completeData.type !== 'order') {
    console.error(`[${providerLabel}] Cart completion failed:`, completeData);
    return {
      error: 'Cart completion failed',
      warning: 'Pago aprobado pero orden no creada en sistema. Contactar soporte.',
    };
  }

  const order = completeData.order;
  console.log(`[${providerLabel}] Order created: ${order.id} (DSD-${order.display_id})`);
  return { order };
}

/**
 * Standard JSON error response
 */
export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}
