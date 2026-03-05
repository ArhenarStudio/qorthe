"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search, FileText, Plus, Download, ArrowLeft, Eye, Zap, MoreHorizontal,
  Send, Paperclip, Mail, Clock, Package, CheckCircle, DollarSign,
  MessageSquare, Printer, Copy, ShoppingCart,
  Hammer, Target, BarChart3, ExternalLink, XCircle
} from 'lucide-react';
import {
  fullQuotes, type FullQuote, type QuoteStatus, type QuotePiece
} from '@/data/adminMockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

// ===== CONSTANTS =====
type TabId = 'nuevas' | 'negociacion' | 'aprobadas' | 'produccion' | 'historial' | 'analisis';

const statusConfig: Record<QuoteStatus, { label: string; cls: string; dot: string }> = {
  nueva:              { label: 'Nueva',              cls: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500' },
  en_revision:        { label: 'En revisión',        cls: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-500' },
  cotizacion_enviada: { label: 'Cotización enviada', cls: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  en_negociacion:     { label: 'En negociación',     cls: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  aprobada:           { label: 'Aprobada',           cls: 'bg-green-50 text-green-600',   dot: 'bg-green-500' },
  anticipo_recibido:  { label: 'Anticipo recibido',  cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  en_produccion:      { label: 'En producción',      cls: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  completada:         { label: 'Completada',         cls: 'bg-gray-100 text-green-600',   dot: 'bg-green-400' },
  rechazada:          { label: 'Rechazada',          cls: 'bg-red-50 text-red-500',       dot: 'bg-red-500' },
  vencida:            { label: 'Vencida',            cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
  cancelada:          { label: 'Cancelada',          cls: 'bg-gray-200 text-gray-600',    dot: 'bg-gray-500' },
};

import { DEFAULT_LOYALTY_CONFIG, getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { TierIcon } from '@/components/ui/TierIcons';

function getQuoteTierBadge(tierId: string) {
  const normalized = normalizeTierId(tierId);
  const tier = DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalized) || DEFAULT_LOYALTY_CONFIG.tiers[0];
  return { name: tier.name, styles: getTierInlineStyles(tier), tierId: normalized };
}

const CHART_COLORS = ['#C5A065', '#5D4037', '#A1887F', '#D7CCC8', '#8D6E63'];

// ===== HELPERS =====
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d: string) => new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function getQuoteTotal(q: FullQuote) {
  const subtotal = q.pieces.reduce((s, p) => s + (p.adminPrice ?? p.autoPrice) * p.quantity, 0);
  const disc = q.discount ? subtotal * (q.discount.percent / 100) : 0;
  return subtotal - disc;
}
function getQuoteCost(q: FullQuote) {
  return q.pieces.reduce((s, p) => s + (p.costEstimate ?? 0) * p.quantity, 0);
}
function getPieceCount(q: FullQuote) {
  return q.pieces.reduce((s, p) => s + p.quantity, 0);
}

function getClientBadge(q: FullQuote) {
  const { tier, orders } = q.customer;
  const badges: { text: string; cls: string }[] = [];
  if (tier === 'oro' || tier === 'platino') badges.push({ text: '⚡ Cliente VIP', cls: 'bg-accent-gold/15 text-accent-gold' });
  if (orders === 0) badges.push({ text: '🆕 Cliente nuevo', cls: 'bg-blue-50 text-blue-600' });
  const usage = q.pieces[0]?.usage;
  if (usage === 'Evento / regalo corporativo' || usage === 'Restaurante / volumen alto') badges.push({ text: '🏢 Corporativo', cls: 'bg-purple-50 text-purple-600' });
  return badges;
}

function hoursAgo(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
}

// ===== KPI CARD =====
const KpiCard: React.FC<{ icon: React.ReactNode; value: string; label: string; sub: string; accent?: boolean }> = ({ icon, value, label, sub, accent }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-4 ${accent ? 'border-accent-gold/30' : 'border-wood-100'}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-accent-gold/15' : 'bg-sand-50'}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-sans text-wood-900">{value}</p>
    <p className="text-[10px] text-wood-400 uppercase tracking-wider mt-0.5">{label}</p>
    <p className="text-[11px] text-wood-500 mt-1">{sub}</p>
  </div>
);

// ===== MAIN COMPONENT =====
export const QuotesPage: React.FC = () => {

  // ── Live data from API ──
  const [liveQuotes, setLiveQuotes] = useState<any>(null);
  const [quotesLoading, setQuotesLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveQuotes(d); }).catch(() => {}).finally(() => setQuotesLoading(false));
  }, []);

  const [tab, setTab] = useState<TabId>('nuevas');
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<FullQuote | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', project_name: '', description: '', timeline: '3-4 semanas' });

  const refreshQuotes = () => fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveQuotes(d); });

  const handleCreateQuote = async () => {
    if (!newQuoteForm.customer_email || !newQuoteForm.customer_name) { toast.error('Nombre y email requeridos'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: newQuoteForm.customer_email,
          customer_name: newQuoteForm.customer_name,
          customer_phone: newQuoteForm.customer_phone,
          project_name: newQuoteForm.project_name,
          timeline: newQuoteForm.timeline,
          messages: newQuoteForm.description ? [{ id: `m_${Date.now()}`, sender: 'client', senderName: newQuoteForm.customer_name, date: new Date().toISOString(), text: newQuoteForm.description }] : [],
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Cotización creada');
      setShowCreateForm(false);
      setNewQuoteForm({ customer_name: '', customer_email: '', customer_phone: '', project_name: '', description: '', timeline: '3-4 semanas' });
      refreshQuotes();
    } catch { toast.error('Error al crear cotización'); }
    finally { setCreating(false); }
  };
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');

  // Filter quotes by tab
  const tabFilters: Record<TabId, QuoteStatus[]> = {
    nuevas:      ['nueva'],
    negociacion: ['en_revision', 'cotizacion_enviada', 'en_negociacion'],
    aprobadas:   ['aprobada', 'anticipo_recibido'],
    produccion:  ['en_produccion'],
    historial:   ['completada', 'rechazada', 'vencida', 'cancelada'],
    analisis:    [],
  };

  const filtered = useMemo(() => {
    const statuses = tabFilters[tab];
    const allQuotes = (liveQuotes?.quotes?.length > 0 ? liveQuotes.quotes : fullQuotes) as FullQuote[];
    let list = statuses.length ? allQuotes.filter(q => statuses.includes(q.status)) : allQuotes;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(q => q.number.toLowerCase().includes(s) || q.customer.name.toLowerCase().includes(s) || q.pieces.some(p => p.type.toLowerCase().includes(s)));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tab, search]);

  // KPIs
  const activeStatuses: QuoteStatus[] = ['nueva', 'en_revision', 'cotizacion_enviada', 'en_negociacion', 'aprobada', 'anticipo_recibido', 'en_produccion'];
  const allQ = (liveQuotes?.quotes?.length > 0 ? liveQuotes.quotes : fullQuotes) as FullQuote[];
  const activeQuotes = allQ.filter(q => activeStatuses.includes(q.status));
  const newQuotes = allQ.filter(q => q.status === 'nueva');
  const urgentNew = newQuotes.filter(q => hoursAgo(q.date) > 48);
  const pipelineValue = activeQuotes.reduce((s, q) => s + getQuoteTotal(q), 0);
  const completedQuotes = allQ.filter(q => q.status === 'completada');
  const closedQuotes = allQ.filter(q => ['completada', 'rechazada', 'vencida', 'cancelada'].includes(q.status));
  const conversionRate = closedQuotes.length ? Math.round((completedQuotes.length / closedQuotes.length) * 100) : 0;
  const avgTicket = activeQuotes.length ? activeQuotes.reduce((s, q) => s + getQuoteTotal(q), 0) / activeQuotes.length : 0;

  const tabCounts: Record<TabId, number> = {
    nuevas: newQuotes.length,
    negociacion: allQ.filter(q => ['en_revision', 'cotizacion_enviada', 'en_negociacion'].includes(q.status)).length,
    aprobadas: allQ.filter(q => ['aprobada', 'anticipo_recibido'].includes(q.status)).length,
    produccion: allQ.filter(q => q.status === 'en_produccion').length,
    historial: closedQuotes.length,
    analisis: 0,
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'nuevas', label: 'Nuevas' },
    { id: 'negociacion', label: 'En negociación' },
    { id: 'aprobadas', label: 'Aprobadas' },
    { id: 'produccion', label: 'En producción' },
    { id: 'historial', label: 'Historial' },
    { id: 'analisis', label: 'Análisis' },
  ];

  // ===== DETAIL VIEW =====
  if (selectedQuote) {
    return <QuoteDetail quote={selectedQuote} onBack={() => setSelectedQuote(null)} onRefresh={() => { fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveQuotes(d); }); }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
          <FileText size={20} className="text-accent-gold" /> Cotizaciones
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors">
            <Plus size={14} /> Crear Cotización Manual
          </button>
          <button onClick={() => { /* TODO: CSV export from /api/admin/importexport?type=quotes */ fetch('/api/admin/importexport?type=orders').then(r => r.json()).then(d => { const csv = [Object.keys(d.data?.[0] || {}).join(','), ...(d.data || []).map((r: any) => Object.values(r).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cotizaciones.csv'; a.click(); toast.success('CSV descargado'); }).catch(() => toast.error('Error')); }} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 text-wood-700 text-xs rounded-lg hover:bg-sand-50 transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Create Quote Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-accent-gold/30 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-wood-900">Nueva Cotización</h4>
            <button onClick={() => setShowCreateForm(false)} className="text-wood-400 hover:text-wood-600"><span className="text-lg">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><label className="text-[10px] text-wood-400 uppercase block mb-1">Nombre del cliente *</label><input value={newQuoteForm.customer_name} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_name: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-gold/40" placeholder="María López" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase block mb-1">Email *</label><input type="email" value={newQuoteForm.customer_email} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_email: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-gold/40" placeholder="maria@email.com" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase block mb-1">Teléfono</label><input value={newQuoteForm.customer_phone} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_phone: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-gold/40" placeholder="662-123-4567" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase block mb-1">Nombre del proyecto</label><input value={newQuoteForm.project_name} onChange={e => setNewQuoteForm(prev => ({ ...prev, project_name: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-gold/40" placeholder="Regalos corporativos" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase block mb-1">Timeline estimado</label><select value={newQuoteForm.timeline} onChange={e => setNewQuoteForm(prev => ({ ...prev, timeline: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white"><option>2-3 semanas</option><option>3-4 semanas</option><option>4-6 semanas</option><option>6-8 semanas</option></select></div>
          </div>
          <div className="mt-3"><label className="text-[10px] text-wood-400 uppercase block mb-1">Descripción / Solicitud del cliente</label><textarea value={newQuoteForm.description} onChange={e => setNewQuoteForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs outline-none resize-none focus:border-accent-gold/40" placeholder="Describe lo que el cliente necesita..." /></div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-xs text-wood-500 hover:text-wood-700">Cancelar</button>
            <button onClick={handleCreateQuote} disabled={creating} className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">{creating ? 'Creando...' : 'Crear Cotización'}</button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={<FileText size={16} className="text-accent-gold" />} value={String(activeQuotes.length)} label="Cotizaciones activas" sub={`${allQ.filter(q => new Date(q.validUntil) < new Date(Date.now() + 7 * 86400000) && activeStatuses.includes(q.status)).length} vencen esta semana`} accent />
        <KpiCard icon={<Clock size={16} className="text-amber-600" />} value={String(newQuotes.length)} label="Nuevas sin responder" sub={`${urgentNew.length} hace +48h ⚠️`} />
        <KpiCard icon={<DollarSign size={16} className="text-green-600" />} value={fmt(pipelineValue)} label="Valor en pipeline" sub="+15% vs prev" />
        <KpiCard icon={<BarChart3 size={16} className="text-blue-600" />} value={`${conversionRate}%`} label="Tasa de conversión" sub="Cot → Pedido" />
        <KpiCard icon={<Target size={16} className="text-purple-600" />} value={fmt(avgTicket)} label="Ticket promedio" sub="vs $881 catálogo" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs rounded-lg whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-wood-900 text-sand-100' : 'bg-white text-wood-600 hover:bg-sand-50 border border-wood-100'
            }`}
          >
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                tab === t.id ? 'bg-accent-gold/30 text-accent-gold' : 'bg-wood-100 text-wood-500'
              }`}>{tabCounts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por # cotización, cliente o producto..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-wood-200 rounded-lg text-xs text-wood-900 outline-none focus:border-wood-400 transition-colors"
        />
      </div>

      {/* Content */}
      {tab === 'analisis' ? (
        <AnalyticsTab />
      ) : tab === 'nuevas' ? (
        <NewQuotesList quotes={filtered} onSelect={setSelectedQuote} />
      ) : tab === 'negociacion' ? (
        <NegotiationTable quotes={filtered} onSelect={setSelectedQuote} />
      ) : tab === 'aprobadas' ? (
        <ApprovedTable quotes={filtered} onSelect={setSelectedQuote} />
      ) : tab === 'produccion' ? (
        <ProductionTable quotes={filtered} onSelect={setSelectedQuote} />
      ) : tab === 'historial' ? (
        <HistoryTable quotes={filtered} onSelect={setSelectedQuote} />
      ) : null}
    </div>
  );
};

// ===== NEW QUOTES LIST (cards) =====
const NewQuotesList: React.FC<{ quotes: FullQuote[]; onSelect: (q: FullQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="space-y-3">
    <p className="text-xs text-wood-500">⏳ {quotes.length} cotizaciones nuevas</p>
    {quotes.map(q => {
      const badges = getClientBadge(q);
      const isUrgent = hoursAgo(q.date) > 48;
      return (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-colors ${isUrgent ? 'border-amber-300 bg-amber-50/30' : 'border-wood-100'}`}
        >
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${statusConfig[q.status].dot}`} />
                  <span className="text-xs text-wood-900">{q.number}</span>
                  {badges.map((b, i) => (
                    <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full ${b.cls}`}>{b.text}</span>
                  ))}
                  {isUrgent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">⚠️ +48h sin responder</span>}
                </div>
                <p className="text-xs text-wood-700 mt-1">
                  {q.customer.name}
                  {q.customer.tier && (() => { const tb = getQuoteTierBadge(q.customer.tier); return <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={tb.styles.badge}><TierIcon tierId={tb.tierId} size={10} /> {tb.name}</span>; })()}
                  {q.customer.orders > 0 && <span className="text-wood-400 ml-2">— {q.customer.orders} pedidos previos</span>}
                </p>
                <p className="text-[11px] text-wood-400 mt-0.5">{q.customer.email}{q.customer.phone ? ` | ${q.customer.phone}` : ''}</p>
              </div>
              <span className="text-[11px] text-wood-400 whitespace-nowrap">{fmtDateTime(q.date)}</span>
            </div>

            {/* Pieces */}
            <div className="mb-3">
              <p className="text-[11px] text-wood-500 mb-1.5">📦 {q.pieces.length} pieza{q.pieces.length > 1 ? 's' : ''} solicitada{q.pieces.length > 1 ? 's' : ''}:</p>
              <div className="space-y-1.5">
                {q.pieces.map((p, i) => (
                  <div key={p.id} className="text-xs text-wood-700 pl-3 border-l-2 border-wood-100">
                    <span className="text-wood-900">{i + 1}. {p.type}</span>
                    {p.type !== 'Servicio de grabado' ? ` — ${p.wood}` : ''}
                    {p.dimensions && <span className="text-wood-400 ml-1">{p.dimensions.length}×{p.dimensions.width}×{p.dimensions.thickness} cm</span>}
                    {p.engravingMaterial && <span className="text-wood-400 ml-1">— {p.engravingMaterial}</span>}
                    {p.engraving && <span className="text-wood-400 ml-1">| Grabado: {p.engraving.type} ({p.engraving.complexity})</span>}
                    <br />
                    <span className="text-wood-400">Uso: {p.usage} | Cantidad: {p.quantity} {p.quantity > 1 ? 'unidades' : 'unidad'}</span>
                    {p.engraving?.file && <span className="text-wood-400 ml-1">| 📎 {p.engraving.file}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-wood-500 pt-3 border-t border-wood-50">
              <span>💰 Estimado: <span className="text-wood-900">{fmt(getQuoteTotal(q))}</span></span>
              <span>📅 Validez: hasta {fmtDate(q.validUntil)}</span>
              {q.pieces[0]?.usage && <span>🏢 Uso: {q.pieces[0].usage}</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => onSelect(q)} className="flex items-center gap-1 px-3 py-1.5 bg-wood-900 text-sand-100 text-[11px] rounded-lg hover:bg-wood-800 transition-colors">
                <Eye size={12} /> Revisar completa
              </button>
              <button onClick={() => onSelect(q)} className="flex items-center gap-1 px-3 py-1.5 bg-accent-gold/15 text-accent-gold text-[11px] rounded-lg hover:bg-accent-gold/25 transition-colors">
                <Zap size={12} /> Responder rápido
              </button>
              <button className="p-1.5 text-wood-400 hover:text-wood-700 transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
    {quotes.length === 0 && <EmptyState text="No hay cotizaciones nuevas" />}
  </div>
);

// ===== NEGOTIATION TABLE =====
const NegotiationTable: React.FC<{ quotes: FullQuote[]; onSelect: (q: FullQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
            <th className="px-4 py-3"># Cotiz.</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Piezas</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Última resp.</th>
            <th className="px-4 py-3">Mensajes</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-50">
          {quotes.map(q => {
            const lastMsg = q.messages[q.messages.length - 1];
            const isStale = lastMsg && hoursAgo(lastMsg.date) > 48;
            return (
              <tr key={q.id} className={`hover:bg-sand-50/50 transition-colors ${isStale ? 'bg-amber-50/30' : ''}`}>
                <td className="px-4 py-3 text-xs text-wood-900">{q.number}</td>
                <td className="px-4 py-3 text-xs text-wood-700">{q.customer.name}</td>
                <td className="px-4 py-3">
                  {q.customer.tier ? (
                    (() => { const tb = getQuoteTierBadge(q.customer.tier); return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={tb.styles.badge}><TierIcon tierId={tb.tierId} size={10} /> {tb.name}</span>; })()
                  ) : <span className="text-[10px] text-wood-400">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-wood-600">{q.pieces.length}</td>
                <td className="px-4 py-3 text-xs text-wood-900">{fmt(getQuoteTotal(q))}</td>
                <td className="px-4 py-3 text-[11px]">
                  {lastMsg ? (
                    <div>
                      <span className={isStale ? 'text-amber-600' : 'text-wood-500'}>
                        Hace {Math.max(1, Math.round(hoursAgo(lastMsg.date) / 24))}d {isStale && '⚠️'}
                      </span>
                      <br />
                      <span className="text-[10px] text-wood-400">({lastMsg.sender === 'client' ? 'cliente' : 'admin'})</span>
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-wood-600">{q.messages.length}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onSelect(q)} className="text-[11px] text-accent-gold hover:underline">Ver detalle</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {quotes.length === 0 && <EmptyState text="No hay cotizaciones en negociación" />}
  </div>
);

// ===== APPROVED TABLE =====
const ApprovedTable: React.FC<{ quotes: FullQuote[]; onSelect: (q: FullQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
            <th className="px-4 py-3"># Cotiz.</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Anticipo</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Aprobada</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-50">
          {quotes.map(q => {
            const total = getQuoteTotal(q) * 1.16;
            const deposit = total * (q.depositPercent / 100);
            return (
              <tr key={q.id} className="hover:bg-sand-50/50 transition-colors">
                <td className="px-4 py-3 text-xs text-wood-900">{q.number}</td>
                <td className="px-4 py-3 text-xs text-wood-700">{q.customer.name}</td>
                <td className="px-4 py-3 text-xs text-wood-900">{fmt(total)}</td>
                <td className="px-4 py-3">
                  {q.depositPaid ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">✅ {fmt(q.depositPaid.amount)}</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Pendiente {fmt(deposit)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[q.status].cls}`}>{statusConfig[q.status].label}</span>
                </td>
                <td className="px-4 py-3 text-xs text-wood-500">{fmtDate(q.date)}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  {!q.depositPaid && (
                    <button onClick={() => { const amt = prompt('Monto del anticipo:'); if (amt) { fetch('/api/admin/quotes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q.id, status: 'anticipo_recibido', deposit_paid: { amount: parseFloat(amt.replace(/[^0-9.]/g, '')), method: 'Transferencia', ref: `DEP-${Date.now()}`, date: new Date().toISOString() } }) }).then(() => toast.success('Anticipo registrado')); } }} className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                      💰 Registrar anticipo
                    </button>
                  )}
                  <button onClick={() => onSelect(q)} className="text-[11px] text-accent-gold hover:underline ml-1">Ver</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {quotes.length === 0 && <EmptyState text="No hay cotizaciones aprobadas" />}
  </div>
);

// ===== PRODUCTION TABLE =====
const ProductionTable: React.FC<{ quotes: FullQuote[]; onSelect: (q: FullQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
            <th className="px-4 py-3"># Cotiz.</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Anticipo</th>
            <th className="px-4 py-3">Piezas</th>
            <th className="px-4 py-3">Progreso</th>
            <th className="px-4 py-3">Entrega est.</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-50">
          {quotes.map(q => {
            const prog = q.productionProgress;
            const pct = prog ? Math.round((prog.completed / prog.total) * 100) : 0;
            return (
              <tr key={q.id} className="hover:bg-sand-50/50 transition-colors">
                <td className="px-4 py-3 text-xs text-wood-900">{q.number}</td>
                <td className="px-4 py-3 text-xs text-wood-700">{q.customer.name}</td>
                <td className="px-4 py-3 text-xs text-wood-900">{fmt(getQuoteTotal(q))}</td>
                <td className="px-4 py-3">
                  {q.depositPaid ? (
                    <span className="text-[10px] text-green-600">✅ {fmt(q.depositPaid.amount)}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-wood-600">{prog ? `${prog.completed}/${prog.total}` : q.pieces.length}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-wood-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-wood-600">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-wood-500">~15 Mar</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <button onClick={() => { const completed = prompt('Piezas completadas:'); if (completed) { const total = q.pieces.reduce((s: number, p: any) => s + p.quantity, 0); fetch('/api/admin/quotes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q.id, production_progress: { completed: parseInt(completed), total } }) }).then(() => toast.success(`Progreso actualizado: ${completed}/${total}`)); } }} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                    📸 Update
                  </button>
                  <button onClick={() => onSelect(q)} className="text-[11px] text-accent-gold hover:underline ml-1">Ver</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {quotes.length === 0 && <EmptyState text="No hay cotizaciones en producción" />}
  </div>
);

// ===== HISTORY TABLE =====
const HistoryTable: React.FC<{ quotes: FullQuote[]; onSelect: (q: FullQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
            <th className="px-4 py-3"># Cotiz.</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Piezas</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Cerrada</th>
            <th className="px-4 py-3">Motivo rechazo</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-50">
          {quotes.map(q => (
            <tr key={q.id} className="hover:bg-sand-50/50 transition-colors">
              <td className="px-4 py-3 text-xs text-wood-900">{q.number}</td>
              <td className="px-4 py-3 text-xs text-wood-700">{q.customer.name}</td>
              <td className="px-4 py-3 text-xs text-wood-600">{getPieceCount(q)}</td>
              <td className="px-4 py-3 text-xs text-wood-900">{fmt(getQuoteTotal(q))}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[q.status].cls}`}>{statusConfig[q.status].label}</span>
              </td>
              <td className="px-4 py-3 text-xs text-wood-500">{q.closedDate ? fmtDate(q.closedDate) : '—'}</td>
              <td className="px-4 py-3 text-xs text-wood-500">{q.rejectionReason || '—'}</td>
              <td className="px-4 py-3">
                <button onClick={() => onSelect(q)} className="text-[11px] text-accent-gold hover:underline">Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {quotes.length === 0 && <EmptyState text="No hay cotizaciones en historial" />}
  </div>
);

// ===== EMPTY STATE =====
const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-12 text-center">
    <FileText size={32} className="text-wood-200 mx-auto mb-2" />
    <p className="text-xs text-wood-400">{text}</p>
  </div>
);

// ===== QUOTE DETAIL =====
const QuoteDetail: React.FC<{ quote: FullQuote; onBack: () => void; onRefresh?: () => void }> = ({ quote: initialQuote, onBack, onRefresh }) => {
  const [q, setQ] = useState(initialQuote);
  const [saving, setSaving] = useState(false);

  // Persist changes to Supabase
  const persistQuote = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: q.id, ...updates }),
      });
      if (!res.ok) throw new Error('Failed');
      onRefresh?.();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  const [newMsg, setNewMsg] = useState('');
  const [newNote, setNewNote] = useState('');

  const subtotal = q.pieces.reduce((s, p) => s + (p.adminPrice ?? p.autoPrice) * p.quantity, 0);
  const discountAmt = q.discount ? subtotal * (q.discount.percent / 100) : 0;
  const total = subtotal - discountAmt;
  const iva = total * 0.16;
  const totalConIva = total + iva;
  const deposit = totalConIva * (q.depositPercent / 100);
  const totalCost = getQuoteCost(q);
  const grossProfit = total - totalCost;
  const margin = total > 0 ? Math.round((grossProfit / total) * 100) : 0;

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    const msg = { id: `m_new_${Date.now()}`, sender: 'admin' as const, senderName: "DavidSon's Design", date: new Date().toISOString(), text: newMsg };
    const updatedMessages = [...q.messages, msg];
    setQ(prev => ({ ...prev, messages: updatedMessages }));
    setNewMsg('');
    persistQuote({ messages: updatedMessages });
    toast.success('Mensaje enviado');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = { id: `n_new_${Date.now()}`, author: 'David (Admin)', date: new Date().toISOString(), text: newNote };
    const updatedNotes = [...q.internalNotes, note];
    setQ(prev => ({ ...prev, internalNotes: updatedNotes }));
    setNewNote('');
    persistQuote({ internal_notes: updatedNotes });
    toast.success('Nota agregada');
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-wood-500 hover:text-wood-900 transition-colors">
        <ArrowLeft size={14} /> Volver a cotizaciones
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-wood-100 shadow-sm p-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg text-wood-900">📋 {q.number}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[q.status].cls}`}>{statusConfig[q.status].label}</span>
          </div>
          <p className="text-[11px] text-wood-500 mt-1">Recibida: {fmtDateTime(q.date)} | Vence: {fmtDate(q.validUntil)}</p>
          {q.projectName && <p className="text-[11px] text-wood-400 mt-0.5">Proyecto: {q.projectName}</p>}
        </div>
        <select
          value={q.status}
          onChange={e => { const newStatus = e.target.value as QuoteStatus; setQ(prev => ({ ...prev, status: newStatus })); persistQuote({ status: newStatus }); toast.success(`Estado cambiado a ${statusConfig[newStatus].label}`); }}
          className="text-xs bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-wood-900 outline-none"
        >
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Pieces */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-accent-gold" /> Piezas Solicitadas
            </h4>
            <div className="space-y-4">
              {q.pieces.map((p, i) => (
                <PieceCard key={p.id} piece={p} index={i} total={q.pieces.length} />
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-accent-gold" /> Conversación con el Cliente
            </h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
              {q.messages.length === 0 && <p className="text-xs text-wood-400 text-center py-4">Sin mensajes aún</p>}
              {q.messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${m.sender === 'admin' ? 'bg-wood-900 text-sand-100' : 'bg-sand-50 text-wood-900 border border-wood-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] ${m.sender === 'admin' ? 'text-accent-gold' : 'text-wood-500'}`}>
                        {m.sender === 'admin' ? '🏪' : '👤'} {m.senderName}
                      </span>
                      <span className={`text-[10px] ${m.sender === 'admin' ? 'text-wood-400' : 'text-wood-400'}`}>{fmtDateTime(m.date)}</span>
                    </div>
                    <p className="text-xs">{m.text}</p>
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.attachments.map((a, ai) => (
                          <span key={ai} className={`text-[10px] px-2 py-0.5 rounded-md ${m.sender === 'admin' ? 'bg-wood-800 text-wood-300' : 'bg-white text-wood-600 border border-wood-200'}`}>
                            📎 {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-wood-100 pt-3">
              <input
                value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu respuesta..."
                className="flex-1 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-xs text-wood-900 outline-none focus:border-wood-400"
              />
              <button className="p-2 text-wood-400 hover:text-wood-700"><Paperclip size={14} /></button>
              <button className="p-2 text-wood-400 hover:text-wood-700"><Mail size={14} /></button>
              <button onClick={handleSendMessage} className="px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" /> Notas Internas
              <span className="text-[10px] text-wood-400">(el cliente NO las ve)</span>
            </h4>
            <div className="space-y-3 mb-3">
              {q.internalNotes.length === 0 && <p className="text-xs text-wood-400">Sin notas internas</p>}
              {q.internalNotes.map(n => (
                <div key={n.id} className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-amber-700">{n.author}</span>
                    <span className="text-[10px] text-wood-400">{fmtDateTime(n.date)}</span>
                  </div>
                  <p className="text-xs text-wood-700">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newNote} onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                placeholder="Agregar nota interna..."
                className="flex-1 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-xs text-wood-900 outline-none focus:border-wood-400"
              />
              <button onClick={handleAddNote} className="px-3 py-2 bg-amber-100 text-amber-700 text-xs rounded-lg hover:bg-amber-200 transition-colors">Agregar</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Client */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Cliente</h4>
            <p className="text-sm text-wood-900">{q.customer.name}</p>
            <p className="text-[11px] text-wood-500 mt-1">{q.customer.email}</p>
            {q.customer.phone && <p className="text-[11px] text-wood-500">{q.customer.phone}</p>}
            {q.customer.tier && (
              <div className="flex items-center gap-2 mt-2">
                {(() => { const tb = getQuoteTierBadge(q.customer.tier); return (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={tb.styles.badge}>
                  <TierIcon tierId={tb.tierId} size={12} /> {tb.name}
                </span>); })()}
                <span className="text-[10px] text-wood-400">{q.customer.points.toLocaleString()} puntos</span>
              </div>
            )}
            <p className="text-[11px] text-wood-500 mt-2">{q.customer.orders} pedidos previos | {fmt(q.customer.totalSpent)} gastado</p>
            <button className="text-[11px] text-accent-gold mt-2 hover:underline flex items-center gap-1">Ver perfil completo <ExternalLink size={10} /></button>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Resumen Financiero</h4>
            <div className="space-y-1.5 text-xs">
              {q.pieces.map((p, i) => (
                <div key={p.id} className="flex justify-between text-wood-600">
                  <span className="truncate mr-2">Pieza {i + 1}: {p.type} ×{p.quantity}</span>
                  <span className="text-wood-900 whitespace-nowrap">{fmt((p.adminPrice ?? p.autoPrice) * p.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-wood-100 pt-1.5 mt-1.5" />
              <div className="flex justify-between text-wood-600"><span>Subtotal</span><span className="text-wood-900">{fmt(subtotal)}</span></div>
              {q.discount && (
                <div className="flex justify-between text-wood-600"><span>Descuento {q.discount.reason} ({q.discount.percent}%)</span><span className="text-red-500">-{fmt(discountAmt)}</span></div>
              )}
              <div className="border-t border-wood-100 pt-1.5 mt-1.5" />
              <div className="flex justify-between"><span className="text-wood-900">Total cotización</span><span className="text-wood-900">{fmt(total)}</span></div>
              <div className="flex justify-between text-wood-500"><span>IVA (16%)</span><span>{fmt(iva)}</span></div>
              <div className="flex justify-between text-wood-900"><span>Total con IVA</span><span>{fmt(totalConIva)}</span></div>
              <div className="border-t border-wood-100 pt-1.5 mt-1.5" />
              <div className="flex justify-between text-wood-600"><span>Anticipo ({q.depositPercent}%)</span><span className="text-wood-900">{fmt(deposit)}</span></div>
              <div className="flex justify-between text-wood-600"><span>Saldo al entregar</span><span>{fmt(totalConIva - deposit)}</span></div>
              <div className="border-t border-wood-100 pt-1.5 mt-1.5" />
              <p className="text-[10px] text-wood-400 uppercase tracking-wider mt-2 mb-1">Análisis de rentabilidad</p>
              <div className="flex justify-between text-wood-600"><span>Costo total estimado</span><span>{fmt(totalCost)}</span></div>
              <div className="flex justify-between text-wood-600"><span>Ganancia bruta</span><span className="text-green-600">{fmt(grossProfit)}</span></div>
              <div className="flex justify-between">
                <span className="text-wood-600">Margen bruto</span>
                <span className={`${margin >= 50 ? 'text-green-600' : margin >= 30 ? 'text-amber-600' : 'text-red-500'}`}>
                  {margin}% {margin >= 50 ? '✅' : margin >= 30 ? '⚠️' : '❌'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Conditions */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Timeline y Condiciones</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-wood-500">Tiempo estimado</span><span className="text-wood-900">{q.timeline}</span></div>
              <div className="flex justify-between"><span className="text-wood-500">Validez cotización</span><span className="text-wood-900">{fmtDate(q.validUntil)}</span></div>
              {q.conditions.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] text-wood-400 uppercase">Condiciones:</p>
                  {q.conditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-wood-600">
                      <span className={c.checked ? 'text-green-500' : 'text-wood-300'}>{c.checked ? '☑' : '☐'}</span>
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deposit info */}
          {q.depositPaid && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h4 className="text-[11px] text-green-700 uppercase tracking-wider mb-2">💰 Anticipo Registrado</h4>
              <div className="space-y-1 text-xs text-green-800">
                <p>Monto: {fmt(q.depositPaid.amount)}</p>
                <p>Método: {q.depositPaid.method}</p>
                <p>Ref: {q.depositPaid.ref}</p>
                <p>Fecha: {fmtDate(q.depositPaid.date)}</p>
              </div>
            </div>
          )}

          {/* Production Progress */}
          {q.productionProgress && (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
              <h4 className="text-[11px] text-yellow-700 uppercase tracking-wider mb-2">🔨 Progreso de Producción</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-yellow-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-gold rounded-full" style={{ width: `${(q.productionProgress.completed / q.productionProgress.total) * 100}%` }} />
                </div>
                <span className="text-xs text-yellow-800">{q.productionProgress.completed}/{q.productionProgress.total} piezas</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Acciones</h4>
            <div className="space-y-2">
              <ActionButton icon={<FileText size={13} />} label="Generar PDF de cotización" onClick={() => { window.print(); }} />
              <ActionButton icon={<Mail size={13} />} label="Enviar cotización al cliente" onClick={async () => {
                try {
                  const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: `Cotización ${q.number}`, category: 'cotizacion', message: `Estimado/a ${q.customer.name},\n\nAdjunto encontrará su cotización ${q.number} por un total de ${(q.pieces.reduce((s: number, p: any) => s + ((p.adminPrice || p.autoPrice) * p.quantity), 0)).toLocaleString()} MXN.\n\nVigencia: ${q.validityDays} días.\nTimeline: ${q.timeline}.\n\nQuedamos a sus órdenes.\nDavidSon's Design`, email: q.customer.email }) });
                  if (res.ok) { setQ(p => ({...p, status: p.status === 'nueva' ? 'cotizacion_enviada' : p.status})); persistQuote({ status: q.status === 'nueva' ? 'cotizacion_enviada' : q.status }); toast.success(`Cotización enviada a ${q.customer.email}`); } else throw new Error();
                } catch { toast.error('Error al enviar email'); }
              }} accent />
              <ActionButton icon={<CheckCircle size={13} />} label="Marcar como aprobada" onClick={() => { setQ(p => ({...p, status:'aprobada'})); persistQuote({ status: 'aprobada' }); toast.success('Cotización aprobada'); }} />
              <ActionButton icon={<DollarSign size={13} />} label="Registrar anticipo recibido" onClick={() => {
                const amount = prompt(`Monto del anticipo (sugerido: ${Math.round(q.pieces.reduce((s: number, p: any) => s + ((p.adminPrice || p.autoPrice) * p.quantity), 0) * q.depositPercent / 100).toLocaleString()})`);
                if (amount) {
                  const depositData = { amount: parseFloat(amount.replace(/[^0-9.]/g, '')), method: 'Transferencia', ref: `DEP-${Date.now()}`, date: new Date().toISOString() };
                  setQ(p => ({...p, status: 'anticipo_recibido', depositPaid: depositData}));
                  persistQuote({ status: 'anticipo_recibido', deposit_paid: depositData });
                  toast.success(`Anticipo de ${depositData.amount.toLocaleString()} registrado`);
                }
              }} />
              <ActionButton icon={<Hammer size={13} />} label="Iniciar producción" onClick={() => { setQ(p => ({...p, status:'en_produccion', productionProgress: { completed: 0, total: p.pieces.reduce((s: number, pc: any) => s + pc.quantity, 0) }})); persistQuote({ status: 'en_produccion', production_progress: { completed: 0, total: q.pieces.reduce((s: number, pc: any) => s + pc.quantity, 0) } }); toast.success('Producción iniciada'); }} />
              <ActionButton icon={<ShoppingCart size={13} />} label="Convertir a pedido" onClick={() => { setQ(p => ({...p, status:'completada'})); persistQuote({ status: 'completada' }); toast.success('Cotización marcada como completada'); }} />
              <div className="border-t border-wood-100 pt-2 mt-2" />
              <ActionButton icon={<Copy size={13} />} label="Duplicar cotización" onClick={async () => {
                try {
                  const res = await fetch('/api/admin/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_email: q.customer.email, customer_name: q.customer.name, customer_phone: q.customer.phone, project_name: q.projectName ? `${q.projectName} (copia)` : 'Copia', pieces: q.pieces, discount: q.discount, conditions: q.conditions, timeline: q.timeline, validity_days: q.validityDays, deposit_percent: q.depositPercent, shipping_included: q.shippingIncluded }) });
                  if (res.ok) { onRefresh?.(); toast.success('Cotización duplicada'); } else throw new Error();
                } catch { toast.error('Error al duplicar'); }
              }} subtle />
              <ActionButton icon={<Printer size={13} />} label="Imprimir" onClick={() => window.print()} subtle />
              <ActionButton icon={<XCircle size={13} />} label="Rechazar / Cancelar" onClick={() => {
                const reason = prompt('Motivo de rechazo/cancelación:');
                if (reason) { setQ(p => ({...p, status:'rechazada', rejectionReason: reason})); persistQuote({ status: 'rechazada', rejection_reason: reason }); toast.success('Cotización rechazada'); }
              }} danger />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== ACTION BUTTON =====
const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean; subtle?: boolean; danger?: boolean }> = ({ icon, label, onClick, accent, subtle, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left ${
      danger ? 'text-red-500 hover:bg-red-50' :
      accent ? 'bg-wood-900 text-sand-100 hover:bg-wood-800' :
      subtle ? 'text-wood-500 hover:bg-sand-50' :
      'text-wood-700 bg-sand-50 hover:bg-sand-100'
    }`}
  >
    {icon} {label}
  </button>
);

// ===== PIECE CARD =====
const PieceCard: React.FC<{ piece: QuotePiece; index: number; total: number }> = ({ piece: p, index, total }) => {
  const isGrabado = p.type === 'Servicio de grabado';
  const unitPrice = p.adminPrice ?? p.autoPrice;
  const cost = p.costEstimate ?? 0;
  const margin = unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0;

  return (
    <div className="border border-wood-100 rounded-lg p-4">
      <p className="text-[10px] text-wood-400 mb-2">— Pieza {index + 1} de {total} —</p>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-lg">{isGrabado ? '✂️' : '🪵'}</span>
        <div>
          <p className="text-sm text-wood-900">{p.type}</p>
          {!isGrabado && (
            <div className="text-xs text-wood-600 space-y-0.5 mt-1">
              <p>Material: {p.wood}{p.wood === 'Combinación' && p.secondWood ? ` (${p.wood === 'Combinación' ? `Cedro + ${p.secondWood}` : p.wood} ${p.woodRatio || ''})` : ''}{p.wood === 'Parota' || p.wood === 'Nogal' ? ' (madera premium)' : ''}</p>
              {p.dimensions && <p>Dimensiones: {p.dimensions.length} × {p.dimensions.width} × {p.dimensions.thickness} cm</p>}
              {p.dimensions && <p className="text-wood-400">Volumen: {(p.dimensions.length * p.dimensions.width * p.dimensions.thickness).toLocaleString()} cm³</p>}
            </div>
          )}
          {isGrabado && p.engravingMaterial && (
            <p className="text-xs text-wood-600 mt-1">Material del cliente: {p.engravingMaterial}</p>
          )}
          <p className="text-xs text-wood-600 mt-1">Uso: {p.usage} | Cantidad: {p.quantity} {p.quantity > 1 ? 'unidades' : 'unidad'}</p>
        </div>
      </div>

      {p.engraving && (
        <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 mb-3">
          <p className="text-[10px] text-red-600 uppercase tracking-wider mb-1">🔴 Grabado Láser</p>
          <div className="text-xs text-wood-600 space-y-0.5">
            <p>Tipo: {p.engraving.type}</p>
            <p>Complejidad: {p.engraving.complexity}</p>
            {p.engraving.zones && <p>Zonas: {p.engraving.zones.join(' + ')}</p>}
            {p.engraving.text && <p>Texto: "{p.engraving.text}"</p>}
            {p.engraving.file && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-white border border-wood-200 rounded-md">📎 {p.engraving.file}</span>
                <button className="text-[10px] text-accent-gold hover:underline">👁️ Preview</button>
                <button className="text-[10px] text-accent-gold hover:underline">⬇️ Descargar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="bg-sand-50 rounded-lg p-3">
        <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5">Pricing admin</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <span className="text-wood-500">Cálculo auto:</span>
          <span className="text-wood-600">{fmt(p.autoPrice)} × {p.quantity} = {fmt(p.autoPrice * p.quantity)}</span>
          {p.adminPrice && (
            <>
              <span className="text-wood-500">Ajuste admin:</span>
              <span className="text-wood-900">{fmt(p.adminPrice)} × {p.quantity} = {fmt(p.adminPrice * p.quantity)}</span>
            </>
          )}
          {p.costEstimate && (
            <>
              <span className="text-wood-500">Costo estimado:</span>
              <span className="text-wood-600">{fmt(cost)} × {p.quantity} = {fmt(cost * p.quantity)}</span>
            </>
          )}
          <span className="text-wood-500">Margen estimado:</span>
          <span className={`${margin >= 50 ? 'text-green-600' : margin >= 30 ? 'text-amber-600' : 'text-red-500'}`}>
            {margin}% {margin >= 50 ? '✅' : margin >= 30 ? '⚠️' : '❌'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ===== ANALYTICS TAB =====
const AnalyticsTab: React.FC = () => {
  const funnelData = [
    { stage: 'Recibidas', count: 48, pct: 100 },
    { stage: 'Respondidas', count: 42, pct: 87.5 },
    { stage: 'En negociación', count: 28, pct: 58.3 },
    { stage: 'Aprobadas', count: 20, pct: 41.7 },
    { stage: 'Completadas', count: 18, pct: 37.5 },
  ];

  const rejectionData = [
    { name: 'Precio alto', value: 40 },
    { name: 'Timeline largo', value: 20 },
    { name: 'Cambió de opinión', value: 15 },
    { name: 'Sin respuesta', value: 15 },
    { name: 'Otro proveedor', value: 10 },
  ];

  const productData = [
    { name: 'Tabla charcutería', pct: 38 },
    { name: 'Servicio grabado', pct: 22 },
    { name: 'Tabla de picar', pct: 18 },
    { name: 'Tabla decoración', pct: 12 },
    { name: 'Caja personalizada', pct: 10 },
  ];

  const woodData = [
    { name: 'Parota', pct: 45 },
    { name: 'Nogal', pct: 25 },
    { name: 'Cedro', pct: 15 },
    { name: 'Combinación', pct: 10 },
    { name: 'Encino', pct: 5 },
  ];

  const clientTypeData = [
    { name: 'Corporativo/Evento', pct: 42, ticket: '$12,400' },
    { name: 'Personal/Regalo', pct: 35, ticket: '$1,800' },
    { name: 'Restaurante/Volumen', pct: 15, ticket: '$28,000' },
    { name: 'Decorativo', pct: 8, ticket: '$2,200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-wood-900 flex items-center gap-2">
          <BarChart3 size={16} className="text-accent-gold" /> Análisis de Cotizaciones
        </h4>
        <select className="text-xs bg-white border border-wood-200 rounded-lg px-3 py-1.5 text-wood-700 outline-none">
          <option>Últimos 90 días</option>
          <option>Últimos 30 días</option>
          <option>Último año</option>
        </select>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
        <h5 className="text-xs text-wood-900 mb-4">Funnel de Conversión</h5>
        <div className="space-y-3">
          {funnelData.map((d, i) => (
            <div key={d.stage}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-wood-700">{d.stage}: {d.count} cotizaciones</span>
                <span className="text-wood-500">{d.pct}%</span>
              </div>
              <div className="h-6 bg-sand-50 rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full rounded-md"
                  style={{ background: `linear-gradient(90deg, #C5A065, ${['#C5A065', '#D4B07A', '#A1887F', '#8D6E63', '#5D4037'][i]})` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">💡 La mayor pérdida es de "Respondidas" a "En negociación" (29.2%). Posible causa: precio alto en primera cotización. Sugerencia: Enviar opciones de precio (básico/premium).</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tiempo promedio respuesta', value: '4.2 horas' },
          { label: 'Tiempo cierre (cot→pedido)', value: '12 días' },
          { label: 'Valor completadas (periodo)', value: '$68,400' },
          { label: 'Ingresos cot. vs catálogo', value: '22%' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
            <p className="text-lg text-wood-900">{m.value}</p>
            <p className="text-[10px] text-wood-400 uppercase tracking-wider mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rejection Reasons */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <h5 className="text-xs text-wood-900 mb-4">Motivos de Rechazo</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rejectionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {rejectionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <RTooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e0db' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {rejectionData.map((d, i) => (
              <span key={d.name} className="text-[10px] text-wood-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                {d.name} ({d.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* Most Quoted Products */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <h5 className="text-xs text-wood-900 mb-4">Productos Más Cotizados</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 50]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <RTooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e0db' }} />
                <Bar dataKey="pct" fill="#C5A065" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Requested Woods */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <h5 className="text-xs text-wood-900 mb-4">Maderas Más Solicitadas</h5>
          <div className="space-y-2">
            {woodData.map((w, i) => (
              <div key={w.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-wood-700">{i + 1}. {w.name}</span>
                  <span className="text-wood-500">{w.pct}%</span>
                </div>
                <div className="h-2 bg-sand-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${w.pct}%`, background: CHART_COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Type */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <h5 className="text-xs text-wood-900 mb-4">Tipo de Cliente que Cotiza</h5>
          <div className="space-y-3">
            {clientTypeData.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-wood-700">{c.name}</p>
                  <p className="text-[10px] text-wood-400">{c.pct}% de cotizaciones</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-wood-900">{c.ticket}</p>
                  <p className="text-[10px] text-wood-400">ticket prom.</p>
                </div>
              </div>
            ))}
            <div className="p-2 bg-green-50 rounded-lg mt-2">
              <p className="text-[10px] text-green-700">← Restaurante/Volumen tiene el mayor potencial ($28,000 ticket promedio)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-wood-200 text-wood-700 text-xs rounded-lg hover:bg-sand-50 transition-colors">
          <Download size={14} /> Exportar reporte (PDF)
        </button>
      </div>
    </div>
  );
};
