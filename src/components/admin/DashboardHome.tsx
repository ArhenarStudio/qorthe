"use client";

import React from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, ShoppingBag, TrendingUp, Eye,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  ShoppingCart, Star, FileText, Truck,
  CheckCircle, UserPlus, Package, Wifi, WifiOff
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { salesChartData, activityFeed, orders, adminProducts } from '@/data/adminMockData';
import { useAdminData } from '@/hooks/useAdminData';
import type { Period } from './AdminHeader';
import type { AdminPage } from './AdminSidebar';

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

// Period → query param map
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

  // ── Live data from Medusa ──
  const periodQ = periodQueryMap[period] || '7days';
  const { data: liveData, loading: liveLoading, error: liveError } = useAdminData<{
    kpis: {
      total_revenue: number;
      order_count: number;
      pending_orders: number;
      shipped_orders: number;
      product_count: number;
      customer_count: number;
      avg_order_value: number;
    };
    recent_orders: any[];
    low_stock: any[];
  }>(`/api/admin/dashboard?period=${periodQ}`, { refreshInterval: 60_000 });

  const isLive = !!liveData && !liveError;
  const k = liveData?.kpis;

  const kpis = k
    ? [
        { label: 'Ventas del periodo', value: fmtMXN(k.total_revenue), change: `${k.order_count} pedidos`, up: true, icon: DollarSign, color: 'bg-accent-gold/10 text-accent-gold' },
        { label: 'Pedidos', value: String(k.order_count), change: `${k.pending_orders} pendientes`, up: true, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', highlight: k.pending_orders > 0 },
        { label: 'Ticket promedio', value: fmtMXN(k.avg_order_value), change: `${k.product_count} productos`, up: true, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
        { label: 'Clientes', value: String(k.customer_count), change: `${k.shipped_orders} enviados`, up: true, icon: UserPlus, color: 'bg-purple-50 text-purple-600' },
      ]
    : [
        { label: 'Ventas del periodo', value: '$124,500', change: '+12.4%', up: true, icon: DollarSign, color: 'bg-accent-gold/10 text-accent-gold' },
        { label: 'Pedidos', value: '45', change: '3 pendientes', up: true, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', highlight: true },
        { label: 'Ticket promedio', value: '$2,766', change: '+8.2%', up: true, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
        { label: 'Visitantes', value: '3,240', change: '-2.1%', up: false, icon: Eye, color: 'bg-purple-50 text-purple-600' },
      ];

  const pendingOrders = orders.filter(o => o.shippingStatus === 'pending' || o.shippingStatus === 'production');
  const topProducts = [...adminProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const pendingActions = [
    { label: '3 reviews pendientes de aprobación', action: () => onNavigate('reviews') },
    { label: '1 cotización sin responder', action: () => onNavigate('quotes') },
    { label: '2 pedidos listos para enviar', action: () => onNavigate('shipping') },
  ];

  return (
    <div className="space-y-6">
      {/* Live data indicator */}
      {!liveLoading && (
        <div className={`flex items-center gap-1.5 text-[10px] ${
          isLive ? 'text-green-600' : 'text-wood-400'
        }`}>
          {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
          {isLive ? 'Datos en vivo de Medusa' : 'Datos de demostración (mock)'}
          {liveError && <span className="text-red-400 ml-2">· {liveError}</span>}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white p-5 rounded-xl border border-wood-100 shadow-sm"
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
            <h3 className="text-2xl font-bold text-wood-900 font-sans">{kpi.value}</h3>
            <p className="text-[11px] text-wood-400 uppercase tracking-wider mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-wood-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-wood-900 text-sm">Ventas del periodo</h3>
            <div className="flex bg-sand-50 rounded-lg p-0.5">
              <button
                onClick={() => setChartView('revenue')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${chartView === 'revenue' ? 'bg-white text-wood-900 shadow-sm' : 'text-wood-500'}`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${chartView === 'orders' ? 'bg-white text-wood-900 shadow-sm' : 'text-wood-500'}`}
              >
                Pedidos
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'revenue' ? (
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#2d2419', border: 'none', borderRadius: 8, color: '#f5f0e8', fontSize: 12 }}
                    formatter={(value: any) => [`$${value.toLocaleString()} MXN`, '']}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" name="Este periodo" stroke="#C5A065" strokeWidth={2.5} dot={{ fill: '#C5A065', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="prevRevenue" name="Periodo anterior" stroke="#D7CCC8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              ) : (
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#A1887F' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#2d2419', border: 'none', borderRadius: 8, color: '#f5f0e8', fontSize: 12 }} />
                  <Bar dataKey="orders" name="Pedidos" fill="#C5A065" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-wood-100 shadow-sm"
        >
          <div className="px-5 py-4 border-b border-wood-100">
            <h3 className="font-medium text-wood-900 text-sm">Actividad reciente</h3>
          </div>
          <div className="divide-y divide-wood-50 max-h-[340px] overflow-y-auto">
            {activityFeed.map(item => {
              const IconComp = iconMap[item.icon] || Package;
              return (
                <div key={item.id} className="px-5 py-3 hover:bg-sand-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColorMap[item.type] || 'bg-gray-50 text-gray-500'}`}>
                      <IconComp size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-wood-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-wood-500 truncate">{item.description}</p>
                      <p className="text-[10px] text-wood-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Pending Orders + Top Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-wood-100 flex items-center justify-between">
            <h3 className="font-medium text-wood-900 text-sm">Pedidos que requieren acción</h3>
            <button onClick={() => onNavigate('orders')} className="text-[10px] text-accent-gold font-bold uppercase tracking-widest hover:underline">
              Ver todos
            </button>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="p-10 text-center text-wood-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                    <th className="px-5 py-3">Pedido</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Estado envío</th>
                    <th className="px-5 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {pendingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-sand-50/50 transition-colors">
                      <td className="px-5 py-3 text-xs font-medium text-wood-900">{order.number}</td>
                      <td className="px-5 py-3 text-xs text-wood-600">{order.customer.name}</td>
                      <td className="px-5 py-3 text-xs text-wood-900 font-medium">${order.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          order.shippingStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {order.shippingStatus === 'pending' ? 'Pendiente' : 'En producción'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="text-[10px] font-bold text-accent-gold uppercase tracking-wider hover:underline">
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
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-xl border border-wood-100 shadow-sm"
          >
            <div className="px-5 py-4 border-b border-wood-100">
              <h3 className="font-medium text-wood-900 text-sm">Top productos</h3>
            </div>
            <div className="divide-y divide-wood-50">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-sand-50/50 transition-colors">
                  <span className="text-[10px] text-wood-400 font-medium w-4">{idx + 1}</span>
                  <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-wood-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-wood-400">{p.soldUnits} uds — ${p.revenue.toLocaleString()}</p>
                  </div>
                  {p.stock <= p.reorderPoint && (
                    <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Stock bajo</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-wood-100 shadow-sm"
          >
            <div className="px-5 py-4 border-b border-wood-100">
              <h3 className="font-medium text-wood-900 text-sm">Pendientes rápidos</h3>
            </div>
            <div className="divide-y divide-wood-50">
              {pendingActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-sand-50/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-gold flex-shrink-0" />
                  <p className="text-xs text-wood-700">{item.label}</p>
                  <ArrowUpRight size={12} className="ml-auto text-wood-400" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
