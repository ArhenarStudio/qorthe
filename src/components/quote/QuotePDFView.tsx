"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// ── Brand Config (SaaS-ready: override per tenant) ──────

const BRAND = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Qorthe",
  url: process.env.NEXT_PUBLIC_STORE_URL || "qorthe.com",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "hola@qorthe.com",
  logo: process.env.NEXT_PUBLIC_STORE_LOGO || "/images/logo-dsd.png",
  goldColor: "#C5A065",
  darkColor: "#1a1208",
};

interface QuotePiece {
  type: string;
  category: string;
  material: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  engraving?: { type: string; complexity: string; zones?: string[] };
  textile?: { technique: string; color: string; printZone?: string };
  notes?: string;
}

interface QuoteData {
  id: string;
  number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_name: string;
  pieces: QuotePiece[];
  subtotal: number;
  total: number;
  timeline: string;
  valid_until: string;
  validity_days: number;
  deposit_percent: number;
  conditions: { text: string; checked: boolean }[];
  created_at: string;
}

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString("es-MX")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Component ───────────────────────────────────────────

export const QuotePDFView = () => {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("id");
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setError("No se proporcionó ID de cotización");
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/admin/quotes?id=${quoteId}`);
        if (!res.ok) throw new Error("No se pudo cargar la cotización");
        const data = await res.json();
        setQuote(data.quote);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  // Auto-trigger print
  useEffect(() => {
    if (quote && !loading) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [quote, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Cargando cotización...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">{error || "Cotización no encontrada"}</p>
      </div>
    );
  }

  const deposit = Math.round(quote.total * (quote.deposit_percent || 50) / 100);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
        }
        @page { margin: 1.5cm; size: letter; }
      `}</style>

      {/* Print button (hidden on print) */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-[#1a1208] text-white rounded-lg text-sm font-bold hover:bg-[#2d2010] transition-colors shadow-lg"
        >
          Imprimir / Guardar PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
      </div>

      {/* PDF Content */}
      <div className="max-w-[800px] mx-auto bg-white text-[#1a1208] p-8 font-[Helvetica,Arial,sans-serif]">

        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#c5a065] pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              {BRAND.name}
            </h1>
            <p className="text-sm text-[#7a6340] mt-1">Madera con Alma — Piezas artesanales únicas</p>
            <p className="text-xs text-[#9e8562] mt-1">{BRAND.url}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#c5a065]" style={{ fontFamily: "Georgia, serif" }}>
              COTIZACIÓN
            </p>
            <p className="text-lg font-bold mt-1">{quote.number}</p>
            <p className="text-xs text-[#9e8562] mt-1">
              {formatDate(quote.created_at)}
            </p>
          </div>
        </div>

        {/* Client info + validity */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9e8562] mb-2">Cliente</h3>
            <p className="font-bold text-base">{quote.customer_name}</p>
            <p className="text-sm text-[#5c4a2f]">{quote.customer_email}</p>
            <p className="text-sm text-[#5c4a2f]">{quote.customer_phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9e8562] mb-2">Detalles</h3>
            <p className="text-sm"><span className="text-[#9e8562]">Proyecto:</span> {quote.project_name}</p>
            <p className="text-sm"><span className="text-[#9e8562]">Tiempo estimado:</span> {quote.timeline}</p>
            <p className="text-sm"><span className="text-[#9e8562]">Vigencia:</span> {formatDate(quote.valid_until)}</p>
          </div>
        </div>

        {/* Pieces table */}
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-[#f5f0e8]">
              <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">#</th>
              <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">Descripción</th>
              <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">Material</th>
              <th className="text-center px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">Cant.</th>
              <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">Precio Unit.</th>
              <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a6340] border-b border-[#e8dfd0]">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.pieces?.map((p, i) => (
              <tr key={i} className="border-b border-[#e8dfd0]">
                <td className="px-3 py-2.5 text-sm text-[#9e8562]">{i + 1}</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className="font-medium">{p.type}</span>
                  {p.dimensions && <span className="text-[#9e8562] text-xs block">{p.dimensions}</span>}
                  {p.engraving && (
                    <span className="text-[#c5a065] text-xs block">
                      Grabado {p.engraving.complexity}: {p.engraving.type}
                    </span>
                  )}
                  {p.textile && (
                    <span className="text-[#7a6340] text-xs block">
                      {p.textile.technique} — {p.textile.color}
                    </span>
                  )}
                  {p.notes && <span className="text-[#9e8562] text-xs block italic">{p.notes}</span>}
                </td>
                <td className="px-3 py-2.5 text-sm text-[#5c4a2f]">{p.material}</td>
                <td className="px-3 py-2.5 text-sm text-center">{p.quantity}</td>
                <td className="px-3 py-2.5 text-sm text-right text-[#5c4a2f]">{formatMXN(p.unitPrice)}</td>
                <td className="px-3 py-2.5 text-sm text-right font-medium">{formatMXN(p.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-[#7a6340]">Subtotal</span>
              <span>{formatMXN(quote.subtotal)}</span>
            </div>
            {quote.subtotal !== quote.total && (
              <div className="flex justify-between py-1.5 text-sm text-green-600">
                <span>Descuento</span>
                <span>-{formatMXN(quote.subtotal - quote.total)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-[#1a1208] mt-1">
              <span className="font-bold text-base">Total</span>
              <span className="font-bold text-xl text-[#c5a065]" style={{ fontFamily: "Georgia, serif" }}>
                {formatMXN(quote.total)} MXN
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-sm bg-[#f5f0e8] px-2 rounded mt-2">
              <span className="text-[#7a6340]">Anticipo ({quote.deposit_percent}%)</span>
              <span className="font-bold">{formatMXN(deposit)}</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        {quote.conditions && quote.conditions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9e8562] mb-3">
              Condiciones
            </h3>
            <ul className="space-y-1.5">
              {quote.conditions.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#5c4a2f]">
                  <span className="text-[#c5a065] mt-0.5">●</span>
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-[#c5a065] pt-6 mt-8 text-center">
          <p className="text-sm text-[#7a6340]">
            Gracias por tu interés en {BRAND.name}
          </p>
          <p className="text-xs text-[#9e8562] mt-1">
            {BRAND.url} · {BRAND.email}
          </p>
        </div>
      </div>
    </>
  );
};
