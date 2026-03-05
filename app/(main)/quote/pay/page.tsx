"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText, CreditCard, ArrowLeft, CheckCircle, Loader2,
  Package, Shield, Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════
// Quote Payment Page — /quote/pay?id=QUOTE_ID
//
// Allows customers to view their approved quote and proceed
// to payment. Creates a Medusa cart from quote pieces and
// redirects to the checkout flow.
// ═══════════════════════════════════════════════════════════════

interface QuotePiece {
  type: string;
  category: string;
  material: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface QuoteData {
  id: string;
  number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  project_name: string;
  pieces: QuotePiece[];
  total: number;
  subtotal: number;
  timeline: string;
  valid_until: string;
  deposit_percent: number;
  conditions: { text: string; checked: boolean }[];
}

const formatMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

const PAYABLE_STATUSES = ["aprobada", "anticipo_recibido"];

export default function QuotePayPage() {
  const params = useSearchParams();
  const quoteId = params.get("id");
  const { user } = useAuth();

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!quoteId) {
      setError("ID de cotización no proporcionado");
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/admin/quotes?id=${quoteId}`);
        if (!res.ok) throw new Error("No se pudo cargar la cotización");
        const data = await res.json();
        const q = data.quote;
        if (!q) throw new Error("Cotización no encontrada");
        setQuote({
          id: q.id,
          number: q.number,
          status: q.status,
          customer_name: q.customer?.name || "",
          customer_email: q.customer?.email || "",
          project_name: q.projectName || "",
          pieces: q.pieces || [],
          total: q.pieces?.reduce((s: number, p: QuotePiece) => s + (p.lineTotal || (p.unitPrice || 0) * (p.quantity || 1)), 0) || 0,
          subtotal: q.pieces?.reduce((s: number, p: QuotePiece) => s + (p.unitPrice || 0) * (p.quantity || 1), 0) || 0,
          timeline: q.timeline || "",
          valid_until: q.validUntil || "",
          deposit_percent: q.depositPercent || 50,
          conditions: q.conditions || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  const handleProceedToCheckout = async (payType: "deposit" | "full" = "deposit") => {
    if (!quote || processing) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/quotes/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quote.id,
          pay_type: payType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al crear sesión de pago");
      }

      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No se recibió URL de pago");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent-gold" />
      </div>
    );
  }

  // ── Error ──
  if (error || !quote) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <FileText className="w-12 h-12 text-wood-300 mb-4" />
        <h2 className="text-xl font-serif text-wood-900 dark:text-sand-100 mb-2">
          {error || "Cotización no encontrada"}
        </h2>
        <a href="/account" className="text-sm text-accent-gold hover:underline mt-4">
          ← Volver a mi cuenta
        </a>
      </div>
    );
  }

  // ── Not payable ──
  if (!PAYABLE_STATUSES.includes(quote.status)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <Clock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-serif text-wood-900 dark:text-sand-100 mb-2">
            Cotización en proceso
          </h2>
          <p className="text-sm text-wood-600 dark:text-wood-400 mb-4">
            Tu cotización <strong>{quote.number}</strong> está en estado <strong>{quote.status}</strong>.
            El pago estará disponible cuando sea aprobada por nuestro equipo.
          </p>
          <a href="/account" className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver a mi cuenta
          </a>
        </div>
      </div>
    );
  }

  // ── Payable view ──
  const depositAmount = quote.total * (quote.deposit_percent / 100);
  const isExpired = new Date(quote.valid_until) < new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Back */}
      <a href="/account" className="inline-flex items-center gap-1.5 text-xs text-wood-500 hover:text-wood-900 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a mi cuenta
      </a>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-wood-900 dark:text-sand-100 mb-1">
          Cotización Aprobada
        </h1>
        <p className="text-sm text-wood-500">
          {quote.number} — {quote.project_name || "Cotización personalizada"}
        </p>
      </div>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-red-600">Esta cotización venció el {formatDate(quote.valid_until)}. Contacta a nuestro equipo para renovarla.</p>
        </div>
      )}

      {/* Pieces */}
      <div className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden mb-6">
        <div className="px-5 py-3 bg-wood-50 dark:bg-wood-900 border-b border-wood-100 dark:border-wood-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-wood-400 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Detalle de piezas
          </h3>
        </div>
        <div className="divide-y divide-wood-50 dark:divide-wood-900">
          {quote.pieces.map((p, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-wood-900 dark:text-sand-100">{p.type}</span>
                <span className="text-xs text-wood-400 ml-2">{p.material}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-wood-400">×{p.quantity}</span>
                <span className="text-sm font-bold text-wood-900 dark:text-sand-100 ml-3">{formatMXN(p.lineTotal)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-wood-50 dark:bg-wood-900 border-t border-wood-200 dark:border-wood-700">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-wood-900 dark:text-sand-100">Total</span>
            <span className="text-xl font-serif font-bold text-accent-gold">{formatMXN(quote.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-wood-500 mt-1">
            <span>Anticipo requerido ({quote.deposit_percent}%)</span>
            <span className="font-bold">{formatMXN(depositAmount)}</span>
          </div>
        </div>
      </div>

      {/* Conditions */}
      {quote.conditions.length > 0 && (
        <div className="bg-sand-50 dark:bg-wood-900 rounded-xl p-5 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-wood-400 mb-3">Condiciones</h4>
          <div className="space-y-2">
            {quote.conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-wood-600">
                <span className="text-green-500">✓</span> {c.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security badges */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-wood-400 mb-6">
        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Pago seguro</span>
        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Stripe + MercadoPago</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Timeline: {quote.timeline}</span>
      </div>

      {/* Pay buttons */}
      {!isExpired && (
        <div className="space-y-3">
          <button
            onClick={() => handleProceedToCheckout("deposit")}
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-accent-gold to-[#B08D55] text-wood-900 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Pagar Anticipo — {formatMXN(depositAmount)}</>
            )}
          </button>
          <button
            onClick={() => handleProceedToCheckout("full")}
            disabled={processing}
            className="w-full py-3 bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 text-wood-700 dark:text-wood-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 hover:bg-wood-50 disabled:opacity-50 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" /> Pagar total completo — {formatMXN(quote.total)}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-wood-400 text-center mt-3">
        Se cobrará el anticipo de {formatMXN(depositAmount)} ({quote.deposit_percent}%). El saldo restante se cobra al completar tu pedido.
      </p>
    </div>
  );
}
