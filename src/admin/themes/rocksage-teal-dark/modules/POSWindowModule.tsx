"use client";
// ═══════════════════════════════════════════════════════════════
// POSWindowModule.tsx — Punto de Venta dentro de OSWindow
//
// Layout del prototipo aprobado (rocksage-os-v3.html):
//   grid 2 columnas: [catálogo + búsqueda] | [carrito + cobrar]
// Conectado a useShippingConfig() para opciones de envío dinámicas.
// Sin frame propio, sin padding extra — vive dentro de OSWindow.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail,
  CreditCard, Banknote, ArrowRightLeft, Tag, Percent, X,
  Truck, Store, MessageSquare, Instagram, Facebook, Globe,
  UserPlus, CheckCircle, Receipt, Loader2, Send,
} from 'lucide-react';
import { useShippingConfig } from '@/hooks/useShippingConfig';

// ── Paleta ───────────────────────────────────────────────────
const C = {
  bg: '#08090B', surface: '#0F1114', surf2: '#161A1F',
  border: '#1A2228', border2: '#243038',
  primary: '#0D9488', primaryH: '#14B8A6', primaryL: '#2DD4BF', primaryT: '#0C2420',
  accent: '#F59E0B', text: '#E8ECF0', text2: '#6B7A85', text3: '#3A4A52',
  success: '#22C55E', error: '#EF4444', warning: '#F59E0B',
};

// ── Tipos ────────────────────────────────────────────────────
interface Product { id: string; name: string; sku: string; price: number; stock: number; }
interface CartItem { product: Product; qty: number; discount: number; }
type PayMethod = 'cash' | 'card' | 'transfer' | 'mercadopago';
type Channel = 'presencial' | 'whatsapp' | 'instagram' | 'facebook' | 'telefono' | 'web';

// ── Catálogo mock (reemplazar con Medusa cuando esté conectado) ─
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Tabla Maple 40cm',       sku: 'TBL-MLP-40', price: 480,  stock: 12 },
  { id: '2', name: 'Tabla Nogal 35cm',        sku: 'TBL-NGL-35', price: 390,  stock: 8  },
  { id: '3', name: 'Tabla Parota 50cm',       sku: 'TBL-PRT-50', price: 890,  stock: 5  },
  { id: '4', name: 'Set Tablas x3',           sku: 'SET-3PCS',   price: 1250, stock: 3  },
  { id: '5', name: 'Tabla Ébano 45cm',        sku: 'TBL-EBN-45', price: 1640, stock: 2  },
  { id: '6', name: 'Grabado personalizado',   sku: 'SRV-GRV-01', price: 240,  stock: 99 },
  { id: '7', name: 'Tabla Cerezo 38cm',       sku: 'TBL-CER-38', price: 520,  stock: 6  },
  { id: '8', name: 'Tabla Walnut 42cm',       sku: 'TBL-WLN-42', price: 720,  stock: 4  },
  { id: '9', name: 'Tabla Mini 25cm',         sku: 'TBL-MIN-25', price: 220,  stock: 15 },
  { id: '10', name: 'Caja regalo madera',     sku: 'PKG-GIFT-01', price: 180,  stock: 20 },
];

const PAY_METHODS: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash',        label: 'Efectivo',     icon: <Banknote size={14}/> },
  { id: 'card',        label: 'Tarjeta',      icon: <CreditCard size={14}/> },
  { id: 'transfer',    label: 'Transferencia', icon: <ArrowRightLeft size={14}/> },
  { id: 'mercadopago', label: 'MercadoPago',  icon: <Receipt size={14}/> },
];

