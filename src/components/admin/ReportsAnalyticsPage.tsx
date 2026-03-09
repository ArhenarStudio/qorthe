"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, ShoppingCart, Users, Package, Settings2, Plus,
  Download, AlertTriangle, Lightbulb,
  CheckCircle, Smartphone, Monitor, Tablet, MapPin,
  Star, Wrench,
  ArrowUpRight, ArrowDownRight, Calendar,
  ChevronRight, GripVertical
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis,
  ReferenceLine
} from 'recharts';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard } from '@/src/theme/primitives';
import { useThemeComponents } from '@/src/admin/hooks/useThemeComponents';

// ===== TYPES =====
type TabId = 'resumen' | 'ventas' | 'clientes' | 'productos' | 'operaciones' | 'custom';

// ===== CONSTANTS =====
const COLORS = ['var(--admin-accent)', 'var(--admin-text-secondary)', 'var(--admin-muted)', 'var(--admin-border)', 'var(--admin-text-secondary)', 'var(--admin-muted)'];

const tabItems: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart3 },
  { id: 'ventas', label: 'Ventas & Conversion', icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'operaciones', label: 'Operaciones', icon: Settings2 },
  { id: 'custom', label: 'Dashboards Custom', icon: Wrench },
];

const periods = ['Hoy', 'Esta semana', 'Este mes', 'Este trimestre', 'Este ano', 'Ultimos 12 meses'];

const fmt = (n: number) => '$' + n.toLocaleString('es-MX');

const chartStyle = {
  background: 'var(--admin-text)',
  border: 'none',
  borderRadius: 8,
  color: 'var(--admin-surface2)',
  fontSize: 11,
};

// ===== MOCK DATA =====
const scorecardItems = [
  { area: 'VENTAS', status: 'green' as const, value: '$142,800', metric: 'Meta: $130K', met: true, delta: '+18% vs prev' },
  { area: 'CLIENTES', status: 'green' as const, value: '248 totales', metric: '18 nuevos', met: true, delta: '32% recompra' },
  { area: 'OPERACIONES', status: 'yellow' as const, value: '4.2 dias prom', metric: 'Meta: 3 dias', met: false, delta: 'Entrega promedio' },
  { area: 'RENTABILIDAD', status: 'green' as const, value: '60% margen bruto', metric: 'Meta: 55%', met: true, delta: '26.9% neto' },
  { area: 'SATISFACCION', status: 'green' as const, value: '4.7 rating', metric: 'Meta: 4.5', met: true, delta: '85% positivas' },
  { area: 'MARKETING', status: 'yellow' as const, value: '42% conversion', metric: 'cupones', met: false, delta: 'Meta: 50%' },
];

const sparklineData = [
  { label: 'Ingresos diarios (30d)', value: '$4,680/dia', trend: 'up' as const, data: [3800, 5200, 4100, 6200, 4800, 7800, 5200, 3400, 5100, 4900, 6400, 3800, 4200, 8900, 7200, 5400, 4100, 3600, 5300, 6100, 4800, 3900, 5600, 4400, 3200, 6100, 3300, 3800, 5000, 4680] },
  { label: 'Pedidos diarios (30d)', value: '5.3/dia', trend: 'up' as const, data: [4, 7, 3, 8, 5, 9, 6, 4, 6, 5, 7, 4, 5, 11, 9, 6, 5, 4, 6, 7, 5, 4, 6, 5, 3, 7, 4, 4, 6, 5] },
  { label: 'Ticket promedio (30d)', value: '$881', trend: 'up' as const, data: [850, 740, 1360, 775, 960, 870, 860, 850, 850, 980, 910, 950, 840, 810, 800, 900, 820, 900, 880, 870, 960, 975, 930, 880, 1060, 870, 825, 950, 830, 881] },
  { label: 'Clientes nuevos (30d)', value: '0.6/dia', trend: 'flat' as const, data: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 2, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1] },
  { label: 'Rating promedio (30d)', value: '4.7', trend: 'flat' as const, data: [4.5, 5, 4.5, 5, 4.5, 5, 4, 5, 5, 4.5, 5, 4.5, 4, 5, 5, 4.5, 5, 5, 4.5, 5, 4, 5, 5, 4.5, 5, 4.5, 5, 5, 4.5, 4.7] },
  { label: 'Tasa conversion web (30d)', value: '2.8%', trend: 'up' as const, data: [2.2, 2.5, 2.3, 2.8, 2.6, 3.0, 2.7, 2.4, 2.6, 2.5, 2.9, 2.3, 2.5, 3.2, 3.0, 2.8, 2.5, 2.3, 2.7, 2.9, 2.6, 2.4, 2.8, 2.5, 2.3, 2.9, 2.4, 2.5, 2.7, 2.8] },
];

const alerts = [
  { type: 'warning' as const, text: 'Tiempo de entrega subio a 4.2 dias (meta: 3 dias) - revisar carrier DHL' },
  { type: 'warning' as const, text: '3 productos con stock bajo (Rosa Morada: 2 uds, Set Colores: agotado)' },
  { type: 'warning' as const, text: '5 cotizaciones sin responder hace +48h' },
  { type: 'info' as const, text: 'Tabla Rosa Morada Gourmet: ventas +45% vs mes anterior, reabastecer' },
  { type: 'info' as const, text: 'Viernes es el dia con mas ventas, programar campanas para jueves noche' },
  { type: 'info' as const, text: 'Clientes Platino generan 17% de ingresos con solo 1.2% de clientes' },
];

