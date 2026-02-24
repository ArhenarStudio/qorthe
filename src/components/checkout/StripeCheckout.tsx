"use client";

import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

interface StripeCheckoutProps {
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

export interface StripeCheckoutHandle {
  submit: () => Promise<void>;
}

// ── Inner form that lives INSIDE <Elements> ──
// Uses a callback ref pattern to expose submit to parent
interface CheckoutFormProps {
  cartId: string;
  paymentIntentId: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  payerEmail?: string;
  payerFirstName?: string;
  payerLastName?: string;
  shippingAddress?: StripeCheckoutProps['shippingAddress'];
  onReady: (handle: StripeCheckoutHandle) => void;
}

function CheckoutForm({
  cartId,
  paymentIntentId,
  onPaymentSuccess,
  onPaymentError,
  payerEmail,
  payerFirstName,
  payerLastName,
  shippingAddress,
  onReady,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<'ready' | 'processing' | 'success' | 'error'>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements || !elementReady) {
      console.warn('[Stripe] Not ready yet - stripe:', !!stripe, 'elements:', !!elements, 'elementReady:', elementReady);
      onPaymentError({ message: 'Stripe aún no está listo. Espera un momento e intenta de nuevo.' });
      return;
    }

    setStatus('processing');
    setErrorMsg('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${payerFirstName || ''} ${payerLastName || ''}`.trim() || undefined,
              email: payerEmail || undefined,
            },
          },
        },
      });

      if (error) {
        setStatus('error');
        setErrorMsg(error.message || 'Error al procesar el pago');
        onPaymentError(error);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('[Stripe] Payment succeeded, creating order...');
        const confirmRes = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            cart_id: cartId,
            shipping_address: shippingAddress,
            payer: {
              email: payerEmail,
              first_name: payerFirstName,
              last_name: payerLastName,
            },
          }),
        });

        const result = await confirmRes.json();
        console.log('[Stripe] Order result:', result);
        setStatus('success');
        onPaymentSuccess(result);
      } else {
        setStatus('error');
        setErrorMsg(`Estado del pago: ${paymentIntent?.status}`);
        onPaymentError({ status: paymentIntent?.status });
      }
    } catch (err: any) {
      console.error('[Stripe] Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión');
      onPaymentError(err);
    }
  }, [stripe, elements, elementReady, cartId, paymentIntentId, onPaymentSuccess, onPaymentError, payerEmail, payerFirstName, payerLastName, shippingAddress]);

  // Expose submit handle to parent via callback (not forwardRef)
  useEffect(() => {
    onReady({ submit: handleSubmit });
  }, [handleSubmit, onReady]);

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#635BFF]" />
        <p className="text-sm font-medium text-wood-700">Procesando tu pago...</p>
        <p className="text-xs text-wood-500">No cierres esta ventana</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <p className="text-sm font-medium text-green-700">¡Pago aprobado!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <PaymentElement
        options={{ layout: 'tabs' }}
        onReady={() => {
          console.log('[Stripe] PaymentElement mounted and ready');
          setElementReady(true);
        }}
      />

      <div className="flex items-center justify-center gap-2 text-xs text-wood-400 pt-2">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Pago seguro procesado por Stripe</span>
      </div>
    </div>
  );
}

// ── Main exported component ──
export const StripeCheckout = forwardRef<StripeCheckoutHandle, StripeCheckoutProps>(({
  amount,
  cartId,
  onPaymentSuccess,
  onPaymentError,
  payerEmail = '',
  payerFirstName = '',
  payerLastName = '',
  shippingAddress,
}, ref) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleRef = useRef<StripeCheckoutHandle | null>(null);

  // Expose submit via forwardRef
  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (handleRef.current) {
        await handleRef.current.submit();
      } else {
        console.warn('[Stripe] Submit called but form not ready');
        onPaymentError({ message: 'Stripe aún no está listo' });
      }
    },
  }));

  // Create PaymentIntent ONCE — do NOT re-create on email/name changes
  // This prevents the Elements provider from re-mounting and losing the PaymentElement
  const intentCreated = useRef(false);

  useEffect(() => {
    if (!amount || !cartId || intentCreated.current) return;

    async function createIntent() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'mxn', cart_id: cartId, email: payerEmail }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          intentCreated.current = true;
        } else {
          setError(data.error || 'Error inicializando Stripe');
        }
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, cartId]);

  if (!STRIPE_PK) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
        <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">Stripe no está configurado.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-wood-500" />
        <span className="ml-2 text-sm text-wood-500">Inicializando Stripe...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
        <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3D2B1F',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '2px',
          },
        },
        locale: 'es',
      }}
    >
      <CheckoutForm
        cartId={cartId}
        paymentIntentId={paymentIntentId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        payerEmail={payerEmail}
        payerFirstName={payerFirstName}
        payerLastName={payerLastName}
        shippingAddress={shippingAddress}
        onReady={(handle) => { handleRef.current = handle; }}
      />
    </Elements>
  );
});

StripeCheckout.displayName = 'StripeCheckout';
