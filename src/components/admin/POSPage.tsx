"use client";

// ═══════════════════════════════════════════════════════════════
// POSPage — Punto de Venta (Admin Panel)
//
// Full POS system for creating manual orders from WhatsApp,
// phone, social media, and in-person sales.
//
// Features:
//   - Product catalog with search + quick-add
//   - Cart management with quantities, discounts
//   - Customer lookup/create
//   - Multiple payment methods (cash, transfer, terminal)
//   - Channel tracking (WhatsApp, phone, Instagram, etc.)
//   - Shipping type selection (local delivery, pickup, national)
//   - Order notes and customization
//   - Recent POS orders history
//   - Daily stats (revenue, order count)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, DollarSign,
  User, Phone, Mail, MessageSquare, CreditCard,
  Banknote, ArrowRightLeft, Smartphone, Tag, Percent,
  Package, X, CheckCircle,
  Clock, Truck, Store, Receipt, Wifi, Loader2,
  Instagram, Facebook, Globe,
  Zap, AlertCircle, FileText, Copy,
  RefreshCw, BarChart3, TrendingUp
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { useShippingConfig } from "@/src/hooks/useShippingConfig";
import { toast } from "sonner";

// ═══════ TYPES ═══════

// Tipos estrictos para respuestas del API POS
interface POSOrderResult {
  id: string;
  display_id?: number;
  status: string;
  email: string;
  customer_name?: string;
  total?: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface POSOrderHistoryItem {
  id: string;
  display_id: number;
  email: string;
  total: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  items_count: number;
  source: string;
  channel: string;
  payment_method: string;
  created_at: string;
  customer_name: string;
}

interface POSDailyStats {
  today_revenue: number;
  today_count: number;
  pos_count: number;
  total_count: number;
}
interface POSProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  status: string;
  category: string | null;
  variants: POSVariant[];
}

interface POSVariant {
  id: string;
  title: string;
  sku: string | null;
  inventory_quantity: number;
  prices: { amount: number; currency_code: string }[];
}

interface CartItem {
  variant_id: string;
  product_id: string;
  product_title: string;
  variant_title: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnail: string | null;
  metadata?: Record<string, any>;
}

interface POSCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

type Channel = "whatsapp" | "phone" | "instagram" | "facebook" | "in_person" | "other";
type PaymentMethod = "cash" | "transfer" | "terminal" | "online";
type ShippingType = string | null;

// shippingConfig se reemplaza por posOptions del hook — ver useShippingConfig()

