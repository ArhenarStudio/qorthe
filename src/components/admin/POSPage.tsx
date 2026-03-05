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
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, DollarSign,
  User, Phone, Mail, MapPin, MessageSquare, CreditCard,
  Banknote, ArrowRightLeft, Smartphone, Tag, Percent,
  Package, X, ChevronDown, ChevronRight, CheckCircle,
  Clock, Truck, Store, Receipt, Wifi, WifiOff, Loader2,
  Hash, Send, Instagram, Facebook, Globe, UserPlus,
  Zap, AlertCircle, FileText, Copy, Printer, Eye,
  RefreshCw, BarChart3, TrendingUp, ArrowRight
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";

// ═══════ TYPES ═══════
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
type ShippingType = "local_delivery" | "pickup" | "national" | null;

// ═══════ CONFIG ═══════
const channelConfig: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "bg-green-50 text-green-600 border-green-200" },
  phone: { label: "Teléfono", icon: Phone, color: "bg-blue-50 text-blue-600 border-blue-200" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-600 border-pink-200" },
  facebook: { label: "Facebook", icon: Facebook, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  in_person: { label: "En persona", icon: Store, color: "bg-amber-50 text-amber-600 border-amber-200" },
  other: { label: "Otro", icon: Globe, color: "bg-gray-50 text-gray-600 border-gray-200" },
};

const paymentConfig: Record<PaymentMethod, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: "Efectivo", icon: Banknote, color: "bg-green-50 text-green-600 border-green-200" },
  transfer: { label: "Transferencia", icon: ArrowRightLeft, color: "bg-blue-50 text-blue-600 border-blue-200" },
  terminal: { label: "Terminal", icon: CreditCard, color: "bg-purple-50 text-purple-600 border-purple-200" },
  online: { label: "Pago en línea", icon: Smartphone, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
};

const shippingConfig: Record<string, { label: string; icon: React.ElementType }> = {
  local_delivery: { label: "Entrega local", icon: Truck },
  pickup: { label: "Recoger en tienda", icon: Store },
  national: { label: "Envío nacional", icon: Package },
};

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

