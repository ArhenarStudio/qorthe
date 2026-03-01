"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck, Package, Search, RefreshCw, Download, ChevronDown,
  Copy, Printer, ExternalLink, CheckCircle, Clock, AlertTriangle,
  MapPin, Mail, MoreHorizontal, X as XIcon, Settings, Eye,
  ChevronRight, Filter
} from 'lucide-react';
import { orders, type Order } from '@/data/adminMockData';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ===== MOCK SHIPPING DATA =====
interface ShippingEntry {
  order: Order;
  guideSince?: string;       // when guide was generated
  carrierStatus?: string;    // detailed carrier status
  estimatedDelivery?: string;
  deliveredDate?: string;
  deliveryDays?: number;
  hasReview?: boolean;
  reviewStars?: number;
}

const buildShippingData = (): {
  pending: ShippingEntry[];
  ready: ShippingEntry[];
  transit: ShippingEntry[];
  delivered: ShippingEntry[];
  problems: ShippingEntry[];
} => {
  const pending: ShippingEntry[] = [];
  const ready: ShippingEntry[] = [];
  const transit: ShippingEntry[] = [];
  const delivered: ShippingEntry[] = [];
  const problems: ShippingEntry[] = [];

  orders.forEach(o => {
    if (o.shippingStatus === 'pending' || (o.shippingStatus === 'production' && o.paymentStatus === 'paid' && !o.tracking)) {
      pending.push({ order: o });
    }
    if (o.shippingStatus === 'shipped' && o.orderStatus !== 'delivered') {
      transit.push({
        order: o,
        carrierStatus: 'En bodega de distribución',
        estimatedDelivery: '01 Mar 2026',
      });
    }
    if (o.shippingStatus === 'delivered' || o.orderStatus === 'delivered') {
      delivered.push({
        order: o,
        deliveredDate: '27 Feb 2026',
        deliveryDays: 3,
        hasReview: o.id === 'ord-004',
        reviewStars: o.id === 'ord-004' ? 4 : undefined,
      });
    }
  });

  // Extra mock for ready (simulate a guía generated but not picked up)
  if (transit.length > 0) {
    ready.push({
      order: { ...transit[0].order },
      guideSince: 'Hace 2h',
    });
  }

  // Mock problem
  problems.push({
    order: {
      ...orders[2],
      id: 'ord-problem-1',
    },
    carrierStatus: 'Entrega retrasada',
    estimatedDelivery: '27 Feb 2026',
  });

  return { pending, ready, transit, delivered, problems };
};

const shippingData = buildShippingData();

// ===== KPI DATA =====
const kpis = [
  { label: 'Pendientes de guía', value: shippingData.pending.length, icon: '🟡', sub: '2 urgentes', subClass: 'text-red-500' },
  { label: 'Listos para recolección', value: shippingData.ready.length, icon: '📦', sub: '', subClass: '' },
  { label: 'En tránsito', value: shippingData.transit.length, icon: '🚚', sub: '1 retrasado', subClass: 'text-amber-600' },
  { label: 'Entregados este mes', value: 42, icon: '✅', sub: '98% a tiempo', subClass: 'text-green-600' },
  { label: 'Costo envío este mes', value: '$4,850', icon: '💰', sub: 'Prom: $285', subClass: 'text-wood-500' },
];

// ===== CARRIER REPORT DATA =====
const carrierReport = [
  { carrier: 'DHL', guides: 28, totalCost: 10388, avgCost: 371, avgDays: 2.8, onTime: 96, problems: 1 },
  { carrier: 'Estafeta', guides: 15, totalCost: 4275, avgCost: 285, avgDays: 4.1, onTime: 87, problems: 2 },
  { carrier: 'FedEx', guides: 8, totalCost: 2560, avgCost: 320, avgDays: 2.2, onTime: 100, problems: 0 },
  { carrier: 'Local', guides: 12, totalCost: 1188, avgCost: 99, avgDays: 0.5, onTime: 100, problems: 0 },
];

const carrierPieData = carrierReport.map(c => ({ name: c.carrier, value: c.guides }));
const PIE_COLORS = ['#C5A065', '#8B7355', '#A0522D', '#D4C5A9'];

const dailyShipments = [
  { day: '22 Feb', envios: 3 }, { day: '23 Feb', envios: 5 }, { day: '24 Feb', envios: 2 },
  { day: '25 Feb', envios: 4 }, { day: '26 Feb', envios: 6 }, { day: '27 Feb', envios: 3 }, { day: '28 Feb', envios: 1 },
];

type ShippingTab = 'pending' | 'ready' | 'transit' | 'delivered' | 'problems';

