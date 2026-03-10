"use client";

import React from 'react';
import {
  TrendingUp, TrendingDown, Activity,
  DollarSign, ShoppingBag, UserPlus, Package,
  Wifi, WifiOff, Loader2, CheckCircle,
  ShoppingCart, Star, AlertTriangle, FileText,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useAdminData } from '@/hooks/useAdminData';
import type { AdminPage } from './AdminSidebar';
import { SetupWizard } from './SetupWizard';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

// ── Setup Wizard wrapper ───────────────────────────────────────
const SetupWizardWrapper: React.FC = () => {
  const { theme } = useAdminTheme();
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <SetupWizard
      onComplete={() => setDismissed(true)}
      onDismiss={() => setDismissed(true)}
    />
  );
};

// ── Icon map para activity feed ────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  'shopping-bag': ShoppingCart,
  'star': Star,
  'alert-triangle': AlertTriangle,
  'file-text': FileText,
  'user-plus': UserPlus,
  'check-circle': CheckCircle,
};

const fmtMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const periodQueryMap: Record<string, string> = {
  today: 'today', '7days': '7days', '30days': '30days', custom: '90days',
};

interface Props {
  period: string;
  onNavigate: (page: AdminPage) => void;
}

export const DashboardHome: React.FC<Props> = ({ period, onNavigate }) => {
  const [chartView, setChartView] = React.useState<'revenue' | 'orders'>('revenue');
  const periodQ = periodQueryMap[period] || '7days';

  const { data: liveData, loading: liveLoading, error: liveError } = useAdminData<{
    kpis: {
      total_revenue: number; order_count: number; pending_orders: number;
      shipped_orders: number; canceled_count: number; product_count: number;
      customer_count: number; avg_order_value: number;
    };
    recent_orders: any[];
    low_stock: any[];
    daily_chart: { day: string; revenue: number; orders: number }[];
    activity_feed: { id: string; type: string; title: string; description: string; time: string; icon: string }[];
    top_products: { title: string; thumbnail: string; revenue: number; sold: number }[];
  }>(`/api/admin/dashboard?period=${periodQ}`, { refreshInterval: 60_000 });

  const isLive = !!liveData && !liveError;
  const k = liveData?.kpis;

  const kpis = [
    { label: 'Ventas del período', value: fmtMXN(k?.total_revenue || 0), change: `${k?.order_count || 0} pedidos`, up: (k?.total_revenue || 0) > 0, icon: DollarSign },
    { label: 'Pedidos', value: String(k?.order_count || 0), change: `${k?.pending_orders || 0} pendientes`, up: true, icon: ShoppingBag },
    { label: 'Ticket promedio', value: fmtMXN(k?.avg_order_value || 0), change: `${k?.product_count || 0} productos`, up: true, icon: TrendingUp },
    { label: 'Clientes', value: String(k?.customer_count || 0), change: `${k?.shipped_orders || 0} enviados`, up: true, icon: UserPlus },
  ];

  const chartData = liveData?.daily_chart || [];
  const activityFeed = liveData?.activity_feed || [];
  const topProducts = liveData?.top_products || [];
  const lowStock = liveData?.low_stock || [];

  const pendingOrders = (liveData?.recent_orders || []).filter(
    (o: any) => o.fulfillment_status === 'not_fulfilled' || o.fulfillment_status === 'partially_fulfilled'
  );

  const pendingActions = [
    ...(k?.pending_orders ? [{ label: `${k.pending_orders} pedido(s) pendientes de envío`, action: () => onNavigate('shipping') }] : []),
    ...(k?.canceled_count ? [{ label: `${k.canceled_count} pedido(s) cancelados requieren revisión`, action: () => onNavigate('returns') }] : []),
    ...(lowStock.length > 0 ? [{ label: `${lowStock.length} producto(s) con stock bajo`, action: () => onNavigate('inventory') }] : []),
  ];

  if (liveLoading) {
    return (
      <div className="flex items-center justify-center py-32" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span style={{ fontSize: '13px' }}>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SetupWizardWrapper />

      {/* Live indicator */}
      <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: isLive ? 'var(--success)' : 'var(--text-muted)' }}>
        {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isLive ? 'Datos en vivo' : 'Sin conexión a Medusa'}
        {liveError && <span style={{ color: 'var(--error)', marginLeft: '8px' }}>· {liveError}</span>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kpi.label}
            </div>
            <div className="flex items-end justify-between">
              <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                {kpi.value}
              </div>
              <div className="flex items-center gap-1" style={{ color: kpi.up ? 'var(--success)' : 'var(--error)' }}>
                {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfica + Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica */}
        <div
          className="lg:col-span-2 p-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
              Ventas del período
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {(['revenue', 'orders'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: chartView === v ? 'var(--accent)' : 'var(--surface2)',
                      color: chartView === v ? 'var(--accent-text)' : 'var(--text-secondary)',
                      border: `1px solid ${chartView === v ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-button)',
                      cursor: 'pointer',
                    }}
                  >
                    {v === 'revenue' ? 'Ingresos' : 'Pedidos'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={13} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--success)' }}>LIVE</span>
              </div>
            </div>
          </div>
          <div style={{ height: '240px' }}>
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Sin datos en este período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'revenue' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 0, color: 'var(--text)', fontSize: 12 }} formatter={(v: any) => [`$${v.toLocaleString()} MXN`, 'Ingresos']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 0, color: 'var(--text)', fontSize: 12 }} />
                    <Bar dataKey="orders" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
              Actividad reciente
            </h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            {activityFeed.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin actividad reciente</div>
            ) : (
              activityFeed.map((item, idx) => {
                const IconComp = iconMap[item.icon] || Package;
                return (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-start gap-3"
                    style={{ borderBottom: idx < activityFeed.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)', borderRadius: 'var(--radius-badge)' }}>
                      <IconComp size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }} className="truncate">{item.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }} className="truncate">{item.description}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pedidos pendientes + Top products + Pendientes rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pedidos pendientes */}
        <div className="lg:col-span-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
              Pedidos que requieren acción
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Ver todos →
            </button>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              <CheckCircle size={24} style={{ opacity: 0.2 }} />
              No hay pedidos pendientes de acción
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Pedido', 'Cliente', 'Total', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="text-left px-5 py-3" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order: any, idx: number) => (
                    <tr
                      key={order.id}
                      style={{ borderBottom: idx < pendingOrders.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td className="px-5 py-3" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}>#{order.display_id}</td>
                      <td className="px-5 py-3" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.email?.split('@')[0] || 'Cliente'}</td>
                      <td className="px-5 py-3" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>{fmtMXN(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1" style={{ fontSize: '10px', fontWeight: 700, backgroundColor: order.payment_status === 'captured' ? 'var(--warning-subtle)' : 'var(--surface2)', color: order.payment_status === 'captured' ? 'var(--warning)' : 'var(--text-muted)', border: `1px solid ${order.payment_status === 'captured' ? 'var(--warning)' : 'var(--border)'}`, borderRadius: 'var(--radius-badge)' }}>
                          {order.payment_status === 'captured' ? 'Listo para envío' : 'Pendiente pago'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => onNavigate('orders')} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Top productos */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>Top productos</h3>
            </div>
            <div>
              {topProducts.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin ventas en este período</div>
              ) : (
                topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: idx < topProducts.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, width: '16px' }}>{idx + 1}</span>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt={p.title} className="w-8 h-8 object-cover flex-shrink-0" style={{ borderRadius: 'var(--radius-card)' }} />
                      : <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--surface2)', borderRadius: 'var(--radius-card)' }}><Package size={13} style={{ color: 'var(--text-muted)' }} /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }} className="truncate">{p.title}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.sold} uds — {fmtMXN(p.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alertas de stock bajo */}
          {lowStock.length > 0 && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>Stock bajo</h3>
              </div>
              <div className="p-4 space-y-2">
                {lowStock.map((item: any, idx: number) => (
                  <div key={idx} className="p-3" style={{ backgroundColor: 'var(--warning-subtle)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-card)' }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{item.title || item.name}</span>
                      <span className="px-2 py-0.5" style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', backgroundColor: 'var(--warning)', color: 'var(--bg)', borderRadius: 'var(--radius-badge)' }}>
                        {item.inventory_quantity ?? item.stock} uds
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendientes rápidos */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>Pendientes rápidos</h3>
            </div>
            {pendingActions.length === 0 ? (
              <div className="p-6 flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                <CheckCircle size={16} style={{ opacity: 0.3 }} />
                Todo al día
              </div>
            ) : (
              pendingActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left"
                  style={{ borderBottom: idx < pendingActions.length - 1 ? '1px solid var(--border)' : 'none', background: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text)', flex: 1 }}>{item.label}</p>
                  <ArrowUpRight size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
