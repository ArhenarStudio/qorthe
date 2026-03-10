"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, ArrowLeft, Copy, Truck, Printer,
  CheckCircle, Clock, Package, MapPin, CreditCard, MessageSquare,
  ChevronDown, MoreHorizontal, Mail, Download, Pin, Plus,
  ExternalLink, Camera, X as XIcon, AlertCircle, Zap, Send,
  User, Trophy, ShoppingBag, Eye, BarChart3
} from 'lucide-react';
import { type Order, type OrderItem, type EngravingDesign } from '@/data/adminMockData';
import { useAdminData } from '@/hooks/useAdminData';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ===== CONFIG =====
// Status labels — colores via useTheme() tokens, no hardcoded
const statusLabels: Record<string, string> = {
  paid: 'Pagado', pending: 'Pendiente', refunded: 'Reembolsado',
};
const shippingLabels: Record<string, string> = {
  pending: 'Pendiente', production: 'En producción', shipped: 'Enviado',
  delivered: 'Entregado', cancelled: 'Cancelado',
};
const orderStatusLabels: Record<string, string> = {
  new: 'Nuevo', payment_confirmed: 'Pago confirmado', in_production: 'En producción',
  laser_engraving: 'Grabado láser', quality_control: 'Control de calidad', packing: 'Empacado',
  ready_to_ship: 'Listo para enviar', shipped: 'Enviado', in_transit: 'En tránsito',
  out_for_delivery: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
  refunded: 'Reembolsado', disputed: 'En disputa',
};
type StatusVariant = 'success' | 'warning' | 'error' | 'info';
const paymentVariant = (s: string): StatusVariant =>
  s === 'paid' ? 'success' : s === 'refunded' ? 'error' : 'warning';
const orderVariant = (s: string): StatusVariant =>
  ['delivered', 'payment_confirmed'].includes(s) ? 'success' :
  ['cancelled', 'refunded', 'disputed'].includes(s) ? 'error' :
  ['shipped', 'in_transit', 'out_for_delivery', 'new'].includes(s) ? 'info' : 'warning';
// shippingConfig kept for filter label lookup only
const shippingConfig: Record<string, { label: string }> = {
  pending: { label: 'Pendiente' }, production: { label: 'En producción' },
  shipped: { label: 'Enviado' }, delivered: { label: 'Entregado' }, cancelled: { label: 'Cancelado' },
};

const engravingStatusConfig: Record<string, { label: string; class: string }> = {
  'pending': { label: 'Pendiente', class: 'text-amber-600' },
  'in-progress': { label: 'En proceso', class: 'text-blue-600' },
  'completed': { label: 'Completado', class: 'text-green-600' },
};

const positionLabels: Record<string, string> = {
  'center': 'Centro',
  'bottom-right': 'Inferior derecha',
  'bottom-left': 'Inferior izquierda',
  'custom': 'Personalizada',
};

