import { NextRequest, NextResponse } from 'next/server';

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
    } = body;

    if (!token || !transaction_amount || !payment_method_id) {
      return NextResponse.json(
        { error: 'Datos de pago incompletos' },
        { status: 400 }
      );
    }

    // Call MercadoPago Payments API directly
    const mpBody: any = {
      token,
      transaction_amount: Number(transaction_amount),
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: payer?.email || 'test@test.com',
        identification: payer?.identification,
        first_name: payer?.first_name,
        last_name: payer?.last_name,
      },
      description: `DavidSons Design - Orden`,
      statement_descriptor: 'DAVIDSONS',
      external_reference: cart_id || '',
    };

    if (issuer_id) {
      mpBody.issuer_id = String(issuer_id);
    }

    console.log('[MP API] Processing payment:', JSON.stringify(mpBody, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${cart_id}-${Date.now()}`,
      },
      body: JSON.stringify(mpBody),
    });

    const mpResult = await mpResponse.json();
    console.log('[MP API] MercadoPago response:', mpResult.status, mpResult.status_detail);

    if (!mpResponse.ok) {
      console.error('[MP API] Error:', JSON.stringify(mpResult, null, 2));
      return NextResponse.json(
        { 
          error: mpResult.message || 'Error en MercadoPago',
          cause: mpResult.cause,
          status: 'rejected',
          status_detail: mpResult.status_detail,
        },
        { status: mpResponse.status }
      );
    }

    return NextResponse.json({
      id: mpResult.id,
      status: mpResult.status,
      status_detail: mpResult.status_detail,
      payment_method: mpResult.payment_method_id,
      transaction_amount: mpResult.transaction_amount,
      installments: mpResult.installments,
      cart_id,
    });

  } catch (error: any) {
    console.error('[MP API] Server error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}