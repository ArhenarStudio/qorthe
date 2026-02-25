import { NextRequest, NextResponse } from 'next/server';
import { completeCartToOrder, jsonError } from '../../_lib/medusa-helpers';

// ═══════════════════════════════════════════════════════════════
// PayPal Capture Order — Captures PayPal payment, then completes
// the Medusa cart to create an order.
//
// Flow:
// 1. Capture PayPal order via PayPal Orders API
// 2. Complete Medusa cart → create order (uses completeCartToOrder)
// ═══════════════════════════════════════════════════════════════

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_IS_SANDBOX = process.env.PAYPAL_IS_SANDBOX !== 'false';

const PAYPAL_API_URL = PAYPAL_IS_SANDBOX
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Failed to get PayPal access token');
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { cartId, paypalOrderId } = await req.json();

    if (!cartId || !paypalOrderId) {
      return jsonError('cartId and paypalOrderId are required');
    }

    // 1. Capture the PayPal order
    console.log(`[PayPal] Capturing order ${paypalOrderId} for cart ${cartId}...`);
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!captureRes.ok) {
      const errData = await captureRes.json();
      console.error('[PayPal] Capture error:', JSON.stringify(errData));
      return NextResponse.json(
        { error: 'PayPal capture failed', details: errData },
        { status: 500 }
      );
    }

    const captureData = await captureRes.json();
    const captureStatus = captureData.status;
    console.log(`[PayPal] Capture status: ${captureStatus}`);

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: `PayPal capture status: ${captureStatus}` },
        { status: 500 }
      );
    }

    // 2. Complete Medusa cart → create order
    const result = await completeCartToOrder({
      cartId,
      providerLabel: 'PayPal',
    });

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          warning: result.warning,
          paypal_capture_id: captureData.id,
        },
        { status: 500 }
      );
    }

    const order = result.order;
    console.log(`[PayPal] ✅ Order completed: ${order.id} (DSD-${order.display_id})`);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_display_id: order.display_id,
      paypal_order_id: paypalOrderId,
      paypal_capture_id: captureData.id,
    });
  } catch (error: any) {
    console.error('[PayPal] Capture order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
