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

// ─────────────────────────────────────────────────
// CheckoutForm: lives INSIDE <Elements>
// Uses refs for all mutable data to avoid re-renders
// that would unmount the PaymentElement
// ─────────────────────────────────────────────────
interface CheckoutFormProps {
  cartId: string;
  paymentIntentId: string;
  submitRef: React.MutableRefObject<(() => Promise<void>) | null>;
  payerEmail?: string;
  payerFirstName?: string;
  payerLastName?: string;
  shippingAddress?: StripeCheckoutProps['shippingAddress'];
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
}

function CheckoutForm({
  cartId,
  paymentIntentId,
  submitRef,
  payerEmail,
  payerFirstName,
  payerLastName,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<'ready' | 'processing' | 'success' | 'error'>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [elementReady, setElementReady] = useState(false);

  // Store latest props in refs to avoid stale closures
  // WITHOUT triggering re-renders or re-creating callbacks
  const propsRef = useRef({
    payerEmail, payerFirstName, payerLastName,
    shippingAddress, onPaymentSuccess, onPaymentError,
    cartId, paymentIntentId,
  });
  propsRef.current = {
    payerEmail, payerFirstName, payerLastName,
    shippingAddress, onPaymentSuccess, onPaymentError,
    cartId, paymentIntentId,
  };

  // Register the submit function ONCE via the shared ref
  // This avoids any useEffect/callback chains that cause re-renders
  useEffect(() => {
    submitRef.current = async () => {
      if (!stripe || !elements) {
        console.error('[Stripe] stripe or elements not available');
        propsRef.current.onPaymentError({ message: 'Stripe no está inicializado. Recarga la página.' });
        return;
      }
      if (!elementReady) {
        console.error('[Stripe] PaymentElement not ready yet');
        propsRef.current.onPaymentError({ message: 'El formulario de pago aún no está listo. Espera un momento.' });
        return;
      }

      setStatus('processing');
      setErrorMsg('');

      try {
        const p = propsRef.current;
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: `${p.payerFirstName || ''} ${p.payerLastName || ''}`.trim() || undefined,
                email: p.payerEmail || undefined,
              },
            },
          },
        });

        if (error) {
          setStatus('error');
          setErrorMsg(error.message || 'Error al procesar el pago');
          p.onPaymentError(error);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          console.log('[Stripe] Payment succeeded, creating order...');
          const confirmRes = await fetch('/api/stripe/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_intent_id: p.paymentIntentId,
              cart_id: p.cartId,
              shipping_address: p.shippingAddress,
              payer: {
                email: p.payerEmail,
                first_name: p.payerFirstName,
                last_name: p.payerLastName,
              },
            }),
          });

          const result = await confirmRes.json();
          console.log('[Stripe] Order result:', result);
          setStatus('success');
          p.onPaymentSuccess(result);
        } else {
          setStatus('error');
          setErrorMsg(`Estado del pago: ${paymentIntent?.status}`);
          p.onPaymentError({ status: paymentIntent?.status });
        }
      } catch (err: any) {
        console.error('[Stripe] Error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Error de conexión');
        propsRef.current.onPaymentError(err);
      }
    };
  // ONLY re-register when stripe/elements/elementReady change
  // NOT when props change — we read those from propsRef
  }, [stripe, elements, elementReady, submitRef]);

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

// ─────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────
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

  // Shared ref that CheckoutForm writes to and parent reads from
  const submitFnRef = useRef<(() => Promise<void>) | null>(null);
  const intentCreated = useRef(false);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (submitFnRef.current) {
        await submitFnRef.current();
      } else {
        console.error('[Stripe] submit called but no handler registered');
        onPaymentError({ message: 'Stripe no está listo. Espera a que cargue el formulario.' });
      }
    },
  }));

  // Create PaymentIntent ONCE
  useEffect(() => {
    if (!amount || !cartId || intentCreated.current) return;

    async function createIntent() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'mxn', cart_id: cartId }),
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
        submitRef={submitFnRef}
        payerEmail={payerEmail}
        payerFirstName={payerFirstName}
        payerLastName={payerLastName}
        shippingAddress={shippingAddress}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
});

StripeCheckout.displayName = 'StripeCheckout';
