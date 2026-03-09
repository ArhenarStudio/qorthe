import { NextRequest, NextResponse } from 'next/server';
import { medusaFetch, jsonError } from '../../_lib/medusa-helpers';
import { logger } from '@/src/lib/logger';

// ═══════════════════════════════════════════════════════════════
// PayPal Capture Order — Complete cart after PayPal approval
//
// After user approves in PayPal, this route:
// 1. Completes the cart via Medusa (which triggers authorize →
//    capture through our native PayPal provider)
// 2. Returns the created order
//
// Note: The native provider's authorizePayment method handles
// the actual PayPal capture (autoCapture: true).
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { cartId, paypalOrderId } = await req.json();

    if (!cartId || !paypalOrderId) {
      return jsonError('cartId and paypalOrderId are required');
    }

    logger.debug(`[PayPal] Completing cart ${cartId} (PayPal order: ${paypalOrderId})...`);

    // Complete cart → Medusa will call our provider's authorizePayment
    // which captures the PayPal order (autoCapture: true)
    const completeData = await medusaFetch(`/carts/${cartId}/complete`, {
      method: 'POST',
    });

    if (completeData.type !== 'order') {
      console.error('[PayPal] Cart completion did not produce an order:', completeData);
      return NextResponse.json(
        {
          error: 'Cart completion failed',
          warning: 'Pago aprobado pero orden no creada. Contactar soporte.',
          paypal_order_id: paypalOrderId,
        },
        { status: 500 }
      );
    }

    const order = completeData.order;
    logger.debug(`[PayPal] ✅ Order created: ${order.id} (DSD-${order.display_id})`);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_display_id: order.display_id,
      paypal_order_id: paypalOrderId,
    });
  } catch (error: any) {
    console.error('[PayPal] Capture order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
