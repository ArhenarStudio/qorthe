import { NextRequest, NextResponse } from 'next/server';
import {
  medusaFetch,
  completeCartToOrder,
  jsonError,
} from '../../_lib/medusa-helpers';
import { calculateDiscounts } from '../../_lib/discount-engine';
import { logger } from '@/src/lib/logger';

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
    logger.debug(`[MP] 🔄 Attempting refund for payment ${paymentId} (cart: ${cartId})`);
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
      logger.debug(`[MP] ✅ Refund successful: ${data.id}`);
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
      loyalty_points_to_redeem,
    } = body;

    if (!token || !payment_method_id || !cart_id) {
      return jsonError('Datos de pago incompletos');
    }

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL 0: SINGLE-FLIGHT — Prevent double charge
    // If this cart already has an order, return it instead
    // of charging again.
    // ═══════════════════════════════════════════════════════
    try {
      const existingCheck = await medusaFetch(`/carts/${cart_id}?fields=completed_at`);
      if (existingCheck.cart?.completed_at) {
        logger.debug(`[MP] Cart ${cart_id} already completed. Returning existing.`);
        return NextResponse.json({
          status: 'already_processed',
          cart_id,
          message: 'Este pedido ya fue procesado.',
        });
      }
    } catch {
      // Cart might not exist or be in weird state — continue to preflight
    }

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL 1: PREFLIGHT — Validate cart is ready
    // BEFORE any money moves. Checks: email, address,
    // shipping method valid, items exist, total > 0.
    // ═══════════════════════════════════════════════════════
    logger.debug(`[MP] Running preflight for cart ${cart_id}...`);
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
    logger.debug(`[MP] ✅ Preflight passed for cart ${cart_id}`);

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL 2: CENTRALIZED DISCOUNT ENGINE
    // Validates tier + points + enforces 70% max combined cap
    // ═══════════════════════════════════════════════════════
    const cartTotalCentavos = cart.total || 0;
    const cartSubtotalCentavos = cart.item_subtotal || cart.subtotal || cartTotalCentavos;

    const discounts = await calculateDiscounts({
      userEmail: payer?.email || cart.email,
      cartSubtotalCentavos,
      cartTotalCentavos,
      pointsToRedeem: loyalty_points_to_redeem || 0,
    });

    const mpAmount = discounts.finalAmountCentavos / 100; // Convert centavos → pesos for MP
    logger.debug(`[MP] Discount engine: ${discounts.debug}`);
    logger.debug(`[MP] Final amount: ${mpAmount} MXN`);

    if (Math.abs(Number(transaction_amount) - mpAmount) > 0.01) {
      console.warn(
        `[MP] ⚠️ Frontend amount (${transaction_amount}) differs from verified (${mpAmount}). Using verified.`
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
      transaction_amount: mpAmount,
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: payer?.email || 'guest@qorthe.com',
        identification: payer?.identification,
        first_name: payer?.first_name,
        last_name: payer?.last_name,
      },
      description: `Qorthe — Orden (Cart: ${cart_id})`,
      statement_descriptor: 'QORTHES',
      external_reference: cart_id,
      additional_info: {
        items: [
          {
            id: cart_id,
            title: "Qorthe - Productos artesanales",
            quantity: 1,
            unit_price: mpAmount,
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

    logger.debug(`[MP] Processing payment (key: ${idempotencyKey})...`);

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
    logger.debug('[MP] Response:', mpResult.status, mpResult.status_detail);

    // ─── Handle non-approved states ───
    if (!mpResponse.ok || !['approved'].includes(mpResult.status)) {
      // PENDING states (in_process, pending) — payment is not final yet.
      // Do NOT complete order. Webhook will resolve this later.
      // Pending payments are handled via MP webhook at /api/webhooks/mercadopago
      if (['in_process', 'pending'].includes(mpResult.status)) {
        logger.debug(`[MP] ⏳ Payment pending (${mpResult.status}). Order will be created via webhook.`);
        return NextResponse.json({
          status: mpResult.status,
          status_detail: mpResult.status_detail,
          id: mpResult.id,
          cart_id,
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          _note: 'order_pending_webhook_required',
        });
      }

      // REJECTED / other failures
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

    if (Math.abs(verified.transaction_amount - mpAmount) > 0.01) {
      console.error(
        `[MP] Amount mismatch: MP=${verified.transaction_amount}, Expected=${mpAmount}`
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

    logger.debug(`[MP] ✅ Payment verified: ${mpResult.id} = $${mpAmount} MXN`);

    // ═══════════════════════════════════════════════════════
    // STEP 3: Complete order in Medusa
    // GUARDRAIL 4: If this fails, AUTO-REFUND the payment
    // ═══════════════════════════════════════════════════════
    // ARCHITECTURE: Do NOT pass email/address here.
    // The cart is already fully prepared by the frontend.
    // Any mutation would invalidate shipping methods.
    // ═══════════════════════════════════════════════════════
    const result = await completeCartToOrder({
      cartId: cart_id,
      providerLabel: 'MP',
    });

    if (result.error) {
      console.error(`[MP] ❌ Order creation failed. Initiating auto-refund...`);
      const refundResult = await attemptRefund(mpResult.id, cart_id);

      // Structured audit log
      logger.debug(JSON.stringify({
        event: 'mp_order_failed_refund',
        cart_id,
        mp_payment_id: mpResult.id,
        order_id: null,
        idempotency_key: `mp_pay_${cart_id}_${Math.floor(Date.now() / 600000)}`,
        refund_success: refundResult.success,
        refund_id: refundResult.refund_id || null,
        timestamp: new Date().toISOString(),
      }));

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
    // Structured audit log
    logger.debug(JSON.stringify({
      event: 'mp_payment_success',
      cart_id,
      mp_payment_id: mpResult.id,
      order_id: result.order.id,
      order_display_id: result.order.display_id,
      amount: verified.transaction_amount,
      idempotency_key: `mp_pay_${cart_id}_${Math.floor(Date.now() / 600000)}`,
      timestamp: new Date().toISOString(),
    }));

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
