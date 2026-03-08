"use client";

import React from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, ShoppingBag, TrendingUp,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  ShoppingCart, Star, FileText, Truck,
  CheckCircle, UserPlus, Package, Wifi, WifiOff, Loader2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useAdminData } from '@/hooks/useAdminData';
import type { Period } from './AdminHeader';
import type { AdminPage } from './AdminSidebar';
import { SetupWizard } from './SetupWizard';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

// Setup Wizard wrapper — shows only if setup not completed
const SetupWizardWrapper: React.FC = () => {
  const { setupCompleted, setSetupCompleted } = useAdminTheme();
  const [dismissed, setDismissed] = React.useState(false);

  if (setupCompleted || dismissed) return null;

  return (
    <SetupWizard
      onComplete={() => setSetupCompleted(true)}
      onDismiss={() => setDismissed(true)}
    />
  );
};

const iconMap: Record<string, React.ElementType> = {
  'shopping-bag': ShoppingCart,
  'star': Star,
  'alert-triangle': AlertTriangle,
  'file-text': FileText,
  'user-plus': UserPlus,
  'check-circle': CheckCircle,
};

const typeColorMap: Record<string, string> = {
  order: 'bg-blue-50 text-blue-600',
  review: 'bg-amber-50 text-amber-600',
  stock: 'bg-red-50 text-red-600',
  quote: 'bg-purple-50 text-purple-600',
  customer: 'bg-green-50 text-green-600',
};

interface Props {
  period: Period;
  onNavigate: (page: AdminPage) => void;
}

const periodQueryMap: Record<Period, string> = {
  today: 'today',
  '7days': '7days',
  '30days': '30days',
  custom: '90days',
};

const fmtMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const DashboardHome: React.FC<Props> = ({ period, onNavigate }) => {
  const [chartView, setChartView] = React.useState<'revenue' | 'orders'>('revenue');

  const periodQ = periodQueryMap[period] || '7days';
  const { data: liveData, loading: liveLoading, error: liveError } = useAdminData<{
    kpis: {
      total_revenue: number;
      order_count: number;
      pending_orders: number;
      shipped_orders: number;
      canceled_count: number;
      product_count: number;
      customer_count: number;
      avg_order_value: number;
    };
    recent_orders: any[];
    low_stock: any[];
    daily_chart: { day: string; revenue: number; orders: number }[];
    activity_feed: { id: string; type: string; title: string; description: string; time: string; icon: string }[];
    top_products: { title: string; thumbnail: string; revenue: number; sold: number }[];
  }>(`/api/admin/dashboard?period=${periodQ}`, { refreshInterval: 60_000 });

  const isLive = !!liveData && !liveError;
  const k = liveData?.kpis;

  // KPIs — real data with zero-value fallback (never mock)
  const kpis = [
    { label: 'Ventas del periodo', value: fmtMXN(k?.total_revenue || 0), change: `${k?.order_count || 0} pedidos`, up: (k?.total_revenue || 0) > 0, icon: DollarSign, color: 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]' },
    { label: 'Pedidos', value: String(k?.order_count || 0), change: `${k?.pending_orders || 0} pendientes`, up: true, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', highlight: (k?.pending_orders || 0) > 0 },
    { label: 'Ticket promedio', value: fmtMXN(k?.avg_order_value || 0), change: `${k?.product_count || 0} productos`, up: true, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Clientes', value: String(k?.customer_count || 0), change: `${k?.shipped_orders || 0} enviados`, up: true, icon: UserPlus, color: 'bg-purple-50 text-purple-600' },
  ];

  // Chart data — real daily aggregation
  const chartData = liveData?.daily_chart || [];

  // Activity feed — real events
  const activityFeed = liveData?.activity_feed || [];

  // Pending orders from recent_orders
  const pendingOrders = (liveData?.recent_orders || []).filter(
    (o: any) => o.fulfillment_status === 'not_fulfilled' || o.fulfillment_status === 'partially_fulfilled'
  );

  // Top products — real from order items
  const topProducts = liveData?.top_products || [];

  // Low stock alerts
  const lowStock = liveData?.low_stock || [];

  // Pending actions — built from real counts
  const pendingActions = [
    ...(k?.pending_orders ? [{ label: `${k.pending_orders} pedido(s) pendientes de envío`, action: () => onNavigate('shipping') }] : []),
    ...(k?.canceled_count ? [{ label: `${k.canceled_count} pedido(s) cancelados requieren revisión`, action: () => onNavigate('returns') }] : []),
    ...(lowStock.length > 0 ? [{ label: `${lowStock.length} producto(s) con stock bajo`, action: () => onNavigate('inventory') }] : []),
  ];

  if (liveLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-[var(--admin-muted)]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setup Wizard — shows if not completed */}
      <SetupWizardWrapper />

      {/* Live data indicator */}
      <div className={`flex items-center gap-1.5 text-[10px] ${isLive ? 'text-green-600' : 'text-[var(--admin-muted)]'}`}>
        {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
        {isLive ? 'Datos en vivo de Medusa' : 'Sin conexión a Medusa'}
        {liveError && <span className="text-red-400 ml-2">· {liveError}</span>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                kpi.highlight ? 'bg-amber-50 text-amber-600' : kpi.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}>
                {!kpi.highlight && (kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
                {kpi.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--admin-text)] font-sans">{kpi.value}</h3>
            <p className="text-[11px] text-[var(--admin-muted)] uppercase tracking-wider mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart — REAL daily data */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--admin-text)] text-sm">Ventas del periodo</h3>
            <div className="flex bg-[var(--admin-surface2)] rounded-lg p-0.5">
              <button
                onClick={() => setChartView('revenue')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${chartView === 'revenue' ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm' : 'text-[var(--admin-text-secondary)]'}`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${chartView === 'orders' ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm' : 'text-[var(--admin-text-secondary)]'}`}
              >
                Pedidos
              </button>
            </div>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--admin-muted)] text-sm">
                Sin datos de ventas en este periodo
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'revenue' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#2d2419', border: 'none', borderRadius: 8, color: '#f5f0e8', fontSize: 12 }}
                      formatter={(value: any) => [`$${value.toLocaleString()} MXN`, 'Ingresos']}
                    />
                    <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#C5A065" strokeWidth={2.5} dot={{ fill: '#C5A065', r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#2d2419', border: 'none', borderRadius: 8, color: '#f5f0e8', fontSize: 12 }} />
                    <Bar dataKey="orders" name="Pedidos" fill="#C5A065" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Activity Feed — REAL events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm"
        >
          <div className="px-5 py-4 border-b border-[var(--admin-border)]">
            <h3 className="font-medium text-[var(--admin-text)] text-sm">Actividad reciente</h3>
          </div>
          <div className="divide-y divide-wood-50 max-h-[340px] overflow-y-auto">
            {activityFeed.length === 0 ? (
              <div className="p-8 text-center text-[var(--admin-muted)] text-xs">Sin actividad reciente</div>
            ) : (
              activityFeed.map(item => {
                const IconComp = iconMap[item.icon] || Package;
                return (
                  <div key={item.id} className="px-5 py-3 hover:bg-[var(--admin-surface2)]/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColorMap[item.type] || 'bg-gray-50 text-gray-500'}`}>
                        <IconComp size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--admin-text)] truncate">{item.title}</p>
                        <p className="text-[11px] text-[var(--admin-text-secondary)] truncate">{item.description}</p>
                        <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Pending Orders + Top Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders — REAL from Medusa */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center justify-between">
            <h3 className="font-medium text-[var(--admin-text)] text-sm">Pedidos que requieren acción</h3>
            <button onClick={() => onNavigate('orders')} className="text-[10px] text-[var(--admin-accent)] font-bold uppercase tracking-widest hover:underline">
              Ver todos
            </button>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="p-10 text-center text-[var(--admin-muted)] text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No hay pedidos pendientes de acción</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)]">
                    <th className="px-5 py-3">Pedido</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {pendingOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                      <td className="px-5 py-3 text-xs font-medium text-[var(--admin-text)]">#{order.display_id}</td>
                      <td className="px-5 py-3 text-xs text-[var(--admin-text-secondary)]">{order.email?.split('@')[0] || 'Cliente'}</td>
                      <td className="px-5 py-3 text-xs text-[var(--admin-text)] font-medium">{fmtMXN(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          order.payment_status === 'captured' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                          {order.payment_status === 'captured' ? 'Listo para envío' : 'Pendiente pago'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => onNavigate('orders')} className="text-[10px] font-bold text-[var(--admin-accent)] uppercase tracking-wider hover:underline">
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right Column: Top Products + Pending Actions */}
        <div className="space-y-6">
          {/* Top Products — REAL from order items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm"
          >
            <div className="px-5 py-4 border-b border-[var(--admin-border)]">
              <h3 className="font-medium text-[var(--admin-text)] text-sm">Top productos</h3>
            </div>
            <div className="divide-y divide-wood-50">
              {topProducts.length === 0 ? (
                <div className="p-6 text-center text-[var(--admin-muted)] text-xs">Sin ventas en este periodo</div>
              ) : (
                topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--admin-surface2)]/50 transition-colors">
                    <span className="text-[10px] text-[var(--admin-muted)] font-medium w-4">{idx + 1}</span>
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[var(--admin-surface2)] flex items-center justify-center">
                        <Package size={14} className="text-[var(--admin-muted)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--admin-text)] truncate">{p.title}</p>
                      <p className="text-[10px] text-[var(--admin-muted)]">{p.sold} uds — {fmtMXN(p.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Pending Actions — REAL from KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm"
          >
            <div className="px-5 py-4 border-b border-[var(--admin-border)]">
              <h3 className="font-medium text-[var(--admin-text)] text-sm">Pendientes rápidos</h3>
            </div>
            <div className="divide-y divide-wood-50">
              {pendingActions.length === 0 ? (
                <div className="p-6 text-center text-[var(--admin-muted)] text-xs flex flex-col items-center gap-2">
                  <CheckCircle size={16} className="opacity-30" />
                  Todo al día
                </div>
              ) : (
                pendingActions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-[var(--admin-surface2)]/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--admin-accent)] flex-shrink-0" />
                    <p className="text-xs text-[var(--admin-text)]">{item.label}</p>
                    <ArrowUpRight size={12} className="ml-auto text-[var(--admin-muted)]" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