// ===== MAIN COMPONENT =====
export const ShippingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShippingTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [resolveModal, setResolveModal] = useState<ShippingEntry | null>(null);
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [carrierFilterOpen, setCarrierFilterOpen] = useState(false);

  const tabs: { key: ShippingTab; label: string; count: number }[] = [
    { key: 'pending', label: 'Pendientes', count: shippingData.pending.length },
    { key: 'ready', label: 'Listos para recolección', count: shippingData.ready.length },
    { key: 'transit', label: 'En tránsito', count: shippingData.transit.length },
    { key: 'delivered', label: 'Entregados', count: 42 },
    { key: 'problems', label: 'Problemas', count: shippingData.problems.length },
  ];

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllPending = () => {
    if (selectedRows.size === shippingData.pending.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(shippingData.pending.map(e => e.order.id)));
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
            🚚 Centro de Envíos
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => toast.success('Datos actualizados')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:border-wood-300 transition-colors"
            >
              <RefreshCw size={14} /> Actualizar
            </button>
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:border-wood-300 transition-colors"
              >
                <Download size={14} /> Exportar <ChevronDown size={12} />
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-30 min-w-[200px]">
                  {['Exportar lista CSV', 'Exportar guías pendientes (PDF)', 'Reporte de envíos'].map(item => (
                    <button key={item} onClick={() => { toast.info(item); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-wood-600 hover:bg-sand-50">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:border-wood-300 transition-colors"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center bg-white border border-wood-200 rounded-lg overflow-hidden">
            <Search size={14} className="ml-3 text-wood-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido..."
              className="flex-1 px-3 py-2 text-xs bg-transparent outline-none text-wood-900 placeholder:text-wood-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setCarrierFilterOpen(!carrierFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:border-wood-300 transition-colors"
            >
              <Filter size={12} />
              Carrier: {carrierFilter === 'all' ? 'Todos' : carrierFilter}
              <ChevronDown size={12} />
            </button>
            {carrierFilterOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                {['all', 'DHL', 'Estafeta', 'FedEx', 'Local'].map(c => (
                  <button key={c} onClick={() => { setCarrierFilter(c); setCarrierFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-sand-50 ${carrierFilter === c ? 'text-accent-gold font-medium' : 'text-wood-600'}`}>
                    {c === 'all' ? 'Todos' : c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-wood-100 shadow-sm p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{kpi.icon}</span>
              <span className="text-2xl font-bold text-wood-900 font-sans">{typeof kpi.value === 'number' ? kpi.value : kpi.value}</span>
            </div>
            <p className="text-[10px] text-wood-400 uppercase tracking-wider">{kpi.label}</p>
            {kpi.sub && <p className={`text-[10px] mt-1 ${kpi.subClass}`}>{kpi.sub.includes('urgente') ? '⚠️ ' : ''}{kpi.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-1 bg-sand-50 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedRow(null); setSelectedRows(new Set()); }}
            className={`px-4 py-2 text-xs rounded-md transition-colors whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-wood-900 shadow-sm font-medium' : 'text-wood-500 hover:text-wood-700'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ===== BULK ACTIONS BAR ===== */}
      <AnimatePresence>
        {selectedRows.size > 0 && activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-wood-900 rounded-lg px-5 py-3 flex items-center justify-between text-sand-100"
          >
            <span className="text-xs">☑ {selectedRows.size} seleccionados</span>
            <div className="flex gap-2">
              <button onClick={() => setBatchModalOpen(true)} className="px-3 py-1.5 bg-accent-gold text-wood-900 rounded-lg text-[11px] font-medium hover:bg-accent-gold/90 transition-colors">
                Generar guías en batch
              </button>
              <button onClick={() => setSelectedRows(new Set())} className="px-3 py-1.5 bg-white/10 rounded-lg text-[11px] hover:bg-white/20 transition-colors">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TAB CONTENT ===== */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        {activeTab === 'pending' && <PendingTab entries={shippingData.pending} expandedRow={expandedRow} setExpandedRow={setExpandedRow} selectedRows={selectedRows} toggleRow={toggleRow} toggleAll={toggleAllPending} getTimeSince={getTimeSince} />}
        {activeTab === 'ready' && <ReadyTab entries={shippingData.ready} />}
        {activeTab === 'transit' && <TransitTab entries={shippingData.transit} expandedRow={expandedRow} setExpandedRow={setExpandedRow} />}
        {activeTab === 'delivered' && <DeliveredTab entries={shippingData.delivered} />}
        {activeTab === 'problems' && <ProblemsTab entries={shippingData.problems} onResolve={setResolveModal} />}
      </div>

      {/* ===== REPORTS SECTION ===== */}
      <div className="space-y-4">
        <h4 className="font-serif text-sm text-wood-900">Reportes de Envío</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Carrier Table */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-wood-100">
              <h5 className="text-xs font-medium text-wood-700">Métricas por Carrier</h5>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-50 bg-sand-50/50">
                    <th className="px-4 py-2">Carrier</th>
                    <th className="px-4 py-2">Guías</th>
                    <th className="px-4 py-2">Costo prom</th>
                    <th className="px-4 py-2">Tiempo</th>
                    <th className="px-4 py-2">A tiempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {carrierReport.map(c => (
                    <tr key={c.carrier} className="text-[11px]">
                      <td className="px-4 py-2.5 font-medium text-wood-900">{c.carrier}</td>
                      <td className="px-4 py-2.5 text-wood-600">{c.guides}</td>
                      <td className="px-4 py-2.5 text-wood-600">${c.avgCost}</td>
                      <td className="px-4 py-2.5 text-wood-600">{c.avgDays}d</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-medium ${c.onTime >= 95 ? 'text-green-600' : c.onTime >= 90 ? 'text-amber-600' : 'text-red-500'}`}>
                          {c.onTime}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
            <h5 className="text-xs font-medium text-wood-700 mb-4">Distribución por Carrier</h5>
            <div className="flex items-center gap-6">
              <PieChart width={140} height={140}>
                  <Pie data={carrierPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                    {carrierPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              <div className="space-y-2">
                {carrierPieData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-[11px] text-wood-600">{c.name}: {c.value} guías</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5 lg:col-span-2">
            <h5 className="text-xs font-medium text-wood-700 mb-4">Envíos por día</h5>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyShipments}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8B7355' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8B7355' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #e5e0d5', borderRadius: 8 }} />
                <Bar dataKey="envios" fill="#C5A065" radius={[4, 4, 0, 0]} name="Envíos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== BATCH MODAL ===== */}
      <AnimatePresence>
        {batchModalOpen && (
          <ModalOverlay onClose={() => setBatchModalOpen(false)}>
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-wood-100 flex items-center justify-between">
                <h4 className="text-sm font-medium text-wood-900">🏷️ Generación de Guías en Batch</h4>
                <button onClick={() => setBatchModalOpen(false)} className="p-1.5 hover:bg-sand-50 rounded-lg"><XIcon size={16} className="text-wood-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-wood-600">Seleccionados: <span className="font-bold">{selectedRows.size} pedidos</span></p>
                <div>
                  <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-2">Carrier para todos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['DHL Express', 'Estafeta', 'FedEx'].map(c => (
                      <button key={c} className="px-3 py-2 rounded-lg text-xs border border-wood-200 text-wood-600 hover:border-accent-gold hover:text-accent-gold transition-colors">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {shippingData.pending.filter(e => selectedRows.has(e.order.id)).map(e => (
                    <div key={e.order.id} className="flex items-center justify-between text-xs py-2 border-b border-wood-50">
                      <div className="flex items-center gap-2">
                        <span className="text-wood-700 font-medium">{e.order.number}</span>
                        <span className="text-wood-400">→ {e.order.addressDetail.city}</span>
                        {e.order.hasEngraving && <span className="text-sm">🔴</span>}
                      </div>
                      <span className="text-wood-400">{e.order.items.reduce((s, i) => s + (i.weight || 0), 0)} kg</span>
                    </div>
                  ))}
                </div>
                {shippingData.pending.some(e => selectedRows.has(e.order.id) && e.order.hasEngraving) && (
                  <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700">Algunos pedidos tienen grabado láser pendiente. Verifica antes de enviar.</p>
                  </div>
                )}
                <p className="text-xs text-wood-500">Costo estimado: <span className="font-bold text-wood-900">~$1,855 MXN</span></p>
              </div>
              <div className="p-5 border-t border-wood-100 flex gap-2">
                <button onClick={() => setBatchModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:bg-sand-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => { toast.success(`${selectedRows.size} guías generadas`); setBatchModalOpen(false); setSelectedRows(new Set()); }} className="flex-1 px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors">
                  Generar {selectedRows.size} guías
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ===== CONFIG SIDEBAR ===== */}
      <AnimatePresence>
        {configOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfigOpen(false)} className="fixed inset-0 z-40 bg-black/30" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-5 border-b border-wood-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h4 className="text-sm font-medium text-wood-900">⚙️ Configuración de Envíos</h4>
                <button onClick={() => setConfigOpen(false)} className="p-1.5 hover:bg-sand-50 rounded-lg"><XIcon size={16} className="text-wood-400" /></button>
              </div>
              <div className="p-5 space-y-6">
                {/* Zones */}
                <div>
                  <h5 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-3">📍 Zonas de Envío</h5>
                  {[
                    { name: 'México Nacional', coverage: 'Todo México excepto Hermosillo', carriers: 'DHL ✅ | Estafeta ✅ | FedEx ✅', freeFrom: '$2,500 MXN' },
                    { name: 'Hermosillo Local', coverage: 'CP 83000-83999', carriers: 'Uber Flash', freeFrom: '$2,500 MXN' },
                  ].map(zone => (
                    <div key={zone.name} className="bg-sand-50 rounded-lg p-4 mb-3">
                      <p className="text-xs font-medium text-wood-900">{zone.name}</p>
                      <p className="text-[10px] text-wood-500 mt-1">Cobertura: {zone.coverage}</p>
                      <p className="text-[10px] text-wood-500">Carriers: {zone.carriers}</p>
                      <p className="text-[10px] text-wood-500">Envío gratis desde: {zone.freeFrom}</p>
                      <button className="text-[10px] text-accent-gold font-medium mt-2 hover:underline">Editar</button>
                    </div>
                  ))}
                  <button className="text-xs text-accent-gold font-medium hover:underline">+ Agregar zona</button>
                </div>

                {/* Origin */}
                <div>
                  <h5 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-3">🏭 Dirección de Origen</h5>
                  <div className="bg-sand-50 rounded-lg p-4 space-y-1 text-xs text-wood-600">
                    <p className="font-medium text-wood-900">DavidSon's Design</p>
                    <p>Blvd Rodriguez #100</p>
                    <p>Col. Centro, Hermosillo, Sonora</p>
                    <p>CP 83000, México</p>
                    <p className="text-wood-400">Tel: 662-361-0742</p>
                    <button className="text-[10px] text-accent-gold font-medium mt-2 hover:underline">Editar</button>
                  </div>
                </div>

                {/* Default Package */}
                <div>
                  <h5 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-3">📦 Empaque por Defecto</h5>
                  <div className="bg-sand-50 rounded-lg p-4 space-y-1.5 text-xs text-wood-600">
                    <div className="flex justify-between"><span>Tipo</span><span className="text-wood-900">Caja</span></div>
                    <div className="flex justify-between"><span>Dimensiones</span><span className="text-wood-900">50 × 30 × 10 cm</span></div>
                    <div className="flex justify-between"><span>Peso empaque</span><span className="text-wood-900">0.5 kg</span></div>
                    <div className="flex justify-between"><span>Contenido</span><span className="text-wood-900">Tabla artesanal de madera</span></div>
                    <div className="flex justify-between"><span>Valor declarado</span><span className="text-wood-900">Total del pedido</span></div>
                    <div className="flex justify-between"><span>Seguro</span><span className="text-wood-900">Desactivado</span></div>
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <h5 className="text-xs font-bold text-wood-700 uppercase tracking-wider mb-3">📋 Reglas de Envío</h5>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Envío gratis en pedidos desde $2,500 MXN', checked: true },
                      { label: 'Calcular peso automático: 3 kg por tabla', checked: true },
                      { label: 'Pre-seleccionar carrier más barato', checked: true },
                      { label: 'Permitir que el cliente elija carrier', checked: false },
                      { label: 'Agregar seguro automáticamente (+$50)', checked: false },
                      { label: 'Validar CP Hermosillo para zona local', checked: true },
                    ].map(rule => (
                      <label key={rule.label} className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" defaultChecked={rule.checked} className="mt-0.5 accent-accent-gold" />
                        <span className="text-xs text-wood-600">{rule.label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => { toast.success('Configuración guardada'); setConfigOpen(false); }} className="mt-4 w-full px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== RESOLVE PROBLEM MODAL ===== */}
      <AnimatePresence>
        {resolveModal && (
          <ModalOverlay onClose={() => setResolveModal(null)}>
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-wood-100 flex items-center justify-between">
                <h4 className="text-sm font-medium text-wood-900">⚠️ Resolver Problema</h4>
                <button onClick={() => setResolveModal(null)} className="p-1.5 hover:bg-sand-50 rounded-lg"><XIcon size={16} className="text-wood-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-sand-50 rounded-lg p-3 space-y-1 text-xs">
                  <p className="text-wood-900 font-medium">{resolveModal.order.number} — {resolveModal.order.customer.name}</p>
                  <p className="text-wood-500">{resolveModal.carrierStatus}</p>
                  <p className="text-wood-400">Carrier: {resolveModal.order.carrier} | Tracking: {resolveModal.order.tracking}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-2">Acción de resolución</p>
                  <div className="space-y-1.5">
                    {[
                      'Reenviar producto nuevo (sin costo)',
                      'Reembolso total',
                      'Reembolso parcial',
                      'Crédito en tienda',
                      'Reclamar seguro al carrier',
                      'Marcar como resuelto (sin acción)',
                    ].map(action => (
                      <label key={action} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sand-50 cursor-pointer">
                        <input type="radio" name="resolution" className="accent-accent-gold" />
                        <span className="text-xs text-wood-600">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-2">Nota interna</p>
                  <textarea placeholder="Detalles de la resolución..." className="w-full bg-sand-50 border border-wood-200 rounded-lg p-3 text-xs text-wood-900 placeholder:text-wood-400 resize-none h-20 outline-none focus:border-wood-400 transition-colors" />
                </div>
              </div>
              <div className="p-5 border-t border-wood-100 flex gap-2">
                <button onClick={() => { toast.info('Notificación enviada al cliente'); }} className="flex-1 px-4 py-2.5 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:bg-sand-50 transition-colors flex items-center justify-center gap-1.5">
                  <Mail size={14} /> Notificar cliente
                </button>
                <button onClick={() => { toast.success('Problema resuelto'); setResolveModal(null); }} className="flex-1 px-4 py-2.5 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Resolver y cerrar
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== MODAL OVERLAY =====
const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </motion.div>
);

// ===== TAB: PENDING =====
const PendingTab: React.FC<{
  entries: ShippingEntry[];
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  toggleAll: () => void;
  getTimeSince: (d: string) => string;
}> = ({ entries, expandedRow, setExpandedRow, selectedRows, toggleRow, toggleAll, getTimeSince }) => {
  const [generatedGuide, setGeneratedGuide] = useState<string | null>(null);
  const [generatingGuide, setGeneratingGuide] = useState<string | null>(null);

  const handleGenerate = (orderId: string) => {
    setGeneratingGuide(orderId);
    setTimeout(() => {
      setGeneratingGuide(null);
      setGeneratedGuide(orderId);
      toast.success('Guía generada exitosamente');
    }, 1500);
  };

  if (entries.length === 0) {
    return <EmptyState message="Sin pedidos pendientes de guía" />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
              <th className="px-4 py-2.5 w-8">
                <input type="checkbox" checked={selectedRows.size === entries.length && entries.length > 0} onChange={toggleAll} className="accent-accent-gold" />
              </th>
              <th className="px-4 py-2.5"># Pedido</th>
              <th className="px-4 py-2.5">Hace</th>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Destino</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Pzas</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Peso</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Zona</th>
              <th className="px-4 py-2.5 w-8">🔴</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {entries.map(entry => {
              const o = entry.order;
              const timeSince = getTimeSince(o.date);
              const isUrgent = parseInt(timeSince) >= 2 && timeSince.includes('d');
              const isLocal = o.addressDetail.city === 'Hermosillo';
              const isExpanded = expandedRow === o.id;

              const rows: React.ReactNode[] = [
                  <tr
                    key={o.id}
                    className={`transition-colors cursor-default ${isUrgent ? 'bg-amber-50/50' : 'hover:bg-sand-50/50'} ${isExpanded ? 'bg-sand-50' : ''}`}
                    onClick={() => setExpandedRow(isExpanded ? null : o.id)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.has(o.id)} onChange={() => toggleRow(o.id)} className="accent-accent-gold" />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-wood-900">{o.number}</td>
                    <td className="px-4 py-3 text-xs text-wood-500">
                      {timeSince} {isUrgent && <span className="text-sm">⚠️</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-wood-700">{o.customer.name}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 hidden lg:table-cell">{o.addressDetail.city}, {o.addressDetail.state.slice(0, 2).toUpperCase()} {o.addressDetail.zip}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 hidden md:table-cell">{o.items.length}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 hidden md:table-cell">{o.items.reduce((s, i) => s + (i.weight || 0), 0)} kg</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLocal ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isLocal ? 'Local' : 'Nacional'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{o.hasEngraving && <span className="text-sm">🔴</span>}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerate(o.id); }}
                        disabled={generatingGuide === o.id}
                        className="px-3 py-1.5 bg-wood-900 text-sand-100 rounded-lg text-[10px] font-medium hover:bg-wood-800 transition-colors disabled:opacity-50"
                      >
                        {generatingGuide === o.id ? 'Generando...' : 'Generar'}
                      </button>
                    </td>
                  </tr>
              ];
              if (isExpanded) {
                rows.push(
                      <tr key={`${o.id}-expanded`}>
                        <td colSpan={10}>
                          <div className="px-5 py-5 bg-sand-50/50 border-t border-wood-100">
                              {generatedGuide === o.id ? (
                                <GuideGenerated order={o} onClose={() => setGeneratedGuide(null)} />
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Articles */}
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider">Artículos</p>
                                    {o.items.map(item => (
                                      <div key={item.id} className="flex gap-3">
                                        <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        <div className="min-w-0">
                                          <p className="text-xs text-wood-900 font-medium truncate">{item.productName}</p>
                                          <p className="text-[10px] text-wood-400">SKU: {item.sku}</p>
                                          <p className="text-[10px] text-wood-500">Qty: {item.qty} | {item.weight || '?'} kg</p>
                                          {item.engraving?.hasEngraving && (
                                            <span className="text-[10px] text-green-600 font-medium">🔴 Grabado: {item.engraving.designs.every(d => d.status === 'completed') ? '✅ Listo' : '⏳ Pendiente'}</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t border-wood-100 space-y-1 text-[10px] text-wood-500">
                                      <p>Peso total: {o.items.reduce((s, i) => s + (i.weight || 0), 0)} kg</p>
                                      <p>Valor declarado: ${o.subtotal.toLocaleString()} MXN</p>
                                      {o.hasEngraving && <p>Incluye grabado: Sí</p>}
                                      {o.notes.length > 0 && <p className="italic">Notas: "{o.notes[0].text}"</p>}
                                    </div>
                                  </div>

                                  {/* Address */}
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider">Dirección de envío</p>
                                    <div className="space-y-1 text-xs text-wood-600">
                                      <p className="font-medium text-wood-900">{o.addressDetail.name}</p>
                                      <p>{o.addressDetail.street}</p>
                                      <p>{o.addressDetail.neighborhood}</p>
                                      <p>{o.addressDetail.city}, {o.addressDetail.state}</p>
                                      <p>CP {o.addressDetail.zip}, {o.addressDetail.country}</p>
                                      <p className="text-wood-400">Tel: {o.addressDetail.phone}</p>
                                    </div>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(o.addressDetail.fullString); toast.success('Dirección copiada'); }}
                                      className="flex items-center gap-1.5 text-[10px] text-accent-gold font-medium hover:underline"
                                    >
                                      <Copy size={12} /> Copiar dirección
                                    </button>
                                    <p className="text-[10px] text-wood-500">Zona: {o.addressDetail.zone}</p>
                                  </div>

                                  {/* Generate Guide */}
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider">Generar guía</p>
                                    <div className="space-y-2">
                                      {[
                                        { name: 'DHL', price: 371, days: '2-4 días' },
                                        { name: 'Estafeta', price: 285, days: '3-5 días' },
                                        { name: 'FedEx', price: 320, days: '2-3 días' },
                                      ].map(c => (
                                        <label key={c.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-wood-200 hover:border-accent-gold cursor-pointer transition-colors">
                                          <div className="flex items-center gap-2">
                                            <input type="radio" name={`carrier-${o.id}`} defaultChecked={o.carrier === c.name} className="accent-accent-gold" />
                                            <span className="text-xs text-wood-700 font-medium">{c.name}</span>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs font-medium text-wood-900">${c.price}</p>
                                            <p className="text-[10px] text-wood-400">{c.days}</p>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                    <div className="text-[10px] text-wood-500 space-y-1 pt-2 border-t border-wood-100">
                                      <p>Peso: {o.items.reduce((s, i) => s + (i.weight || 0), 0)} kg</p>
                                      {o.items[0]?.packageDimensions && <p>Dims: {o.items[0].packageDimensions}</p>}
                                    </div>

                                    {/* Engraving Warning */}
                                    {o.hasEngraving && o.items.some(i => i.engraving?.designs.some(d => d.status !== 'completed')) && (
                                      <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                                        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-amber-700">Este pedido tiene grabado láser pendiente. ¿Generar guía de todas formas?</p>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => handleGenerate(o.id)}
                                      disabled={generatingGuide === o.id}
                                      className="w-full px-4 py-3 bg-wood-900 text-sand-100 rounded-lg text-xs font-medium hover:bg-wood-800 transition-colors disabled:opacity-50"
                                    >
                                      {generatingGuide === o.id ? '⏳ Generando...' : '🏷️ GENERAR GUÍA'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                        </td>
                      </tr>
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== GUIDE GENERATED SUCCESS =====
const GuideGenerated: React.FC<{ order: Order; onClose: () => void }> = ({ order }) => (
  <div className="max-w-sm mx-auto text-center space-y-4">
    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
      <CheckCircle size={28} className="text-green-500" />
    </div>
    <div>
      <p className="text-sm font-medium text-wood-900">Guía generada exitosamente</p>
      <div className="mt-3 space-y-1.5 text-xs text-wood-600">
        <p>Carrier: <span className="font-medium text-wood-900">DHL Express</span></p>
        <p>Tracking: <span className="font-mono text-wood-900">1234567890</span></p>
        <p>Costo: <span className="font-medium text-wood-900">$370.62 MXN</span></p>
      </div>
    </div>
    <div className="flex gap-2 justify-center">
      <button onClick={() => toast.success('Imprimiendo guía...')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:bg-sand-50 transition-colors">
        <Printer size={14} /> Imprimir Guía
      </button>
      <button onClick={() => { navigator.clipboard.writeText('1234567890'); toast.success('Tracking copiado'); }} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600 hover:bg-sand-50 transition-colors">
        <Copy size={14} /> Copiar tracking
      </button>
    </div>
    <p className="text-[10px] text-green-600">✉️ Email enviado al cliente con tracking y link de rastreo</p>
  </div>
);

// ===== TAB: READY =====
const ReadyTab: React.FC<{ entries: ShippingEntry[] }> = ({ entries }) => {
  if (entries.length === 0) {
    return <EmptyState message="Sin paquetes listos para recolección" />;
  }

  return (
    <div>
      {/* Bulk action */}
      <div className="px-5 py-3 border-b border-wood-100 bg-sand-50/50 flex items-center justify-between">
        <span className="text-[10px] text-wood-400">{entries.length} paquetes listos</span>
        <div className="flex gap-2">
          <button onClick={() => toast.success('PDF con todas las guías generado')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-wood-200 rounded-lg text-[10px] text-wood-600 hover:bg-sand-50 transition-colors">
            <Printer size={12} /> Imprimir todas
          </button>
          <button onClick={() => toast.success('Marcados como recogidos')} className="flex items-center gap-1.5 px-3 py-1.5 bg-wood-900 text-sand-100 rounded-lg text-[10px] hover:bg-wood-800 transition-colors">
            <Truck size={12} /> Marcar recogidos
          </button>
        </div>
      </div>
      <div className="divide-y divide-wood-50">
        {entries.map(entry => {
          const o = entry.order;
          return (
            <div key={o.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sand-50/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Package size={16} className="text-wood-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-wood-900">{o.number} — {o.customer.name}</p>
                  <p className="text-[10px] text-wood-400">Guía generada {entry.guideSince} | {o.carrier} | {o.addressDetail.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {o.tracking && <span className="text-[10px] font-mono text-wood-500">{o.tracking}</span>}
                <button onClick={() => toast.success('Imprimiendo...')} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors"><Printer size={14} /></button>
                <button onClick={() => { navigator.clipboard.writeText(o.tracking || ''); toast.success('Copiado'); }} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors"><Copy size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== TAB: TRANSIT =====
const TransitTab: React.FC<{ entries: ShippingEntry[]; expandedRow: string | null; setExpandedRow: (id: string | null) => void }> = ({ entries, expandedRow, setExpandedRow }) => {
  if (entries.length === 0) {
    return <EmptyState message="Sin paquetes en tránsito" />;
  }

  const mockTrackingEvents = [
    { date: '28 Feb 14:00', event: 'En bodega de distribución Hermosillo' },
    { date: '27 Feb 22:00', event: 'Llegó a centro de distribución regional' },
    { date: '27 Feb 08:00', event: 'En tránsito desde CDMX' },
    { date: '26 Feb 16:00', event: 'Paquete recogido por DHL' },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
              <th className="px-4 py-2.5"># Pedido</th>
              <th className="px-4 py-2.5">Enviado</th>
              <th className="px-4 py-2.5">Carrier</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Tracking</th>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Destino</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Est. entrega</th>
              <th className="px-4 py-2.5">Estado</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {entries.map(entry => {
              const o = entry.order;
              const isExpanded = expandedRow === o.id;

              const rows: React.ReactNode[] = [
                  <tr
                    key={o.id}
                    className={`hover:bg-sand-50/50 transition-colors cursor-default ${isExpanded ? 'bg-sand-50' : ''}`}
                    onClick={() => setExpandedRow(isExpanded ? null : o.id)}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-wood-900">{o.number}</td>
                    <td className="px-4 py-3 text-xs text-wood-500">{new Date(o.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-3 text-xs text-wood-700">{o.carrier}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-wood-500 hidden md:table-cell">{o.tracking}</td>
                    <td className="px-4 py-3 text-xs text-wood-700">{o.customer.name}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 hidden lg:table-cell">{o.addressDetail.city}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 hidden lg:table-cell">{entry.estimatedDelivery}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        🔵 {entry.carrierStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); toast.info('Abriendo rastreo...'); }} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors">
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
              ];
              if (isExpanded) {
                rows.push(
                      <tr key={`${o.id}-expanded`}>
                        <td colSpan={9}>
                            <div className="px-6 py-5 bg-sand-50/50 border-t border-wood-100">
                              <p className="text-[10px] font-bold text-wood-500 uppercase tracking-wider mb-3">
                                {o.number} — {o.carrier} {o.tracking}
                              </p>
                              <div className="relative ml-2">
                                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-wood-200" />
                                {mockTrackingEvents.map((ev, idx) => (
                                  <div key={idx} className="relative flex gap-3 pb-3 last:pb-0">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 z-10 ${idx === 0 ? 'bg-blue-500' : 'bg-wood-300'}`} />
                                    <div>
                                      <p className={`text-xs ${idx === 0 ? 'text-wood-900 font-medium' : 'text-wood-600'}`}>{ev.event}</p>
                                      <p className="text-[10px] text-wood-400">{ev.date}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-3 border-t border-wood-100 flex gap-2">
                                <button onClick={() => toast.info('Abriendo rastreo...')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-wood-200 rounded-lg text-[10px] text-wood-600 hover:bg-sand-50 transition-colors">
                                  <ExternalLink size={12} /> Ver rastreo completo
                                </button>
                                <button onClick={() => toast.info('Notificando...')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-wood-200 rounded-lg text-[10px] text-wood-600 hover:bg-sand-50 transition-colors">
                                  <Mail size={12} /> Notificar cliente
                                </button>
                              </div>
                            </div>
                        </td>
                      </tr>
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== TAB: DELIVERED =====
const DeliveredTab: React.FC<{ entries: ShippingEntry[] }> = ({ entries }) => {
  // Add some extra mock delivered entries
  const allDelivered = [
    ...entries,
    { order: { ...orders[0], id: 'del-2', number: '#DSD-0010' }, deliveredDate: '22 Feb 2026', deliveryDays: 4, hasReview: false, reviewStars: undefined, carrierStatus: 'Entregado' } as ShippingEntry,
    { order: { ...orders[1], id: 'del-3', number: '#DSD-0009', carrier: 'Local' }, deliveredDate: '20 Feb 2026', deliveryDays: 1, hasReview: true, reviewStars: 4, carrierStatus: 'Entregado' } as ShippingEntry,
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
              <th className="px-4 py-2.5"># Pedido</th>
              <th className="px-4 py-2.5">Entregado</th>
              <th className="px-4 py-2.5">Carrier</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Tracking</th>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Destino</th>
              <th className="px-4 py-2.5">Días</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Costo</th>
              <th className="px-4 py-2.5">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {allDelivered.map(entry => {
              const o = entry.order;
              return (
                <tr key={o.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-wood-900">{o.number}</td>
                  <td className="px-4 py-3 text-xs text-wood-500">{entry.deliveredDate}</td>
                  <td className="px-4 py-3 text-xs text-wood-700">{o.carrier || 'DHL'}</td>
                  <td className="px-4 py-3 text-[10px] font-mono text-wood-500 hidden md:table-cell">{o.tracking || '—'}</td>
                  <td className="px-4 py-3 text-xs text-wood-700">{o.customer.name}</td>
                  <td className="px-4 py-3 text-xs text-wood-500 hidden lg:table-cell">{o.addressDetail.city}</td>
                  <td className="px-4 py-3 text-xs text-wood-600">{entry.deliveryDays}d</td>
                  <td className="px-4 py-3 text-xs text-wood-600 hidden md:table-cell">${o.shipping.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {entry.hasReview ? (
                      <span className="text-amber-500">{'⭐'.repeat(entry.reviewStars || 0)}</span>
                    ) : (
                      <span className="text-wood-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== TAB: PROBLEMS =====
const ProblemsTab: React.FC<{ entries: ShippingEntry[]; onResolve: (e: ShippingEntry) => void }> = ({ entries, onResolve }) => {
  if (entries.length === 0) {
    return <EmptyState message="Sin problemas de envío" />;
  }

  const problemTypes = [
    { type: 'Entrega retrasada', priority: '🟡 Media' },
    { type: 'Paquete dañado', priority: '🔴 Alta' },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
              <th className="px-4 py-2.5"># Pedido</th>
              <th className="px-4 py-2.5">Tipo problema</th>
              <th className="px-4 py-2.5">Carrier</th>
              <th className="px-4 py-2.5">Desde</th>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5">Prioridad</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {entries.map((entry, idx) => {
              const o = entry.order;
              const problem = problemTypes[idx % problemTypes.length];
              return (
                <tr key={o.id} className="hover:bg-sand-50/50 transition-colors bg-red-50/30">
                  <td className="px-4 py-3 text-xs font-medium text-wood-900">{o.number}</td>
                  <td className="px-4 py-3 text-xs text-red-600 font-medium">{problem.type}</td>
                  <td className="px-4 py-3 text-xs text-wood-700">{o.carrier || 'Estafeta'}</td>
                  <td className="px-4 py-3 text-xs text-wood-500">{new Date(o.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs text-wood-700">{o.customer.name}</td>
                  <td className="px-4 py-3 text-xs">{problem.priority}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onResolve(entry)}
                      className="px-3 py-1.5 bg-wood-900 text-sand-100 rounded-lg text-[10px] font-medium hover:bg-wood-800 transition-colors"
                    >
                      Resolver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== EMPTY STATE =====
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-12 text-center text-wood-400 text-sm">
    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
    <p>{message}</p>
  </div>
);
