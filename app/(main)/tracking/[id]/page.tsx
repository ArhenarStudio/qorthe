"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle, Clock, Search, AlertCircle } from "lucide-react";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "";

type Checkpoint = {
  date: string;
  description: string;
  locality?: string;
};

type TrackingResult = {
  carrier: string;
  tracking_number: string;
  status: string;
  checkpoints: Checkpoint[];
  error?: string;
};

// Status → icon + color + label mapping
const STATUS_MAP: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  delivered: { icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50 border-green-200", label: "Entregado" },
  in_transit: { icon: <Truck size={20} />, color: "text-blue-600 bg-blue-50 border-blue-200", label: "En tránsito" },
  out_for_delivery: { icon: <MapPin size={20} />, color: "text-amber-600 bg-amber-50 border-amber-200", label: "En camino a entrega" },
  pending: { icon: <Clock size={20} />, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Pendiente de envío" },
  unknown: { icon: <Package size={20} />, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Consultando..." },
};

function getStatusInfo(status: string) {
  const normalized = status?.toLowerCase().replace(/\s+/g, "_") || "unknown";
  return STATUS_MAP[normalized] || STATUS_MAP.unknown;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function TrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState("");

  useEffect(() => {
    if (orderId) {
      lookupByOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  async function lookupByOrder(displayId: string) {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${MEDUSA_URL}/store/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_display_id: displayId }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (data.status === "pending") {
          setError("Este pedido aún no ha sido enviado. Te notificaremos por email cuando tu paquete esté en camino.");
        } else {
          setError(data.error || "No se pudo obtener información de rastreo");
        }
        return;
      }
      setTracking(data);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = manualSearch.trim();
    if (!val) return;
    // If it looks like an order number (digits only), search by order
    if (/^\d+$/.test(val)) {
      lookupByOrder(val);
    } else {
      setError("Ingresa tu número de pedido (ejemplo: 15)");
    }
  }

  const statusInfo = tracking ? getStatusInfo(tracking.status) : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-[640px] mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Package size={40} className="mx-auto mb-4 text-[#795548]" />
          <h1 className="font-serif text-3xl text-[#2d2419] mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-[14px] text-[#8D6E63]">
            Consulta el estado de tu envío en tiempo real
          </p>
        </div>

        {/* Search form (always visible) */}
        <form onSubmit={handleManualSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              placeholder="Número de pedido (ej: 15)"
              className="flex-1 px-4 py-3 border border-[#EFEBE9] rounded-lg text-[14px] text-[#2d2419] placeholder:text-[#BCAAA4] focus:outline-none focus:border-[#795548] bg-white"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-[#2d2419] text-white rounded-lg text-[13px] font-semibold hover:bg-[#3e3226] transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              Rastrear
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#795548] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[14px] text-[#8D6E63]">Consultando estado del envío...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-amber-600" />
            <p className="text-[14px] text-amber-800">{error}</p>
          </div>
        )}

        {/* Tracking result */}
        {tracking && !loading && statusInfo && (
          <div className="space-y-6">
            {/* Status card */}
            <div className={`border rounded-lg p-6 text-center ${statusInfo.color}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {statusInfo.icon}
                <span className="font-semibold text-[16px]">{statusInfo.label}</span>
              </div>
              <p className="text-[13px] opacity-75">
                {tracking.carrier} — {tracking.tracking_number}
              </p>
            </div>

            {/* Order info */}
            {orderId && (
              <div className="bg-white border border-[#EFEBE9] rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#A1887F] mb-1">
                  Pedido
                </p>
                <p className="font-semibold text-[#2d2419]">#{orderId}</p>
              </div>
            )}

            {/* Timeline */}
            {tracking.checkpoints && tracking.checkpoints.length > 0 && (
              <div className="bg-white border border-[#EFEBE9] rounded-lg p-6">
                <h2 className="font-serif text-[18px] text-[#2d2419] mb-6">
                  Historial de envío
                </h2>
                <div className="space-y-0">
                  {tracking.checkpoints.map((cp, i) => (
                    <div key={i} className="flex gap-4">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            i === 0 ? "bg-[#795548]" : "bg-[#D7CCC8]"
                          }`}
                        />
                        {i < tracking.checkpoints.length - 1 && (
                          <div className="w-px h-full min-h-[40px] bg-[#EFEBE9]" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-6">
                        <p className={`text-[14px] ${i === 0 ? "font-semibold text-[#2d2419]" : "text-[#5D4037]"}`}>
                          {cp.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] text-[#A1887F]">
                            {formatDate(cp.date)}
                          </span>
                          {cp.locality && (
                            <span className="text-[12px] text-[#BCAAA4]">
                              📍 {cp.locality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No checkpoints yet */}
            {(!tracking.checkpoints || tracking.checkpoints.length === 0) && (
              <div className="bg-white border border-[#EFEBE9] rounded-lg p-6 text-center">
                <Clock size={24} className="mx-auto mb-3 text-[#BCAAA4]" />
                <p className="text-[14px] text-[#8D6E63]">
                  Tu paquete ha sido entregado a la paquetería. Los detalles de rastreo aparecerán pronto.
                </p>
              </div>
            )}

            {/* Help */}
            <div className="text-center pt-2">
              <p className="text-[12px] text-[#BCAAA4]">
                ¿Tienes dudas sobre tu envío?{" "}
                <a href="/contact" className="text-[#795548] underline hover:text-[#2d2419]">
                  Contáctanos
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Empty state (no orderId and no search) */}
        {!orderId && !tracking && !error && !loading && (
          <div className="bg-white border border-[#EFEBE9] rounded-lg p-8 text-center">
            <Truck size={32} className="mx-auto mb-4 text-[#BCAAA4]" />
            <p className="text-[14px] text-[#8D6E63] mb-2">
              Ingresa tu número de pedido para consultar el estado de tu envío.
            </p>
            <p className="text-[12px] text-[#BCAAA4]">
              Lo encuentras en el email de confirmación de tu compra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
