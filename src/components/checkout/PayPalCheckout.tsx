"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PayPalCheckoutProps {
  amount: number;
  cartId: string;
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  shippingAddress: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
}

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  cartId,
  payerEmail,
  payerFirstName,
  payerLastName,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // PayPal SDK loads asynchronously via PayPalScriptProvider
    setLoading(false);
  }, []);

  // Create order via our API route (which talks to Medusa → PayPal)
  const createOrder = useCallback(async () => {
    try {
      setError('');
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          amount,
          email: payerEmail,
          firstName: payerFirstName,
          lastName: payerLastName,
          shippingAddress,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error creating PayPal order');
      }

      return data.paypalOrderId;
    } catch (err: any) {
      console.error('[PayPal] Create order error:', err);
      setError(err.message || 'Error al crear la orden de PayPal');
      throw err;
    }
  }, [cartId, amount, payerEmail, payerFirstName, payerLastName, shippingAddress]);

  // Handle approval — capture payment and create Medusa order
  const onApprove = useCallback(async (data: any) => {
    try {
      setProcessing(true);
      setError('');

      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          paypalOrderId: data.orderID,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error capturing PayPal payment');
      }

      onPaymentSuccess(result);
    } catch (err: any) {
      console.error('[PayPal] Capture error:', err);
      setError(err.message || 'Error al procesar el pago con PayPal');
      onPaymentError(err);
    } finally {
      setProcessing(false);
    }
  }, [cartId, onPaymentSuccess, onPaymentError]);

  const onError = useCallback((err: any) => {
    console.error('[PayPal] SDK Error:', err);
    setError('Error con PayPal. Intenta de nuevo o elige otro método de pago.');
    onPaymentError(err);
  }, [onPaymentError]);

  const onCancel = useCallback(() => {
    console.log('[PayPal] Payment cancelled by user');
    setError('');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-wood-400" />
        <span className="ml-2 text-sm text-wood-500">Cargando PayPal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {processing && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Procesando tu pago...</span>
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId: PAYPAL_CLIENT_ID,
          currency: 'MXN',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          }}
          disabled={processing}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
        />
      </PayPalScriptProvider>
    </div>
  );
};
