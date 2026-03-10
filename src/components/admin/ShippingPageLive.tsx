"use client";

// ═══════════════════════════════════════════════════════════════
// Admin Shipping Panel — /admin/shipping
//
// SaaS-ready fulfillment management:
//   - Table of pending orders (ready to ship)
//   - One-click label generation via Envia API
//   - PDF label viewer / print
//   - Shipped orders with tracking info
//   - Auto-triggers email to customer on fulfillment
//
// Backend endpoints:
//   GET  /admin/orders/pending-shipment
//   POST /admin/fulfillment/generate-label
// ═══════════════════════════════════════════════════════════════

import { useTheme } from '@/src/theme/ThemeContext';
import { Card, Badge, Button, StatCard } from '@/src/theme/primitives';
import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Truck,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
} from "lucide-react";

// Use frontend API proxy routes (handles Medusa admin auth server-side)
const API_BASE = ""; // Same origin — /api/admin/*

// ─── Types ───

type OrderItem = {
  id: string;
  title: string;
  variant_title: string;
  quantity: number;
  unit_price: number;
  thumbnail: string | null;
};

type ShippingAddress = {
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

type AdminOrder = {
  id: string;
  display_id: number;
  email: string;
  status: string;
  created_at: string;
  total: number;
  item_total: number;
  shipping_total: number;
  currency_code: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  shipping_method: { name: string; price: number } | null;
  fulfillment: {
    id: string;
    tracking_number: string;
    tracking_url: string;
    label_url: string;
    carrier: string;
    created_at: string;
  } | null;
};

type LabelResult = {
  success: boolean;
  tracking_number: string;
  tracking_url: string;
  label_url: string;
  carrier: string;
  error?: string;
};

// ─── Helpers ───

function formatPrice(amount: number): string {
  return `$${(amount / 100).toLocaleString("es-MX", { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
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

function timeSince(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const hours = Math.floor((now - then) / (1000 * 60 * 60));
  if (hours < 1) return "Hace menos de 1h";
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

// Available carriers for label generation
const CARRIERS = [
  { value: "dhl", label: "DHL Express", icon: "🟡" },
  { value: "estafeta", label: "Estafeta", icon: "🔵" },
  { value: "fedex", label: "FedEx", icon: "🟣" },
];

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export default function AdminShippingPage() {
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [shippedOrders, setShippedOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "shipped">("pending");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [generatingLabel, setGeneratingLabel] = useState<string | null>(null);
  const [labelResults, setLabelResults] = useState<Record<string, LabelResult>>({});
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, string>>({});

  // ─── Fetch orders ───

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/admin/orders`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setPendingOrders(data.pending || []);
      setShippedOrders(data.shipped || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Generate label ───

  async function handleGenerateLabel(order: AdminOrder) {
    const carrier = selectedCarriers[order.id] || "dhl";
    setGeneratingLabel(order.id);

    try {
      const resp = await fetch(`${API_BASE}/api/admin/fulfillment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          carrier,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setLabelResults((prev) => ({
          ...prev,
          [order.id]: {
            success: false,
            tracking_number: "",
            tracking_url: "",
            label_url: "",
            carrier,
            error: data.error || data.details?.message || "Error al generar guía",
          },
        }));
        return;
      }

      setLabelResults((prev) => ({
        ...prev,
        [order.id]: {
          success: true,
          tracking_number: data.tracking_number,
          tracking_url: data.tracking_url,
          label_url: data.label_url,
          carrier: data.carrier || carrier,
        },
      }));

      // Refresh orders after successful label generation
      setTimeout(() => fetchOrders(), 2000);
    } catch (err: any) {
      setLabelResults((prev) => ({
        ...prev,
        [order.id]: {
          success: false,
          tracking_number: "",
          tracking_url: "",
          label_url: "",
          carrier,
          error: err.message,
        },
      }));
    } finally {
      setGeneratingLabel(null);
    }
  }

  // ─── Print label ───

  function handlePrintLabel(labelUrl: string) {
    window.open(labelUrl, "_blank");
  }

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  const orders = activeTab === "pending" ? pendingOrders : shippedOrders;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[var(--text)]">Centro de Envíos</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Genera guías e imprime etiquetas para tus pedidos
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-none p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[var(--text)]">{pendingOrders.length}</p>
              <p className="text-[12px] text-[var(--text-muted)]">Pendientes de envío</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-none p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-green-50 flex items-center justify-center">
              <Truck size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[var(--text)]">{shippedOrders.length}</p>
              <p className="text-[12px] text-[var(--text-muted)]">Enviados</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-none p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[var(--text)]">
                {pendingOrders.length + shippedOrders.length}
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">Total órdenes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none p-1 w-fit">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-[var(--text)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
          }`}
        >
          Pendientes ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("shipped")}
          className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${
            activeTab === "shipped"
              ? "bg-[var(--text)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
          }`}
        >
          Enviados ({shippedOrders.length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-none p-4 mb-6">
          <p className="text-[14px] text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--text-secondary)] border-t-transparent rounded-none mx-auto mb-4" />
          <p className="text-[14px] text-[var(--text-secondary)]">Cargando órdenes...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && (
        <div className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-none p-12 text-center">
          {activeTab === "pending" ? (
            <>
              <CheckCircle size={40} className="mx-auto mb-4 text-green-400" />
              <h2 className="font-serif text-xl text-[var(--text)] mb-2">
                Todo al día
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)]">
                No hay pedidos pendientes de envío.
              </p>
            </>
          ) : (
            <>
              <Package size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
              <h2 className="font-serif text-xl text-[var(--text)] mb-2">
                Sin envíos aún
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)]">
                Los pedidos enviados aparecerán aquí.
              </p>
            </>
          )}
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isGenerating = generatingLabel === order.id;
            const labelResult = labelResults[order.id];
            const selectedCarrier = selectedCarriers[order.id] || "dhl";
            const addr = order.shipping_address;

            return (
              <div
                key={order.id}
                className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-none overflow-hidden"
              >
                {/* Order row — clickable header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--surface2)] transition-colors text-left"
                >
                  {/* Status dot */}
                  <div
                    className={`w-3 h-3 rounded-none flex-shrink-0 ${
                      order.fulfillment ? "bg-green-500" : "bg-amber-400"
                    }`}
                  />

                  {/* Order # + date */}
                  <div className="w-28 flex-shrink-0">
                    <p className="font-bold text-[14px] text-[var(--text)]">
                      #{order.display_id}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {timeSince(order.created_at)}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--text)] truncate">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {order.email}
                    </p>
                  </div>

                  {/* Destination */}
                  <div className="hidden md:block flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--text-secondary)] truncate">
                      <MapPin size={12} className="inline mr-1" />
                      {addr.city}, {addr.province}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      CP {addr.postal_code}
                    </p>
                  </div>

                  {/* Items count */}
                  <div className="hidden sm:block w-20 text-center">
                    <p className="text-[13px] text-[var(--text-secondary)]">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} pzas
                    </p>
                  </div>

                  {/* Total */}
                  <div className="w-24 text-right">
                    <p className="font-bold text-[14px] text-[var(--text)]">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  {/* Tracking badge or expand icon */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {order.fulfillment ? (
                      <CheckCircle size={16} className="text-green-500 mx-auto" />
                    ) : isExpanded ? (
                      <ChevronUp size={16} className="text-[var(--text-muted)] mx-auto" />
                    ) : (
                      <ChevronDown size={16} className="text-[var(--text-muted)] mx-auto" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] p-5 bg-[var(--surface2)]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Items */}
                      <div>
                        <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-3 font-semibold">
                          Artículos
                        </h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-[var(--surface)] rounded p-2 border-2 border-[var(--border)]"
                            >
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-[var(--border)]" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[var(--text)] truncate font-medium">
                                  {item.title}
                                </p>
                                {item.variant_title && (
                                  <p className="text-[11px] text-[var(--text-muted)]">
                                    {item.variant_title}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-[13px] text-[var(--text)]">
                                  ×{item.quantity}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                  {formatPrice(item.unit_price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1">
                          <div className="flex justify-between text-[12px]">
                            <span className="text-[var(--text-muted)]">Productos</span>
                            <span className="text-[var(--text)]">{formatPrice(order.item_total)}</span>
                          </div>
                          <div className="flex justify-between text-[12px]">
                            <span className="text-[var(--text-muted)]">Envío</span>
                            <span className="text-[var(--text)]">{formatPrice(order.shipping_total)}</span>
                          </div>
                          <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-[var(--border)]">
                            <span className="text-[var(--text)]">Total</span>
                            <span className="text-[var(--text)]">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Center: Shipping address */}
                      <div>
                        <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-3 font-semibold">
                          Dirección de envío
                        </h3>
                        <div className="bg-[var(--surface)] rounded p-4 border-2 border-[var(--border)] space-y-1">
                          <p className="text-[14px] font-semibold text-[var(--text)]">
                            {addr.first_name} {addr.last_name}
                          </p>
                          <p className="text-[13px] text-[var(--text-secondary)]">{addr.address_1}</p>
                          {addr.address_2 && (
                            <p className="text-[13px] text-[var(--text-secondary)]">{addr.address_2}</p>
                          )}
                          <p className="text-[13px] text-[var(--text-secondary)]">
                            {addr.city}, {addr.province} CP {addr.postal_code}
                          </p>
                          {addr.phone && (
                            <p className="text-[13px] text-[var(--text-secondary)]">Tel: {addr.phone}</p>
                          )}
                          <p className="text-[12px] text-[var(--text-muted)] pt-1">{order.email}</p>
                        </div>

                        {order.shipping_method && (
                          <div className="mt-3 bg-[var(--surface)] rounded p-3 border-2 border-[var(--border)]">
                            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                              Método seleccionado
                            </p>
                            <p className="text-[13px] font-medium text-[var(--text)]">
                              {order.shipping_method.name}
                            </p>
                          </div>
                        )}

                        <p className="text-[11px] text-[var(--text-muted)] mt-3">
                          Pedido: {formatDate(order.created_at)}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div>
                        {/* Already shipped */}
                        {order.fulfillment && (
                          <div>
                            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-3 font-semibold">
                              Envío generado
                            </h3>
                            <div className="bg-green-50 border border-green-200 rounded p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-[13px] font-semibold text-green-800">
                                  Guía generada
                                </span>
                              </div>
                              <p className="text-[12px] text-green-700">
                                Carrier: {order.fulfillment.carrier}
                              </p>
                              <p className="text-[12px] text-green-700 font-mono">
                                Tracking: {order.fulfillment.tracking_number || "—"}
                              </p>
                              {order.fulfillment.label_url && (
                                <button
                                  onClick={() => handlePrintLabel(order.fulfillment!.label_url)}
                                  className="flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white text-[12px] font-semibold rounded hover:bg-green-700 transition-colors w-full justify-center"
                                >
                                  <Printer size={14} />
                                  Imprimir Guía
                                </button>
                              )}
                              {order.fulfillment.tracking_url && (
                                <a
                                  href={order.fulfillment.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[12px] text-green-700 hover:text-green-900"
                                >
                                  <ExternalLink size={12} />
                                  Ver rastreo
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pending — generate label */}
                        {!order.fulfillment && (
                          <div>
                            <h3 className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-3 font-semibold">
                              Generar guía de envío
                            </h3>

                            {/* Carrier selector */}
                            <div className="space-y-2 mb-4">
                              {CARRIERS.map((c) => (
                                <label
                                  key={c.value}
                                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                                    selectedCarrier === c.value
                                      ? "bg-[var(--text)] text-white border-[var(--text)]"
                                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--text-secondary)]"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`carrier-${order.id}`}
                                    value={c.value}
                                    checked={selectedCarrier === c.value}
                                    onChange={() =>
                                      setSelectedCarriers((prev) => ({
                                        ...prev,
                                        [order.id]: c.value,
                                      }))
                                    }
                                    className="sr-only"
                                  />
                                  <span className="text-lg">{c.icon}</span>
                                  <span className="text-[13px] font-medium">{c.label}</span>
                                </label>
                              ))}
                            </div>

                            {/* Generate button */}
                            <button
                              onClick={() => handleGenerateLabel(order)}
                              disabled={isGenerating}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--text)] text-white text-[13px] font-semibold rounded hover:bg-[#3e3226] transition-colors disabled:opacity-50"
                            >
                              {isGenerating ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  Generando guía...
                                </>
                              ) : (
                                <>
                                  <FileText size={14} />
                                  Generar Guía {CARRIERS.find((c) => c.value === selectedCarrier)?.label}
                                </>
                              )}
                            </button>

                            {/* Label result */}
                            {labelResult && (
                              <div className="mt-3">
                                {labelResult.success ? (
                                  <div className="bg-green-50 border border-green-200 rounded p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle size={16} className="text-green-600" />
                                      <span className="text-[13px] font-semibold text-green-800">
                                        Guía generada exitosamente
                                      </span>
                                    </div>
                                    <p className="text-[12px] text-green-700 font-mono">
                                      Tracking: {labelResult.tracking_number}
                                    </p>
                                    {labelResult.label_url && (
                                      <button
                                        onClick={() => handlePrintLabel(labelResult.label_url)}
                                        className="flex items-center gap-2 mt-1 px-4 py-2 bg-green-600 text-white text-[12px] font-semibold rounded hover:bg-green-700 transition-colors w-full justify-center"
                                      >
                                        <Printer size={14} />
                                        Imprimir Guía (PDF)
                                      </button>
                                    )}
                                    <p className="text-[11px] text-green-600">
                                      El cliente recibirá un email con el tracking automáticamente.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-red-50 border border-red-200 rounded p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <AlertCircle size={16} className="text-red-500" />
                                      <span className="text-[13px] font-semibold text-red-800">
                                        Error al generar guía
                                      </span>
                                    </div>
                                    <p className="text-[12px] text-red-700">
                                      {labelResult.error}
                                    </p>
                                    <p className="text-[11px] text-red-500 mt-2">
                                      Intenta con otro carrier o verifica la dirección.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
