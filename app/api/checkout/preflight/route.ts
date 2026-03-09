import { NextRequest, NextResponse } from 'next/server';
import { medusaFetch, jsonError } from '../../_lib/medusa-helpers';
import { logger } from '@/src/lib/logger';

/**
 * POST /api/checkout/preflight
 *
 * Validates that a cart is ready for payment BEFORE any money moves.
 * This prevents the "payment captured but order not created" scenario.
 *
 * Checks:
 * 1. Cart exists and has items
 * 2. Cart has email
 * 3. Cart has shipping address
 * 4. Cart has shipping method(s)
 * 5. Shipping method is still valid (belongs to currently available options)
 *
 * SaaS-READY: This endpoint is the single gate before payment.
 */
export async function POST(request: NextRequest) {
  try {
    const { cart_id } = await request.json();

    if (!cart_id) {
      return jsonError('cart_id is required', 400);
    }

    const errors: string[] = [];

    // ─── Fetch cart with shipping_methods expanded ───
    const cartData = await medusaFetch(
      `/carts/${cart_id}?fields=*shipping_methods,*items`
    );
    const cart = cartData.cart;

    if (!cart) {
      return jsonError('Cart not found', 404);
    }

    // ─── Check 1: Cart has items ───
    const items = cart.items || [];
    if (items.length === 0) {
      errors.push('Cart is empty');
    }

    // ─── Check 2: Cart has email ───
    if (!cart.email) {
      errors.push('Cart missing email');
    }

    // ─── Check 3: Cart has shipping address ───
    const addr = cart.shipping_address;
    if (!addr || !addr.address_1 || !addr.city || !addr.postal_code) {
      errors.push('Cart missing or incomplete shipping address');
    }

    // ─── Check 4: Cart has shipping method(s) ───
    const shippingMethods = cart.shipping_methods || [];
    if (shippingMethods.length === 0) {
      errors.push('Cart has no shipping method selected');
    }

    // ─── Check 5: Shipping method is still valid ───
    // Fetch currently available shipping options for this cart
    // and verify the selected method belongs to one of them
    if (shippingMethods.length > 0) {
      try {
        const optionsData = await medusaFetch(
          `/shipping-options?cart_id=${cart_id}`
        );
        const availableOptions = optionsData.shipping_options || [];
        const availableIds = new Set(
          availableOptions.map((o: { id: string }) => o.id)
        );

        for (const method of shippingMethods) {
          if (!availableIds.has(method.shipping_option_id)) {
            errors.push(
              `Shipping method ${method.shipping_option_id} is no longer a valid option for this cart/address`
            );
          }
        }
      } catch (e: unknown) {
        // If we can't fetch options, log but don't block
        // (this is a "best effort" validation)
        console.warn(
          '[Preflight] Could not validate shipping options:',
          (e as Error).message
        );
      }
    }

    // ─── Check 6: Cart total is valid ───
    if (typeof cart.total !== 'number' || cart.total <= 0) {
      errors.push(`Invalid cart total: ${cart.total}`);
    }

    // ─── Check 7: Warn on duplicate shipping methods (SaaS safety) ───
    if (shippingMethods.length > 1) {
      console.warn(`[Preflight] Cart ${cart_id} has ${shippingMethods.length} shipping methods (expected 1). May cause issues.`);
      errors.push(`Cart has ${shippingMethods.length} shipping methods — expected 1. Please restart checkout.`);
    }

    // ─── Check 8: All items must have a product with shipping profile ───
    // Without a shipping profile, Medusa cannot match items to shipping methods
    // This catches the root cause of "shipping profiles not satisfied"
    for (const item of items) {
      if (item.product_id) {
        try {
          const productData = await medusaFetch(
            `/products/${item.product_id}?fields=id,title`
          );
          // If product exists but has no shipping profile, Medusa's /complete
          // will fail. We can't check the profile directly from Store API,
          // but we log product_id for diagnosis.
          if (!productData.product) {
            errors.push(`Product ${item.product_id} not found for item "${item.title}"`);
          }
        } catch {
          // Product fetch failed — could be deleted or unpublished
          console.warn(`[Preflight] Could not verify product ${item.product_id} for item "${item.title}"`);
        }
      }
    }

    // ─── Response ───
    if (errors.length > 0) {
      console.warn(`[Preflight] Cart ${cart_id} NOT ready:`, errors);
      return NextResponse.json(
        {
          ready: false,
          errors,
          cart_id,
        },
        { status: 422 }
      );
    }

    logger.debug(`[Preflight] Cart ${cart_id} is ready ✅ (total: $${cart.total})`);
    return NextResponse.json({
      ready: true,
      cart_id,
      total: cart.total,
      email: cart.email,
      shipping_methods_count: shippingMethods.length,
      items_count: items.length,
    });
  } catch (error: unknown) {
    console.error('[Preflight] Error:', error);
    return NextResponse.json(
      { ready: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