// ═══════ MAIN COMPONENT ═══════
export const POSPage: React.FC = () => {
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
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [view, setView] = useState<"pos" | "history">("pos");
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState({ address_1: "", city: "", province: "", postal_code: "" });
  const searchRef = useRef<HTMLInputElement>(null);

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
      const price = variant.prices[0]?.amount || 0;
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
    },
    []
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
  const total = Math.max(0, subtotal - discountAmount);
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
      const resp = await fetch("/api/admin/pos", {
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
    } catch (err: any) {
      toast.error("Error de conexión", { description: err.message });
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
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-wood-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C5A065] to-[#8B7355] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-wood-900">Punto de Venta</h1>
            <p className="text-[10px] text-wood-400">
              {productsData ? (
                <span className="text-green-600 flex items-center gap-1"><Wifi size={8} /> {products.length} productos</span>
              ) : (
                <span className="text-wood-400 flex items-center gap-1"><WifiOff size={8} /> Cargando...</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "pos" ? "history" : "pos")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              view === "history"
                ? "bg-wood-900 text-white border-wood-900"
                : "bg-white text-wood-600 border-wood-200 hover:bg-wood-50"
            }`}
          >
            {view === "pos" ? (
              <span className="flex items-center gap-1.5"><Clock size={12} /> Historial</span>
            ) : (
              <span className="flex items-center gap-1.5"><Zap size={12} /> Volver al POS</span>
            )}
          </button>
          {ordersData?.stats && (
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-wood-50 rounded-lg text-xs text-wood-600">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} className="text-green-600" />
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
          <div className="flex-1 flex flex-col border-r border-wood-100 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-wood-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-300" />
                <input
                  ref={searchRef}
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto, SKU... (⌘K)"
                  className="w-full pl-10 pr-4 py-2.5 bg-wood-50 border border-wood-100 rounded-xl text-sm text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 focus:border-[#C5A065]"
                />
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-20 text-wood-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando productos...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-wood-400">
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
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-400 mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
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
          <div className="w-[420px] flex flex-col bg-white overflow-hidden">
            {/* Channel selector */}
            <div className="p-4 border-b border-wood-50">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-400 mb-2 block">
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
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                          channel === key
                            ? cfg.color + " ring-1 ring-current/20"
                            : "bg-white text-wood-400 border-wood-100 hover:bg-wood-50"
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
            <div className="p-4 border-b border-wood-50 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-400 flex items-center gap-1">
                <User size={10} /> Cliente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customer.first_name}
                  onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
                  placeholder="Nombre"
                  className="px-3 py-2 bg-wood-50 border border-wood-100 rounded-lg text-xs text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                />
                <input
                  type="text"
                  value={customer.last_name}
                  onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })}
                  placeholder="Apellido"
                  className="px-3 py-2 bg-wood-50 border border-wood-100 rounded-lg text-xs text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-wood-300" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Teléfono"
                    className="w-full pl-8 pr-3 py-2 bg-wood-50 border border-wood-100 rounded-lg text-xs text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                  />
                </div>
                <div className="relative">
                  <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-wood-300" />
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="Email (opcional)"
                    className="w-full pl-8 pr-3 py-2 bg-wood-50 border border-wood-100 rounded-lg text-xs text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                  />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-400 flex items-center gap-1">
                  <ShoppingCart size={10} /> Carrito ({itemCount})
                </label>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5"
                  >
                    <Trash2 size={10} /> Limpiar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-wood-300">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">Selecciona productos del catálogo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.variant_id}
                      className="flex items-center gap-3 p-2.5 bg-wood-50/50 rounded-xl border border-wood-100/50"
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-wood-900 truncate">
                          {item.product_title}
                        </p>
                        <p className="text-[10px] text-wood-400">{fmtMXN(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.variant_id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-wood-200 text-wood-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-wood-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-wood-200 text-wood-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-wood-900 w-16 text-right">
                        {fmtMXN(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="text-wood-300 hover:text-red-500 transition-colors"
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
              <div className="border-t border-wood-100 p-4 space-y-3 bg-wood-50/30">
                {/* Shipping type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-400 mb-1.5 block">
                    Tipo de entrega
                  </label>
                  <div className="flex gap-1.5">
                    {(Object.entries(shippingConfig) as [string, { label: string; icon: React.ElementType }][]).map(
                      ([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setShippingType(key as ShippingType);
                              setShowAddress(key === "local_delivery" || key === "national");
                            }}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                              shippingType === key
                                ? "bg-wood-900 text-white border-wood-900"
                                : "bg-white text-wood-500 border-wood-200 hover:bg-wood-50"
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

                {/* Address (conditional) */}
                <AnimatePresence>
                  {showAddress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          value={address.address_1}
                          onChange={(e) => setAddress({ ...address, address_1: e.target.value })}
                          placeholder="Dirección"
                          className="w-full px-3 py-2 bg-white border border-wood-100 rounded-lg text-xs placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Ciudad"
                            className="px-3 py-2 bg-white border border-wood-100 rounded-lg text-xs placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                          />
                          <input
                            type="text"
                            value={address.province}
                            onChange={(e) => setAddress({ ...address, province: e.target.value })}
                            placeholder="Estado"
                            className="px-3 py-2 bg-white border border-wood-100 rounded-lg text-xs placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                          />
                          <input
                            type="text"
                            value={address.postal_code}
                            onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                            placeholder="CP"
                            className="px-3 py-2 bg-white border border-wood-100 rounded-lg text-xs placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Payment method */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-400 mb-1.5 block">
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
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                              paymentMethod === key
                                ? cfg.color + " ring-1 ring-current/20"
                                : "bg-white text-wood-400 border-wood-200 hover:bg-wood-50"
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
                  className="w-full px-3 py-2 bg-white border border-wood-100 rounded-lg text-xs text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30 resize-none"
                />

                {/* Totals */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-wood-500">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{fmtMXN(subtotal)}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={10} />
                        Descuento ({discount.type === "percentage" ? `${discount.value}%` : fmtMXN(discount.value)})
                        <button onClick={() => setDiscount(null)} className="text-red-400 hover:text-red-600">
                          <X size={10} />
                        </button>
                      </span>
                      <span>-{fmtMXN(discountAmount)}</span>
                    </div>
                  )}
                  {!discount && (
                    <button
                      onClick={() => setShowDiscount(!showDiscount)}
                      className="text-[10px] text-[#C5A065] hover:underline flex items-center gap-0.5"
                    >
                      <Percent size={10} /> Agregar descuento
                    </button>
                  )}
                  <AnimatePresence>
                    {showDiscount && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 pt-1">
                          <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                            className="px-2 py-1.5 bg-white border border-wood-200 rounded-lg text-xs"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">$</option>
                          </select>
                          <input
                            type="number"
                            value={discountInput}
                            onChange={(e) => setDiscountInput(e.target.value)}
                            placeholder={discountType === "percentage" ? "10" : "100"}
                            className="flex-1 px-3 py-1.5 bg-white border border-wood-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A065]/30"
                          />
                          <button
                            onClick={applyDiscount}
                            className="px-3 py-1.5 bg-[#C5A065] text-white rounded-lg text-xs font-medium hover:bg-[#B08D55]"
                          >
                            Aplicar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between text-sm font-bold text-wood-900 pt-2 border-t border-wood-200">
                    <span>Total</span>
                    <span className="text-lg">{fmtMXN(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={submitOrder}
                  disabled={submitting || !cart.length}
                  className="w-full py-3 bg-gradient-to-r from-wood-900 to-[#3d3425] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-[#3d3425] hover:to-wood-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-wood-900/20"
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
    </div>
  );
};

// ═══════ SUB-COMPONENTS ═══════

// Product Card
const ProductCard: React.FC<{
  product: POSProduct;
  onAdd: (product: POSProduct, variant: POSVariant) => void;
  cartItems: CartItem[];
}> = ({ product, onAdd, cartItems }) => {
  const variant = product.variants[0];
  if (!variant) return null;

  const price = variant.prices[0]?.amount || 0;
  const inCart = cartItems.find((i) => i.variant_id === variant.id);
  const outOfStock = variant.inventory_quantity <= 0;

  return (
    <button
      onClick={() => !outOfStock && onAdd(product, variant)}
      disabled={outOfStock}
      className={`relative text-left p-3 rounded-xl border transition-all group ${
        outOfStock
          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
          : inCart
            ? "bg-[#C5A065]/5 border-[#C5A065]/30 ring-1 ring-[#C5A065]/20"
            : "bg-white border-wood-100 hover:border-[#C5A065]/40 hover:shadow-sm"
      }`}
    >
      {inCart && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C5A065] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
          {inCart.quantity}
        </span>
      )}
      {product.thumbnail ? (
        <img
          src={product.thumbnail}
          alt=""
          className="w-full aspect-square rounded-lg object-cover mb-2"
        />
      ) : (
        <div className="w-full aspect-square rounded-lg bg-wood-50 flex items-center justify-center mb-2">
          <Package className="w-6 h-6 text-wood-300" />
        </div>
      )}
      <p className="text-[11px] font-medium text-wood-900 leading-tight line-clamp-2 mb-1">
        {product.title}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#C5A065]">{fmtMXN(price)}</span>
        {outOfStock ? (
          <span className="text-[9px] text-red-400 font-medium">Agotado</span>
        ) : (
          <span className="text-[9px] text-wood-300">{variant.inventory_quantity} en stock</span>
        )}
      </div>
    </button>
  );
};

// Order Confirmation
const OrderConfirmation: React.FC<{
  order: any;
  total: number;
  customer: POSCustomer;
  onNewOrder: () => void;
}> = ({ order, total, customer, onNewOrder }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center max-w-md"
    >
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-wood-900 mb-2">Pedido Creado</h2>
      <p className="text-wood-500 mb-1">
        {customer.first_name} {customer.last_name}
      </p>
      <p className="text-3xl font-bold text-[#C5A065] mb-6">{fmtMXN(total)}</p>
      {order.id && (
        <p className="text-xs text-wood-400 bg-wood-50 px-4 py-2 rounded-lg inline-block mb-6 font-mono">
          ID: {order.id}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onNewOrder}
          className="px-6 py-3 bg-wood-900 text-white rounded-xl text-sm font-bold hover:bg-[#3d3425] transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Pedido
        </button>
        <button
          onClick={() => {
            if (order.id) {
              navigator.clipboard.writeText(order.id);
              toast.success("ID copiado");
            }
          }}
          className="px-4 py-3 bg-white text-wood-600 rounded-xl text-sm font-medium border border-wood-200 hover:bg-wood-50 transition-colors flex items-center gap-2"
        >
          <Copy size={14} /> Copiar ID
        </button>
      </div>
    </motion.div>
  </div>
);

// Order History
const OrderHistory: React.FC<{ orders: any[]; stats?: any }> = ({ orders, stats }) => (
  <div className="flex-1 overflow-y-auto p-6">
    {/* Stats */}
    {stats && (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ventas hoy", value: fmtMXN(stats.today_revenue), icon: DollarSign, color: "text-green-600" },
          { label: "Pedidos hoy", value: stats.today_count, icon: Receipt, color: "text-blue-600" },
          { label: "Pedidos POS", value: stats.pos_count, icon: Zap, color: "text-[#C5A065]" },
          { label: "Total histórico", value: stats.total_count, icon: BarChart3, color: "text-wood-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-wood-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-wood-400">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    )}

    {/* Orders table */}
    <div className="bg-white rounded-xl border border-wood-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-wood-100">
        <h3 className="text-sm font-bold text-wood-900">Pedidos recientes</h3>
      </div>
      <div className="divide-y divide-wood-50">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-wood-400 text-sm">No hay pedidos aún</div>
        ) : (
          orders.map((o: any) => {
            const isPos = o.source === "pos";
            const chCfg = channelConfig[o.channel as Channel] || channelConfig.other;
            const ChIcon = chCfg.icon;

            return (
              <div key={o.id} className="flex items-center gap-4 px-4 py-3 hover:bg-wood-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPos ? "bg-[#C5A065]/10" : o.source === "quote" ? "bg-purple-50" : "bg-blue-50"}`}>
                  {isPos ? <Zap size={14} className="text-[#C5A065]" /> : o.source === "quote" ? <FileText size={14} className="text-purple-500" /> : <Globe size={14} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-wood-900">#{o.display_id}</span>
                    <span className="text-[10px] text-wood-400">{o.customer_name || o.email}</span>
                    {isPos && (
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${chCfg.color}`}>
                        <ChIcon size={8} />
                        {chCfg.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-wood-300">
                    {new Date(o.created_at).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}{o.items_count} items
                  </p>
                </div>
                <span className="text-xs font-bold text-wood-900">{fmtMXN(o.total)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

export default POSPage;