const CHANNELS: { id: Channel; label: string; icon: React.ReactNode }[] = [
  { id: 'presencial', label: 'Presencial', icon: <Store size={13}/> },
  { id: 'whatsapp',   label: 'WhatsApp',   icon: <MessageSquare size={13}/> },
  { id: 'instagram',  label: 'Instagram',  icon: <Instagram size={13}/> },
  { id: 'facebook',   label: 'Facebook',   icon: <Facebook size={13}/> },
  { id: 'telefono',   label: 'Teléfono',   icon: <Phone size={13}/> },
  { id: 'web',        label: 'Web',        icon: <Globe size={13}/> },
];

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toLocaleString('es-MX')}`;

function fieldStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '7px 11px', fontSize: '12px',
    background: C.surf2, color: C.text,
    border: `1px solid ${focused ? C.primary : C.border}`,
    borderRadius: '8px', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  };
}

// ── Componente principal ──────────────────────────────────────
export function POSWindowModule() {
  const { posOptions } = useShippingConfig();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [channel, setChannel] = useState<Channel>('presencial');
  const [shippingOptionId, setShippingOptionId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [cashInput, setCashInput] = useState('');

  // Opciones de envío activas
  const activeShipping = useMemo(
    () => posOptions.filter(o => o.active).sort((a, b) => a.sort_order - b.sort_order),
    [posOptions]
  );

  // Seleccionar primera opción de envío cuando carguen
  useEffect(() => {
    if (activeShipping.length > 0 && !shippingOptionId) {
      setShippingOptionId(activeShipping[0].id);
    }
  }, [activeShipping, shippingOptionId]);

  const filtered = useMemo(() =>
    MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.flatMap(i => {
      if (i.product.id !== id) return [i];
      const next = i.qty + delta;
      return next <= 0 ? [] : [{ ...i, qty: next }];
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  }, []);

  // Totales
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty * (1 - i.discount / 100), 0);
  const selectedShipping = activeShipping.find(o => o.id === shippingOptionId);
  const shippingCost = selectedShipping ? selectedShipping.price / 100 : 0;
  const discountAmt = subtotal * (globalDiscount / 100);
  const total = Math.max(0, subtotal - discountAmt + shippingCost);
  const cashAmt = parseFloat(cashInput) || 0;
  const change = payMethod === 'cash' ? Math.max(0, cashAmt - total) : 0;

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 900)); // placeholder — conectar a Medusa
    setProcessing(false);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setCart([]); setCustomerName(''); setCustomerPhone('');
      setNotes(''); setGlobalDiscount(0); setCashInput('');
    }, 2200);
  };

  // ── Pantalla de éxito ───────────────────────────────────────
  if (orderSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '420px', gap: '14px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={30} color={C.success} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif" }}>¡Venta registrada!</div>
        <div style={{ fontSize: '12px', color: C.text2 }}>Total cobrado: <span style={{ color: C.primaryL, fontWeight: 700 }}>{fmt(total)}</span></div>
      </div>
    );
  }

  // ── Layout principal ────────────────────────────────────────
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px',
      height: 'calc(82vh - 52px - 14px)', minHeight: 0,
      padding: '14px', overflow: 'hidden',
    }}>
      {/* ── Columna izquierda: búsqueda + catálogo ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
        {/* Barra de búsqueda */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.text2, pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre o SKU..."
            style={{ ...fieldStyle(focusedField === 'search'), paddingLeft: '34px' }}
            onFocus={() => setFocusedField('search')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* Grilla de productos */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: '10px', padding: '12px 10px 10px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', color: C.text,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary;
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,148,136,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLButtonElement).style.background = C.surface;
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '3px', lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: '10px', color: C.text2, fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px' }}>{p.sku}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.primaryL, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(p.price)}</div>
                {p.stock <= 3 && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '8px', fontWeight: 700, color: C.warning, background: 'rgba(245,158,11,0.1)', padding: '2px 5px', borderRadius: '4px' }}>
                    {p.stock} left
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: '32px', textAlign: 'center', color: C.text2, fontSize: '12px' }}>
                Sin resultados para &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Canal + notas */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setChannel(ch.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: channel === ch.id ? 'rgba(13,148,136,0.15)' : 'transparent',
                color: channel === ch.id ? C.primaryL : C.text2,
                border: `1px solid ${channel === ch.id ? 'rgba(13,148,136,0.3)' : C.border}`,
              }}>
              {ch.icon}{ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Columna derecha: carrito ── */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header carrito */}
        <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif" }}>
              <ShoppingCart size={14} color={C.primaryL} />
              Carrito activo
              {cart.length > 0 && (
                <span style={{ background: C.primary, color: '#fff', fontSize: '9px', fontWeight: 800, borderRadius: '10px', padding: '1px 6px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: C.text2, cursor: 'pointer', padding: '2px' }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Items carrito */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', scrollbarWidth: 'none' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', gap: '6px', color: C.text2 }}>
              <ShoppingCart size={20} opacity={0.3}/>
              <span style={{ fontSize: '11px' }}>Carrito vacío</span>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 6px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                  <div style={{ fontSize: '10px', color: C.text2, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(item.product.price)} c/u</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => updateQty(item.product.id, -1)} style={{ width: '20px', height: '20px', borderRadius: '5px', border: `1px solid ${C.border2}`, background: C.surf2, color: C.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={10}/>
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text, minWidth: '16px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} style={{ width: '20px', height: '20px', borderRadius: '5px', border: `1px solid ${C.border2}`, background: C.surf2, color: C.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={10}/>
                  </button>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: C.primaryL, minWidth: '52px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(item.product.price * item.qty)}
                </div>
                <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', padding: '2px' }}>
                  <X size={11}/>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer carrito: envío, descuento, cliente, pago, cobrar */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>

          {/* Envío */}
          {activeShipping.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.text2, fontWeight: 700, marginBottom: '5px' }}>Envío</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {activeShipping.map(opt => (
                  <button key={opt.id} onClick={() => setShippingOptionId(opt.id)}
                    style={{
                      padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      background: shippingOptionId === opt.id ? 'rgba(13,148,136,0.15)' : C.surf2,
                      color: shippingOptionId === opt.id ? C.primaryL : C.text2,
                      border: `1px solid ${shippingOptionId === opt.id ? 'rgba(13,148,136,0.3)' : C.border}`,
                      transition: 'all 0.12s',
                    }}>
                    {opt.label}{opt.price > 0 ? ` +${fmt(opt.price / 100)}` : ' Gratis'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descuento global */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Percent size={11} color={C.text2} />
            <span style={{ fontSize: '11px', color: C.text2, flex: 1 }}>Descuento</span>
            <input
              type="number" min="0" max="100" value={globalDiscount || ''}
              onChange={e => setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              placeholder="0"
              style={{ width: '52px', padding: '4px 7px', fontSize: '12px', textAlign: 'right', background: C.surf2, color: C.text, border: `1px solid ${C.border}`, borderRadius: '7px', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
            />
            <span style={{ fontSize: '11px', color: C.text2 }}>%</span>
          </div>

          {/* Cliente */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Nombre cliente"
              style={{ flex: 1, padding: '6px 9px', fontSize: '11px', background: C.surf2, color: C.text, border: `1px solid ${C.border}`, borderRadius: '7px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Teléfono"
              style={{ width: '100px', padding: '6px 9px', fontSize: '11px', background: C.surf2, color: C.text, border: `1px solid ${C.border}`, borderRadius: '7px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          {/* Método de pago */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                style={{
                  flex: 1, padding: '5px 4px', borderRadius: '7px', fontSize: '10px', fontWeight: 600,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  cursor: 'pointer', transition: 'all 0.12s',
                  background: payMethod === m.id ? 'rgba(13,148,136,0.15)' : C.surf2,
                  color: payMethod === m.id ? C.primaryL : C.text2,
                  border: `1px solid ${payMethod === m.id ? 'rgba(13,148,136,0.3)' : C.border}`,
                }}>
                {m.icon}{m.label}
              </button>
            ))}
          </div>

          {/* Cash input si es efectivo */}
          {payMethod === 'cash' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Banknote size={11} color={C.text2} />
              <span style={{ fontSize: '11px', color: C.text2 }}>Con</span>
              <input value={cashInput} onChange={e => setCashInput(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder={fmt(total)}
                style={{ flex: 1, padding: '4px 7px', fontSize: '12px', background: C.surf2, color: C.text, border: `1px solid ${C.border}`, borderRadius: '7px', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
              {change > 0 && <span style={{ fontSize: '11px', color: C.success, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>Cambio: {fmt(change)}</span>}
            </div>
          )}

          {/* Total + botón cobrar */}
          <div style={{ background: 'rgba(12,36,32,0.5)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: C.text2 }}>Subtotal</span>
              <span style={{ fontSize: '12px', color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(subtotal)}</span>
            </div>
            {discountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', color: C.text2 }}>Descuento {globalDiscount}%</span>
                <span style={{ fontSize: '12px', color: C.warning, fontFamily: "'JetBrains Mono', monospace" }}>−{fmt(discountAmt)}</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', color: C.text2 }}>Envío</span>
                <span style={{ fontSize: '12px', color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(shippingCost)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: `1px solid ${C.border}`, marginTop: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif" }}>Total</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(total)}</span>
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={cart.length === 0 || processing}
            style={{
              width: '100%', padding: '11px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              background: cart.length === 0 ? C.border2 : `linear-gradient(135deg, ${C.primary}, ${C.primaryH})`,
              color: cart.length === 0 ? C.text2 : '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'Sora', sans-serif",
              boxShadow: cart.length > 0 ? '0 4px 14px rgba(13,148,136,0.3)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {processing ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }}/> : <Receipt size={15}/>}
            {processing ? 'Procesando...' : `Cobrar ${fmt(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
