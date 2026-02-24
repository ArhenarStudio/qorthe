import { NextRequest, NextResponse } from 'next/server';
import {
  getVerifiedCartTotal,
  medusaFetch,
  completeCartToOrder,
  jsonError,
} from '../../_lib/medusa-helpers';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

/**
 * Attempt automatic refund via MercadoPago API.
 * Uses idempotency key to prevent duplicate refunds.
 * Returns { success, refund_id } or { success: false, error }.
 */
async function attemptRefund(
  paymentId: number | string,
  cartId: string
): Promise<{ success: boolean; refund_id?: string; error?: string }> {
  try {
    console.log(`[MP] 🔄 Attempting refund for payment ${paymentId} (cart: ${cartId})`);
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `refund_${paymentId}_${cartId}`,
        },
        body: JSON.stringify({}), // Full refund
      }
    );
    const data = await res.json();
    if (res.ok) {
      console.log(`[MP] ✅ Refund successful: ${data.id}`);
      return { success: true, refund_id: String(data.id) };
    }
    console.error(`[MP] ❌ Refund failed:`, data);
    return { success: false, error: data.message || 'Refund failed' };
  } catch (e: unknown) {
    console.error(`[MP] ❌ Refund error:`, e);
    return { success: false, error: (e as Error).message };
  }
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

    if (!token || !payment_method_id || !cart_id) {
      return jsonError('Datos de pago incompletos');
    }

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL 1: PREFLIGHT — Validate cart is ready
    // BEFORE any money moves. Checks: email, address,
    // shipping method valid, items exist, total > 0.
    // ═══════════════════════════════════════════════════════
    console.log(`[MP] Running preflight for cart ${cart_id}...`);
    const cartData = await medusaFetch(
      `/carts/${cart_id}?fields=*shipping_methods,*items`
    );
    const cart = cartData.cart;

    if (!cart) return jsonError('Cart not found', 404);

    const preflightErrors: string[] = [];
    if (!cart.items || cart.items.length === 0) preflightErrors.push('Cart empty');
    if (!cart.email) preflightErrors.push('Missing email');
    if (!cart.shipping_address?.address_1) preflightErrors.push('Missing address');
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      preflightErrors.push('No shipping method');
    }
    if (typeof cart.total !== 'number' || cart.total <= 0) {
      preflightErrors.push(`Invalid total: ${cart.total}`);
    }

    // Validate shipping method is still valid (vigente)
    if (cart.shipping_methods?.length > 0) {
      try {
        const optData = await medusaFetch(`/shipping-options?cart_id=${cart_id}`);
        const validIds = new Set(
          (optData.shipping_options || []).map((o: { id: string }) => o.id)
        );
        for (const sm of cart.shipping_methods) {
          if (!validIds.has(sm.shipping_option_id)) {
            preflightErrors.push(`Shipping method ${sm.shipping_option_id} no longer valid`);
          }
        }
      } catch {
        console.warn('[MP] Could not validate shipping options (non-blocking)');
      }
    }

    if (preflightErrors.length > 0) {
      console.error(`[MP] ❌ Preflight FAILED:`, preflightErrors);
      return NextResponse.json(
        {
          error: 'Cart not ready for payment',
          preflight_errors: preflightErrors,
          status: 'preflight_failed',
        },
        { status: 422 }
      );
    }
    console.log(`[MP] ✅ Preflight passed for cart ${cart_id}`);

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL 2: Server-side amount validation
    // ═══════════════════════════════════════════════════════
    const verifiedTotal = cart.total;
    console.log(`[MP] Verified cart total: $${verifiedTotal} MXN`);

    if (Number(transaction_amount) !== verifiedTotal) {
      console.warn(
        `[MP] ⚠️ Frontend amount ($${transaction_amount}) differs from verified ($${verifiedTotal}). Using verified.`
      );
    }

    // ═══════════════════════════════════════════════════════
    // STEP 1: Process payment with MercadoPago
    // GUARDRAIL 3: Idempotency key per cart + attempt
    // Using timestamp bucket (10-min window) so retries
    // within the same window are idempotent, but a new
    // attempt after 10 min gets a fresh key.
    // ═══════════════════════════════════════════════════════
    const attemptBucket = Math.floor(Date.now() / 600000); // 10-min buckets
    const idempotencyKey = `mp_pay_${cart_id}_${attemptBucket}`;

    const mpBody: Record<string, unknown> = {
      token,
      transaction_amount: verifiedTotal,
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: payer?.email || 'guest@davidsonsdesign.com',
        identification: payer?.identification,
        first_name: payer?.first_name,
        last_name: payer?.last_name,
      },
      description: `DavidSon's Design — Orden (Cart: ${cart_id})`,
      statement_descriptor: 'DAVIDSONS',
      external_reference: cart_id,
      additional_info: {
        items: [
          {
            id: cart_id,
            title: "DavidSon's Design - Productos artesanales",
            quantity: 1,
            unit_price: verifiedTotal,
          },
        ],
        payer: {
          first_name: payer?.first_name || shipping_address?.first_name || '',
          last_name: payer?.last_name || shipping_address?.last_name || '',
        },
        shipments: shipping_address
          ? {
              receiver_address: {
                street_name: shipping_address.address_1 || '',
                city_name: shipping_address.city || '',
                state_name: shipping_address.province || '',
                zip_code: shipping_address.postal_code || '',
              },
            }
          : undefined,
      },
    };

    if (issuer_id) {
      mpBody.issuer_id = String(issuer_id);
    }

    console.log(`[MP] Processing payment (key: ${idempotencyKey})...`);

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
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

    // ═══════════════════════════════════════════════════════
    // STEP 2: Server-side payment verification
    // ═══════════════════════════════════════════════════════
    const verifyRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpResult.id}`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
    );
    const verified = await verifyRes.json();

    if (verified.status !== 'approved') {
      console.error(`[MP] Verification failed: status=${verified.status}`);
      return jsonError(`Pago no verificado. Estado: ${verified.status}`, 402);
    }

    if (Math.abs(verified.transaction_amount - verifiedTotal) > 0.01) {
      console.error(
        `[MP] Amount mismatch: MP=${verified.transaction_amount}, Cart=${verifiedTotal}`
      );
      // Refund: amount doesn't match
      const refundResult = await attemptRefund(mpResult.id, cart_id);
      return NextResponse.json(
        {
          error: 'Monto del pago no coincide. Se inició reembolso automático.',
          refund: refundResult,
          status: 'amount_mismatch',
        },
        { status: 400 }
      );
    }

    console.log(`[MP] ✅ Payment verified: ${mpResult.id} = $${verifiedTotal} MXN`);

    // ═══════════════════════════════════════════════════════
    // STEP 3: Complete order in Medusa
    // GUARDRAIL 4: If this fails, AUTO-REFUND the payment
    // ═══════════════════════════════════════════════════════
    const result = await completeCartToOrder({
      cartId: cart_id,
      email: payer?.email,
      shippingAddress: shipping_address,
      providerLabel: 'MP',
    });

    if (result.error) {
      console.error(`[MP] ❌ Order creation failed. Initiating auto-refund...`);
      const refundResult = await attemptRefund(mpResult.id, cart_id);

      return NextResponse.json({
        id: mpResult.id,
        status: 'approved',
        status_detail: mpResult.status_detail,
        payment_method: mpResult.payment_method_id,
        transaction_amount: verified.transaction_amount,
        cart_id,
        order_id: null,
        order_display_id: null,
        warning: result.warning,
        refund: refundResult.success ? 'completed' : 'pending',
        refund_details: refundResult,
        // Tell frontend this needs attention
        _error: 'order_creation_failed_payment_refunded',
      });
    }

    // ═══════════════════════════════════════════════════════
    // SUCCESS RESPONSE
    // ═══════════════════════════════════════════════════════
    console.log(`[MP] 🎉 Order created: ${result.order.id} (DSD-${result.order.display_id})`);

    return NextResponse.json({
      id: mpResult.id,
      status: 'approved',
      status_detail: mpResult.status_detail,
      payment_method: mpResult.payment_method_id,
      transaction_amount: verified.transaction_amount,
      installments: mpResult.installments,
      cart_id,
      order_id: result.order.id,
      order_display_id: result.order.display_id,
    });
  } catch (error: unknown) {
    console.error('[MP] Server error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