const comparisonTable = [
  { metric: 'Ingresos', actual: '$142,800', prev: '$121,000', change: '+18.0%', up: true, trend: '5 meses subiendo' },
  { metric: 'Pedidos', actual: '162', prev: '140', change: '+15.7%', up: true, trend: 'Estable' },
  { metric: 'Ticket promedio', actual: '$881', prev: '$864', change: '+2.0%', up: true, trend: 'Estable' },
  { metric: 'Clientes nuevos', actual: '18', prev: '13', change: '+38.5%', up: true, trend: 'Acelerando' },
  { metric: 'Tasa recompra', actual: '32%', prev: '29%', change: '+3pp', up: true, trend: 'Mejorando' },
  { metric: 'Margen bruto', actual: '60.0%', prev: '58.5%', change: '+1.5pp', up: true, trend: 'Mejorando' },
  { metric: 'Rating reviews', actual: '4.7', prev: '4.6', change: '+0.1', up: true, trend: 'Estable' },
  { metric: 'Cotizaciones cerradas', actual: '42%', prev: '38%', change: '+4pp', up: true, trend: 'Mejorando' },
  { metric: 'Tiempo entrega', actual: '4.2 dias', prev: '3.8 dias', change: '+10.5%', up: false, trend: 'Empeorando' },
];

const funnelData = [
  { name: 'Visitantes unicos', value: 5800, pct: 100, fill: 'var(--admin-accent)' },
  { name: 'Vieron producto', value: 3480, pct: 60.0, fill: 'var(--admin-text-secondary)' },
  { name: 'Agregaron al carrito', value: 680, pct: 11.7, fill: 'var(--admin-muted)' },
  { name: 'Iniciaron checkout', value: 348, pct: 6.0, fill: 'var(--admin-muted)' },
  { name: 'Completaron compra', value: 162, pct: 2.8, fill: 'var(--admin-text-secondary)' },
];

const salesByDayHour = [
  { day: 'Lun', '8-12h': 12, '12-16h': 18, '16-20h': 22, '20-24h': 8 },
  { day: 'Mar', '8-12h': 10, '12-16h': 15, '16-20h': 20, '20-24h': 7 },
  { day: 'Mie', '8-12h': 14, '12-16h': 16, '16-20h': 18, '20-24h': 9 },
  { day: 'Jue', '8-12h': 11, '12-16h': 19, '16-20h': 24, '20-24h': 12 },
  { day: 'Vie', '8-12h': 22, '12-16h': 28, '16-20h': 18, '20-24h': 14 },
  { day: 'Sab', '8-12h': 16, '12-16h': 14, '16-20h': 12, '20-24h': 6 },
  { day: 'Dom', '8-12h': 8, '12-16h': 10, '16-20h': 26, '20-24h': 18 },
];

const trafficSources = [
  { source: 'Organico (Google)', revenue: 58200, pct: 40.8, conv: 3.2, ticket: 920 },
  { source: 'Directo', revenue: 42800, pct: 30.0, conv: 4.1, ticket: 1050 },
  { source: 'Redes sociales', revenue: 22400, pct: 15.7, conv: 1.8, ticket: 680 },
  { source: 'Referidos', revenue: 11200, pct: 7.8, conv: 5.2, ticket: 870 },
  { source: 'Email marketing', revenue: 8200, pct: 5.7, conv: 6.8, ticket: 820 },
];

const abandonedProducts = [
  { product: 'Tabla Rosa Morada', price: 1650, abandons: 42, reason: 'precio alto' },
  { product: 'Set 3 Tablas', price: 2990, abandons: 38, reason: '' },
  { product: 'Tabla Parota Gde', price: 1100, abandons: 35, reason: '' },
];

const abandonReasons = [
  { reason: 'Al ver precio de envio', pct: 45 },
  { reason: 'Al crear cuenta', pct: 25 },
  { reason: 'Al elegir metodo de pago', pct: 18 },
  { reason: 'Otro', pct: 12 },
];

const deviceData = [
  { device: 'Mobile', traffic: 62, sales: 48, conv: 2.1, icon: Smartphone },
  { device: 'Desktop', traffic: 32, sales: 45, conv: 3.8, icon: Monitor },
  { device: 'Tablet', traffic: 6, sales: 7, conv: 3.2, icon: Tablet },
];

const cohortData = [
  { cohort: 'Ago 2025', months: [100, 28, 22, 18, 15, 14, 12] },
  { cohort: 'Sep 2025', months: [100, 32, 25, 20, 18, 15, null] },
  { cohort: 'Oct 2025', months: [100, 35, 28, 22, 18, null, null] },
  { cohort: 'Nov 2025', months: [100, 38, 30, 24, null, null, null] },
  { cohort: 'Dic 2025', months: [100, 35, 28, null, null, null, null] },
  { cohort: 'Ene 2026', months: [100, 40, null, null, null, null, null] },
  { cohort: 'Feb 2026', months: [100, null, null, null, null, null, null] },
];

const rfmSegments = [
  { segment: 'Campeones', desc: 'R+ F+ M+', clients: 15, pct: 6, revenue: 67100, revPct: 47, color: '#22c55e', action: 'Programa embajadores, acceso anticipado' },
  { segment: 'Leales', desc: 'R= F+ M=', clients: 28, pct: 11, revenue: 42000, revPct: 29, color: 'var(--admin-accent)', action: 'Upsell a sets, referidos' },
  { segment: 'Potenciales', desc: 'R+ F- M-', clients: 45, pct: 18, revenue: 18400, revPct: 13, color: '#3b82f6', action: 'Nurturing + incentivo segunda compra' },
  { segment: 'En riesgo', desc: 'R- F= M=', clients: 22, pct: 9, revenue: 8800, revPct: 6, color: '#f59e0b', action: 'Campana "te extranamos" + cupon' },
  { segment: 'Perdidos', desc: 'R- F- M-', clients: 48, pct: 19, revenue: 2400, revPct: 2, color: '#ef4444', action: 'Reactivacion agresiva o aceptar perdida' },
  { segment: 'Nuevos', desc: 'R+ F- M-', clients: 90, pct: 36, revenue: 4100, revPct: 3, color: '#8b5cf6', action: 'Nurturing con contenido + incentivo 2da compra' },
];