// ═══════ CONFIG ═══════
const channelConfig: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]" },
  phone: { label: "Teléfono", icon: Phone, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
  facebook: { label: "Facebook", icon: Facebook, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  in_person: { label: "En persona", icon: Store, color: "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]" },
  other: { label: "Otro", icon: Globe, color: "bg-[var(--surface2)] text-[var(--text-secondary)] border-[var(--border)]" },
};

const paymentConfig: Record<PaymentMethod, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: "Efectivo", icon: Banknote, color: "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]" },
  transfer: { label: "Transferencia", icon: ArrowRightLeft, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  terminal: { label: "Terminal", icon: CreditCard, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
  online: { label: "Pago en línea", icon: Smartphone, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
};

// shippingConfig estático eliminado — reemplazado por posOptions dinámico desde useShippingConfig()

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

// ═══════ MAIN COMPONENT ═══════
// Componente interno — wrapeado por POSErrorBoundary abajo
const POSPageInner: React.FC<{ windowMode?: boolean }> = ({ windowMode = false }) => {
  // ── Shipping config desde Supabase ──
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

  // ── Live products from Medusa ──
  const { data: productsData, loading: loadingProducts } = useAdminData<{
    products: any[];
    count: number;
  }>("/api/admin/products?limit=100&status=published", { refreshInterval: 120_000 });

  // ── Recent orders ──
  const { data: ordersData, refetch: refetchOrders } = useAdminData<{
    orders: any[];
    stats: { today_revenue: number; today_count: number; pos_count: number; total_count: number };
  }>("/api/admin/pos?limit=30", { refreshInterval: 30_000 });

  const products: POSProduct[] = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products
      .filter((p: any) => {
        // Exclude service products (laser engraving service) from POS catalog
        if (p.handle === 'servicio-grabado-laser') return false;
        if (p.variants?.[0]?.sku?.startsWith('DSD-LASER')) return false;
        return true;
      })
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail,
        status: p.status,
        category: p.categories?.[0]?.name || null,
        variants: (p.variants || []).map((v: any) => ({
          id: v.id,
          title: v.title || "Default",
          sku: v.sku,
          inventory_quantity: v.inventory_quantity ?? 0,
          prices: (v.prices || []).map((pr: any) => ({
            amount: pr.amount,
            currency_code: pr.currency_code || "mxn",
          })),
        })),
      }));
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku?.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  // ── Cart operations ──
  const addToCart = useCallback(
    (product: POSProduct, variant: POSVariant) => {
      const price = variant.prices.find(p => p.currency_code === 'mxn')?.amount ?? variant.prices[0]?.amount ?? 0;
      setCart((prev) => {
        const existing = prev.find((i) => i.variant_id === variant.id);
        if (existing) {
          return prev.map((i) =>
            i.variant_id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            variant_id: variant.id,
            product_id: product.id,
            product_title: product.title,
            variant_title: variant.title,
            sku: variant.sku || "",
            price,
            quantity: 1,
            thumbnail: product.thumbnail,
          },
        ];
      });
      // Flash visual al agregar
      setFlashItem(variant.id);
      setTimeout(() => setFlashItem(null), 400);
    },
    [setFlashItem]
  );

  const updateQuantity = useCallback((variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.variant_id === variantId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variant_id !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomer({ email: "", first_name: "", last_name: "", phone: "" });
    setNotes("");
    setDiscount(null);
    setDiscountInput("");
    setShowDiscount(false);
    setShowAddress(false);
    setAddress({ address_1: "", city: "", province: "", postal_code: "" });
    setLastOrder(null);
  }, []);

  // ── Totals ──
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount
    ? discount.type === "percentage"
      ? subtotal * (discount.value / 100)
      : discount.value
    : 0;
  const selectedPosOption = posOptions.find((o) => o.id === shippingType);
  const shippingCost = selectedPosOption ? selectedPosOption.price / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingCost;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscount = () => {
    const val = parseFloat(discountInput);
    if (isNaN(val) || val <= 0) return;
    setDiscount({ type: discountType, value: val });
    setShowDiscount(false);
  };

  // ── Submit order ──
  const submitOrder = async () => {
    if (!cart.length) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (!customer.email && !customer.phone && !customer.first_name) {
      toast.error("Agrega datos del cliente (al menos nombre o teléfono)");
      return;
    }

    // Generate email if not provided
    const email = customer.email || `pos_${Date.now()}@davidsonsdesign.com`;

    setSubmitting(true);
    try {
      const fetchWithRetry = async (url: string, opts: RequestInit, retries = 1): Promise<Response> => {
        try {
          const r = await fetch(url, opts);
          if (!r.ok && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, opts, retries - 1);
          }
          return r;
        } catch (e) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, opts, retries - 1);
          }
          throw e;
        }
      };

      const resp = await fetchWithRetry("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            variant_id: i.variant_id,
            quantity: i.quantity,
            unit_price: i.price,
            metadata: i.metadata,
          })),
          customer: { ...customer, email },
          shipping_address: showAddress
            ? {
                ...address,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone,
                country_code: "mx",
              }
            : null,
          payment_method: paymentMethod,
          discount,
          notes,
          channel,
          shipping_type: shippingType,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        setLastOrder(data.order);
        toast.success(`Pedido creado exitosamente`, {
          description: `${customer.first_name || email} — ${fmtMXN(total)}`,
        });
        refetchOrders();
      } else {
        toast.error("Error al crear pedido", { description: data.error });
      }
    } catch (err: unknown) {
      toast.error("Error de conexión", { description: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Keyboard shortcut: focus search ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ═══════ RENDER ═══════
  return (
    <div className={`${windowMode ? "h-full" : "h-[calc(100vh-65px)]"} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[#8B7355] rounded-none flex items-center justify-center">
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
          <button
            onClick={() => setView(view === "pos" ? "history" : "pos")}
            className={`px-3 py-1.5 text-xs font-medium rounded-none border transition-colors ${
              view === "history"
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface2)]"
            }`}
          >
            {view === "pos" ? (
              <span className="flex items-center gap-1.5"><Clock size={12} /> Historial</span>
            ) : (
              <span className="flex items-center gap-1.5"><Zap size={12} /> Volver al POS</span>
            )}
          </button>
          {ordersData?.stats && (
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-[var(--surface2)] rounded-none text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} className="text-[var(--success)]" />
                Hoy: {fmtMXN(ordersData.stats.today_revenue)}
              </span>
              <span className="flex items-center gap-1">
                <Receipt size={12} />
                {ordersData.stats.today_count} pedidos
              </span>
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
          {/* ═══ LEFT: Product Catalog ═══ */}
          <div className="flex-1 flex flex-col border-r border-[var(--border)] overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto, SKU... (⌘K)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                  <Package className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    // Group products by category
                    const grouped = new Map<string, POSProduct[]>();
                    filteredProducts.forEach((p) => {
                      const cat = p.category || "Sin categoría";
                      if (!grouped.has(cat)) grouped.set(cat, []);
                      grouped.get(cat)!.push(p);
                    });
                    return Array.from(grouped.entries()).map(([cat, prods]) => (
                      <div key={cat}>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-none bg-[var(--accent)]" />
                          {cat} ({prods.length})
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {prods.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onAdd={addToCart}
                              cartItems={cart}
                            />
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Cart + Checkout ═══ */}
          <div className="w-[420px] flex flex-col bg-[var(--surface)] overflow-hidden">
            {/* Channel selector */}
            <div className="p-4 border-b border-[var(--border)]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">
                Canal de venta
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(channelConfig) as [Channel, typeof channelConfig[Channel]][]).map(
                  ([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setChannel(key)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-none text-[11px] font-medium border transition-all ${
                          channel === key
                            ? cfg.color + " ring-1 ring-current/20"
                            : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface2)]"
                        }`}
                      >
                        <Icon size={12} />
                        {cfg.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="p-4 border-b border-[var(--border)] space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <User size={10} /> Cliente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customer.first_name}
                  onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
                  placeholder="Nombre"
                  className="px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                />
                <input
                  type="text"
                  value={customer.last_name}
                  onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })}
                  placeholder="Apellido"
                  className="px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Teléfono"
                    className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                  />
                </div>
                <div className="relative">
                  <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="Email (opcional)"
                    className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                  <ShoppingCart size={10} /> Carrito ({itemCount})
                </label>
                {cart.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[10px] text-[var(--error)] hover:text-[var(--error)] flex items-center gap-0.5"
                  >
                    <Trash2 size={10} /> Limpiar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">Selecciona productos del catálogo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.variant_id}
                      className={`flex items-center gap-3 p-2.5 rounded-none border transition-colors ${
                        flashItem === item.variant_id
                          ? "bg-[var(--success-subtle)] border-[var(--success)]/30"
                          : "bg-[var(--surface2)]/50 border-[var(--border)]/50"
                      }`}
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-none object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text)] truncate">
                          {item.product_title}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">{fmtMXN(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.variant_id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--error-subtle)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[var(--text)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--success-subtle)] hover:text-[var(--success)] hover:border-[var(--success)] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[var(--text)] w-16 text-right">
                        {fmtMXN(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout section */}
            {cart.length > 0 && (
              <div className="border-t border-[var(--border)] p-4 space-y-3 bg-[var(--surface2)]/30">
                {/* Shipping type — dinámico desde useShippingConfig() */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Tipo de entrega
                    </label>
                    {shippingLoading && (
                      <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-0.5">
                        <RefreshCw size={8} className="animate-spin" /> cargando
                      </span>
                    )}
                  </div>
                  {posOptions.length === 0 && !shippingLoading ? (
                    <p className="text-[10px] text-[var(--text-muted)] py-2 text-center"
                      style={{ border: "1px dashed var(--border)" }}>
                      Sin opciones — configura en Envíos → Configuración
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {posOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setShippingType(opt.id);
                            setShowAddress(opt.price > 0);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-none text-[10px] font-medium border transition-all ${
                            shippingType === opt.id
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface2)]"
                          }`}
                        >
                          <Package size={10} />
                          {opt.label}
                          {opt.price > 0 && (
                            <span className={`text-[9px] ml-0.5 ${shippingType === opt.id ? "text-white/70" : "text-[var(--text-muted)]"}`}>
                              +${opt.price / 100}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Address (conditional) */}
                <>
                  {showAddress && (
                    <div
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          value={address.address_1}
                          onChange={(e) => setAddress({ ...address, address_1: e.target.value })}
                          placeholder="Dirección"
                          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Ciudad"
                            className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                          />
                          <input
                            type="text"
                            value={address.province}
                            onChange={(e) => setAddress({ ...address, province: e.target.value })}
                            placeholder="Estado"
                            className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                          />
                          <input
                            type="text"
                            value={address.postal_code}
                            onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                            placeholder="CP"
                            className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>

                {/* Payment method */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    Método de pago
                  </label>
                  <div className="flex gap-1.5">
                    {(Object.entries(paymentConfig) as [PaymentMethod, typeof paymentConfig[PaymentMethod]][]).map(
                      ([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setPaymentMethod(key)}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-none text-[10px] font-medium border transition-all ${
                              paymentMethod === key
                                ? cfg.color + " ring-1 ring-current/20"
                                : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface2)]"
                            }`}
                          >
                            <Icon size={12} />
                            {cfg.label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Notes */}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas del pedido (opcional)..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 resize-none"
                />

                {/* Totals */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{fmtMXN(subtotal)}</span>
                  </div>
                  {(() => {
                    const selOpt = posOptions.find((o) => o.id === shippingType);
                    if (!selOpt || selOpt.price === 0) return null;
                    return (
                      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Truck size={10} />{selOpt.label}
                        </span>
                        <span>{fmtMXN(selOpt.price / 100)}</span>
                      </div>
                    );
                  })()}
                  {discount && (
                    <div className="flex justify-between text-xs text-[var(--success)]">
                      <span className="flex items-center gap-1">
                        <Tag size={10} />
                        Descuento ({discount.type === "percentage" ? `${discount.value}%` : fmtMXN(discount.value)})
                        <button onClick={() => setDiscount(null)} className="text-[var(--error)] hover:text-[var(--error)]">
                          <X size={10} />
                        </button>
                      </span>
                      <span>-{fmtMXN(discountAmount)}</span>
                    </div>
                  )}
                  {!discount && (
                    <button
                      onClick={() => setShowDiscount(!showDiscount)}
                      className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5"
                    >
                      <Percent size={10} /> Agregar descuento
                    </button>
                  )}
                  <>
                    {showDiscount && (
                      <div
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 pt-1">
                          <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                            className="px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">$</option>
                          </select>
                          <input
                            type="number"
                            value={discountInput}
                            onChange={(e) => setDiscountInput(e.target.value)}
                            placeholder={discountType === "percentage" ? "10" : "100"}
                            className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                          />
                          <button
                            onClick={applyDiscount}
                            className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-none text-xs font-medium hover:bg-[var(--accent)]"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                  <div className="flex justify-between text-sm font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span className="text-lg">{fmtMXN(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={submitOrder}
                  disabled={submitting || !cart.length}
                  className="w-full py-3 text-white rounded-none text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all" style={{ background: "var(--primary)", boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creando pedido...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Crear Pedido — {fmtMXN(total)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal confirmación limpiar carrito */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-6 max-w-sm w-full mx-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-2">¿Limpiar carrito?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Se eliminarán {itemCount} artículo{itemCount !== 1 ? "s" : ""} y los datos del cliente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { clearCart(); setShowClearConfirm(false); }}
                className="px-3 py-1.5 text-xs text-white transition-colors"
                style={{ background: "var(--error)" }}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const POSPage: React.FC<{ windowMode?: boolean }> = (props) => (
  <POSErrorBoundary>
    <POSPageInner {...props} />
  </POSErrorBoundary>
);

// ═══════ ERROR BOUNDARY ═══════

class POSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-10 h-10 mb-4" style={{ color: "var(--error)" }} />
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
            Error en el Punto de Venta
          </h2>
          <p className="text-xs mb-6 max-w-sm" style={{ color: "var(--text-secondary)" }}>
            {this.state.errorMsg || "Ocurrió un error inesperado."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: "" })}
            className="px-4 py-2 text-xs font-medium text-white"
            style={{ background: "var(--primary)" }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════ SUB-COMPONENTS ═══════

// Product Card — soporta múltiples variantes con selector inline
const ProductCard: React.FC<{
  product: POSProduct;
  onAdd: (product: POSProduct, variant: POSVariant) => void;
  cartItems: CartItem[];
}> = ({ product, onAdd, cartItems }) => {
  const hasMultipleVariants = product.variants.length > 1;
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    product.variants[0]?.id ?? ""
  );

  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  if (!variant) return null;

  const price = variant.prices.find(p => p.currency_code === 'mxn')?.amount ?? variant.prices[0]?.amount ?? 0;
  const inCart = cartItems.find((i) => i.variant_id === variant.id);
  // FIX 5: Validación de stock — bloquear si qty en carrito >= stock disponible
  const cartQty = inCart?.quantity ?? 0;
  const outOfStock = variant.inventory_quantity <= 0;
  const stockExhausted = cartQty >= variant.inventory_quantity && !outOfStock;
  const disabled = outOfStock || stockExhausted;

  return (
    <div
      className={`relative text-left p-3 rounded-none border transition-all ${
        outOfStock
          ? "bg-[var(--surface2)] border-[var(--border)] opacity-60"
          : inCart
            ? "bg-[var(--accent)]/5 border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20"
            : "bg-[var(--surface)] border-[var(--border)]"
      }`}
    >
      {inCart && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--accent)] text-white rounded-none text-[9px] font-bold flex items-center justify-center shadow-sm">
          {inCart.quantity}
        </span>
      )}
      {product.thumbnail ? (
        <img src={product.thumbnail} alt="" className="w-full aspect-square rounded-none object-cover mb-2" />
      ) : (
        <div className="w-full aspect-square rounded-none bg-[var(--surface2)] flex items-center justify-center mb-2">
          <Package className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
      )}
      <p className="text-[11px] font-medium text-[var(--text)] leading-tight line-clamp-2 mb-1">
        {product.title}
      </p>

      {/* FIX 4: Selector de variante cuando hay más de una */}
      {hasMultipleVariants && (
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full mb-1.5 px-1.5 py-1 text-[10px] bg-[var(--surface2)] border border-[var(--border)] rounded-none text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        >
          {product.variants.map((v) => (
            <option key={v.id} value={v.id} disabled={v.inventory_quantity <= 0}>
              {v.title}{v.inventory_quantity <= 0 ? " — Agotado" : ` (${v.inventory_quantity})`}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-[var(--accent)]">{fmtMXN(price)}</span>
        {outOfStock ? (
          <span className="text-[9px] text-[var(--error)] font-medium">Agotado</span>
        ) : stockExhausted ? (
          <span className="text-[9px] text-[var(--warning)] font-medium">Máx. en carrito</span>
        ) : (
          <span className="text-[9px] text-[var(--text-muted)]">{variant.inventory_quantity - cartQty} disponibles</span>
        )}
      </div>

      <button
        onClick={() => !disabled && onAdd(product, variant)}
        disabled={disabled}
        className={`w-full py-1 text-[10px] font-semibold rounded-none border transition-all ${
          disabled
            ? "bg-[var(--surface2)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
            : "bg-[var(--primary)] border-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
        }`}
      >
        {outOfStock ? "Agotado" : stockExhausted ? "Límite alcanzado" : "Agregar"}
      </button>
    </div>
  );
};

// Función para imprimir recibo estilo ticket
const printReceipt = (order: POSOrderResult, total: number, customer: POSCustomer) => {
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return;
  const date = new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
  const orderNum = order.display_id ? "<div class=\"row\"><span>Pedido:</span><span class=\"bold\">#" + order.display_id + "</span></div>" : "";
  const clientName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "—";
  const html = [
    "<!DOCTYPE html><html><head><title>Recibo POS</title>",
    "<style>",
    "* { margin: 0; padding: 0; box-sizing: border-box; }",
    "body { font-family: monospace; font-size: 12px; width: 300px; padding: 16px; color: #111; }",
    ".center { text-align: center; } .bold { font-weight: bold; }",
    ".line { border-top: 1px dashed #999; margin: 8px 0; }",
    ".row { display: flex; justify-content: space-between; margin: 3px 0; }",
    ".total { font-size: 15px; font-weight: bold; }",
    "@media print { .no-print { display: none; } }",
    "</style></head><body>",
    "<div class=\"center bold\" style=\"font-size:14px;margin-bottom:4px\">DavidSon's Design</div>",
    "<div class=\"center\" style=\"color:#666;margin-bottom:12px\">davidsonsdesign.com</div>",
    "<div class=\"line\"></div>",
    "<div class=\"row\"><span>Fecha:</span><span>" + date + "</span></div>",
    orderNum,
    "<div class=\"row\"><span>Cliente:</span><span>" + clientName + "</span></div>",
    "<div class=\"line\"></div>",
    "<div class=\"row bold\"><span>TOTAL</span><span class=\"total\">$" + total.toFixed(0) + " MXN</span></div>",
    "<div class=\"line\"></div>",
    "<div class=\"center\" style=\"color:#666;margin-top:12px;font-size:10px\">Gracias por su compra!</div>",
    "<div class=\"no-print center\" style=\"margin-top:16px\">",
    "<button onclick=\"window.print()\" style=\"padding:8px 20px;cursor:pointer\">Imprimir</button>",
    "</div></body></html>",
  ].join("\n");
  w.document.write(html);
  w.document.close();
};

// Order Confirmation
const OrderConfirmation: React.FC<{
  order: POSOrderResult;
  total: number;
  customer: POSCustomer;
  onNewOrder: () => void;
}> = ({ order, total, customer, onNewOrder }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-[var(--success-subtle)] rounded-none flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-[var(--success)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Pedido Creado</h2>
      <p className="text-[var(--text-secondary)] mb-1">
        {customer.first_name} {customer.last_name}
      </p>
      <p className="text-3xl font-bold text-[var(--accent)] mb-6">{fmtMXN(total)}</p>
      {order.id && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--surface2)] px-4 py-2 rounded-none inline-block mb-6 font-mono">
          ID: {order.id}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onNewOrder}
          className="px-6 py-3 text-white rounded-none text-sm font-bold flex items-center gap-2 transition-colors"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={16} /> Nuevo Pedido
        </button>
        <button
          onClick={() => printReceipt(order, total, customer)}
          className="px-4 py-3 rounded-none text-sm font-medium border flex items-center gap-2 transition-colors"
          style={{ background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          <FileText size={14} /> Recibo
        </button>
        <button
          onClick={() => {
            if (order.id) {
              navigator.clipboard.writeText(order.id);
              toast.success("ID copiado");
            }
          }}
          className="px-4 py-3 rounded-none text-sm font-medium border flex items-center gap-2 transition-colors"
          style={{ background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          <Copy size={14} /> Copiar ID
        </button>
      </div>
    </div>
  </div>
);

// Order History — con búsqueda y filtros client-side
const OrderHistory: React.FC<{ orders: POSOrderHistoryItem[]; stats?: POSDailyStats }> = ({ orders, stats }) => {
  const [histSearch, setHistSearch] = React.useState("");
  const [histChannel, setHistChannel] = React.useState<string>("all");
  const [histPeriod, setHistPeriod] = React.useState<string>("all");

  const filteredOrders = React.useMemo(() => {
    let result = orders;
    if (histSearch.trim()) {
      const q = histSearch.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        String(o.display_id).includes(q)
      );
    }
    if (histChannel !== "all") {
      result = result.filter(o => o.channel === histChannel);
    }
    if (histPeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (histPeriod === "today") cutoff.setHours(0, 0, 0, 0);
      else if (histPeriod === "week") cutoff.setDate(now.getDate() - 7);
      else if (histPeriod === "month") cutoff.setDate(now.getDate() - 30);
      result = result.filter(o => new Date(o.created_at) >= cutoff);
    }
    return result;
  }, [orders, histSearch, histChannel, histPeriod]);

  return (
  <div className="flex-1 overflow-y-auto p-6">
    {/* Filtros historial */}
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={histSearch}
          onChange={e => setHistSearch(e.target.value)}
          placeholder="Buscar por nombre, email o #pedido..."
          className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        />
      </div>
      <select
        value={histChannel}
        onChange={e => setHistChannel(e.target.value)}
        className="px-2 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
      >
        <option value="all">Todos los canales</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="phone">Teléfono</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="in_person">En persona</option>
        <option value="other">Otro</option>
      </select>
      <select
        value={histPeriod}
        onChange={e => setHistPeriod(e.target.value)}
        className="px-2 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
      >
        <option value="all">Todo el tiempo</option>
        <option value="today">Hoy</option>
        <option value="week">Última semana</option>
        <option value="month">Último mes</option>
      </select>
    </div>

    {/* Stats */}
    {stats && (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ventas hoy", value: fmtMXN(stats.today_revenue), icon: DollarSign, color: "text-[var(--success)]" },
          { label: "Pedidos hoy", value: stats.today_count, icon: Receipt, color: "text-[var(--info)]" },
          { label: "Pedidos POS", value: stats.pos_count, icon: Zap, color: "text-[var(--accent)]" },
          { label: "Total histórico", value: stats.total_count, icon: BarChart3, color: "text-[var(--text-secondary)]" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] rounded-none border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    )}

    {/* Orders table */}
    <div className="bg-[var(--surface)] rounded-none border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--text)]">Pedidos recientes</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">No hay pedidos aún</div>
        ) : (
          orders.map((o: any) => {
            const isPos = o.source === "pos";
            const chCfg = channelConfig[o.channel as Channel] || channelConfig.other;
            const ChIcon = chCfg.icon;

            return (
              <div key={o.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface2)]/50 transition-colors">
                <div className={`w-8 h-8 rounded-none flex items-center justify-center ${isPos ? "bg-[var(--accent)]/10" : o.source === "quote" ? "bg-[var(--accent-subtle)]" : "bg-[var(--info-subtle)]"}`}>
                  {isPos ? <Zap size={14} className="text-[var(--accent)]" /> : o.source === "quote" ? <FileText size={14} className="text-[var(--accent)]" /> : <Globe size={14} className="text-[var(--info)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text)]">#{o.display_id}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{o.customer_name || o.email}</span>
                    {isPos && (
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${chCfg.color}`}>
                        <ChIcon size={8} />
                        {chCfg.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(o.created_at).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}{o.items_count} items
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--text)]">{fmtMXN(o.total)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
  );
};

export default POSPage;
