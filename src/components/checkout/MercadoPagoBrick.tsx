"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

let mpInitialized = false;

interface MercadoPagoBrickProps {
  amount: number;
  cartId: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  payerEmail?: string;
  payerFirstName?: string;
  payerLastName?: string;
  shippingAddress?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
  };
}

export const MercadoPagoBrick: React.FC<MercadoPagoBrickProps> = ({
  amount,
  cartId,
  onPaymentSuccess,
  onPaymentError,
  payerEmail = '',
  payerFirstName = '',
  payerLastName = '',
  shippingAddress,
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!mpInitialized && MP_PUBLIC_KEY) {
      initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-MX' });
      mpInitialized = true;
    }
    setStatus('ready');
  }, []);

  const handleSubmit = useCallback(async (formData: any) => {
    setStatus('processing');
    setErrorMsg('');

    // The Payment Brick wraps data inside formData.formData
    const pd = formData.formData || formData;

    try {
      // ─── PREFLIGHT: Validate cart is ready before payment ───
      const preflightRes = await fetch('/api/checkout/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId }),
      });
      const preflight = await preflightRes.json();

      if (!preflight.ready) {
        console.error('[MP] Preflight failed:', preflight.errors);
        setStatus('error');
        setErrorMsg(
          preflight.errors?.join(', ') ||
            'Tu carrito no está listo. Verifica tus datos de envío.'
        );
        return;
      }

      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pd.token,
          transaction_amount: amount,
          installments: pd.installments || 1,
          payment_method_id: pd.payment_method_id,
          issuer_id: pd.issuer_id,
          payer: {
            email: pd.payer?.email || payerEmail,
            first_name: payerFirstName,
            last_name: payerLastName,
            identification: pd.payer?.identification,
          },
          cart_id: cartId,
          shipping_address: shippingAddress,
        }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        setStatus('success');
        onPaymentSuccess(result);
      } else if (result.status === 'in_process' || result.status === 'pending') {
        setStatus('success');
        onPaymentSuccess(result);
      } else {
        setStatus('error');
        setErrorMsg(result.error || result.status_detail || 'Pago rechazado');
        onPaymentError(result);
      }
    } catch (err: any) {
      console.error('[MP] Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión');
      onPaymentError(err);
    }
  }, [amount, cartId, onPaymentSuccess, onPaymentError, payerEmail, payerFirstName, payerLastName, shippingAddress]);

  if (!MP_PUBLIC_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
        <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">MercadoPago no está configurado.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-wood-500" />
        <span className="ml-2 text-sm text-wood-500">Cargando formulario de pago...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Processing overlay */}
      {status === 'processing' && (
        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center py-12 space-y-3 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-[#009ee3]" />
          <p className="text-sm font-medium text-wood-700">Procesando tu pago...</p>
          <p className="text-xs text-wood-500">No cierres esta ventana</p>
        </div>
      )}

      {/* Success overlay */}
      {status === 'success' && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center py-12 space-y-3 rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
          <p className="text-sm font-medium text-green-700">¡Pago aprobado!</p>
        </div>
      )}

      <div className={status === 'processing' || status === 'success' ? 'opacity-0 pointer-events-none' : ''}>
        <div className="space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

      <Payment
        initialization={{
          amount: amount,
          payer: {
            email: payerEmail,
            firstName: payerFirstName,
            lastName: payerLastName,
          },
        }}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
          },
          visual: {
            style: {
              theme: 'default',
            },
          },
        }}
        onSubmit={handleSubmit}
        onReady={() => setStatus('ready')}
        onError={(error: any) => {
          console.error('MP Brick error:', error);
        }}
      />

      <div className="flex items-center justify-center gap-2 text-xs text-wood-400 pt-2">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Pago seguro procesado por MercadoPago</span>
      </div>
        </div>
      </div>
    </div>
  );
};