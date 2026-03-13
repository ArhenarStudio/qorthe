"use client";

// ═══════════════════════════════════════════════════════════════
// POSPage — Orquestador del Punto de Venta
// State, hooks, callbacks, layout. Delega UI a POSCatalog y POSSubComponents.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ShoppingCart, User, Phone, Mail, Plus, Minus, Trash2, X,
  Tag, Percent, Package, Truck, CheckCircle, Clock, Receipt,
  Wifi, Loader2, Zap, AlertCircle, TrendingUp, RefreshCw,
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { useShippingConfig } from "@/src/hooks/useShippingConfig";
import { toast } from "sonner";

import {
  POSProduct, POSVariant, CartItem, POSCustomer, POSOrderResult,
  Channel, PaymentMethod, ShippingType,
  channelConfig, paymentConfig, fmtMXN, getMXNPrice,
} from "./types";
import { POSCatalog } from "./POSCatalog";
import { OrderConfirmation, OrderHistory } from "./POSSubComponents";

// ═══════ MAIN COMPONENT (wrapped by ErrorBoundary) ═══════
const POSPageInner: React.FC<{ windowMode?: boolean }> = ({ windowMode = false }) => {
  const { posOptions, loading: shippingLoading } = useShippingConfig();

  // ── State ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<POSCustomer>({ email: "", first_name: "", last_name: "", phone: "" });
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [shippingType, setShippingType] = useState<ShippingType>("pickup");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<{ type: "percentage" | "fixed"; value: number } | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [showDiscount, setShowDiscount] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<POSOrderResult | null>(null);
  const [view, setView] = useState<"pos" | "history">("pos");
  const [showAddress, setShowAddress] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [address, setAddress] = useState({ address_1: "", city: "", province: "", postal_code: "" });
  const searchRef = useRef<HTMLInputElement>(null);
  const [flashItem, setFlashItem] = useState<string | null>(null);

  // ── Data hooks ──
  const { data: productsData, loading: loadingProducts } = useAdminData<{
    products: any[];
    count: number;
  }>("/api/admin/products?limit=100&status=published", { refreshInterval: 120_000 });

  const { data: ordersData, refetch: refetchOrders } = useAdminData<{
    orders: any[];
    stats: { today_revenue: number; today_count: number; pos_count: number; total_count: number };
  }>("/api/admin/pos?limit=30", { refreshInterval: 30_000 });

  const products: POSProduct[] = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products
      .filter((p: any) => {
        if (p.handle === "servicio-grabado-laser") return false;
        if (p.variants?.[0]?.sku?.startsWith("DSD-LASER")) return false;
        return true;
      })
      .map((p: any) => ({
        id: p.id, title: p.title, handle: p.handle, thumbnail: p.thumbnail,
        status: p.status, category: p.categories?.[0]?.name || null,
        variants: (p.variants || []).map((v: any) => ({
          id: v.id, title: v.title || "Default", sku: v.sku,
          inventory_quantity: v.inventory_quantity ?? 0,
          prices: (v.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code || "mxn" })),
        })),
      }));
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.title.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q) ||
      p.variants.some(v => v.sku?.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  // ── Cart operations ──
  const addToCart = useCallback((product: POSProduct, variant: POSVariant) => {
    const price = getMXNPrice(variant.prices);
    setCart(prev => {
      const existing = prev.find(i => i.variant_id === variant.id);
      if (existing) return prev.map(i => i.variant_id === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        variant_id: variant.id, product_id: product.id, product_title: product.title,
        variant_title: variant.title, sku: variant.sku || "", price, quantity: 1, thumbnail: product.thumbnail,
      }];
    });
    setFlashItem(variant.id);
    setTimeout(() => setFlashItem(null), 400);
  }, []);

  const updateQuantity = useCallback((variantId: string, delta: number) => {
    setCart(prev => prev.map(i => i.variant_id === variantId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  }, []);
  const removeFromCart = useCallback((variantId: string) => { setCart(prev => prev.filter(i => i.variant_id !== variantId)); }, []);
  const clearCart = useCallback(() => {
    setCart([]); setCustomer({ email: "", first_name: "", last_name: "", phone: "" });
    setNotes(""); setDiscount(null); setDiscountInput(""); setShowDiscount(false);
    setShowAddress(false); setAddress({ address_1: "", city: "", province: "", postal_code: "" }); setLastOrder(null);
  }, []);

  // ── Totals ──
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount
    ? discount.type === "percentage" ? subtotal * (discount.value / 100) : discount.value : 0;
  const selectedPosOption = posOptions.find(o => o.id === shippingType);
  const shippingCost = selectedPosOption ? selectedPosOption.price / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingCost;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscount = () => {
    const val = parseFloat(discountInput);
    if (isNaN(val) || val <= 0) return;
    setDiscount({ type: discountType, value: val }); setShowDiscount(false);
  };

  // ── Submit ──
  const submitOrder = async () => {
    if (!cart.length) { toast.error("Agrega al menos un producto"); return; }
    if (!customer.email && !customer.phone && !customer.first_name) { toast.error("Agrega datos del cliente"); return; }
    const email = customer.email || `pos_${Date.now()}@davidsonsdesign.com`;
    setSubmitting(true);
    try {
      const fetchWithRetry = async (url: string, opts: RequestInit, retries = 1): Promise<Response> => {
        try { const r = await fetch(url, opts); if (!r.ok && retries > 0) { await new Promise(res => setTimeout(res, 1000)); return fetchWithRetry(url, opts, retries - 1); } return r; }
        catch (e) { if (retries > 0) { await new Promise(res => setTimeout(res, 1000)); return fetchWithRetry(url, opts, retries - 1); } throw e; }
      };
      const resp = await fetchWithRetry("/api/admin/pos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ variant_id: i.variant_id, quantity: i.quantity, unit_price: i.price, metadata: i.metadata })),
          customer: { ...customer, email },
          shipping_address: showAddress ? { ...address, first_name: customer.first_name, last_name: customer.last_name, phone: customer.phone, country_code: "mx" } : null,
          payment_method: paymentMethod, discount, notes, channel, shipping_type: shippingType,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setLastOrder(data.order);
        toast.success("Pedido creado exitosamente", { description: `${customer.first_name || email} — ${fmtMXN(total)}` });
        refetchOrders();
      } else { toast.error("Error al crear pedido", { description: data.error }); }
    } catch (err: unknown) { toast.error("Error de conexión", { description: err instanceof Error ? err.message : "Error desconocido" }); }
    finally { setSubmitting(false); }
  };

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);

  // ═══════ RENDER ═══════
  return (
    <div className={`${windowMode ? "h-full" : "h-[calc(100vh-65px)]"} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-none flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Punto de Venta</h1>
            <p className="text-[10px] text-[var(--text-muted)]">
              {productsData ? (
                <span className="text-[var(--success)] flex items-center gap-1"><Wifi size={8} /> {products.length} productos</span>
              ) : (
                <span className="text-[var(--text-muted)] flex items-center gap-1"><Loader2 size={8} className="animate-spin" /> Conectando...</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === "pos" ? "history" : "pos")}
            className={`px-3 py-1.5 text-xs font-medium rounded-none border transition-colors ${
              view === "history" ? "bg-[var(--primary)] text-white border-[var(--primary)]"
              : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface2)]"
            }`}>
            {view === "pos" ? <span className="flex items-center gap-1.5"><Clock size={12} /> Historial</span>
              : <span className="flex items-center gap-1.5"><Zap size={12} /> Volver al POS</span>}
          </button>
          {ordersData?.stats && (
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-[var(--surface2)] rounded-none text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[var(--success)]" /> Hoy: {fmtMXN(ordersData.stats.today_revenue)}</span>
              <span className="flex items-center gap-1"><Receipt size={12} /> {ordersData.stats.today_count} pedidos</span>
            </div>
          )}
        </div>
      </div>

      {view === "history" ? (
        <OrderHistory orders={ordersData?.orders || []} stats={ordersData?.stats} />
      ) : lastOrder ? (
        <OrderConfirmation order={lastOrder} total={total} customer={customer} onNewOrder={clearCart} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Catalog */}
          <POSCatalog products={products} loading={loadingProducts} filteredProducts={filteredProducts}
            productSearch={productSearch} onSearchChange={setProductSearch} onAdd={addToCart} cartItems={cart} searchRef={searchRef} />

          {/* RIGHT: Cart + Checkout */}
          <div className="w-[420px] flex flex-col bg-[var(--surface)] overflow-hidden">
            {/* Channel selector */}
            <div className="p-4 border-b border-[var(--border)]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Canal de venta</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(channelConfig) as [Channel, typeof channelConfig[Channel]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key} onClick={() => setChannel(key)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-none text-[11px] font-medium border transition-all ${
                        channel === key ? cfg.color + " ring-1 ring-current/20"
                        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface2)]"
                      }`}>
                      <Icon size={12} /> {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer */}
            <div className="p-4 border-b border-[var(--border)] space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><User size={10} /> Cliente</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={customer.first_name} onChange={e => setCustomer({ ...customer, first_name: e.target.value })}
                  placeholder="Nombre" className="px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                <input type="text" value={customer.last_name} onChange={e => setCustomer({ ...customer, last_name: e.target.value })}
                  placeholder="Apellido" className="px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Teléfono" className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                </div>
                <div className="relative">
                  <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="Email (opcional)" className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><ShoppingCart size={10} /> Carrito ({itemCount})</label>
                {cart.length > 0 && (
                  <button onClick={() => setShowClearConfirm(true)} className="text-[10px] text-[var(--error)] hover:text-[var(--error)] flex items-center gap-0.5">
                    <Trash2 size={10} /> Limpiar
                  </button>
                )}
              </div>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-40" /><p className="text-xs">Selecciona productos del catálogo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.variant_id}
                      className={`flex items-center gap-3 p-2.5 rounded-none border transition-colors ${
                        flashItem === item.variant_id ? "bg-[var(--success-subtle)] border-[var(--success)]/30" : "bg-[var(--surface2)]/50 border-[var(--border)]/50"
                      }`}>
                      {item.thumbnail && <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-none object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text)] truncate">{item.product_title}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{fmtMXN(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.variant_id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--error-subtle)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[var(--text)]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variant_id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--success-subtle)] hover:text-[var(--success)] hover:border-[var(--success)] transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[var(--text)] w-16 text-right">{fmtMXN(item.price * item.quantity)}</p>
                      <button onClick={() => removeFromCart(item.variant_id)} className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout section */}
            {cart.length > 0 && (
              <div className="border-t border-[var(--border)] p-4 space-y-3 bg-[var(--surface2)]/30">
                {/* Shipping type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tipo de entrega</label>
                    {shippingLoading && <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-0.5"><RefreshCw size={8} className="animate-spin" /> cargando</span>}
                  </div>
                  {posOptions.length === 0 && !shippingLoading ? (
                    <p className="text-[10px] text-[var(--text-muted)] py-2 text-center" style={{ border: "1px dashed var(--border)" }}>Sin opciones — configura en Envíos</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {posOptions.map(opt => (
                        <button key={opt.id} onClick={() => { setShippingType(opt.id); setShowAddress(opt.price > 0); }}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-none text-[10px] font-medium border transition-all ${
                            shippingType === opt.id ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface2)]"
                          }`}>
                          <Package size={10} /> {opt.label}
                          {opt.price > 0 && <span className={`text-[9px] ml-0.5 ${shippingType === opt.id ? "text-white/70" : "text-[var(--text-muted)]"}`}>+${opt.price / 100}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Address */}
                {showAddress && (
                  <div className="space-y-2 pt-1">
                    <input type="text" value={address.address_1} onChange={e => setAddress({ ...address, address_1: e.target.value })}
                      placeholder="Dirección" className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Ciudad"
                        className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                      <input type="text" value={address.province} onChange={e => setAddress({ ...address, province: e.target.value })} placeholder="Estado"
                        className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                      <input type="text" value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} placeholder="CP"
                        className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                    </div>
                  </div>
                )}

                {/* Payment method */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Método de pago</label>
                  <div className="flex gap-1.5">
                    {(Object.entries(paymentConfig) as [PaymentMethod, typeof paymentConfig[PaymentMethod]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => setPaymentMethod(key)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-none text-[10px] font-medium border transition-all ${
                            paymentMethod === key ? cfg.color + " ring-1 ring-current/20" : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface2)]"
                          }`}>
                          <Icon size={12} /> {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas del pedido (opcional)..." rows={2}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 resize-none" />

                {/* Totals */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Subtotal ({itemCount} items)</span><span>{fmtMXN(subtotal)}</span></div>
                  {(() => { const selOpt = posOptions.find(o => o.id === shippingType); if (!selOpt || selOpt.price === 0) return null;
                    return <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span className="flex items-center gap-1"><Truck size={10} />{selOpt.label}</span><span>{fmtMXN(selOpt.price / 100)}</span></div>; })()}
                  {discount && (
                    <div className="flex justify-between text-xs text-[var(--success)]">
                      <span className="flex items-center gap-1"><Tag size={10} /> Descuento ({discount.type === "percentage" ? `${discount.value}%` : fmtMXN(discount.value)})
                        <button onClick={() => setDiscount(null)} className="text-[var(--error)]"><X size={10} /></button></span>
                      <span>-{fmtMXN(discountAmount)}</span>
                    </div>
                  )}
                  {!discount && (
                    <button onClick={() => setShowDiscount(!showDiscount)} className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5"><Percent size={10} /> Agregar descuento</button>
                  )}
                  {showDiscount && (
                    <div className="flex gap-2 pt-1">
                      <select value={discountType} onChange={e => setDiscountType(e.target.value as "percentage" | "fixed")} className="px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs">
                        <option value="percentage">%</option><option value="fixed">$</option>
                      </select>
                      <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder={discountType === "percentage" ? "10" : "100"}
                        className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                      <button onClick={applyDiscount} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-none text-xs font-medium">Aplicar</button>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]">
                    <span>Total</span><span className="text-lg">{fmtMXN(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button onClick={submitOrder} disabled={submitting || !cart.length}
                  className="w-full py-3 text-white rounded-none text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: "var(--primary)", boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando pedido...</> : <><CheckCircle className="w-4 h-4" /> Crear Pedido — {fmtMXN(total)}</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal limpiar carrito */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-6 max-w-sm w-full mx-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Limpiar carrito?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Se eliminaran {itemCount} articulo{itemCount !== 1 ? "s" : ""} y los datos del cliente.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)]">Cancelar</button>
              <button onClick={() => { clearCart(); setShowClearConfirm(false); }} className="px-3 py-1.5 text-xs text-white" style={{ background: "var(--error)" }}>Limpiar todo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════ ERROR BOUNDARY ═══════
class POSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, errorMsg: error.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-10 h-10 mb-4" style={{ color: "var(--error)" }} />
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Error en el Punto de Venta</h2>
          <p className="text-xs mb-6 max-w-sm" style={{ color: "var(--text-secondary)" }}>{this.state.errorMsg || "Ocurrió un error inesperado."}</p>
          <button onClick={() => this.setState({ hasError: false, errorMsg: "" })} className="px-4 py-2 text-xs font-medium text-white" style={{ background: "var(--primary)" }}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════ EXPORT ═══════
export const POSPage: React.FC<{ windowMode?: boolean }> = (props) => (
  <POSErrorBoundary><POSPageInner {...props} /></POSErrorBoundary>
);

export default POSPage;
