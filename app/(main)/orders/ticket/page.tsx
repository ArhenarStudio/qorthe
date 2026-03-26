"use client";

// ═══════════════════════════════════════════════════════════════
// /orders/ticket?id=14 — Virtual Order Ticket (print-ready PDF)
//
// Renders a professional ticket that can be printed/saved as PDF
// Also accessible from /account panel and checkout success page
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TicketItem {
  title: string;
  variant_title: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail: string | null;
  metadata: Record<string, unknown>;
}

interface TicketAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface OrderTicket {
  order_id: string;
  display_id: number;
  number: string;
  created_at: string;
  status: string;
  email: string;
  currency: string;
  items: TicketItem[];
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  shipping_address: TicketAddress | null;
  payment_provider: string;
  fulfillment_status: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

function OrderTicketContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [ticket, setTicket] = useState<OrderTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("ID de orden no proporcionado"); setLoading(false); return; }
    fetch(`/api/orders/ticket?id=${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Orden no encontrada"))
      .then(data => { setTicket(data.ticket); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <p className="text-wood-500 mb-4">{error || "No se pudo cargar el ticket"}</p>
          <Link href="/" className="text-accent-gold hover:underline text-sm">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      {/* Print controls — hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-wood-200 px-4 py-3 flex items-center justify-between">
        <Link href="/account" className="flex items-center gap-2 text-xs text-wood-500 hover:text-wood-900">
          <ArrowLeft size={14} /> Volver a mi cuenta
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800">
            <Printer size={14} /> Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Ticket */}
      <div className="max-w-[600px] mx-auto p-6 print:p-0 print:max-w-none">
        <div className="bg-white shadow-lg print:shadow-none border border-wood-100 print:border-0 overflow-hidden">
          {/* Header band */}
          <div className="bg-wood-900 text-sand-100 px-8 py-6 text-center">
            <img src="/images/logo-dsd.png" alt="Qorthe" className="h-10 w-auto mx-auto mb-3 brightness-0 invert" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-sand-300">Comprobante de Compra</p>
          </div>

          {/* Order number + date */}
          <div className="px-8 py-5 border-b border-wood-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-wood-400 uppercase tracking-wider">Orden</p>
              <p className="text-xl font-serif font-bold text-wood-900">{ticket.number}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-wood-400 uppercase tracking-wider">Fecha</p>
              <p className="text-sm text-wood-900">{fmtDate(ticket.created_at)}</p>
              <p className="text-xs text-wood-400">{fmtTime(ticket.created_at)}</p>
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="px-8 py-5 border-b border-wood-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Cliente</p>
              {ticket.shipping_address ? (
                <>
                  <p className="text-sm font-bold text-wood-900">{ticket.shipping_address.name}</p>
                  <p className="text-xs text-wood-500">{ticket.email}</p>
                  {ticket.shipping_address.phone && (
                    <p className="text-xs text-wood-500">{ticket.shipping_address.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-wood-500">{ticket.email}</p>
              )}
            </div>
            {ticket.shipping_address && (
              <div>
                <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Enviar a</p>
                <p className="text-xs text-wood-700">{ticket.shipping_address.address}</p>
                <p className="text-xs text-wood-700">
                  {ticket.shipping_address.city}{ticket.shipping_address.state ? `, ${ticket.shipping_address.state}` : ""} {ticket.shipping_address.postal_code}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="px-8 py-5 border-b border-wood-100">
            <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-3">Artículos</p>
            <table className="w-full">
              <thead>
                <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-100">
                  <th className="text-left pb-2">Producto</th>
                  <th className="text-center pb-2 w-12">Cant.</th>
                  <th className="text-right pb-2 w-20">Precio</th>
                  <th className="text-right pb-2 w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {ticket.items.map((item, i) => {
                  const hasLaser = !!(item.metadata && (item.metadata as Record<string, unknown>).custom_design);
                  return (
                    <tr key={i} className="border-b border-wood-50 last:border-0">
                      <td className="py-3 pr-2">
                        <p className="text-xs font-medium text-wood-900">{item.title}</p>
                        {item.variant_title && item.variant_title !== "Default" && (
                          <p className="text-[10px] text-wood-400">{item.variant_title}</p>
                        )}
                        {hasLaser && (
                          <p className="text-[10px] text-red-500 mt-0.5">Grabado láser incluido</p>
                        )}
                      </td>
                      <td className="py-3 text-center text-xs text-wood-600">{item.quantity}</td>
                      <td className="py-3 text-right text-xs text-wood-600">{fmt(item.unit_price)}</td>
                      <td className="py-3 text-right text-xs font-bold text-wood-900">{fmt(item.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 py-5 border-b border-wood-100">
            <div className="flex justify-between items-center text-xs text-wood-500 mb-1.5">
              <span>Subtotal</span>
              <span>{fmt(ticket.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-wood-500 mb-1.5">
              <span>Envío</span>
              <span>{ticket.shipping_total === 0 ? "Gratis" : fmt(ticket.shipping_total)}</span>
            </div>
            {ticket.discount_total > 0 && (
              <div className="flex justify-between items-center text-xs text-green-600 mb-1.5">
                <span>Descuento</span>
                <span>-{fmt(ticket.discount_total)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-wood-200">
              <span className="text-sm font-bold text-wood-900">Total</span>
              <span className="text-lg font-serif font-bold text-wood-900">{fmt(ticket.total)}</span>
            </div>
          </div>

          {/* Payment + Status */}
          <div className="px-8 py-5 border-b border-wood-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Método de Pago</p>
              <p className="text-xs font-bold text-wood-900">{ticket.payment_provider}</p>
            </div>
            <div>
              <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Estado</p>
              <p className="text-xs font-bold text-green-600">Pagado y Confirmado</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-sand-50 text-center">
            <p className="text-[10px] text-wood-400 mb-1">
              Qorthe — Tablas Artesanales de Madera
            </p>
            <p className="text-[9px] text-wood-300">
              qorthe.com · pedidos@qorthe.com · Hermosillo, Sonora, México
            </p>
            <p className="text-[9px] text-wood-300 mt-2">
              Conserve este comprobante como referencia de su compra.
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          @page { margin: 0.5cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

export default function OrderTicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
      </div>
    }>
      <OrderTicketContent />
    </Suspense>
  );
}