const newCustomersWeekly = [
  { week: 'S1 Sep', count: 2 }, { week: 'S2 Sep', count: 3 }, { week: 'S3 Sep', count: 1 }, { week: 'S4 Sep', count: 2 },
  { week: 'S1 Oct', count: 3 }, { week: 'S2 Oct', count: 2 }, { week: 'S3 Oct', count: 4 }, { week: 'S4 Oct', count: 2 },
  { week: 'S1 Nov', count: 3 }, { week: 'S2 Nov', count: 5 }, { week: 'S3 Nov', count: 3 }, { week: 'S4 Nov', count: 4 },
  { week: 'S1 Dic', count: 6 }, { week: 'S2 Dic', count: 8 }, { week: 'S3 Dic', count: 5 }, { week: 'S4 Dic', count: 4 },
  { week: 'S1 Ene', count: 3 }, { week: 'S2 Ene', count: 4 }, { week: 'S3 Ene', count: 3 }, { week: 'S4 Ene', count: 2 },
  { week: 'S1 Feb', count: 5 }, { week: 'S2 Feb', count: 4 }, { week: 'S3 Feb', count: 6 }, { week: 'S4 Feb', count: 3 },
];

const geoData = [
  { city: 'CDMX', clients: 58, pct: 23.4 },
  { city: 'Hermosillo', clients: 42, pct: 16.9 },
  { city: 'Guadalajara', clients: 32, pct: 12.9 },
  { city: 'Monterrey', clients: 28, pct: 11.3 },
  { city: 'Puebla', clients: 18, pct: 7.3 },
  { city: 'Otros', clients: 70, pct: 28.2 },
];

const bcgProducts = [
  { name: 'Set 3 Tablas', growth: 28, share: 37.7, revenue: 53820, category: 'star' },
  { name: 'Rosa Morada', growth: 45, share: 9.2, revenue: 13200, category: 'star' },
  { name: 'Parota Med', growth: 2, share: 16.7, revenue: 23800, category: 'cow' },
  { name: 'Parota Gde', growth: 15, share: 16.9, revenue: 24200, category: 'cow' },
  { name: 'Nogal Med', growth: 0, share: 3.3, revenue: 4750, category: 'question' },
  { name: 'Grabado', growth: 22, share: 4.3, revenue: 6200, category: 'question' },
  { name: 'Mini Tabla', growth: -5, share: 2.1, revenue: 3000, category: 'dog' },
  { name: 'Cedro Rojo', growth: -8, share: 8.4, revenue: 12000, category: 'cow' },
];

const priceVsDemand = [
  { name: 'Mini Tabla', price: 450, units: 20, margin: 55 },
  { name: 'Parota Med', price: 850, units: 28, margin: 60 },
  { name: 'Parota Gde', price: 1100, units: 22, margin: 60 },
  { name: 'Cedro Rojo', price: 1200, units: 10, margin: 58 },
  { name: 'Rosa Morada', price: 1650, units: 8, margin: 65 },
  { name: 'Set 3 Tablas', price: 2990, units: 18, margin: 62 },
  { name: 'Nogal Med', price: 950, units: 5, margin: 55 },
];

const crossSellData = [
  { product: 'Tabla Parota Med', related: 'Grabado Laser', pct: 35 },
  { product: 'Set 3 Tablas', related: 'Aceite de Cuidado', pct: 22 },
  { product: 'Tabla Cedro Rojo', related: 'Tabla Parota', pct: 18 },
];

const sellThroughData = [
  { product: 'Tabla Rosa Morada', stockStart: 10, sold: 8, sellThrough: 80, daysToEmpty: 8, level: 'green' as const },
  { product: 'Set 3 Tablas', stockStart: 12, sold: 7, sellThrough: 58, daysToEmpty: 22, level: 'green' as const },
  { product: 'Tabla Parota Med', stockStart: 30, sold: 15, sellThrough: 50, daysToEmpty: 30, level: 'green' as const },
  { product: 'Tabla Nogal Med', stockStart: 20, sold: 0, sellThrough: 0, daysToEmpty: 999, level: 'red' as const },
];

const slaData = [
  { name: 'Procesamiento (pedido a envio)', actual: '1.8 dias', target: '2 dias', met: true },
  { name: 'Envio (envio a entrega)', actual: '2.4 dias', target: '3 dias', met: true },
  { name: 'Total (pedido a entrega)', actual: '4.2 dias', target: '5 dias', met: true },
  { name: 'Respuesta reviews', actual: '4.2 horas', target: '24 horas', met: true },
  { name: 'Respuesta cotizaciones', actual: '8.5 horas', target: '12 horas', met: true },
  { name: 'Cierre cotizacion', actual: '12 dias', target: '15 dias', met: true },
];

const carrierPerformance = [
  { carrier: 'Uber Flash', shipments: 54, avgDelivery: '0.5 dias', onTime: 98, problems: 1, problemPct: 2, costAvg: 99, rating: 4.9 },
  { carrier: 'Estafeta', shipments: 38, avgDelivery: '3.2 dias', onTime: 85, problems: 3, problemPct: 8, costAvg: 280, rating: 4.2 },
  { carrier: 'FedEx', shipments: 28, avgDelivery: '2.8 dias', onTime: 92, problems: 1, problemPct: 4, costAvg: 330, rating: 4.5 },
  { carrier: 'DHL', shipments: 42, avgDelivery: '3.5 dias', onTime: 78, problems: 6, problemPct: 14, costAvg: 370, rating: 3.8 },
];

