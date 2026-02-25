import { NextRequest, NextResponse } from 'next/server';
import { medusaFetch, getVerifiedCartTotal, jsonError } from '../../_lib/medusa-helpers';

// ═══════════════════════════════════════════════════════════════
// PayPal Create Order — via Medusa Payment Collection + Session
//
// Flow:
// 1. Verify cart total from Medusa (never trust frontend)
// 2. Create payment collection for the cart
// 3. Initialize PayPal payment session via Medusa
// 4. Return the PayPal order ID (from session data) to frontend
//
// Medusa handles PayPal API calls through our native provider.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return jsonError('cartId is required');
    }

    // 1. Verify cart exists and has valid total
    const verifiedTotal = await getVerifiedCartTotal(cartId);
    console.log(`[PayPal] Verified cart total: $${verifiedTotal} MXN for cart ${cartId}`);

    // 2. Create payment collection for this cart
    console.log(`[PayPal] Creating payment collection for cart ${cartId}...`);
    const pcData = await medusaFetch('/payment-collections', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    });
    const pcId = pcData.payment_collection.id;
    console.log(`[PayPal] Payment collection created: ${pcId}`);

    // 3. Initialize PayPal payment session
    console.log(`[PayPal] Creating PayPal payment session...`);
    const sessionData = await medusaFetch(
      `/payment-collections/${pcId}/payment-sessions`,
      {
        method: 'POST',
        body: JSON.stringify({
          provider_id: 'pp_paypal_paypal',
        }),
      }
    );

    // Find the PayPal session in the collection
    const paypalSession = sessionData.payment_collection?.payment_sessions?.find(
      (s: any) => s.provider_id === 'pp_paypal_paypal'
    );

    if (!paypalSession?.data?.id) {
      console.error('[PayPal] No PayPal order ID in session data:', JSON.stringify(sessionData));
      return NextResponse.json(
        { error: 'PayPal order ID not found in payment session' },
        { status: 500 }
      );
    }

    const paypalOrderId = paypalSession.data.id;
    const approveUrl = paypalSession.data.approve_url;

    console.log(`[PayPal] ✅ PayPal order created: ${paypalOrderId}`);

    return NextResponse.json({
      paypalOrderId,
      approveUrl,
      paymentSessionId: paypalSession.id,
      paymentCollectionId: pcId,
    });
  } catch (error: any) {
    console.error('[PayPal] Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
