import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { cartId, paypalOrderId } = await req.json();

    if (!cartId || !paypalOrderId) {
      return NextResponse.json(
        { error: 'cartId and paypalOrderId are required' },
        { status: 400 }
      );
    }

    // 1. Complete the cart → create order in Medusa
    const completeRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/complete`,
      {
        method: 'POST',
        headers: {
          'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!completeRes.ok) {
      const errorData = await completeRes.json();
      console.error('[PayPal] Complete cart error:', errorData);
      return NextResponse.json(
        { error: 'Failed to complete order' },
        { status: 500 }
      );
    }

    const completeData = await completeRes.json();

    // Extract order info
    const order = completeData.order || completeData;
    const orderId = order.id || '';
    const orderDisplayId = order.display_id || '';

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_display_id: orderDisplayId,
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