const deliveryDistribution = [
  { range: '1-2 dias', count: 54, pct: 33 },
  { range: '3-4 dias', count: 56, pct: 35 },
  { range: '5 dias', count: 32, pct: 20 },
  { range: '6-7 dias', count: 14, pct: 9 },
  { range: '7+ dias', count: 6, pct: 4 },
];

const problemRates = [
  { name: 'Reembolsos', actual: '2 (1.2%)', target: '<3%', met: true },
  { name: 'Incidencias envio', actual: '11 (6.8%)', target: '<5%', met: false },
  { name: 'Reviews negativas (1-2 estrellas)', actual: '11 (7.7%)', target: '<10%', met: true },
  { name: 'Cotizaciones rechazadas', actual: '12 de 48 (25%)', target: 'Normal para custom', met: true },
];

const savedDashboards = [
  { id: 'db1', name: 'Mi Resumen Diario', icon: 'RD', widgets: 6 },
  { id: 'db2', name: 'Flash Sales', icon: 'FS', widgets: 4 },
  { id: 'db3', name: 'B2B Tracking', icon: 'B2', widgets: 5 },
];

const widgetCategories = [
  { category: 'Graficas', items: ['Linea de tendencia', 'Barras comparativa', 'Dona distribucion', 'Funnel embudo', 'Heatmap actividad', 'Sparkline mini'] },
  { category: 'Metricas', items: ['KPI Card', 'Semaforo vs meta', 'Contador tiempo real'] },
  { category: 'Tablas', items: ['Top productos', 'Top clientes', 'Pedidos recientes', 'Cotizaciones activas', 'Reviews pendientes', 'Stock bajo'] },
];

// ===== SHARED COMPONENTS =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={'bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm ' + className}>
      {children}
    </div>
  );
}

function STitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-medium text-[var(--admin-text)] uppercase tracking-wider border-b border-[var(--admin-border)] pb-2 mb-4">
      {children}
    </h4>
  );
}

