"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion,  } from 'motion/react';
import {
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart as PieChartIcon, Wallet, Receipt, FileText, Settings2,
  Download, Printer, ChevronDown, Lightbulb, AlertTriangle, CheckCircle,
  ExternalLink, Mail, Send, Clock, Calendar, Zap, MapPin, Layers,
  ShoppingCart, Users, Tag, Truck, X, Eye, MoreHorizontal, Plus
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, ReferenceLine, ComposedChart
} from 'recharts';
// Finance data hook — reads from API with mock fallback for fields not yet calculable
const FinanceDataContext = React.createContext<any>(null);
const useFinanceData = () => React.useContext(FinanceDataContext);
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ===== TYPES =====
type TabId = 'general' | 'ingresos' | 'costos' | 'inventario' | 'pagos' | 'flujo' | 'reportes';

// ===== CONSTANTS =====
const COLORS = ['var(--accent)', 'var(--text-secondary)', 'var(--text-muted)', 'var(--border)', 'var(--text-secondary)', 'var(--text-muted)'];
const DONUT_COLORS = ['var(--accent)', 'var(--text-secondary)', 'var(--text-muted)', 'var(--border)', 'var(--text-secondary)'];

const tabItems: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'Panel General', icon: BarChart3 },
  { id: 'ingresos', label: 'Ingresos', icon: DollarSign },
  { id: 'costos', label: 'Costos y Gastos', icon: TrendingDown },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'pagos', label: 'Pagos y Comisiones', icon: CreditCard },
  { id: 'flujo', label: 'Flujo de Efectivo', icon: Wallet },
  { id: 'reportes', label: 'Reportes', icon: FileText },
];

const periods = ['Hoy', 'Esta semana', 'Este mes', 'Este trimestre', 'Este año', 'Últimos 12 meses'];

const fmt = (n: number) => `$${n.toLocaleString('es-MX')}`;
const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}k`;

// ===== SHARED COMPONENTS =====
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[var(--surface)] rounded-none border border-[var(--border)] shadow-sm ${className}`}>{children}</div>
);

