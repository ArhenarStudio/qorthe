"use client";

import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// CRITICAL: loadStripe must be called outside component to avoid
// recreating the Stripe object on every render (per Stripe docs)
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

interface StripeCheckoutProps {
  amount: number;
  cartId: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  payerEmail?: string;
  loyaltyDiscountCentavos?: number;
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

// ─────────────────────────────────────────────────────────
// CheckoutForm — inner component that lives inside <Elements>
// Following official Stripe pattern from react-stripe-js README
// ─────────────────────────────────────────────────────────
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
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Use refs for all mutable props so the submit closure never goes stale
  // and never causes re-renders that could unmount PaymentElement
  const propsRef = useRef({ payerEmail, payerFirstName, payerLastName, shippingAddress, onPaymentSuccess, onPaymentError, cartId, paymentIntentId });
  propsRef.current = { payerEmail, payerFirstName, payerLastName, shippingAddress, onPaymentSuccess, onPaymentError, cartId, paymentIntentId };

  // Write submit function to shared ref — called by parent via stripeRef.current.submit()
  // Only depends on stripe and elements (stable after mount)
  useEffect(() => {
    if (!stripe || !elements) return;

    submitRef.current = async () => {
      const p = propsRef.current;
      setErrorMsg('');

      try {
        // STEP 1: Validate the form — PaymentElement MUST remain in DOM
        const { error: submitError } = await elements.submit();
        if (submitError) {
          setStatus('error');
          setErrorMsg(submitError.message || 'Error de validación');
          p.onPaymentError(submitError);
          return;
        }

        // STEP 2: Show processing overlay AFTER validation passed
        setStatus('processing');

        // STEP 3: Confirm the payment
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

        // STEP 4: Payment succeeded — create order in Medusa
        if (paymentIntent?.status === 'succeeded') {
          const confirmRes = await fetch('/api/stripe/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_intent_id: p.paymentIntentId,
              cart_id: p.cartId,
              shipping_address: p.shippingAddress,
              payer: { email: p.payerEmail, first_name: p.payerFirstName, last_name: p.payerLastName },
            }),
          });
          const result = await confirmRes.json();
          setStatus('success');
          p.onPaymentSuccess(result);
        } else {
          setStatus('error');
          setErrorMsg(`Estado inesperado: ${paymentIntent?.status}`);
          p.onPaymentError({ status: paymentIntent?.status });
        }
      } catch (err: unknown) {
        console.error('[Stripe] Error:', err);
        setStatus('error');
        setErrorMsg((err as Error).message || 'Error de conexión');
        propsRef.current.onPaymentError(err);
      }
    };
  }, [stripe, elements, submitRef]);

  // ── Render ──
  // CRITICAL: PaymentElement must ALWAYS remain mounted in the DOM.
  // Conditional returns (if processing/success) would unmount it,
  // causing "elements should have a mounted Payment Element" error.
  // Instead, we use overlays and visibility to preserve the DOM node.

  return (
    <div className="relative">
      {/* Processing overlay — covers but does NOT unmount PaymentElement */}
      {status === 'processing' && (
        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center py-12 space-y-3 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-[#635BFF]" />
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

      {/* The actual form — ALWAYS in the DOM */}
      <div className={status === 'processing' || status === 'success' ? 'opacity-0 pointer-events-none' : ''}>
        <div className="space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          <PaymentElement
            options={{ layout: 'tabs' }}
            onReady={() => undefined}
            onLoadError={(e) => console.error('[Stripe] PaymentElement load error:', e)}
          />

          <div className="flex items-center justify-center gap-2 text-xs text-wood-400 pt-2">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Pago seguro procesado por Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────
export const StripeCheckout = forwardRef<StripeCheckoutHandle, StripeCheckoutProps>(({
  amount,
  cartId,
  onPaymentSuccess,
  onPaymentError,
  payerEmail = '',
  loyaltyDiscountCentavos = 0,
  payerFirstName = '',
  payerLastName = '',
  shippingAddress,
}, ref) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Shared ref: CheckoutForm writes its submit fn here, parent reads it
  const submitFnRef = useRef<(() => Promise<void>) | null>(null);
  const intentCreated = useRef(false);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (submitFnRef.current) {
        await submitFnRef.current();
      } else {
        console.error('[Stripe] submit() called but no handler registered yet');
        onPaymentError({ message: 'Stripe no está listo. Espera a que cargue el formulario.' });
      }
    },
  }));

  // Create PaymentIntent ONCE — guard with ref
  useEffect(() => {
    if (!amount || !cartId || intentCreated.current) return;
    intentCreated.current = true;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'mxn', cart_id: cartId, email: payerEmail, loyalty_discount: loyaltyDiscountCentavos }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        } else {
          setError(data.error || 'Error inicializando Stripe');
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    })();
  }, [amount, cartId]);

  // CRITICAL: Memoize options so Elements doesn't create multiple
  // StripeElements instances on re-render (react-stripe-js issue #296)
  const elementsOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#3D2B1F',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: '2px',
        },
      },
      locale: 'es' as const,
    };
  }, [clientSecret]);

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

  if (!elementsOptions || !stripePromise) return null;

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
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