import { DEFAULT_LOYALTY_CONFIG, getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { TierIcon } from '@/components/ui/TierIcons';

// ===== Helper: map Medusa order to mock Order shape (for list display) =====
const fmtPrice = (n: number) => `${n.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;

function mapLiveOrder(o: any): Order {
  const created = new Date(o.created_at);
  const dateISO = created.toISOString();

  // Map Medusa fulfillment_status to our shipping status
  const shippingMap: Record<string, Order['shippingStatus']> = {
    not_fulfilled: 'pending',
    partially_fulfilled: 'production',
    fulfilled: 'shipped',
    canceled: 'cancelled',
  };

  const paymentMap: Record<string, Order['paymentStatus']> = {
    captured: 'paid',
    not_paid: 'pending',
    refunded: 'refunded',
  };

  const addr = `${o.city || ''}${o.province ? ', ' + o.province : ''}`;

  return {
    id: o.id,
    number: `#DSD-${String(o.display_id).padStart(4, '0')}`,
    date: dateISO,
    customer: {
      name: o.customer_name || o.email?.split('@')[0] || '—',
      email: o.email || '',
      phone: '',
      avatar: (o.customer_name || 'U').substring(0, 2).toUpperCase(),
    },
    items: (o.items || []).map((i: any) => ({
      id: i.id,
      productName: i.title,
      sku: '',
      qty: i.quantity,
      unitPrice: i.unit_price,
      subtotal: i.unit_price * i.quantity,
      image: i.thumbnail || '/placeholder.jpg',
    })),
    subtotal: o.total,
    shipping: 0,
    discount: 0,
    engravingTotal: 0,
    tax: 0,
    total: o.total,
    paymentStatus: paymentMap[o.payment_status] || 'pending',
    paymentMethod: 'Tarjeta',
    shippingStatus: shippingMap[o.fulfillment_status] || 'pending',
    orderStatus: o.status === 'canceled' ? 'cancelled' : 'payment_confirmed',
    address: addr,
    addressDetail: {
      name: o.customer_name || '',
      street: '',
      neighborhood: '',
      city: o.city || '',
      state: o.province || '',
      zip: '',
      country: 'México',
      phone: '',
      fullString: addr,
      zone: '',
    },
    hasEngraving: false,
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: dateISO, done: true },
    ],
    notes: [],
    communications: [],
    margin: { productCost: 0, shippingCost: 0, stripeCommission: 0, estimatedProfit: 0, marginPercent: 0 },
    _raw: { medusa_id: o.id, display_id: o.display_id },
  };
}