const Insight: React.FC<{ text: string; type?: 'info' | 'warning' | 'success' }> = ({ text, type = 'info' }) => {
  const styles = { info: 'bg-[var(--info-subtle)] border-[var(--info)] text-blue-800', warning: 'bg-[var(--warning-subtle)] border-[var(--warning)] text-amber-800', success: 'bg-[var(--success-subtle)] border-[var(--success)] text-[var(--success)]' };
  const icons = { info: Lightbulb, warning: AlertTriangle, success: CheckCircle };
  const Icon = icons[type];
  return (
    <div className={`flex items-start gap-2 p-3 rounded-none border text-xs ${styles[type]}`}>
      <Icon size={14} className="mt-0.5 shrink-0" /><span>{text}</span>
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-sm font-medium text-[var(--text)] uppercase tracking-wider border-b border-[var(--border)] pb-2 mb-4">{children}</h4>
);

// Donut component
const DonutChart: React.FC<{ data: { name: string; value: number; pct: number }[]; title: string }> = ({ data, title }) => (
  <Card className="p-5">
    <h5 className="text-xs font-medium text-[var(--text)] mb-3">{title}</h5>
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
            {data.map((_: any, i: number) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
          </Pie>
          <RTooltip contentStyle={{ background: 'var(--text)', border: 'none', borderRadius: 8, color: 'var(--surface2)', fontSize: 11 }} formatter={(v: any) => [fmt(v), '']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="space-y-1.5 mt-1">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="text-[var(--text-secondary)] truncate">{d.name}</span>
          </div>
          <span className="font-medium text-[var(--text)]">{d.pct}%</span>
        </div>
      ))}
    </div>
  </Card>
);

const chartTooltipStyle = { background: 'var(--text)', border: 'none', borderRadius: 8, color: 'var(--surface2)', fontSize: 11 };

// ===== TAB: PANEL GENERAL =====
const PanelGeneral: React.FC = () => {
  const d = useFinanceData();
  // P&L table data
  const plRows = [
    { label: '(+) Ingresos por ventas (catálogo)', value: 118400, pct: 83.0, indent: false, sign: '+' },
    { label: '(+) Ingresos por cotizaciones', value: 18200, pct: 12.7, indent: false, sign: '+' },
    { label: '(+) Ingresos por servicio de grabado', value: 6200, pct: 4.3, indent: false, sign: '+' },
    { label: '= INGRESOS BRUTOS', value: 142800, pct: 100, indent: false, sign: '=', bold: true },
    { label: '(−) Costo de productos vendidos (COGS)', value: -57120, pct: 40.0, indent: false, sign: '-' },
    { label: '= GANANCIA BRUTA', value: 85680, pct: 60.0, indent: false, sign: '=', bold: true },
    { label: '(−) Costos de envío absorbidos', value: -8400, pct: 5.9, indent: true, sign: '-' },
    { label: '(−) Comisiones Stripe', value: -3850, pct: 2.7, indent: true, sign: '-' },
    { label: '(−) Comisiones MercadoPago', value: -1240, pct: 0.9, indent: true, sign: '-' },
    { label: '(−) Descuentos y cupones otorgados', value: -8200, pct: 5.7, indent: true, sign: '-' },
    { label: '(−) Puntos de lealtad canjeados', value: -422, pct: 0.3, indent: true, sign: '-' },
    { label: '(−) Costos operativos', value: -25148, pct: 17.6, indent: true, sign: '-' },
    { label: '= GANANCIA NETA', value: 38420, pct: 26.9, indent: false, sign: '=', bold: true, highlight: true },
  ];

  const businessMetrics = [
    { icon: Receipt, label: 'Ticket promedio', value: fmt(d.avgTicket), sub: `+$${d.avgTicket - d.avgTicketPrev} vs anterior` },
    { icon: ShoppingCart, label: 'Pedidos totales', value: d.totalOrders.toString(), sub: `+${d.totalOrders - d.totalOrdersPrev} vs anterior · ${(d.totalOrders / 28).toFixed(1)} pedidos/día` },
    { icon: DollarSign, label: 'Ingresos diarios promedio', value: fmt(d.dailyRevenueAvg), sub: `+$${d.dailyRevenueAvg - d.dailyRevenueAvgPrev} vs anterior` },
    { icon: BarChart3, label: 'Customer Lifetime Value', value: fmt(d.clv), sub: `+$${d.clv - d.clvPrev} vs anterior` },
    { icon: Users, label: 'Tasa de recompra', value: `${d.repurchaseRate}%`, sub: `+${d.repurchaseRate - d.repurchaseRatePrev}pp vs anterior` },
    { icon: FileText, label: 'Ticket promedio cotizaciones', value: fmt(d.avgQuoteTicket), sub: `${(d.avgQuoteTicket / d.avgTicket).toFixed(1)}x ticket catálogo` },
    { icon: Tag, label: 'Tasa de descuento promedio', value: `${d.discountRate}%`, sub: `(${fmt(d.totalDiscounts)} total)` },
    { icon: Truck, label: 'Costo envío promedio/pedido', value: fmt(d.avgShippingCost), sub: `+$${d.avgShippingCost - d.avgShippingCostPrev} vs anterior` },
    { icon: Zap, label: 'Ingresos por grabado láser', value: fmt(d.engravingRevenue), sub: `${d.engravingPct}% de ingresos` },
  ];

  // Waterfall bar data for recharts
  const waterfallBars = useMemo(() => {
    let running = 0;
    return d.waterfallData.map((item: any) => {
      const start = item.type === 'profit' ? 0 : (item.type === 'income' ? 0 : running + item.value);
      const height = Math.abs(item.value);
      if (item.type === 'income') running = item.value;
      else if (item.type === 'cost') running += item.value;
      return { ...item, start, height, displayValue: item.value };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* P&L */}
      <Card className="p-5">
        <SectionTitle>Estado de Resultados Simplificado (P&L)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody>
              {plRows.map((r, i) => (
                <tr key={i} className={`${r.bold ? 'border-t border-[var(--border)]' : ''} ${r.highlight ? 'bg-[var(--success-subtle)]' : ''}`}>
                  <td className={`py-1.5 pr-4 text-xs ${r.indent ? 'pl-6' : 'pl-0'} ${r.bold ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>
                    {r.label}
                  </td>
                  <td className={`py-1.5 text-xs text-right font-mono tabular-nums ${r.bold ? 'font-semibold text-[var(--text)]' : r.value < 0 ? 'text-[var(--error)]' : 'text-[var(--text)]'}`}>
                    {r.value < 0 ? `-${fmt(Math.abs(r.value))}` : fmt(r.value)}
                  </td>
                  <td className="py-1.5 text-[10px] text-right text-[var(--text-muted)] pl-3 w-16">{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-3 italic">* Costos operativos: hosting, herramientas, Neon DB, Vercel, DigitalOcean, dominio, insumos taller, mano de obra</p>
      </Card>

      {/* Waterfall */}
      <Card className="p-5">
        <SectionTitle>Cascada: De Ingresos a Ganancia Neta</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallBars} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [fmt(Math.abs(v)), '']} />
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="height" stackId="a" radius={[4, 4, 0, 0]}>
                {waterfallBars.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue vs Costs Chart */}
      <Card className="p-5">
        <SectionTitle>Ingresos vs Costos (Mensual)</SectionTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any, name: any) => [fmt(v), name]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Ingresos" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" name="COGS" fill="var(--border)" radius={[4, 4, 0, 0]} />
              <Line dataKey="netProfit" name="Ganancia neta" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Business Metrics */}
      <div>
        <SectionTitle>Métricas Clave de Negocio</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {businessMetrics.map((m, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                  <m.icon size={16} className="text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-[var(--text)] font-sans">{m.value}</p>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{m.label}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{m.sub}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4 Donut Charts */}
      <div>
        <SectionTitle>Distribución de Ingresos</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DonutChart data={d.revenueBySource} title="Por fuente de ingreso" />
          <DonutChart data={d.revenueByCategory} title="Por categoría de producto" />
          <DonutChart data={d.revenueByPayment} title="Por método de pago" />
          <DonutChart data={d.revenueByClientType} title="Por tipo de cliente" />
        </div>
      </div>

      {/* Projection */}
      <Card className="p-5">
        <SectionTitle>Proyección (Próximos 3 Meses)</SectionTitle>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Basado en tendencia de los últimos 6 meses + cotizaciones en pipeline</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [fmt(v), '']} />
              <Area dataKey="max" stackId="band" stroke="none" fill="var(--accent)" fillOpacity={0.15} />
              <Area dataKey="min" stackId="band" stroke="none" fill="var(--surface)" fillOpacity={1} />
              <Line dataKey="central" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4, fill: 'var(--accent)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {d.projection.filter((p: any) => !p.isActual).map((p: any) => (
            <div key={p.month} className="text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text)]">{p.month}:</span> {fmt(p.min)} — {fmt(p.max)}
            </div>
          ))}
        </div>
        {d.projectionNotes.map((n: any, i: number) => <Insight key={i} text={n} />)}
      </Card>
    </div>
  );
};

// ===== TAB: INGRESOS =====
const IngresosTab: React.FC = () => {
  const d = useFinanceData();
  const avgRevenue = useMemo(() => d.dailyRevenue.reduce((s: number, r: any) => s + r.revenue, 0) / (d.dailyRevenue.length || 1), []);

  return (
    <div className="space-y-6">
      {/* Daily revenue chart */}
      <Card className="p-5">
        <SectionTitle>Ingresos por día</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any, name: any) => [name === 'revenue' ? fmt(v) : v, name === 'revenue' ? 'Ingresos' : 'Pedidos']} />
              <ReferenceLine y={avgRevenue} stroke="var(--accent)" strokeDasharray="5 5" label={{ value: `Prom: ${fmt(Math.round(avgRevenue))}`, position: 'right', fontSize: 10, fill: 'var(--accent)' }} />
              <Bar dataKey="revenue" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top products */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <SectionTitle>Top productos por ingresos</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2.5">#</th>
                <th className="px-5 py-2.5">Producto</th>
                <th className="px-5 py-2.5 text-right">Uds</th>
                <th className="px-5 py-2.5 text-right">Ingresos</th>
                <th className="px-5 py-2.5 text-right">% total</th>
                <th className="px-5 py-2.5 text-right">Margen</th>
                <th className="px-5 py-2.5 text-right">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.topProductsByRevenue.map((p: any) => (
                <tr key={p.rank} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs text-[var(--text-muted)]">{p.rank}</td>
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)]">{p.product}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{p.units}</td>
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)] text-right font-mono">{fmt(p.revenue)}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{p.pct}%</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className="px-1.5 py-0.5 rounded-none bg-[var(--success-subtle)] text-[var(--success)]">{p.margin}%</span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    {p.trendDir === 'up' && <span className="text-[var(--success)]">+{p.trend}%</span>}
                    {p.trendDir === 'down' && <span className="text-[var(--error)]">{p.trend}%</span>}
                    {p.trendDir === 'flat' && <span className="text-[var(--text-muted)]">+{p.trend}%</span>}
                    {p.trendDir === 'new' && <span className="px-1.5 py-0.5 rounded-none bg-[var(--info-subtle)] text-[var(--info)] text-[10px]">Nuevo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-2">
        <Insight text="El Set 3 Tablas genera el 37.7% de ingresos con solo 18 unidades. Considerar crear más sets/bundles." />
        <Insight text="El grabado láser tiene 82% de margen y crece 22%. Es el servicio más rentable — promoverlo más." type="success" />
      </div>

      {/* Revenue by category horizontal bars */}
      <Card className="p-5">
        <SectionTitle>Ingresos por categoría</SectionTitle>
        <div className="space-y-3">
          {d.revenueBySubCategory.map((cat: any) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--text)] font-medium">{cat.name}</span>
                <span className="text-[var(--text)] font-mono">{fmt(cat.total)} ({cat.pct}%)</span>
              </div>
              <div className="w-full bg-[var(--surface2)] rounded-none h-2.5">
                <div className="bg-[var(--accent)] h-2.5 rounded-none transition-all" style={{ width: `${cat.pct}%` }} />
              </div>
              {'sub' in cat && cat.sub && (
                <div className="ml-4 mt-1.5 space-y-1">
                  {cat.sub.map((s: any) => (
                    <div key={s.name} className="flex items-center justify-between text-[10px]">
                      <span className="text-[var(--text-secondary)]">{s.name}</span>
                      <span className="text-[var(--text-secondary)] font-mono">{fmt(s.value)} ({s.pct}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue by channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionTitle>Ingresos por canal de venta</SectionTitle>
          <div className="space-y-3">
            {d.revenueByChannel.map((ch: any) => (
              <div key={ch.name} className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[var(--text)]">{ch.name}</span>
                  {'note' in ch && ch.note && <span className="text-[10px] text-[var(--text-muted)] ml-1">({ch.note})</span>}
                </div>
                <span className="font-mono font-medium text-[var(--text)]">{fmt(ch.value)} <span className="text-[var(--text-muted)]">({ch.pct}%)</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Ingresos por zona geográfica</SectionTitle>
          <div className="space-y-3">
            {d.revenueByRegion.map((r: any) => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text)]">{r.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-medium text-[var(--text)]">{fmt(r.value)} ({r.pct}%)</span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-2">Envío prom {fmt(r.avgShipping)}</span>
                </div>
              </div>
            ))}
          </div>
          <Insight text="Hermosillo genera 30% del ingreso con costo de envío 71% menor. Considerar marketing local más agresivo." />
        </Card>
      </div>

      {/* Engraving stats */}
      <Card className="p-5">
        <SectionTitle>Ventas con grabado láser</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Pedidos con grabado</p>
            <p className="text-lg font-semibold text-[var(--text)] font-sans">{d.engravingStats.ordersWithEngraving} de {d.engravingStats.totalOrders} ({d.engravingStats.pct}%)</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Incremento promedio</p>
            <p className="text-lg font-semibold text-[var(--text)] font-sans">+{fmt(d.engravingStats.avgIncrease)} MXN</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Ingresos adicionales</p>
            <p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.engravingStats.additionalRevenue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Margen del grabado</p>
            <p className="text-lg font-semibold text-[var(--success)] font-sans">{d.engravingStats.engravingMargin}%</p>
          </div>
        </div>
        <Insight text={`El grabado sube el ticket promedio en $${d.engravingStats.avgIncrease} con margen del ${d.engravingStats.engravingMargin}%. Cada pedido con grabado es significativamente más rentable.`} type="success" />
      </Card>
    </div>
  );
};

// ===== TAB: COSTOS Y GASTOS =====
const CostosTab: React.FC = () => {
  const d = useFinanceData();
  const [showWebDetail, setShowWebDetail] = useState(false);
  const totalCosts = d.totalCostDonut.reduce((s: number, c: any) => s + c.value, 0);

  return (
    <div className="space-y-6">
      {/* Cost donut + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h5 className="text-xs font-medium text-[var(--text)] mb-3">Distribución de costos totales</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.totalCostDonut} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                  {d.totalCostDonut.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [fmt(v), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-lg font-semibold text-[var(--text)] font-sans -mt-2">{fmt(totalCosts)}</p>
          <p className="text-center text-[10px] text-[var(--text-muted)]">Costo total</p>
          <div className="space-y-1.5 mt-3">
            {d.totalCostDonut.map((c: any, i: number) => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-none" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[var(--text-secondary)]">{c.name}</span>
                </div>
                <span className="font-medium text-[var(--text)]">{fmt(c.value)} ({c.pct}%)</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* COGS table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>COGS — {fmt(d.cogs)}</SectionTitle></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2 text-right">Uds</th>
                    <th className="px-4 py-2 text-right">Costo unit.</th>
                    <th className="px-4 py-2 text-right">Costo total</th>
                    <th className="px-4 py-2 text-right">% COGS</th>
                    <th className="px-4 py-2 text-right">Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {d.cogsByProduct.map((p: any) => (
                    <tr key={p.product} className="hover:bg-[var(--surface2)]/50 transition-colors">
                      <td className="px-4 py-2 text-xs text-[var(--text)]">{p.product}</td>
                      <td className="px-4 py-2 text-xs text-[var(--text-secondary)] text-right">{p.units}</td>
                      <td className="px-4 py-2 text-xs text-[var(--text-secondary)] text-right font-mono">{p.costUnit > 0 ? fmt(p.costUnit) : 'var.'}</td>
                      <td className="px-4 py-2 text-xs font-medium text-[var(--text)] text-right font-mono">{fmt(p.costTotal)}</td>
                      <td className="px-4 py-2 text-xs text-[var(--text-secondary)] text-right">{p.pctCogs}%</td>
                      <td className="px-4 py-2 text-xs text-right">
                        {p.margin > 0 ? <span className="text-[var(--success)]">{p.margin}%</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Operating Costs */}
      <Card className="p-5">
        <SectionTitle>Costos Operativos — $25,148/mes</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 text-right pr-4">Costo/mes</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.operatingCosts.map((c: any) => (
                <tr key={c.concept} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="py-2 pr-4 text-xs text-[var(--text)]">{c.concept}</td>
                  <td className="py-2 text-xs font-medium text-[var(--text)] text-right pr-4 font-mono">{fmt(c.cost)}</td>
                  <td className="py-2 pr-4 text-xs">
                    <span className={`px-1.5 py-0.5 rounded-none text-[10px] ${c.type === 'Fijo' ? 'bg-[var(--info-subtle)] text-[var(--info)]' : 'bg-[var(--warning-subtle)] text-[var(--warning)]'}`}>{c.type}</span>
                  </td>
                  <td className="py-2 text-xs text-[var(--text-secondary)]">
                    {c.notes}
                    {c.concept === 'Hosting y servicios web' && (
                      <button onClick={() => setShowWebDetail(!showWebDetail)} className="ml-1 text-[var(--accent)] hover:underline">
                        {showWebDetail ? 'Ocultar' : 'Ver desglose'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <>
          {showWebDetail && (
            <div className="overflow-hidden">
              <div className="mt-4 p-4 bg-[var(--surface2)] rounded-none border border-[var(--border)]">
                <h6 className="text-xs font-medium text-[var(--text)] mb-2">Desglose hosting y servicios web</h6>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-1.5">Servicio</th>
                      <th className="py-1.5 text-right">Costo/mes</th>
                      <th className="py-1.5">Plan</th>
                      <th className="py-1.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {d.webServices.map((s: any) => (
                      <tr key={s.service}>
                        <td className="py-1.5 text-xs text-[var(--text)]">{s.service}</td>
                        <td className="py-1.5 text-xs font-mono text-right text-[var(--text)]">{s.cost > 0 ? fmt(s.cost) : '$0'}</td>
                        <td className="py-1.5 text-[10px] text-[var(--text-secondary)]">{s.plan}</td>
                        <td className="py-1.5 text-center"><span className="inline-block w-2 h-2 rounded-none bg-[var(--success-subtle)]0" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      </Card>

      {/* Shipping costs */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Costos de Envío — {fmt(d.shippingCosts)}</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2">Carrier</th>
                <th className="px-5 py-2 text-right">Envíos</th>
                <th className="px-5 py-2 text-right">Costo total</th>
                <th className="px-5 py-2 text-right">Prom.</th>
                <th className="px-5 py-2 text-right">Cobrado</th>
                <th className="px-5 py-2 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.shippingCostsByCarrier.map((c: any) => (
                <tr key={c.carrier} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)]">{c.carrier}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{c.shipments}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text)] text-right">{fmt(c.totalCost)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text-secondary)] text-right">{fmt(c.avgCost)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text-secondary)] text-right">{fmt(c.charged)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-right">
                    {c.diff < 0 ? <span className="text-[var(--error)] flex items-center justify-end gap-1"><AlertTriangle size={11} />{fmt(c.diff)}</span> : <span className="text-[var(--success)]">{fmt(c.diff)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 space-y-1.5">
          <Insight text="Total envío absorbido: $6,660 (4.7% de ingresos). Evaluar si subir el umbral de envío gratis de $2,500 a $3,000." type="warning" />
        </div>
      </Card>

      {/* Discounts */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Descuentos Otorgados — {fmt(d.totalDiscounts)}</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2">Cupón/Fuente</th>
                <th className="px-5 py-2 text-right">Usos</th>
                <th className="px-5 py-2 text-right">Total descontado</th>
                <th className="px-5 py-2 text-right">Ventas generadas</th>
                <th className="px-5 py-2 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.discountsBySource.map((ds: any) => (
                <tr key={ds.source} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium font-mono text-[var(--text)]">{ds.source}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{ds.uses}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--error)] text-right">-{fmt(ds.discounted)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--success)] text-right">{fmt(ds.salesGenerated)}</td>
                  <td className="px-5 py-2.5 text-xs text-right"><span className="px-1.5 py-0.5 rounded-none bg-[var(--success-subtle)] text-[var(--success)]">{ds.roi}x</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Insight text="ROI general de descuentos: 9.1x. Por cada peso descontado, se generan $9.10 en ventas." type="success" />
        </div>
      </Card>
    </div>
  );
};

// ===== TAB: INVENTARIO =====
const InventarioTab: React.FC = () => {
  const d = useFinanceData();
  const rotColor = (l: string) => l === 'green' ? 'text-[var(--success)] bg-[var(--success-subtle)]' : l === 'yellow' ? 'text-[var(--warning)] bg-[var(--warning-subtle)]' : 'text-[var(--error)] bg-[var(--error-subtle)]';
  const alertBadge = (a: string) => {
    if (a === 'low') return <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-[var(--warning-subtle)] text-[var(--warning)]">Stock bajo</span>;
    if (a === 'slow') return <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-[var(--warning-subtle)] text-[var(--warning)]">Lento</span>;
    if (a === 'out') return <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-[var(--error-subtle)] text-[var(--error)]">Agotado</span>;
    return null;
  };

  const summaryKpis = [
    { label: 'Valor a costo', value: fmt(d.inventoryCostValue), sub: `${d.inventoryUnits} productos en stock`, icon: Package },
    { label: 'Valor a precio venta', value: fmt(d.inventorySaleValue), sub: `Ganancia pot. ${fmt(d.inventorySaleValue - d.inventoryCostValue)}`, icon: DollarSign },
    { label: 'Rotación de inventario', value: `${d.inventoryRotation}x`, sub: `Se renueva cada ${Math.round(365 / d.inventoryRotation)} días`, icon: TrendingUp },
    { label: 'Alertas', value: `${d.inventoryLowStock + d.inventoryOutOfStock}`, sub: `${d.inventoryLowStock} stock bajo + ${d.inventoryOutOfStock} agotado`, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryKpis.map((k, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-none bg-[var(--accent)]/10 flex items-center justify-center">
                <k.icon size={18} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--text)] font-sans">{k.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{k.label}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{k.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* By category */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Valor por categoría</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2">Categoría</th>
                <th className="px-5 py-2 text-right">Productos</th>
                <th className="px-5 py-2 text-right">Unidades</th>
                <th className="px-5 py-2 text-right">Valor costo</th>
                <th className="px-5 py-2 text-right">Valor venta</th>
                <th className="px-5 py-2 text-right">% inv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.inventoryByCategory.map((c: any) => (
                <tr key={c.category} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)]">{c.category}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{c.products}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{c.units === 999 ? '∞' : c.units}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text)] text-right">{fmt(c.costValue)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text)] text-right">{fmt(c.saleValue)}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{c.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* By product */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Valor por producto (detalle)</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2">Producto</th>
                <th className="px-5 py-2 text-right">Stock</th>
                <th className="px-5 py-2 text-right">Costo unit.</th>
                <th className="px-5 py-2 text-right">Valor costo</th>
                <th className="px-5 py-2 text-right">Rotación</th>
                <th className="px-5 py-2 text-right">Días stock</th>
                <th className="px-5 py-2 text-right">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {d.inventoryByProduct.map((p: any) => (
                <tr key={p.product} className={`hover:bg-[var(--surface2)]/50 transition-colors ${p.alert ? 'bg-[var(--error-subtle)]/30' : ''}`}>
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)]">{p.product}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{p.stock}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text-secondary)] text-right">{fmt(p.costUnit)}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--text)] text-right">{fmt(p.costValue)}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    {p.rotation > 0 ? <span className={`px-1.5 py-0.5 rounded-none ${rotColor(p.rotLevel)}`}>{p.rotation}x</span> : <span className="text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)] text-right">{p.daysStock > 0 ? `${p.daysStock} días` : '—'}</td>
                  <td className="px-5 py-2.5 text-right">{alertBadge(p.alert)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[var(--surface2)] border-t border-[var(--border)] space-y-1">
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-none bg-[var(--success-subtle)]0" /> &gt;4x/año (excelente)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-none bg-[var(--warning-subtle)]0" /> 2-4x/año (aceptable)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-none bg-[var(--error-subtle)]0" /> &lt;2x/año (lento)</span>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Insight text="Tabla Rosa Morada: Solo 2 en stock, se vende rápido. Reordenar ya." type="warning" />
        <Insight text="Tabla Nogal Med: 20 unidades con rotación 0.5x. $7,600 de capital estancado. Considerar promoción o descuento." type="warning" />
        <Insight text="Set 3 Tablas Colores: AGOTADO. Hay 3 pedidos pendientes." type="warning" />
      </div>

      {/* Inventory value over time */}
      <Card className="p-5">
        <SectionTitle>Valor del inventario en el tiempo</SectionTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.inventoryHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [fmt(v), '']} />
              <Area dataKey="saleValue" name="Valor venta" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
              <Area dataKey="costValue" name="Valor costo" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.1} strokeWidth={2} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Stuck capital */}
      <Card className="p-5 border-[var(--warning)] bg-[var(--warning-subtle)]/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-[var(--warning)] shrink-0 mt-0.5" size={18} />
          <div>
            <h5 className="text-sm font-medium text-[var(--text)]">Capital atrapado en inventario lento</h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Productos con rotación &lt;2x/año: <span className="font-semibold">{fmt(d.stuckCapital)}</span> ({d.stuckCapitalPct}% del inventario)</p>
            <ul className="text-xs text-[var(--text-secondary)] mt-2 space-y-1 list-disc list-inside">
              <li>Crear venta flash para Tabla Nogal Med (20 uds × $380 = $7,600 atrapados)</li>
              <li>Incluir Mini Tabla en un bundle/set con descuento</li>
            </ul>
            <button onClick={() => toast.success('Redirigiendo a Ventas Flash...')} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-none hover:bg-[var(--accent)]/90 transition-colors">
              <Zap size={12} /> Crear venta flash para inventario lento
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ===== TAB: PAGOS Y COMISIONES =====
const PagosTab: React.FC = () => {
  const d = useFinanceData();

  const ProcessorCard: React.FC<{ title: string; icon: string; color: string; children: React.ReactNode }> = ({ title, icon, color, children }) => (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h5 className={`text-sm font-medium ${color}`}>{title}</h5>
      </div>
      {children}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stripe */}
      <ProcessorCard title="Stripe" icon="💳" color="text-[#635BFF]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Transacciones</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{d.stripe.transactions}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Monto procesado</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.stripe.processed)}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Comisión total</p><p className="text-lg font-semibold text-[var(--error)] font-sans">{fmt(d.stripe.commission)} ({d.stripe.effectiveRate}%)</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Prom. por transacción</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.stripe.avgPerTransaction)}</p></div>
        </div>
        <div className="text-xs text-[var(--text-secondary)] space-y-1 border-t border-[var(--border)] pt-3">
          <p>Desglose: 3.6% + $3 MXN por transacción</p>
          <p>Monto transferido: {fmt(d.stripe.transferred)}</p>
          <p>Próxima transferencia: {d.stripe.nextTransfer} — {fmt(d.stripe.nextTransferEst)} est.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {d.stripe.cardBreakdown.map((c: any) => (
            <span key={c.type} className="text-[10px] px-2 py-0.5 rounded-none bg-[var(--surface2)] text-[var(--text-secondary)]">{c.type}: {c.pct}%</span>
          ))}
        </div>
      </ProcessorCard>

      {/* MercadoPago */}
      <ProcessorCard title="MercadoPago" icon="💙" color="text-[#009EE3]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Transacciones</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{d.mercadoPago.transactions}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Monto procesado</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.mercadoPago.processed)}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Comisión total</p><p className="text-lg font-semibold text-[var(--error)] font-sans">{fmt(d.mercadoPago.commission)} ({d.mercadoPago.effectiveRate}%)</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Disponible</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.mercadoPago.available)}</p></div>
        </div>
        <div className="text-xs text-[var(--text-secondary)] space-y-1 border-t border-[var(--border)] pt-3">
          <p>Desglose: 3.49% + IVA por transacción</p>
          <p>Próxima liberación: {d.mercadoPago.nextRelease}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {d.mercadoPago.methodBreakdown.map((c: any) => (
            <span key={c.type} className="text-[10px] px-2 py-0.5 rounded-none bg-[var(--surface2)] text-[var(--text-secondary)]">{c.type}: {c.pct}%</span>
          ))}
        </div>
      </ProcessorCard>

      {/* Bank Transfer */}
      <ProcessorCard title="Transferencias bancarias (cotizaciones)" icon="🏦" color="text-[var(--text)]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Transacciones</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{d.bankTransfer.transactions}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Monto recibido</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{fmt(d.bankTransfer.received)}</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Comisión</p><p className="text-lg font-semibold text-[var(--success)] font-sans">{fmt(0)}</p></div>
        </div>
        <div className="text-xs text-[var(--text-secondary)] space-y-1 border-t border-[var(--border)] pt-3">
          <p>Anticipos pendientes: <span className="font-medium text-[var(--warning)]">{fmt(d.bankTransfer.pendingAdvances)}</span></p>
          <p>Saldos por cobrar: <span className="font-medium text-[var(--error)]">{fmt(d.bankTransfer.pendingBalances)}</span></p>
        </div>
      </ProcessorCard>

      {/* Comparativa */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Comparativa de comisiones</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-5 py-2">Procesador</th>
                <th className="px-5 py-2 text-right">% del total</th>
                <th className="px-5 py-2 text-right">Comisión efectiva</th>
                <th className="px-5 py-2 text-right">Ticket prom.</th>
                <th className="px-5 py-2 text-right">Costo/transac.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              <tr><td className="px-5 py-2.5 text-xs text-[var(--text)]">Stripe</td><td className="px-5 py-2.5 text-xs text-right">72%</td><td className="px-5 py-2.5 text-xs text-right">{d.stripe.effectiveRate}%</td><td className="px-5 py-2.5 text-xs font-mono text-right">$871</td><td className="px-5 py-2.5 text-xs font-mono text-right">{fmt(d.stripe.avgPerTransaction)}</td></tr>
              <tr><td className="px-5 py-2.5 text-xs text-[var(--text)]">MercadoPago</td><td className="px-5 py-2.5 text-xs text-right">20%</td><td className="px-5 py-2.5 text-xs text-right">{d.mercadoPago.effectiveRate}%</td><td className="px-5 py-2.5 text-xs font-mono text-right">$840</td><td className="px-5 py-2.5 text-xs font-mono text-right">{fmt(d.mercadoPago.avgPerTransaction)}</td></tr>
              <tr><td className="px-5 py-2.5 text-xs text-[var(--text)]">Transferencia</td><td className="px-5 py-2.5 text-xs text-right">8%</td><td className="px-5 py-2.5 text-xs text-right text-[var(--success)]">0.00%</td><td className="px-5 py-2.5 text-xs font-mono text-right">$1,430</td><td className="px-5 py-2.5 text-xs font-mono text-right text-[var(--success)]">$0</td></tr>
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 space-y-1.5">
          <Insight text="MercadoPago es 16% más caro que Stripe por comisión efectiva. Pero es necesario para clientes que pagan en OXXO o con débito mexicano." />
          <p className="text-xs text-[var(--text-secondary)]">Total comisiones del período: <span className="font-semibold">{fmt(d.totalCommissions)}</span> ({d.totalCommissionsPct}% de ingresos)</p>
        </div>
      </Card>

      {/* Pending Payments */}
      <Card className="p-5">
        <SectionTitle>Pagos pendientes y cuentas por cobrar</SectionTitle>
        <div className="space-y-4">
          <div>
            <h6 className="text-xs font-medium text-[var(--text)] mb-2">Anticipos de cotizaciones por cobrar: <span className="text-[var(--warning)]">{fmt(d.bankTransfer.pendingAdvances)}</span></h6>
            <div className="space-y-2">
              {d.pendingPayments.filter((p: any) => p.type === 'anticipo').map((p: any) => (
                <div key={p.ref} className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-none text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-[var(--text)]">{p.ref}</span>
                    <span className="text-[var(--text-secondary)]">{p.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-[var(--text)]">{fmt(p.amount)}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{p.status} {p.date}</span>
                    <button onClick={() => toast.success(`Recordatorio enviado a ${p.client}`)} className="text-[var(--accent)] hover:underline text-[10px]">
                      <Mail size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h6 className="text-xs font-medium text-[var(--text)] mb-2">Saldos por cobrar (ya entregados): <span className="text-[var(--error)]">{fmt(d.bankTransfer.pendingBalances)}</span></h6>
            <div className="space-y-2">
              {d.pendingPayments.filter((p: any) => p.type === 'saldo').map((p: any) => (
                <div key={p.ref} className="flex items-center justify-between p-2.5 bg-[var(--error-subtle)]/50 rounded-none text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-[var(--text)]">{p.ref}</span>
                    <span className="text-[var(--text-secondary)]">{p.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-[var(--error)]">{fmt(p.amount)}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{p.status} {p.date}</span>
                    <button onClick={() => toast.success(`Recordatorio enviado a ${p.client}`)} className="text-[var(--accent)] hover:underline text-[10px]">
                      <Mail size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-medium text-[var(--text)]">Total por cobrar: <span className="text-lg font-semibold">{fmt(d.bankTransfer.totalReceivable)}</span></p>
        </div>
      </Card>

      {/* Refunds */}
      <Card className="p-5">
        <SectionTitle>Reembolsos y devoluciones</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Reembolsos del período</p><p className="text-lg font-semibold text-[var(--text)] font-sans">{d.refunds.count} ({fmt(d.refunds.total)})</p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Tasa de reembolso</p><p className="text-lg font-semibold text-[var(--success)] font-sans">{d.refunds.rate}% <span className="text-[10px] text-[var(--text-muted)]">(meta &lt;3%)</span></p></div>
          <div><p className="text-[10px] text-[var(--text-muted)] uppercase">Motivos</p><p className="text-xs text-[var(--text-secondary)]">{d.refunds.reasons.join(', ')}</p></div>
        </div>
      </Card>
    </div>
  );
};

// ===== TAB: FLUJO DE EFECTIVO =====
const FlujoTab: React.FC = () => {
  const d = useFinanceData();

  const flowKpis = [
    { label: 'Entradas', value: fmt(d.cashFlowEntries), delta: `+${d.cashFlowEntriesDelta}%`, up: true, icon: ArrowUpRight, color: 'text-[var(--success)]' },
    { label: 'Salidas', value: fmt(d.cashFlowExits), delta: `+${d.cashFlowExitsDelta}%`, up: false, icon: ArrowDownRight, color: 'text-[var(--error)]' },
    { label: 'Flujo neto', value: fmt(d.cashFlowNet), delta: `+${d.cashFlowNetDelta}%`, up: true, icon: TrendingUp, color: 'text-[var(--success)]', highlight: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {flowKpis.map((k, i) => (
          <Card key={i} className={`p-5 ${k.highlight ? 'border-[var(--success)] bg-[var(--success-subtle)]/30' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <k.icon size={20} className={k.color} />
              <span className={`text-xs font-medium ${k.up ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>{k.delta}</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--text)] font-sans">{k.value}</p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{k.label}</p>
            {k.highlight && <p className="text-[10px] text-[var(--success)] mt-1">POSITIVO ✓</p>}
          </Card>
        ))}
      </div>

      {/* Weekly cash flow chart */}
      <Card className="p-5">
        <SectionTitle>Flujo de efectivo por semana</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d.cashFlowWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any, name: any) => [fmt(v), name]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="entries" name="Entradas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exits" name="Salidas" fill="var(--text-secondary)" radius={[4, 4, 0, 0]} />
              <Line dataKey="netCumulative" name="Neto acumulado" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Entries detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]"><h5 className="text-xs font-medium text-[var(--success)] uppercase tracking-wider">Detalle de entradas</h5></div>
          <table className="w-full text-left">
            <thead><tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
              <th className="px-5 py-2">Fuente</th><th className="px-5 py-2 text-right">Monto</th><th className="px-5 py-2 text-right">%</th><th className="px-5 py-2">Frecuencia</th>
            </tr></thead>
            <tbody className="divide-y divide-wood-50">
              {d.cashFlowEntriesDetail.map((e: any) => (
                <tr key={e.source}><td className="px-5 py-2 text-xs text-[var(--text)]">{e.source}</td><td className="px-5 py-2 text-xs font-mono text-right text-[var(--success)]">{fmt(e.amount)}</td><td className="px-5 py-2 text-xs text-right text-[var(--text-secondary)]">{e.pct}%</td><td className="px-5 py-2 text-[10px] text-[var(--text-muted)]">{e.freq}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]"><h5 className="text-xs font-medium text-[var(--error)] uppercase tracking-wider">Detalle de salidas</h5></div>
          <table className="w-full text-left">
            <thead><tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
              <th className="px-5 py-2">Concepto</th><th className="px-5 py-2 text-right">Monto</th><th className="px-5 py-2 text-right">%</th><th className="px-5 py-2">Frecuencia</th>
            </tr></thead>
            <tbody className="divide-y divide-wood-50">
              {d.cashFlowExitsDetail.map((e: any) => (
                <tr key={e.concept}><td className="px-5 py-2 text-xs text-[var(--text)]">{e.concept}</td><td className="px-5 py-2 text-xs font-mono text-right text-[var(--error)]">{fmt(e.amount)}</td><td className="px-5 py-2 text-xs text-right text-[var(--text-secondary)]">{e.pct}%</td><td className="px-5 py-2 text-[10px] text-[var(--text-muted)]">{e.freq}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Upcoming payments calendar */}
      <Card className="p-5">
        <SectionTitle>Calendario de pagos próximos</SectionTitle>
        <div className="space-y-2">
          {d.upcomingPayments.map((p: any, i: any) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-none bg-[var(--surface2)] text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[var(--text-secondary)] w-12">{p.date}</span>
                <span className="text-[var(--text)]">{p.concept}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium text-[var(--text)]">{fmt(p.amount)}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{p.type}</span>
                {p.paid ? (
                  <span className="px-1.5 py-0.5 rounded-none bg-[var(--success-subtle)] text-[var(--success)] text-[10px] flex items-center gap-0.5"><CheckCircle size={10} /> Pagado</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-none bg-[var(--warning-subtle)] text-[var(--warning)] text-[10px] flex items-center gap-0.5"><Clock size={10} /> Pend.</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[var(--error-subtle)] rounded-none border border-[var(--error)]">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[var(--error)] mt-0.5 shrink-0" />
            <div className="text-xs text-[var(--error)]">
              <p>Total compromisos próximos 30 días: <span className="font-semibold">{fmt(d.upcomingTotal)}</span></p>
              <p>Saldo disponible actual: <span className="font-semibold">{fmt(d.currentBalance)}</span></p>
              <p className="font-semibold mt-1">Déficit proyectado: {fmt(d.projectedDeficit)} — Necesitas cobrar anticipos pendientes ({fmt(d.bankTransfer.pendingAdvances)})</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cash flow projection */}
      <Card className="p-5">
        <SectionTitle>Proyección de flujo (próximas 4 semanas)</SectionTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.cashFlowProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <RTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [fmt(v), 'Saldo']} />
              <defs>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area dataKey="balance" stroke="#22c55e" fill="url(#flowGrad)" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Insight text="Tu flujo se aprieta alrededor del día 17 (declaración IVA). Asegúrate de cobrar los anticipos pendientes ($28,400) antes de esa fecha." type="warning" />
      </Card>
    </div>
  );
};

// ===== TAB: REPORTES =====
const ReportesTab: React.FC = () => {
  const d = useFinanceData();
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});

  const iconMap: Record<string, React.ElementType> = {
    chart: BarChart3, dollar: DollarSign, package: Package, bank: CreditCard,
    flow: Wallet, tag: Tag, receipt: Receipt,
  };

  return (
    <div className="space-y-6">
      {/* Predefined reports */}
      <div>
        <SectionTitle>Reportes predefinidos</SectionTitle>
        <div className="space-y-3">
          {d.predefinedReports.map((r: any) => {
            const Icon = iconMap[r.icon] || FileText;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-none bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-[var(--text)]">{r.name}</h5>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-[var(--text-muted)]">Formato:</span>
                      {r.formats.map((f: any) => (
                        <button key={f}
                          onClick={() => setSelectedFormat(prev => ({ ...prev, [r.id]: f }))}
                          className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${selectedFormat[r.id] === f ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'}`}
                        >{f}</button>
                      ))}
                      <button
                        onClick={() => toast.success(`Generando ${r.name} en formato ${selectedFormat[r.id] || r.formats[0]}...`)}
                        className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)] text-white text-[10px] rounded-none hover:bg-[var(--accent)]/90 transition-colors"
                      >
                        <Download size={10} /> Generar reporte
                      </button>
                    </div>
                    {r.id === 'r7' && (
                      <div className="mt-2 space-y-1 text-[10px] text-[var(--text-secondary)]">
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" /> Incluir desglose de IVA trasladado vs acreditable</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" /> Incluir comisiones de procesadores (gasto deducible)</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" /> Incluir costos de envío</label>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scheduled reports */}
      <Card className="p-5">
        <SectionTitle>Reportes programados</SectionTitle>
        <div className="space-y-2">
          {d.scheduledReports.map((r: any, i: any) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-none text-xs">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={r.active} className="rounded border-wood-300 text-[var(--accent)]" />
                <span className="text-[var(--text)]">{r.name}</span>
                <span className="text-[var(--text-muted)]">{r.freq}</span>
              </div>
              {r.email && <span className="text-[10px] text-[var(--text-secondary)]">{r.email}</span>}
            </div>
          ))}
        </div>
        <button className="mt-3 text-[10px] text-[var(--accent)] font-medium hover:underline flex items-center gap-1">
          <Plus size={10} /> Agregar reporte programado
        </button>
      </Card>

      {/* Report history */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]"><SectionTitle>Historial de reportes generados</SectionTitle></div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
              <th className="px-5 py-2">Reporte</th>
              <th className="px-5 py-2">Período</th>
              <th className="px-5 py-2">Generado</th>
              <th className="px-5 py-2">Formato</th>
              <th className="px-5 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {d.reportHistory.map((r: any, i: any) => (
              <tr key={i} className="hover:bg-[var(--surface2)]/50 transition-colors">
                <td className="px-5 py-2.5 text-xs font-medium text-[var(--text)]">{r.name}</td>
                <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)]">{r.period}</td>
                <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)]">{r.generated}</td>
                <td className="px-5 py-2.5"><span className="text-[10px] px-1.5 py-0.5 rounded-none bg-[var(--surface2)] text-[var(--text-secondary)]">{r.format}</span></td>
                <td className="px-5 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => toast.success('Descargando...')} className="p-1 hover:bg-[var(--surface2)] rounded"><Download size={12} className="text-[var(--text-secondary)]" /></button>
                    <button onClick={() => toast.success('Enviando por email...')} className="p-1 hover:bg-[var(--surface2)] rounded"><Mail size={12} className="text-[var(--text-secondary)]" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ===== CONFIGURATION MODAL =====
const ConfigModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)] z-10">
          <h3 className="font-serif text-lg text-[var(--text)]">Configuración Financiera</h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface2)] rounded"><X size={18} className="text-[var(--text-secondary)]" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-medium text-[var(--text)] uppercase tracking-wider mb-3">Moneda</h4>
            <select className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs bg-[var(--surface)]">
              <option>MXN — Peso Mexicano</option>
              <option>USD — Dólar</option>
            </select>
          </div>
          <div>
            <h4 className="text-xs font-medium text-[var(--text)] uppercase tracking-wider mb-3">Impuestos</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-[var(--text-muted)]">IVA (%)</label><input type="number" defaultValue={16} className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs" /></div>
              <div><label className="text-[10px] text-[var(--text-muted)]">IVA incluido en precios</label><div className="flex gap-3 mt-1"><label className="text-xs text-[var(--text-secondary)]"><input type="radio" name="iva" defaultChecked className="mr-1" />Sí</label><label className="text-xs text-[var(--text-secondary)]"><input type="radio" name="iva" className="mr-1" />No</label></div></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-[var(--text)] uppercase tracking-wider mb-3">Metas financieras</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-[var(--text-muted)]">Meta ingresos mensual</label><input type="number" defaultValue={150000} className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs" /></div>
              <div><label className="text-[10px] text-[var(--text-muted)]">Meta margen bruto (%)</label><input type="number" defaultValue={60} className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs" /></div>
              <div><label className="text-[10px] text-[var(--text-muted)]">Meta margen neto (%)</label><input type="number" defaultValue={25} className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs" /></div>
              <div><label className="text-[10px] text-[var(--text-muted)]">Meta rotación inventario</label><input type="number" defaultValue={4} className="w-full border border-[var(--border)] rounded-none px-3 py-2 text-xs" /></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-[var(--text)] uppercase tracking-wider mb-3">Notificaciones</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />Alertar cuando ingresos diarios caen debajo de $3,000</label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />Alertar cuando margen de un pedido es menor a 40%</label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />Alertar cuando un pago de cotización está vencido</label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />Resumen financiero diario a las 08:00</label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] sticky bottom-0 bg-[var(--surface)] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)] rounded-none transition-colors">Cancelar</button>
          <button onClick={() => { toast.success('Configuración guardada'); onClose(); }} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-none hover:bg-[var(--accent)]/90 transition-colors">Guardar configuración</button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const FinancesPage: React.FC = () => {

  const { t } = useTheme();
  // primitivos via src/theme/primitives — leen de useTheme() directamente
  // ── Live data from API ──
  const [liveFinances, setLiveFinances] = useState<any>(null);
  const [financesLoading, setFinancesLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  useEffect(() => {
    setFinancesLoading(true);
    fetch(`/api/admin/finances?period=${period}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveFinances(d); }).catch(() => {}).finally(() => setFinancesLoading(false));
  }, [period]);

  // Build unified finance data from live API
  const financeData = useMemo(() => {
    const s = liveFinances?.stats || {};
    const totalRevenue = s.totalRevenue || 0;
    return {
      grossRevenue: totalRevenue, cogs: 0, grossProfit: totalRevenue, grossMargin: 100, netProfit: totalRevenue,
      grossRevenueDelta: 0, cogsDelta: 0, grossProfitDelta: 0, grossMarginDelta: 0, netProfitDelta: 0,
      inventoryCostValue: 0, inventorySaleValue: 0, inventoryUnits: 0,
      avgTicket: s.avgTicket || 0, totalOrders: s.totalOrders || 0, dailyRevenueAvg: totalRevenue > 0 ? Math.round(totalRevenue / 30) : 0,
      avgTicketPrev: 0, totalOrdersPrev: 0, dailyRevenueAvgPrev: 0,
      clv: 0, clvPrev: 0, repurchaseRate: 0, repurchaseRatePrev: 0,
      avgQuoteTicket: 0, discountRate: totalRevenue > 0 ? Math.round((s.totalDiscounts || 0) / totalRevenue * 1000) / 10 : 0,
      totalDiscounts: s.totalDiscounts || 0, avgShippingCost: s.completedOrders > 0 ? Math.round((s.totalShipping || 0) / s.completedOrders) : 0,
      avgShippingCostPrev: 0, engravingRevenue: 0, engravingPct: 0,
      revenueBySource: [{ name: 'Ventas', value: totalRevenue, pct: 100 }],
      costBreakdownPL: [
        { name: 'Envío', value: s.totalShipping || 0, pct: totalRevenue > 0 ? Math.round((s.totalShipping || 0) / totalRevenue * 100) : 0 },
        { name: 'Descuentos', value: s.totalDiscounts || 0, pct: totalRevenue > 0 ? Math.round((s.totalDiscounts || 0) / totalRevenue * 100) : 0 },
      ],
      waterfallData: [
        { name: 'Ingresos', value: totalRevenue, fill: 'var(--accent)', type: 'income' },
        { name: 'Envío', value: -(s.totalShipping || 0), fill: 'var(--text-secondary)', type: 'cost' },
        { name: 'Descuentos', value: -(s.totalDiscounts || 0), fill: 'var(--text-muted)', type: 'cost' },
        { name: 'Neto', value: totalRevenue - (s.totalShipping || 0) - (s.totalDiscounts || 0), fill: '#22c55e', type: 'profit' },
      ],
      monthlyRevenue: (liveFinances?.monthlyData || []).map((m: any) => ({ month: m.month, revenue: m.revenue, orders: m.orders, costs: 0, grossProfit: m.revenue, netProfit: m.revenue, marginPct: 100 })),
      revenueByPayment: (liveFinances?.paymentBreakdown || []).map((p: any) => ({ name: p.method, value: p.amount, pct: totalRevenue > 0 ? Math.round(p.amount / totalRevenue * 100) : 0 })),
      revenueByCategory: [], revenueByClientType: [], projection: [], projectionNotes: [], dailyRevenue: [],
    };
  }, [liveFinances]);

  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showConfig, setShowConfig] = useState(false);
  const d = financeData;

  const kpis = [
    { label: 'Ingresos brutos', value: fmt(d.grossRevenue), delta: `+${d.grossRevenueDelta}%`, up: true, icon: DollarSign, color: 'bg-[var(--accent)]/10 text-[var(--accent)]' },
    { label: 'Costo de ventas (COGS)', value: fmt(d.cogs), delta: `+${d.cogsDelta}%`, up: false, icon: Package, color: 'bg-[var(--info-subtle)] text-[var(--info)]' },
    { label: 'Ganancia bruta', value: fmt(d.grossProfit), delta: `+${d.grossProfitDelta}%`, up: true, icon: TrendingUp, color: 'bg-[var(--success-subtle)] text-[var(--success)]' },
    { label: 'Margen bruto', value: `${d.grossMargin}%`, delta: `+${d.grossMarginDelta}pp`, up: true, icon: BarChart3, color: 'bg-[var(--accent-subtle)] text-[var(--accent)]' },
    { label: 'Ganancia neta', value: fmt(d.netProfit), delta: `+${d.netProfitDelta}%`, up: true, icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Valor inventario', value: fmt(d.inventoryCostValue), delta: `${d.inventoryUnits} productos`, up: true, icon: Layers, color: 'bg-[var(--warning-subtle)] text-[var(--warning)]', note: '(a costo)' },
  ];

  const tabContent: Record<TabId, React.ReactNode> = {
    general: <PanelGeneral />,
    ingresos: <IngresosTab />,
    costos: <CostosTab />,
    inventario: <InventarioTab />,
    pagos: <PagosTab />,
    flujo: <FlujoTab />,
    reportes: <ReportesTab />,
  };

  return (
    <FinanceDataContext.Provider value={financeData}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-[var(--text)] flex items-center gap-2">
          <DollarSign size={20} className="text-[var(--accent)]" /> Finanzas
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success('Exportando reporte...')} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-none hover:bg-[var(--surface2)] transition-colors flex items-center gap-1.5">
            <Download size={12} /> Exportar
          </button>
          <button onClick={() => toast.success('Preparando impresión...')} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-none hover:bg-[var(--surface2)] transition-colors flex items-center gap-1.5">
            <Printer size={12} /> Imprimir
          </button>
          <button onClick={() => setShowConfig(true)} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-none hover:bg-[var(--surface2)] transition-colors flex items-center gap-1.5">
            <Settings2 size={12} /> Configuración
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-[var(--border)]">
          {tabItems.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ${activeTab === t.id ? 'border-[var(--accent)] text-[var(--accent)] font-medium' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Calendar size={12} className="text-[var(--text-muted)]" />
          <span>Período:</span>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-[var(--border)] rounded-none px-2 py-1 text-xs bg-[var(--surface)]">
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span>Comparar con:</span>
          <select className="border border-[var(--border)] rounded-none px-2 py-1 text-xs bg-[var(--surface)]">
            <option>Mes anterior</option>
            <option>Mismo período año anterior</option>
            <option>Sin comparar</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-[var(--surface)] p-4 rounded-none border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-none flex items-center justify-center ${kpi.color}`}><kpi.icon size={16} /></div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-none flex items-center gap-0.5 ${kpi.up ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--warning-subtle)] text-[var(--warning)]'}`}>
                {kpi.up && <ArrowUpRight size={10} />}{kpi.delta}
              </span>
            </div>
            <h4 className="text-xl font-semibold text-[var(--text)] font-sans">{kpi.value}</h4>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{kpi.label}</p>
            {kpi.note && <p className="text-[10px] text-[var(--text-muted)]">{kpi.note}</p>}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <>
        <div key={activeTab}>
          {tabContent[activeTab]}
        </div>
      </>

      {/* Config Modal */}
      <ConfigModal open={showConfig} onClose={() => setShowConfig(false)} />
    </div>
    </FinanceDataContext.Provider>
  );
};
