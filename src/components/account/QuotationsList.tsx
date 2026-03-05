"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Calendar, Clock, ChevronRight, ChevronDown,
  Package, Send, ExternalLink, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ───────────────────────────────────────────────

interface QuotePiece {
  type: string;
  category: string;
  material: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  engraving?: { type: string; complexity: string };
  textile?: { technique: string; color: string };
}

interface Quote {
  id: string;
  number: string;
  status: string;
  project_name: string;
  pieces: QuotePiece[];
  subtotal: number;
  total: number;
  timeline: string;
  valid_until: string;
  created_at: string;
}

// ── Status config ───────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  nueva: { label: 'Nueva', color: 'text-blue-600', bg: 'bg-blue-50' },
  en_revision: { label: 'En revisión', color: 'text-amber-600', bg: 'bg-amber-50' },
  cotizacion_enviada: { label: 'Enviada', color: 'text-purple-600', bg: 'bg-purple-50' },
  en_negociacion: { label: 'Negociación', color: 'text-orange-600', bg: 'bg-orange-50' },
  aprobada: { label: 'Aprobada', color: 'text-green-600', bg: 'bg-green-50' },
  anticipo_recibido: { label: 'Anticipo recibido', color: 'text-green-700', bg: 'bg-green-50' },
  en_produccion: { label: 'En producción', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  completada: { label: 'Completada', color: 'text-green-800', bg: 'bg-green-100' },
  rechazada: { label: 'Rechazada', color: 'text-red-600', bg: 'bg-red-50' },
  vencida: { label: 'Vencida', color: 'text-gray-500', bg: 'bg-gray-100' },
  cancelada: { label: 'Cancelada', color: 'text-gray-500', bg: 'bg-gray-100' },
};

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Component ───────────────────────────────────────────

export const QuotationsList = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchQuotes = async () => {
      try {
        const res = await fetch(`/api/quotes?email=${encodeURIComponent(user.email!)}`);
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.quotes || []);
        }
      } catch (err) {
        console.error('[QuotationsList] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [user?.email]);

  // ── Loading ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-wood-900 rounded-xl p-6 border border-wood-100 dark:border-wood-800 animate-pulse">
            <div className="h-5 bg-wood-100 dark:bg-wood-800 rounded w-48 mb-3" />
            <div className="h-4 bg-wood-100 dark:bg-wood-800 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────

  if (quotes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mx-auto mb-4 text-wood-400">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl mb-2 text-wood-800 dark:text-sand-200">
          Sin cotizaciones
        </h3>
        <p className="text-wood-500 text-sm mb-6 max-w-sm mx-auto">
          Aún no has solicitado ninguna cotización. Diseña tu pieza ideal en nuestro cotizador.
        </p>
        <a
          href="/quote"
          className="inline-flex items-center gap-2 px-6 py-3 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all"
        >
          <Send className="w-4 h-4" />
          Ir al Cotizador
        </a>
      </div>
    );
  }

  // ── List ────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-4 mb-2 overflow-x-auto pb-1">
        {[
          { label: 'Total', value: quotes.length },
          { label: 'Activas', value: quotes.filter(q => !['completada', 'rechazada', 'vencida', 'cancelada'].includes(q.status)).length },
          { label: 'Completadas', value: quotes.filter(q => q.status === 'completada').length },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 bg-wood-50 dark:bg-wood-900 rounded-lg text-xs flex-shrink-0">
            <span className="text-wood-400">{stat.label}:</span>
            <span className="font-bold text-wood-900 dark:text-sand-100">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quote cards */}
      {quotes.map((quote) => {
        const status = STATUS_MAP[quote.status] || { label: quote.status, color: 'text-gray-500', bg: 'bg-gray-50' };
        const isExpanded = expandedId === quote.id;
        const isExpired = new Date(quote.valid_until) < new Date() && !['completada', 'en_produccion', 'anticipo_recibido'].includes(quote.status);
        const totalPieces = quote.pieces?.reduce((s: number, p: QuotePiece) => s + p.quantity, 0) || 0;

        return (
          <motion.div
            key={quote.id}
            layout
            className="bg-white dark:bg-wood-950 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : quote.id)}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-wood-50/50 dark:hover:bg-wood-900/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-wood-50 dark:bg-wood-900 flex items-center justify-center text-wood-500 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-wood-900 dark:text-sand-100">
                      {quote.number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    {isExpired && quote.status === 'nueva' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                        Vencida
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-wood-500 truncate mt-0.5">
                    {quote.project_name || 'Cotización personalizada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="font-serif text-lg font-bold text-wood-900 dark:text-sand-100">
                    {formatMXN(quote.total)}
                  </span>
                  <span className="text-[10px] text-wood-400 block">
                    {totalPieces} {totalPieces === 1 ? 'pieza' : 'piezas'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-wood-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-wood-100 dark:border-wood-800 pt-4 space-y-4">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs text-wood-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(quote.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Vigencia: {formatDate(quote.valid_until)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {quote.timeline}
                      </span>
                    </div>

                    {/* Pieces table */}
                    {quote.pieces && quote.pieces.length > 0 && (
                      <div className="border border-wood-100 dark:border-wood-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-wood-50 dark:bg-wood-900 text-[10px] uppercase tracking-wider text-wood-400">
                              <th className="px-3 py-2 text-left">Pieza</th>
                              <th className="px-3 py-2 text-left">Material</th>
                              <th className="px-3 py-2 text-center">Cant.</th>
                              <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quote.pieces.map((piece: QuotePiece, i: number) => (
                              <tr key={i} className="border-t border-wood-50 dark:border-wood-900">
                                <td className="px-3 py-2 text-wood-900 dark:text-sand-100">
                                  {piece.type}
                                  {piece.engraving && (
                                    <span className="text-[10px] text-accent-gold block">
                                      Grabado {piece.engraving.complexity}
                                    </span>
                                  )}
                                  {piece.textile && (
                                    <span className="text-[10px] text-wood-500 block">
                                      {piece.textile.technique}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-wood-500">{piece.material}</td>
                                <td className="px-3 py-2 text-center text-wood-500">{piece.quantity}</td>
                                <td className="px-3 py-2 text-right font-medium text-wood-900 dark:text-sand-100">
                                  {formatMXN(piece.lineTotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-wood-200 dark:border-wood-700">
                              <td colSpan={3} className="px-3 py-2 font-bold text-right text-wood-900 dark:text-sand-100">
                                Total
                              </td>
                              <td className="px-3 py-2 text-right font-serif text-lg font-bold text-accent-gold">
                                {formatMXN(quote.total)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {/* Pay button — only for approved quotes */}
                      {(quote.status === 'aprobada' || quote.status === 'anticipo_recibido') && (
                        <a
                          href={`/quote/pay?id=${quote.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-accent-gold text-wood-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-md transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          Pagar Cotización
                        </a>
                      )}
                      <a
                        href={`/quote/pdf?id=${quote.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-md transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver PDF
                      </a>
                      <button
                        onClick={() => {
                          const msg = `Hola, tengo una pregunta sobre mi cotización ${quote.number}. `;
                          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* CTA */}
      <div className="text-center pt-4">
        <a
          href="/quote"
          className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline font-medium"
        >
          Crear nueva cotización <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