// ===== MAIN COMPONENT =====
export const OrdersPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { t } = useTheme();
  // primitivos via src/theme/primitives — leen de useTheme() directamente
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [engravingFilter, setEngravingFilter] = useState(false);

  // ── Live data from Medusa ──
  const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
  const searchParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
  const { data: liveData, loading: liveLoading } = useAdminData<{
    orders: any[];
    count: number;
  }>(`/api/admin/orders?limit=50${statusParam}${searchParam}`, { refreshInterval: 30_000 });

  const isLive = !!liveData?.orders;
  const orders: Order[] = isLive
    ? liveData!.orders.map(mapLiveOrder)
    : [];

  const filteredOrders = orders.filter(o => {
    if (isLive) return true; // API already filtered
    const matchesSearch = o.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.shippingStatus === statusFilter;
    const matchesEngraving = !engravingFilter || o.hasEngraving;
    return matchesSearch && matchesStatus && matchesEngraving;
  });

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const badgeStyle = (variant: 'success'|'warning'|'error'|'info') => {
    const map = {
      success: { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'var(--success)' },
      warning: { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'var(--warning)' },
      error:   { bg: 'var(--error-subtle)',   color: 'var(--error)',   border: 'var(--error)' },
      info:    { bg: 'var(--info-subtle)',     color: 'var(--info)',    border: 'var(--info)' },
    };
    return map[variant];
  };

  const orderTabs = ['Todos', 'Pendiente', 'En producción', 'Enviado', 'Entregado', 'Cancelado'];
  const orderTabKeys = ['all', 'pending', 'production', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginBottom: '2px' }}>
            Pedidos
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {orders.length} pedidos totales
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {orderTabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(orderTabKeys[i])}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              backgroundColor: statusFilter === orderTabKeys[i] ? 'var(--accent)' : 'var(--surface)',
              color: statusFilter === orderTabKeys[i] ? 'var(--accent-text)' : 'var(--text)',
              border: `1px solid ${statusFilter === orderTabKeys[i] ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Búsqueda + grabado */}
      <div className="flex gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por # pedido o cliente..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '13px', color: 'var(--text)' }}
          />
        </div>
        <button
          onClick={() => setEngravingFilter(!engravingFilter)}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: engravingFilter ? 'var(--error-subtle)' : 'var(--surface)',
            color: engravingFilter ? 'var(--error)' : 'var(--text-secondary)',
            border: `1px solid ${engravingFilter ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-button)',
            cursor: 'pointer',
          }}
        >
          Grabado láser
        </button>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Fecha', 'Cliente', 'Items', 'Total', 'Pago', 'Estado', 'Envío', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const pvBadge = badgeStyle(paymentVariant(order.paymentStatus));
                const ovBadge = badgeStyle(orderVariant(order.orderStatus));
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: idx < filteredOrders.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                    onClick={() => setSelectedOrder(order)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-5 py-3" style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>{order.number}</td>
                    <td className="px-5 py-3" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(order.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--surface2)', borderRadius: '50%', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {order.customer.avatar}
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }} className="truncate max-w-[120px]">{order.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {order.items.length} {order.items.length === 1 ? 'pza' : 'pzs'}
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1" style={{ fontSize: '10px', fontWeight: 700, backgroundColor: pvBadge.bg, color: pvBadge.color, border: `1px solid ${pvBadge.border}`, borderRadius: 'var(--radius-badge)' }}>
                        {statusLabels[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1" style={{ fontSize: '10px', fontWeight: 700, backgroundColor: ovBadge.bg, color: ovBadge.color, border: `1px solid ${ovBadge.border}`, borderRadius: 'var(--radius-badge)' }}>
                        {orderStatusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {order.tracking
                        ? <span>{order.carrier} {order.tracking.slice(0, 10)}...</span>
                        : <span style={{ color: 'var(--text-muted)' }}>Sin guía</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <button style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            <Package size={28} style={{ opacity: 0.2 }} />
            <p>No se encontraron pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== ORDER DETAIL =====
const OrderDetail: React.FC<{ order: Order; onBack: () => void }> = ({ order, onBack }) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [engravingPreview, setEngravingPreview] = useState<EngravingDesign | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageText, setMessageText] = useState('');

  const copyAddress = () => {
    navigator.clipboard.writeText(order.addressDetail.fullString);
    toast.success('Dirección copiada');
  };

  const copyTracking = () => {
    if (order.tracking) {
      navigator.clipboard.writeText(order.tracking);
      toast.success('Tracking copiado');
    }
  };

  const moreMenuItems = [
    'Reimprimir confirmación',
    'Enviar copia al cliente',
    'Editar pedido',
    'Cancelar pedido',
    'Reembolsar',
    'Archivar',
  ];

  const messageTemplates = [
    'Tu pedido está en producción',
    'Estamos preparando el grabado láser',
    'Tu pedido está listo y será enviado hoy',
    'Necesitamos confirmar un detalle de tu grabado',
    'Tu pedido ha sido entregado, ¿todo bien?',
    'Mensaje personalizado',
  ];

  const allStatuses = [
    'new', 'payment_confirmed', 'in_production', 'laser_engraving',
    'quality_control', 'packing', 'ready_to_ship', 'shipped',
    'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'refunded',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-[var(--surface2)] rounded-lg text-[var(--text-secondary)] transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-serif text-lg text-[var(--text)]">Pedido {order.number}</h3>
                {order.hasEngraving && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex items-center gap-1">
                    🔴 GRABADO LÁSER
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{new Date(order.date).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => toast.success('Orden de producción generada')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] hover:border-wood-300 transition-colors"
            >
              <Printer size={14} /> Imprimir
            </button>
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] hover:border-wood-300 transition-colors"
              >
                <MoreHorizontal size={14} /> Más
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-30 min-w-[200px]">
                  {moreMenuItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => { toast.success(item + " — acción pendiente"); setMoreMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--surface2)] transition-colors ${item.includes('Cancelar') || item.includes('Reembolsar') ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap ml-11">
          <TBadge text={"💳 " + (statusLabels[order.paymentStatus] || order.paymentStatus)} variant={paymentVariant(order.paymentStatus)} />
          <TBadge text={"📦 " + (orderStatusLabels[order.orderStatus] || order.orderStatus)} variant={orderVariant(order.orderStatus)} />
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${order.tracking ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
            🚚 {order.tracking ? 'Guía generada' : 'Sin guía'}
          </span>
        </div>
      </div>

      {/* ===== 2-COLUMN LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (65%) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. TIMELINE */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h4 className="text-sm font-medium text-[var(--text)] mb-5">Timeline del pedido</h4>
            <div className="relative ml-3">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--surface2)]" />
              <div className="space-y-0">
                {order.timeline.map((step, idx) => (
                  <div key={step.id} className="relative flex gap-4 pb-5 last:pb-0">
                    <div className={`relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      step.done
                        ? 'bg-green-500 border-green-500'
                        : 'bg-[var(--surface)] border-wood-300'
                    }`}>
                      {step.done && (
                        <CheckCircle size={10} className="text-white absolute top-0.5 left-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs ${step.done ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}`}>
                          {step.label}
                        </span>
                        {step.notifiedClient && (
                          <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">Cliente notificado</span>
                        )}
                      </div>
                      {step.date && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{step.date}</p>}
                      {step.note && <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 italic">"{step.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Status Button */}
            <div className="relative mt-4 pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
              >
                <ChevronDown size={14} /> Cambiar Estado
              </button>
              {statusDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-30 min-w-[220px] max-h-[280px] overflow-y-auto">
                  {allStatuses.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        toast.success(`Estado cambiado a: ${orderStatusLabels[s] || s}`);
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--surface2)] flex items-center gap-2 ${order.orderStatus === s ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['delivered','payment_confirmed'].includes(s) ? 'var(--success)' : ['cancelled','refunded','disputed'].includes(s) ? 'var(--error)' : ['shipped','in_transit','new'].includes(s) ? 'var(--info)' : 'var(--warning)' }} />
                      {orderStatusLabels[s] || s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. ITEMS */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h4 className="text-sm font-medium text-[var(--text)]">Artículos del pedido</h4>
            </div>
            <div className="divide-y divide-wood-50">
              {order.items.map(item => (
                <div key={item.id} className="p-5">
                  {/* Item Row */}
                  <div className="flex items-start gap-4">
                    <img src={item.image} alt={item.productName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text)]">{item.productName}</p>
                      {item.variant && <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Variante: {item.variant}</p>}
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">SKU: {item.sku}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-[var(--text-secondary)]">Cantidad: {item.qty}</span>
                        <span className="text-xs font-medium text-[var(--text)]">${item.unitPrice.toLocaleString()} MXN</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-[var(--text)]">${item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Engraving Section */}
                  {item.engraving?.hasEngraving && (
                    <div className="mt-4 ml-20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600">🔴 GRABADO LÁSER INCLUIDO</span>
                      </div>
                      <div className="space-y-3">
                        {item.engraving.designs.map((design, dIdx) => (
                          <div key={design.id} className="bg-[var(--surface2)] rounded-lg p-4 border border-[var(--border)]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">
                                Diseño {dIdx + 1} {design.isFree ? '(gratis)' : `(+$${design.extraCost})`}
                              </span>
                              <span className={`text-[10px] font-medium ${engravingStatusConfig[design.status]?.class}`}>
                                ● {engravingStatusConfig[design.status]?.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Design Preview */}
                              <div
                                onClick={() => setEngravingPreview(design)}
                                className="relative aspect-video bg-[var(--surface)] rounded-lg overflow-hidden border border-[var(--border)] cursor-pointer group"
                              >
                                <img src={design.previewUrl} alt={design.fileName} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                              </div>

                              {/* Design Info */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[var(--text-muted)]">Archivo</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-[var(--text)] truncate max-w-[120px]">{design.fileName}</span>
                                    <button onClick={() => toast.success('Descargando...')} className="p-1 hover:bg-[var(--surface)] rounded transition-colors">
                                      <Download size={12} className="text-[var(--text-muted)]" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[var(--text-muted)]">Dimensiones</span>
                                  <span className="text-[10px] text-[var(--text)]">{design.width} × {design.height} cm</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[var(--text-muted)]">Área máx.</span>
                                  <span className="text-[10px] text-[var(--text)]">{design.maxArea}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[var(--text-muted)]">Posición</span>
                                  <span className="text-[10px] text-[var(--text)]">{positionLabels[design.position]}</span>
                                </div>
                              </div>
                            </div>

                            {design.productionNotes && (
                              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                                <p className="text-[10px] text-[var(--text-muted)] mb-1">Notas de producción:</p>
                                <p className="text-[10px] text-[var(--text-secondary)] italic">"{design.productionNotes}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weight & Dimensions */}
                  {(item.weight || item.packageDimensions) && (
                    <div className="mt-3 ml-20 flex gap-4 text-[10px] text-[var(--text-muted)]">
                      {item.weight && <span>Peso: {item.weight} kg</span>}
                      {item.packageDimensions && <span>Empaque: {item.packageDimensions}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. INTERNAL NOTES */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h4 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">📝 Notas del Pedido</h4>
              <span className="text-[10px] text-[var(--text-muted)]">{order.notes.length} notas</span>
            </div>
            <div className="p-5">
              {order.notes.length > 0 && (
                <div className="space-y-3 mb-4">
                  {order.notes.map(n => (
                    <div key={n.id} className={`rounded-lg p-3 ${n.pinned ? 'bg-amber-50 border border-amber-100' : 'bg-[var(--surface2)]'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-[var(--text)] flex-1">"{n.text}"</p>
                        {n.pinned && <Pin size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{n.author} — {new Date(n.date).toLocaleString('es-MX')}</p>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escribir nota..."
                className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none h-20 outline-none focus:border-wood-400 transition-colors"
              />
              <button
                onClick={() => {
                  if (noteText.trim()) { toast.success('Nota guardada'); setNoteText(''); }
                }}
                className="mt-2 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* 4. COMMUNICATIONS */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h4 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">📧 Comunicaciones con el Cliente</h4>
            </div>
            <div className="p-5">
              {order.communications.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {order.communications.map(com => (
                    <div key={com.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--text)] truncate">{com.subject}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">→ {com.recipientEmail}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-[var(--text-muted)]">{new Date(com.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        <span className={`text-[9px] font-medium ${com.status === 'delivered' ? 'text-green-500' : com.status === 'failed' ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                          {com.status === 'delivered' ? '✅ Entregado' : com.status === 'failed' ? '❌ Falló' : '⏳ Enviado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] mb-4">Sin comunicaciones registradas</p>
              )}
              <button
                onClick={() => setMessageModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
              >
                <Send size={14} /> Enviar mensaje al cliente
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="lg:col-span-5 space-y-6">

          {/* 5. CUSTOMER */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">👤 Cliente</h4>
              <button className="text-[10px] text-[var(--accent)] font-medium hover:underline">Ver perfil →</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--text-secondary)] font-bold flex-shrink-0">
                {order.customer.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text)]">{order.customer.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">{order.customer.email}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Tel: {order.customer.phone}</p>
              </div>
            </div>
            {order.customer.tier && (
              <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <TierIcon tierId={order.customer.tier!} size={16} />
                  <span className="text-[11px] font-medium" style={getTierInlineStyles(DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalizeTierId(order.customer.tier!)) || DEFAULT_LOYALTY_CONFIG.tiers[0]).text}>
                    Miembro {DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalizeTierId(order.customer.tier!))?.name || order.customer.tier} ({order.customer.points?.toLocaleString()} pts)
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] text-[var(--text-secondary)]">
                  <span>📦 {order.customer.totalOrders} pedidos</span>
                  <span>💰 ${order.customer.totalSpent?.toLocaleString()} MXN</span>
                </div>
                {order.customer.customerNotes && (
                  <p className="text-[10px] text-[var(--text-secondary)] italic bg-[var(--surface2)] rounded p-2 mt-2">
                    "{order.customer.customerNotes}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 6. ADDRESS */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">📍 Dirección de Envío</h4>
              <button onClick={copyAddress} className="p-1.5 hover:bg-[var(--surface2)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors" title="Copiar">
                <Copy size={14} />
              </button>
            </div>
            <div className="space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p className="font-medium text-[var(--text)]">{order.addressDetail.name}</p>
              <p>{order.addressDetail.street}</p>
              <p>{order.addressDetail.neighborhood}</p>
              <p>{order.addressDetail.city}, {order.addressDetail.state} CP {order.addressDetail.zip}</p>
              <p>{order.addressDetail.country}</p>
              <p className="text-[var(--text-muted)]">Tel: {order.addressDetail.phone}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-secondary)]">Zona: {order.addressDetail.zone}</p>
            </div>
          </div>

          {/* 7. FINANCIAL SUMMARY */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h4 className="text-sm font-medium text-[var(--text)] mb-4 flex items-center gap-2">💰 Resumen</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Subtotal (productos)</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              {order.engravingTotal > 0 && (
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Grabado láser</span>
                  <span>${order.engravingTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Envío</span>
                <span>{order.shipping === 0 ? 'Gratis' : `$${order.shipping.toLocaleString()}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Descuento{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                  <span>-${order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <span>IVA incluido (16%)</span>
                <span>${order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]">
                <span>TOTAL</span>
                <span>${order.total.toLocaleString()} MXN</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-secondary)]">{order.paymentMethod}</span>
              </div>
              {order.paymentRef && (
                <p className="text-[10px] text-[var(--text-muted)] font-mono ml-6">Ref: {order.paymentRef}</p>
              )}
              <p className="text-[10px] text-[var(--text-muted)] ml-6">{new Date(order.date).toLocaleString('es-MX')}</p>
            </div>

            {/* Margin */}
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={14} className="text-[var(--text-muted)]" />
                <span className="text-xs font-medium text-[var(--text)]">Margen estimado</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>Costo productos</span>
                  <span>${order.margin.productCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>Costo envío real</span>
                  <span>${order.margin.shippingCost.toLocaleString()}</span>
                </div>
                {order.margin.stripeCommission > 0 && (
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Comisión Stripe</span>
                    <span>${order.margin.stripeCommission.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-medium text-green-600 pt-1.5 border-t border-[var(--border)]">
                  <span>Utilidad est.</span>
                  <span>${order.margin.estimatedProfit.toLocaleString()} ({order.margin.marginPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Refund buttons */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex gap-2">
              <button
                onClick={() => { if (order._raw?.medusa_id) window.open(`https://urchin-app-u62qc.ondigitalocean.app/app/orders/${order._raw.medusa_id}`, '_blank'); else toast.error('ID de orden no disponible'); }}
                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium hover:bg-red-100 transition-colors"
              >
                Reembolsar
              </button>
              <button
                onClick={() => { if (order._raw?.medusa_id) window.open(`https://urchin-app-u62qc.ondigitalocean.app/app/orders/${order._raw.medusa_id}`, '_blank'); else toast.error('ID de orden no disponible'); }}
                className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-[10px] font-medium hover:bg-[var(--surface2)] transition-colors"
              >
                Reembolso parcial
              </button>
            </div>
          </div>

          {/* 8. SHIPPING */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h4 className="text-sm font-medium text-[var(--text)] mb-4 flex items-center gap-2">🚚 Envío</h4>

            {order.tracking ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <CheckCircle size={14} /> Guía generada
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Carrier</span>
                    <span className="text-[var(--text)] font-medium">{order.carrier}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Tracking</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[var(--text)]">{order.tracking}</span>
                      <button onClick={copyTracking} className="p-1 hover:bg-[var(--surface2)] rounded transition-colors">
                        <Copy size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toast.success('Imprimiendo guía...')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[10px] text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors"
                  >
                    <Printer size={12} /> Imprimir Guía
                  </button>
                  <button
                    onClick={() => window.open(`/tracking/${order.number?.replace('#','').replace('DSD-','')}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[10px] text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors"
                  >
                    <ExternalLink size={12} /> Ver rastreo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {['DHL', 'Estafeta', 'FedEx'].map(c => (
                    <button
                      key={c}
                      onClick={() => { toast.success(`${c} seleccionado`); }}
                      className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                        order.carrier === c
                          ? 'border-[var(--accent)] bg-amber-50 text-[var(--accent)] font-medium'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-wood-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toast.success('Guía generada')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
                >
                  🏷️ Generar Guía de Envío
                </button>
              </div>
            )}

            {/* Shipping details */}
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5 text-[10px] text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Precio cobrado</span>
                <span>${order.shipping.toLocaleString()} MXN</span>
              </div>
              {order.items[0]?.weight && (
                <div className="flex justify-between">
                  <span>Peso total</span>
                  <span>{order.items.reduce((sum, i) => sum + (i.weight || 0), 0)} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* 9. QUICK ACTIONS */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h4 className="text-sm font-medium text-[var(--text)] mb-3 flex items-center gap-2">⚡ Acciones Rápidas</h4>
            <div className="space-y-1.5">
              {[
                { icon: Mail, label: 'Notificar al cliente', action: () => setMessageModalOpen(true) },
                { icon: Truck, label: 'Generar guía de envío', action: () => window.location.href = '/admin/shipping' },
                { icon: Printer, label: 'Imprimir orden de producción', action: () => toast.success('Imprimiendo...') },
                { icon: Camera, label: 'Adjuntar foto del producto', action: () => toast.success('Función de adjuntar foto próximamente') },
                { icon: Zap, label: 'Cambiar estado del pedido', action: () => setStatusDropdownOpen(true) },
                { icon: MessageSquare, label: 'Agregar nota interna', action: () => document.querySelector<HTMLTextAreaElement>('textarea')?.focus() },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors text-left"
                >
                  <item.icon size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                  {item.label}
                </button>
              ))}
              <div className="pt-1.5 border-t border-[var(--border)] mt-1.5">
                <button
                  onClick={() => { if (order._raw?.medusa_id) window.open(`https://urchin-app-u62qc.ondigitalocean.app/app/orders/${order._raw.medusa_id}`, '_blank'); else toast.error('Gestiona cancelaciones desde Medusa Admin'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <XIcon size={14} className="flex-shrink-0" /> Cancelar pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ENGRAVING PREVIEW MODAL ===== */}
      <AnimatePresence>
        {engravingPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setEngravingPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{engravingPreview.fileName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{engravingPreview.width} × {engravingPreview.height} cm — {positionLabels[engravingPreview.position]}</p>
                </div>
                <button onClick={() => setEngravingPreview(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg">
                  <XIcon size={16} className="text-[var(--text-muted)]" />
                </button>
              </div>
              <div className="p-4">
                <img src={engravingPreview.previewUrl} alt={engravingPreview.fileName} className="w-full rounded-lg" />
              </div>
              <div className="p-4 border-t border-[var(--border)] flex gap-2">
                <button
                  onClick={() => { toast.success('Descargando...'); setEngravingPreview(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
                >
                  <Download size={14} /> Descargar original
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SEND MESSAGE MODAL ===== */}
      <AnimatePresence>
        {messageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setMessageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-[var(--text)]">Enviar mensaje al cliente</h4>
                  <button onClick={() => setMessageModalOpen(false)} className="p-1.5 hover:bg-[var(--surface2)] rounded-lg">
                    <XIcon size={16} className="text-[var(--text-muted)]" />
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">A: {order.customer.email}</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Templates */}
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Plantilla rápida</p>
                  <div className="space-y-1">
                    {messageTemplates.map(tmpl => (
                      <button
                        key={tmpl}
                        onClick={() => { setSelectedTemplate(tmpl); setMessageText(tmpl); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedTemplate === tmpl ? 'bg-amber-50 text-[var(--accent)] font-medium border border-amber-200' : 'text-[var(--text-secondary)] hover:bg-[var(--surface2)]'}`}
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor */}
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Mensaje</p>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none h-24 outline-none focus:border-wood-400 transition-colors"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-[var(--border)] flex gap-2">
                <button
                  onClick={() => setMessageModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    toast.success('Mensaje enviado al cliente');
                    setMessageModalOpen(false);
                    setMessageText('');
                    setSelectedTemplate('');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors"
                >
                  <Send size={14} /> Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
