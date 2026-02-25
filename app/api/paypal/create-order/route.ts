import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedCartTotal, jsonError } from '../../_lib/medusa-helpers';

// ═══════════════════════════════════════════════════════════════
// PayPal Create Order — Direct PayPal API (like Stripe pattern)
//
// Instead of going through Medusa payment collections (which may
// not exist yet), we call PayPal Orders API directly to create
// the order. Cart completion happens in capture-order route.
// ═══════════════════════════════════════════════════════════════

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_IS_SANDBOX = process.env.PAYPAL_IS_SANDBOX !== 'false';

const PAYPAL_API_URL = PAYPAL_IS_SANDBOX
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Get PayPal access token using client credentials
 */
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

  if (!res.ok) {
    const err = await res.text();
    console.error('[PayPal] Token error:', err);
    throw new Error('Failed to get PayPal access token');
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return jsonError('cartId is required');
    }

    // 1. Get verified cart total from Medusa (never trust frontend)
    const verifiedTotal = await getVerifiedCartTotal(cartId);
    console.log(`[PayPal] Verified cart total: $${verifiedTotal} MXN for cart ${cartId}`);

    // 2. Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // 3. Create PayPal order directly via PayPal Orders API
    const orderRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `dsd_${cartId}_${Date.now()}`, // idempotency
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: cartId,
            description: `DavidSon's Design — Orden`,
            amount: {
              currency_code: 'MXN',
              value: verifiedTotal.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "DavidSon's Design",
          shipping_preference: 'NO_SHIPPING', // We handle shipping in our checkout
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json();
      console.error('[PayPal] Create order error:', JSON.stringify(errData));
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: errData },
        { status: 500 }
      );
    }

    const orderData = await orderRes.json();
    console.log(`[PayPal] ✅ Order created: ${orderData.id} for cart ${cartId}`);

    return NextResponse.json({
      paypalOrderId: orderData.id,
    });
  } catch (error: any) {
    console.error('[PayPal] Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