function Insight({ text, type = 'info' }: { text: string; type?: 'info' | 'warning' | 'success' }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons: Record<string, React.ElementType> = {
    info: Lightbulb,
    warning: AlertTriangle,
    success: CheckCircle,
  };
  const Icon = icons[type];
  return (
    <div className={'flex items-start gap-2 p-3 rounded-lg border text-xs ' + styles[type]}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function StatusDot({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const c = status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-amber-400' : 'bg-red-500';
  return <span className={'inline-block w-3 h-3 rounded-full ' + c} />;
}

// ===== TAB 1: RESUMEN EJECUTIVO =====
function ResumenTab() {
  return (
    <div className="space-y-6">
      {/* Scorecard */}
      <Card className="p-5">
        <STitle>Scorecard de Negocio - Febrero 2026</STitle>
        <p className="text-[10px] text-[var(--admin-muted)] mb-4 -mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> En meta</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Cerca (&lt;10% debajo)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Debajo de meta</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {scorecardItems.map((s, i) => (
            <motion.div
              key={s.area}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={
                'p-3 rounded-xl border ' +
                (s.status === 'green'
                  ? 'border-green-200 bg-green-50/30'
                  : s.status === 'yellow'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-red-200 bg-red-50/30')
              }
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <StatusDot status={s.status} />
                <span className="text-[10px] font-medium text-[var(--admin-text)] uppercase tracking-wider">{s.area}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--admin-text)]">{s.value}</p>
              <p className="text-[10px] text-[var(--admin-text-secondary)]">{s.metric} {s.met ? '(ok)' : '(!)'}</p>
              <p className="text-[10px] text-[var(--admin-muted)]">{s.delta}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Sparklines */}
      <Card className="p-5">
        <STitle>Tendencias clave (30 dias)</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sparklineData.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[var(--admin-surface2)] rounded-lg">
              <div className="w-24 h-8 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.data.map((v, j) => ({ v, i: j }))}>
                    <Line
                      dataKey="v"
                      stroke={s.trend === 'up' ? '#22c55e' : (['down'] as string[]).includes(s.trend) ? '#ef4444' : 'var(--admin-accent)'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[var(--admin-muted)] truncate">{s.label}</p>
                <p className="text-sm font-semibold text-[var(--admin-text)]">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-5">
        <STitle>Alertas y anomalias</STitle>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Insight key={i} text={a.text} type={a.type === 'warning' ? 'warning' : 'info'} />
          ))}
        </div>
      </Card>

      {/* Comparison table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)]">
          <STitle>Comparativa: Actual vs Anterior</STitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)]">
                <th className="px-5 py-2">Metrica</th>
                <th className="px-5 py-2 text-right">Actual</th>
                <th className="px-5 py-2 text-right">Anterior</th>
                <th className="px-5 py-2 text-right">Cambio</th>
                <th className="px-5 py-2">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {comparisonTable.map((r) => (
                <tr key={r.metric} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--admin-text)]">{r.metric}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text)] text-right font-mono">{r.actual}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right font-mono">{r.prev}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className={r.up ? 'text-green-600' : 'text-red-500'}>{r.change}</span>
                  </td>
                  <td className="px-5 py-2.5 text-[10px] text-[var(--admin-text-secondary)] flex items-center gap-1">
                    {r.up ? <ArrowUpRight size={10} className="text-green-600" /> : <ArrowDownRight size={10} className="text-red-500" />}
                    {r.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 2: VENTAS & CONVERSION =====
function VentasTab() {
  return (
    <div className="space-y-6">
      {/* Funnel */}
      <Card className="p-5">
        <STitle>Embudo de Conversion</STitle>
        <div className="space-y-3">
          {funnelData.map((step, i) => (
            <div key={step.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--admin-text)] font-medium">{step.name}</span>
                <span className="text-[var(--admin-text)] font-mono">
                  {step.value.toLocaleString()} <span className="text-[var(--admin-muted)]">({step.pct}%)</span>
                </span>
              </div>
              <div className="w-full bg-[var(--admin-surface2)] rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step.pct + '%' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ backgroundColor: step.fill }}
                >
                  {step.pct > 8 && <span className="text-[10px] text-white font-medium">{step.pct}%</span>}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Insight text='Mayor perdida: "Vieron producto" a "Agregaron carrito" (80.5% abandono). Posible causa: precio, falta de reviews o fotos.' type="warning" />
          <Insight text="Checkout a Compra: 46.6% conversion (bueno para e-commerce). Abandono 53.4%: revisar si el envio es el factor." />
        </div>
      </Card>

      {/* Heatmap (as stacked bar by day) */}
      <Card className="p-5">
        <STitle>Ventas por hora y dia (heatmap)</STitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByDayHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={chartStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="8-12h" stackId="a" fill="var(--admin-border)" />
              <Bar dataKey="12-16h" stackId="a" fill="var(--admin-muted)" />
              <Bar dataKey="16-20h" stackId="a" fill="var(--admin-accent)" />
              <Bar dataKey="20-24h" stackId="a" fill="var(--admin-text-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Insight text="Picos: Viernes 10-12h y Domingo 18-20h. Programar campanas para jueves noche y domingo mediodia." />
      </Card>

      {/* Traffic Sources */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)]">
          <STitle>Ventas por fuente de trafico</STitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)]">
                <th className="px-5 py-2">Fuente</th>
                <th className="px-5 py-2 text-right">Ingresos</th>
                <th className="px-5 py-2 text-right">%</th>
                <th className="px-5 py-2 text-right">Conv.</th>
                <th className="px-5 py-2 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {trafficSources.map((t) => (
                <tr key={t.source} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--admin-text)]">{t.source}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--admin-text)] text-right">{fmt(t.revenue)}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">{t.pct}%</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className={'px-1.5 py-0.5 rounded-full ' + (t.conv >= 4 ? 'bg-green-50 text-green-600' : t.conv >= 2.5 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500')}>
                      {t.conv}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--admin-text-secondary)] text-right">{fmt(t.ticket)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Insight text="Email tiene la mejor conversion (6.8%) y Referidos el mejor balance. Redes sociales trae volumen pero baja conversion." />
        </div>
      </Card>

      {/* Abandoned carts */}
      <Card className="p-5">
        <STitle>Analisis de carritos abandonados</STitle>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">Carritos abandonados</p>
            <p className="text-xl font-semibold text-[var(--admin-text)] font-sans">518</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">Valor total abandonado</p>
            <p className="text-xl font-semibold text-red-500 font-sans">$456,800</p>
          </div>
        </div>
        <h6 className="text-xs font-medium text-[var(--admin-text)] mb-2">Productos mas abandonados:</h6>
        <div className="space-y-2 mb-4">
          {abandonedProducts.map((p) => (
            <div key={p.product} className="flex items-center justify-between p-2.5 bg-[var(--admin-surface2)] rounded-lg text-xs">
              <span className="text-[var(--admin-text)]">{p.product} ({fmt(p.price)})</span>
              <span className="text-[var(--admin-text-secondary)]">
                {p.abandons} abandonos{p.reason && <span className="text-[var(--admin-muted)] ml-1">- {p.reason}</span>}
              </span>
            </div>
          ))}
        </div>
        <h6 className="text-xs font-medium text-[var(--admin-text)] mb-2">Punto de abandono:</h6>
        <div className="space-y-2">
          {abandonReasons.map((r) => (
            <div key={r.reason}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-[var(--admin-text-secondary)]">{r.reason}</span>
                <span className="font-medium text-[var(--admin-text)]">{r.pct}%</span>
              </div>
              <div className="w-full bg-[var(--admin-surface2)] rounded-full h-2">
                <div className="bg-[var(--admin-accent)] h-2 rounded-full" style={{ width: r.pct + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Devices */}
      <Card className="p-5">
        <STitle>Dispositivos y plataformas</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deviceData.map((d) => (
            <div key={d.device} className="p-4 bg-[var(--admin-surface2)] rounded-xl text-center">
              <d.icon size={24} className="mx-auto text-[var(--admin-text-secondary)] mb-2" />
              <p className="text-sm font-semibold text-[var(--admin-text)]">{d.device}</p>
              <div className="mt-2 space-y-1 text-xs text-[var(--admin-text-secondary)]">
                <p>{d.traffic}% trafico</p>
                <p>{d.sales}% ventas</p>
                <p className={'font-medium ' + (d.conv >= 3 ? 'text-green-600' : 'text-amber-600')}>{d.conv}% conversion</p>
              </div>
            </div>
          ))}
        </div>
        <Insight text="Mobile trae mas trafico pero convierte menos (2.1% vs 3.8% desktop). Revisar UX mobile." type="warning" />
      </Card>
    </div>
  );
}

// ===== TAB 3: CLIENTES =====
function ClientesTab() {
  return (
    <div className="space-y-6">
      {/* Acquisition */}
      <Card className="p-5">
        <STitle>Adquisicion de clientes</STitle>
        <div className="flex items-center gap-4 mb-3 text-xs text-[var(--admin-text-secondary)]">
          <span>Total nuevos (periodo): <span className="font-semibold text-[var(--admin-text)]">18</span></span>
          <span>Costo de adquisicion est.: <span className="font-semibold text-green-600">$0</span> (organico)</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={newCustomersWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 8, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={chartStyle} />
              <Bar dataKey="count" name="Nuevos clientes" fill="var(--admin-accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cohort */}
      <Card className="p-5">
        <STitle>Retencion por cohorte (%)</STitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider">
                <th className="py-2 pr-4">Cohorte</th>
                {['Mes 0', 'Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'].map((m) => (
                  <th key={m} className="py-2 text-center px-2">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((c) => (
                <tr key={c.cohort} className="border-t border-[var(--admin-border)]">
                  <td className="py-2 pr-4 text-xs font-medium text-[var(--admin-text)] whitespace-nowrap">{c.cohort}</td>
                  {c.months.map((v, i) => (
                    <td key={i} className="py-2 px-2 text-center">
                      {v !== null ? (
                        <span
                          className="inline-block w-10 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, ' + (Math.min(v / 100, 1) * 0.6 + 0.05) + ')',
                            color: v > 40 ? 'white' : v > 20 ? '#166534' : '#374151',
                          }}
                        >
                          {v}%
                        </span>
                      ) : (
                        <span className="text-[var(--admin-muted)]">&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Insight text="La retencion al mes 1 esta mejorando (28% a 40%). El programa de lealtad esta funcionando." type="success" />
      </Card>

      {/* RFM */}
      <Card className="p-5">
        <STitle>Analisis RFM (Recencia, Frecuencia, Monetizacion)</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {rfmSegments.map((s) => (
            <div key={s.segment} className="p-3 rounded-xl border border-[var(--admin-border)]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-medium text-[var(--admin-text)]">{s.segment}</span>
                <span className="text-[10px] text-[var(--admin-muted)]">({s.desc})</span>
              </div>
              <div className="text-[10px] text-[var(--admin-text-secondary)] space-y-0.5">
                <p>{s.clients} clientes ({s.pct}%)</p>
                <p>{fmt(s.revenue)} ({s.revPct}% ingresos)</p>
              </div>
              <div className="mt-2 p-2 bg-[var(--admin-surface2)] rounded text-[10px] text-[var(--admin-text-secondary)]">
                <span className="font-medium text-[var(--admin-text)]">Accion:</span> {s.action}
              </div>
            </div>
          ))}
        </div>
        {/* RFM Donut */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rfmSegments.map((s) => ({ name: s.segment, value: s.clients }))}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {rfmSegments.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <RTooltip contentStyle={chartStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Geo */}
      <Card className="p-5">
        <STitle>Distribucion geografica de clientes</STitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {geoData.map((g) => (
            <div key={g.city} className="p-3 bg-[var(--admin-surface2)] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={12} className="text-[var(--admin-accent)]" />
                <span className="text-xs font-medium text-[var(--admin-text)]">{g.city}</span>
              </div>
              <p className="text-lg font-semibold text-[var(--admin-text)] font-sans">{g.clients}</p>
              <p className="text-[10px] text-[var(--admin-muted)]">{g.pct}% del total</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 4: PRODUCTOS =====
function ProductosTab() {
  const catColors: Record<string, string> = { star: '#22c55e', cow: 'var(--admin-accent)', question: '#3b82f6', dog: '#ef4444' };
  const catLabels: Record<string, string> = { star: 'Estrella', cow: 'Vaca', question: 'Interrogante', dog: 'Perro' };

  return (
    <div className="space-y-6">
      {/* BCG Matrix */}
      <Card className="p-5">
        <STitle>Matriz BCG simplificada</STitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis
                type="number"
                dataKey="share"
                name="Participacion %"
                tick={{ fontSize: 10, fill: 'var(--admin-muted)' }}
                label={{ value: 'Participacion %', position: 'bottom', fontSize: 10, fill: 'var(--admin-muted)' }}
              />
              <YAxis
                type="number"
                dataKey="growth"
                name="Crecimiento %"
                tick={{ fontSize: 10, fill: 'var(--admin-muted)' }}
                label={{ value: 'Crecimiento %', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--admin-muted)' }}
              />
              <ZAxis type="number" dataKey="revenue" range={[100, 600]} />
              <RTooltip contentStyle={chartStyle} />
              <ReferenceLine y={10} stroke="var(--admin-muted)" strokeDasharray="3 3" />
              <ReferenceLine x={10} stroke="var(--admin-muted)" strokeDasharray="3 3" />
              <Scatter data={bcgProducts}>
                {bcgProducts.map((p, i) => (
                  <Cell key={i} fill={catColors[p.category]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {(['star', 'cow', 'question', 'dog'] as const).map((cat) => (
            <div key={cat} className="p-3 rounded-lg border border-[var(--admin-border)]">
              <p className="text-xs font-medium mb-1" style={{ color: catColors[cat] }}>{catLabels[cat]}</p>
              <div className="space-y-1">
                {bcgProducts.filter((p) => p.category === cat).map((p) => (
                  <p key={p.name} className="text-[10px] text-[var(--admin-text-secondary)]">
                    {p.name} <span className="text-[var(--admin-muted)]">({p.growth > 0 ? '+' : ''}{p.growth}%, {p.share}%)</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price vs Demand */}
      <Card className="p-5">
        <STitle>Analisis de precio vs demanda</STitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis
                type="number"
                dataKey="price"
                tick={{ fontSize: 10, fill: 'var(--admin-muted)' }}
                label={{ value: 'Precio (MXN)', position: 'bottom', fontSize: 10, fill: 'var(--admin-muted)' }}
                tickFormatter={(v) => fmt(v)}
              />
              <YAxis
                type="number"
                dataKey="units"
                tick={{ fontSize: 10, fill: 'var(--admin-muted)' }}
                label={{ value: 'Unidades vendidas', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--admin-muted)' }}
              />
              <ZAxis type="number" dataKey="margin" range={[80, 300]} />
              <RTooltip
                contentStyle={chartStyle}
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[var(--admin-text)] text-[var(--admin-surface2)] p-2 rounded-lg text-[10px]">
                        <p className="font-medium">{d.name}</p>
                        <p>Precio: {fmt(d.price)}</p>
                        <p>Uds: {d.units}</p>
                        <p>Margen: {d.margin}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={priceVsDemand} fill="var(--admin-accent)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Insight text="Sweet spot: productos $800-$1,200 son los que mas se venden. Productos >$1,500 se venden menos pero tienen mejor margen." />
      </Card>

      {/* Cross-sell */}
      <Card className="p-5">
        <STitle>Cross-sell / Afinidad de productos</STitle>
        <p className="text-xs text-[var(--admin-text-secondary)] mb-3">"Los que compraron X tambien compraron Y"</p>
        <div className="space-y-3">
          {crossSellData.map((c) => (
            <div key={c.product} className="flex items-center gap-3 p-3 bg-[var(--admin-surface2)] rounded-lg text-xs">
              <span className="font-medium text-[var(--admin-text)]">{c.product}</span>
              <ChevronRight size={14} className="text-[var(--admin-muted)]" />
              <span className="text-[var(--admin-text)]">{c.pct}% tambien compro <span className="font-medium">{c.related}</span></span>
            </div>
          ))}
        </div>
        <Insight text="Oportunidades de bundle automatico basadas en datos de compra." type="success" />
      </Card>

      {/* Sell-through */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)]">
          <STitle>Velocidad de venta (sell-through rate)</STitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)]">
                <th className="px-5 py-2">Producto</th>
                <th className="px-5 py-2 text-right">Stock inicio</th>
                <th className="px-5 py-2 text-right">Vendidos</th>
                <th className="px-5 py-2 text-right">Sell-through</th>
                <th className="px-5 py-2 text-right">Dias para agotar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {sellThroughData.map((p) => (
                <tr key={p.product} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--admin-text)]">{p.product}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">{p.stockStart}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">{p.sold}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className={'px-1.5 py-0.5 rounded-full ' + (p.level === 'green' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
                      {p.sellThrough}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">
                    {p.daysToEmpty >= 999 ? '(no se vende)' : '~' + p.daysToEmpty + ' dias'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 5: OPERACIONES =====
function OperacionesTab() {
  return (
    <div className="space-y-6">
      {/* SLAs */}
      <Card className="p-5">
        <STitle>SLA de Tiempos</STitle>
        <div className="space-y-3">
          {slaData.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 bg-[var(--admin-surface2)] rounded-lg">
              <span className="text-xs text-[var(--admin-text)]">{s.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-[var(--admin-text)]">{s.actual}</span>
                <span className="text-[10px] text-[var(--admin-muted)]">Meta: {s.target}</span>
                {s.met ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery distribution */}
      <Card className="p-5">
        <STitle>Distribucion de tiempos de entrega</STitle>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deliveryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={chartStyle} />
              <Bar dataKey="count" name="Envios" fill="var(--admin-accent)" radius={[4, 4, 0, 0]}>
                {deliveryDistribution.map((_, i) => (
                  <Cell key={i} fill={i <= 1 ? '#22c55e' : i === 2 ? 'var(--admin-accent)' : i === 3 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-[var(--admin-text-secondary)] mt-2">68% en &lt;5 dias | 22% en 5-7 dias | 10% en &gt;7 dias</p>
      </Card>

      {/* Carrier performance */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)]">
          <STitle>Rendimiento por carrier</STitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)]">
                <th className="px-5 py-2">Carrier</th>
                <th className="px-5 py-2 text-right">Envios</th>
                <th className="px-5 py-2 text-right">Prom. entrega</th>
                <th className="px-5 py-2 text-right">A tiempo</th>
                <th className="px-5 py-2 text-right">Problemas</th>
                <th className="px-5 py-2 text-right">Costo prom.</th>
                <th className="px-5 py-2 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {carrierPerformance.map((c) => (
                <tr key={c.carrier} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-5 py-2.5 text-xs font-medium text-[var(--admin-text)]">{c.carrier}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">{c.shipments}</td>
                  <td className="px-5 py-2.5 text-xs text-[var(--admin-text-secondary)] text-right">{c.avgDelivery}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className={'px-1.5 py-0.5 rounded-full ' + (c.onTime >= 90 ? 'bg-green-50 text-green-600' : c.onTime >= 80 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500')}>
                      {c.onTime}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className={c.problemPct > 10 ? 'text-red-500' : 'text-[var(--admin-text-secondary)]'}>
                      {c.problems} ({c.problemPct}%)
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs font-mono text-[var(--admin-text-secondary)] text-right">{fmt(c.costAvg)}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    <span className="flex items-center justify-end gap-0.5">
                      <Star size={10} className="text-[var(--admin-accent)] fill-accent-gold" />{c.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Insight text="DHL: menor % a tiempo (78%) y mas problemas (14%). Evaluar reducir uso." type="warning" />
        </div>
      </Card>

      {/* Problem rates */}
      <Card className="p-5">
        <STitle>Tasa de problemas</STitle>
        <div className="space-y-2">
          {problemRates.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 bg-[var(--admin-surface2)] rounded-lg text-xs">
              <span className="text-[var(--admin-text)]">{p.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium text-[var(--admin-text)]">{p.actual}</span>
                <span className="text-[10px] text-[var(--admin-muted)]">Meta: {p.target}</span>
                {p.met ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertTriangle size={14} className="text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Workshop capacity */}
      <Card className="p-5">
        <STitle>Capacidad del taller</STitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">En produccion</p>
            <p className="text-lg font-semibold text-[var(--admin-text)] font-sans">8 pedidos</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">Cotizaciones en prod.</p>
            <p className="text-lg font-semibold text-[var(--admin-text)] font-sans">1 (5 piezas)</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">Capacidad estimada</p>
            <p className="text-lg font-semibold text-[var(--admin-text)] font-sans">12 simultaneos</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase">Utilizacion</p>
            <p className="text-lg font-semibold text-green-600 font-sans">67%</p>
          </div>
        </div>
        <div className="w-full bg-[var(--admin-surface2)] rounded-full h-4 mb-3">
          <div className="bg-green-500 h-4 rounded-full flex items-center justify-center" style={{ width: '67%' }}>
            <span className="text-[10px] text-white font-medium">67%</span>
          </div>
        </div>
        <p className="text-xs text-[var(--admin-text-secondary)] mb-2">
          Cuello de botella: <span className="font-medium">Grabado laser</span> (1 maquina, 45 grabados este mes)
        </p>
        <Insight text="Si las ventas siguen creciendo +18%, necesitaras un 3er artesano o ampliar las horas del taller en ~3 meses." type="warning" />
      </Card>
    </div>
  );
}

// ===== TAB 6: DASHBOARDS CUSTOM =====
function CustomTab() {
  return (
    <div className="space-y-6">
      {/* Saved dashboards */}
      <Card className="p-5">
        <STitle>Dashboards guardados</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {savedDashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => toast.success('Abriendo "' + d.name + '"...')}
              className="p-4 bg-[var(--admin-surface2)] rounded-xl text-left hover:bg-[var(--admin-surface2)] transition-colors border border-transparent hover:border-[var(--admin-accent)]/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-1.5 py-0.5 rounded">{d.icon}</span>
                <span className="text-xs font-medium text-[var(--admin-text)]">{d.name}</span>
              </div>
              <p className="text-[10px] text-[var(--admin-muted)]">{d.widgets} widgets</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Widget palette */}
      <Card className="p-5">
        <STitle>Crear / Editar Dashboard</STitle>
        <div className="mb-4">
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Nombre del dashboard</label>
          <input
            type="text"
            defaultValue="Mi Resumen Diario"
            className="w-full max-w-md border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]"
          />
        </div>

        <h6 className="text-xs font-medium text-[var(--admin-text)] mb-3">Widgets disponibles (arrastrar al canvas)</h6>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {widgetCategories.map((cat) => (
            <div key={cat.category} className="p-3 bg-[var(--admin-surface2)] rounded-xl">
              <p className="text-xs font-medium text-[var(--admin-text)] mb-2">{cat.category}</p>
              <div className="space-y-1.5">
                {cat.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 bg-[var(--admin-surface)] rounded-lg border border-[var(--admin-border)] text-[10px] text-[var(--admin-text-secondary)] hover:border-[var(--admin-accent)]/40 transition-colors">
                    <GripVertical size={10} className="text-[var(--admin-muted)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder canvas */}
        <div className="border-2 border-dashed border-[var(--admin-border)] rounded-xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl mb-4">
            {[
              { title: 'Ingresos Hoy', value: '$5,200', type: 'KPI' },
              { title: 'Pedidos Pendientes', value: '8', type: 'KPI' },
              { title: 'Stock Bajo', value: '3 productos', type: 'Alerta' },
            ].map((w, i) => (
              <div key={i} className="bg-[var(--admin-surface)] p-3 rounded-lg border border-[var(--admin-border)] shadow-sm text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-[var(--admin-muted)] uppercase">{w.type}</span>
                  <GripVertical size={10} className="text-[var(--admin-muted)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--admin-text)]">{w.value}</p>
                <p className="text-[10px] text-[var(--admin-text-secondary)]">{w.title}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--admin-muted)]">Arrastra widgets aqui para construir tu dashboard</p>
          <p className="text-[10px] text-[var(--admin-muted)] mt-1">Los widgets son configurables: metrica, periodo, comparativa, tamano</p>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button className="px-4 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)] rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => toast.success('Dashboard guardado')}
            className="px-4 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors"
          >
            Guardar dashboard
          </button>
          <button
            onClick={() => toast.success('Establecido como inicio')}
            className="px-4 py-2 text-xs border border-[var(--admin-accent)] text-[var(--admin-accent)] rounded-lg hover:bg-[var(--admin-accent)]/10 transition-colors"
          >
            Establecer como mi inicio
          </button>
        </div>
      </Card>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const ReportsAnalyticsPage: React.FC = () => {

  const { t } = useTheme();
  const { Card: TCard, Badge: TBadge, Button: TButton, Table: TTable, StatCard: TStatCard } = useThemeComponents();
  // ── Live data from API ──
  const [liveReports, setLiveReports] = useState<any>(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/reports').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveReports(d); }).catch(() => {}).finally(() => setReportsLoading(false));
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [period, setPeriod] = useState('Este mes');

  const tabContent: Record<TabId, React.ReactNode> = {
    resumen: <ResumenTab />,
    ventas: <VentasTab />,
    clientes: <ClientesTab />,
    productos: <ProductosTab />,
    operaciones: <OperacionesTab />,
    custom: <CustomTab />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-[var(--admin-text)] flex items-center gap-2">
          <BarChart3 size={20} className="text-[var(--admin-accent)]" /> Reportes y Analytics
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Creando nuevo dashboard...')}
            className="px-3 py-1.5 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors flex items-center gap-1.5"
          >
            <Plus size={12} /> Nuevo Dashboard
          </button>
          <button
            onClick={() => toast.success('Exportando...')}
            className="px-3 py-1.5 text-xs border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface2)] transition-colors flex items-center gap-1.5"
          >
            <Download size={12} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-[var(--admin-border)]">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={
                'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab === t.id
                  ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] font-medium'
                  : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]')
              }
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)]">
          <Calendar size={12} className="text-[var(--admin-muted)]" />
          <span>Periodo:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-[var(--admin-border)] rounded-lg px-2 py-1 text-xs bg-[var(--admin-surface)]"
          >
            {periods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)]">
          <span>Comparar:</span>
          <select className="border border-[var(--admin-border)] rounded-lg px-2 py-1 text-xs bg-[var(--admin-surface)]">
            <option>Mes anterior</option>
            <option>Mismo periodo ano anterior</option>
            <option>Sin comparar</option>
          </select>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
