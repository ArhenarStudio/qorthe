import { NextRequest, NextResponse } from 'next/server';
import {
  getVerifiedCartTotal,
  completeCartToOrder,
  jsonError,
} from '../../_lib/medusa-helpers';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

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
    // ISSUE 1 FIX: Server-side amount validation
    // NEVER trust transaction_amount from the frontend.
    // Always recalculate from Medusa cart.
    // ═══════════════════════════════════════════════════════
    const verifiedTotal = await getVerifiedCartTotal(cart_id);
    console.log(`[MP] Verified cart total: $${verifiedTotal} MXN for cart ${cart_id}`);

    // Log if frontend amount differs (for debugging, not blocking)
    if (Number(transaction_amount) !== verifiedTotal) {
      console.warn(
        `[MP] ⚠️ Frontend amount ($${transaction_amount}) differs from verified ($${verifiedTotal}). Using verified.`
      );
    }

    // ═══════════════════════════════════════════════════════
    // STEP 1: Process payment with MercadoPago
    // Using verified amount, not frontend amount
    // ═══════════════════════════════════════════════════════
    const mpBody: Record<string, unknown> = {
      token,
      transaction_amount: verifiedTotal, // ← VERIFIED, not from frontend
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
      // Additional info for better approval rates (MP recommendation)
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

    console.log('[MP] Processing payment for cart:', cart_id);

    // ═══════════════════════════════════════════════════════
    // ISSUE 3 FIX: Proper idempotency key
    // Same cart_id always produces same payment request.
    // Date.now() was making it non-idempotent.
    // ═══════════════════════════════════════════════════════
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `mp_pay_${cart_id}`,
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
    // ISSUE 2 FIX: Server-side payment verification (GET)
    // Double-check the payment was really approved
    // ═══════════════════════════════════════════════════════
    const verifyRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpResult.id}`,
      {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      }
    );
    const verified = await verifyRes.json();

    if (verified.status !== 'approved') {
      console.error(`[MP] Verification failed: status=${verified.status}`);
      return jsonError(`Pago no verificado. Estado: ${verified.status}`, 402);
    }

    // Verify amount matches
    if (Math.abs(verified.transaction_amount - verifiedTotal) > 0.01) {
      console.error(
        `[MP] Amount mismatch: MP=${verified.transaction_amount}, Cart=${verifiedTotal}`
      );
      return jsonError('Monto del pago no coincide con el carrito', 400);
    }

    console.log(`[MP] ✅ Payment verified: ${mpResult.id} = $${verifiedTotal} MXN`);

    // ═══════════════════════════════════════════════════════
    // Complete the order in Medusa (shared helper)
    // ═══════════════════════════════════════════════════════
    const result = await completeCartToOrder({
      cartId: cart_id,
      email: payer?.email,
      shippingAddress: shipping_address,
      providerLabel: 'MP',
    });

    if (result.error) {
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
      });
    }

    // ═══════════════════════════════════════════════════════
    // SUCCESS RESPONSE
    // ═══════════════════════════════════════════════════════
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
    console.error('[API] Server error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
