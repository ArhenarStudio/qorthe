"use client";

// ═══════════════════════════════════════════════════════════════
// DashboardTab — Visual inventory dashboard with recharts
// Rotación, valor por categoría, movimientos por período
// ═══════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, BarChart3, PieChart as PieIcon, Layers } from "lucide-react";
import {
  InventoryItem, StockMovement, InventoryStats,
  fmt, fmtPct, STOCK_STATUS_CONFIG,
} from "./types";

const COLORS = ['#C5A065', '#2d2419', '#8B7355', '#E8C87A', '#5C4033', '#3B82F6'];

type PeriodDays = 7 | 14 | 30 | 60 | 90;
const PERIOD_OPTIONS: { value: PeriodDays; label: string }[] = [
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
  { value: 90, label: '90 días' },
];

interface Props {
  items: InventoryItem[];
  movements: StockMovement[];
  stats: InventoryStats | null;
}

export const DashboardTab: React.FC<Props> = ({ items, movements, stats }) => {
  const [period, setPeriod] = useState<PeriodDays>(30);
  // ── Value by category ──
  const valueByCategory = useMemo(() => {
    const map = new Map<string, { cost: number; retail: number; units: number }>();
    items.forEach(item => {
      const cat = item.category || "Sin categoría";
      const prev = map.get(cat) || { cost: 0, retail: 0, units: 0 };
      map.set(cat, {
        cost: prev.cost + item.unit_cost * item.current_stock,
        retail: prev.retail + item.unit_price * item.current_stock,
        units: prev.units + item.current_stock,
      });
    });
    return Array.from(map.entries())
      .map(([category, vals]) => ({ category, ...vals }))
      .sort((a, b) => b.retail - a.retail);
  }, [items]);

  // ── Status distribution ──
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = { in_stock: 0, low_stock: 0, out_of_stock: 0, overstock: 0 };
    items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({
        name: STOCK_STATUS_CONFIG[status as keyof typeof STOCK_STATUS_CONFIG]?.label || status,
        value: count,
        fill: status === 'in_stock' ? '#22c55e' : status === 'low_stock' ? '#f59e0b' : status === 'out_of_stock' ? '#ef4444' : '#3b82f6',
      }));
  }, [items]);

  // ── Movements by period ──
  const movementsByDay = useMemo(() => {
    const days = new Map<string, { purchases: number; sales: number; adjustments: number; net: number }>();
    const now = Date.now();
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days.set(key, { purchases: 0, sales: 0, adjustments: 0, net: 0 });
    }
    movements.forEach(m => {
      const key = m.created_at.slice(0, 10);
      const entry = days.get(key);
      if (!entry) return;
      if (m.type === 'purchase' || m.type === 'production' || m.type === 'return') {
        entry.purchases += Math.abs(m.quantity);
      } else if (m.type === 'sale') {
        entry.sales += Math.abs(m.quantity);
      } else {
        entry.adjustments += Math.abs(m.quantity);
      }
      entry.net += m.quantity;
    });
    return Array.from(days.entries()).map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      ...vals,
    }));
  }, [movements, period]);

  // ── Top movers (most active products) ──
  const topMovers = useMemo(() => {
    const map = new Map<string, { title: string; sku: string; total: number; sales: number }>();
    movements.forEach(m => {
      const key = m.inventory_item_id;
      const prev = map.get(key) || { title: m.product_title, sku: m.sku, total: 0, sales: 0 };
      prev.total += Math.abs(m.quantity);
      if (m.type === 'sale') prev.sales += Math.abs(m.quantity);
      map.set(key, prev);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [movements]);

  // ── Location distribution ──
  const locationData = useMemo(() => {
    const map = new Map<string, { units: number; value: number }>();
    items.forEach(item => {
      const loc = item.location || "Sin ubicación";
      const prev = map.get(loc) || { units: 0, value: 0 };
      map.set(loc, { units: prev.units + item.current_stock, value: prev.value + item.unit_cost * item.current_stock });
    });
    return Array.from(map.entries()).map(([name, vals]) => ({ name, ...vals }));
  }, [items]);

  if (!stats || items.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-12 text-center">
        <BarChart3 size={32} className="text-wood-300 mx-auto mb-3" />
        <p className="text-sm text-wood-500">No hay datos suficientes para el dashboard</p>
      </div>
    );
  }

  const margin = stats.total_retail_value > 0
    ? ((stats.total_retail_value - stats.total_cost_value) / stats.total_retail_value * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Row 1: Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Valor Total (costo)" value={fmt(stats.total_cost_value)} icon={<DollarSign size={16} />} color="text-[var(--success)]" bgColor="bg-[var(--success-subtle)]" />
        <MetricCard label="Valor Total (retail)" value={fmt(stats.total_retail_value)} icon={<DollarSign size={16} />} color="text-[var(--info)]" bgColor="bg-[var(--info-subtle)]" />
        <MetricCard label="Margen Promedio" value={fmtPct(margin)} icon={<TrendingUp size={16} />} color="text-accent-gold" bgColor="bg-accent-gold/10" />
        <MetricCard label="Categorías" value={String(valueByCategory.length)} icon={<Layers size={16} />} color="text-[var(--accent)]" bgColor="bg-[var(--accent-subtle)]" />
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-wood-400 uppercase tracking-wider font-bold">Período:</span>
        {PERIOD_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-[var(--radius-card)] transition-colors ${
              period === opt.value ? 'bg-wood-900 text-sand-100' : 'bg-[var(--surface)] text-wood-500 border border-wood-100 hover:border-wood-300'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movements over time */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
          <h4 className="text-sm font-bold text-wood-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-gold" /> Movimientos (últimos {period} días)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={movementsByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e0d8' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="purchases" name="Entradas" stackId="a" fill="#22c55e" fillOpacity={0.3} stroke="#22c55e" strokeWidth={1.5} />
              <Area type="monotone" dataKey="sales" name="Ventas" stackId="b" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={1.5} />
              <Area type="monotone" dataKey="adjustments" name="Ajustes" stackId="c" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution pie */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
          <h4 className="text-sm font-bold text-wood-900 mb-4 flex items-center gap-2">
            <PieIcon size={16} className="text-accent-gold" /> Distribución de Estado
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                labelLine={{ stroke: '#8B7355', strokeWidth: 0.5 }}>
                {statusDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Value by category + Top movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value by category bar chart */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
          <h4 className="text-sm font-bold text-wood-900 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-accent-gold" /> Valor por Categoría
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={valueByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="category" tick={{ fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => fmt(Number(v ?? 0))} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="cost" name="Costo" fill="#C5A065" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retail" name="Retail" fill="#2d2419" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top movers + Location breakdown */}
        <div className="space-y-4">
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
            <h4 className="text-sm font-bold text-wood-900 mb-3">Productos Más Activos</h4>
            <div className="space-y-2">
              {topMovers.length === 0 ? (
                <p className="text-xs text-wood-400">Sin movimientos recientes</p>
              ) : topMovers.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-wood-50 last:border-0">
                  <span className="w-5 h-5 rounded-[var(--radius-badge)] bg-accent-gold/15 text-accent-gold text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-wood-900 truncate">{m.title}</p>
                    <p className="text-[10px] text-wood-400 font-mono">{m.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-wood-900">{m.total} mov.</p>
                    <p className="text-[10px] text-wood-400">{m.sales} ventas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
            <h4 className="text-sm font-bold text-wood-900 mb-3">Por Ubicación</h4>
            <div className="space-y-2">
              {locationData.map((loc, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-wood-600">{loc.name}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-wood-900">{loc.units} uds</span>
                    <span className="text-[10px] text-wood-400 ml-2">{fmt(loc.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string; bgColor: string }> = ({ label, value, icon, color, bgColor }) => (
  <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
    <div className={`w-8 h-8 rounded-[var(--radius-card)] flex items-center justify-center ${bgColor} ${color} mb-2`}>{icon}</div>
    <p className="text-xl font-sans text-wood-900">{value}</p>
    <p className="text-[10px] text-wood-400 uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

export default DashboardTab;
