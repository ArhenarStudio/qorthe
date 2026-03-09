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
  AdminQuote, QuoteStatus, QuotePiece, QUOTE_STATUS_CONFIG,
  getQuoteTotal, getQuoteCost, getPieceCount, hoursAgo,
  fmt, fmtDate, fmtDateTime, ACTIVE_STATUSES,
} from './quotes/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ===== CONSTANTS =====
type TabId = 'nuevas' | 'negociacion' | 'aprobadas' | 'produccion' | 'historial' | 'analisis' | 'precios';

// statusConfig now imported as QUOTE_STATUS_CONFIG from ./quotes/types
const statusConfig = QUOTE_STATUS_CONFIG;

import { DEFAULT_LOYALTY_CONFIG, getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { QuotePricingPanel } from './QuotePricingPanel';
import { TierIcon } from '@/components/ui/TierIcons';
import { QuoteDetail } from './quotes/QuoteDetailView';

function getQuoteTierBadge(tierId: string) {
  const normalized = normalizeTierId(tierId);
  const tier = DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalized) || DEFAULT_LOYALTY_CONFIG.tiers[0];
  return { name: tier.name, styles: getTierInlineStyles(tier), tierId: normalized };
}

const CHART_COLORS = ['var(--admin-accent)', 'var(--admin-text-secondary)', 'var(--admin-muted)', 'var(--admin-border)', 'var(--admin-text-secondary)'];

// ===== HELPERS (getQuoteTotal, fmt, etc. imported from ./quotes/types) =====

function getClientBadge(q: AdminQuote) {
  const { tier, orders } = q.customer;
  const badges: { text: string; cls: string }[] = [];
  if (tier === 'parota' || tier === 'ebano' || tier === 'oro' || tier === 'platino') badges.push({ text: '⚡ Cliente VIP', cls: 'bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]' });
  if (orders === 0) badges.push({ text: '🆕 Cliente nuevo', cls: 'bg-blue-50 text-blue-600' });
  const usage = q.pieces[0]?.usage;
  if (usage === 'Evento / regalo corporativo' || usage === 'Restaurante / volumen alto') badges.push({ text: '🏢 Corporativo', cls: 'bg-purple-50 text-purple-600' });
  return badges;
}

// ===== KPI CARD =====
const KpiCard: React.FC<{ icon: React.ReactNode; value: string; label: string; sub: string; accent?: boolean }> = ({ icon, value, label, sub, accent }) => (
  <div className={`bg-[var(--admin-surface)] rounded-xl border shadow-sm p-4 ${accent ? 'border-[var(--admin-accent)]/30' : 'border-[var(--admin-border)]'}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-[var(--admin-accent)]/15' : 'bg-[var(--admin-surface2)]'}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-sans text-[var(--admin-text)]">{value}</p>
    <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider mt-0.5">{label}</p>
    <p className="text-[11px] text-[var(--admin-text-secondary)] mt-1">{sub}</p>
  </div>
);

// ===== MAIN COMPONENT =====
export const QuotesPage: React.FC = () => {

  const { t } = useTheme();
  // primitivos via src/theme/primitives — leen de useTheme() directamente
  // ── Live data from API (no mock fallback) ──
  const [liveQuotes, setLiveQuotes] = useState<{ quotes: AdminQuote[]; stats: { today_revenue: number; today_count: number; pos_count: number; total_count: number } } | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveQuotes(d); }).catch(() => {}).finally(() => setQuotesLoading(false));
  }, []);

  const [tab, setTab] = useState<TabId>('nuevas');
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null);
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
    nuevas:      ['nueva'] as QuoteStatus[],
    negociacion: ['en_revision', 'cotizacion_enviada', 'en_negociacion'] as QuoteStatus[],
    aprobadas:   ['aprobada', 'anticipo_recibido'] as QuoteStatus[],
    produccion:  ['en_produccion'] as QuoteStatus[],
    historial:   ['completada', 'rechazada', 'vencida', 'cancelada'] as QuoteStatus[],
    analisis:    [] as QuoteStatus[],
    precios:     [] as QuoteStatus[],
  };

  const filtered = useMemo(() => {
    const statuses = tabFilters[tab];
    const allQuotes = (liveQuotes?.quotes || []) as AdminQuote[];
    let list = statuses.length ? allQuotes.filter(q => statuses.includes(q.status)) : allQuotes;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(q => q.number.toLowerCase().includes(s) || q.customer.name.toLowerCase().includes(s) || q.pieces.some(p => p.type.toLowerCase().includes(s)));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tab, search, liveQuotes]);

  // KPIs
  const allQ = (liveQuotes?.quotes || []) as AdminQuote[];
  const activeQuotes = allQ.filter(q => ACTIVE_STATUSES.includes(q.status));
  const newQuotes = allQ.filter(q => q.status === 'nueva');
  const urgentNew = newQuotes.filter(q => hoursAgo(q.date) > 48);
  const pipelineValue = activeQuotes.reduce((s, q) => s + getQuoteTotal(q), 0);
  const completedQuotes = allQ.filter(q => q.status === 'completada');
  const closedQuotes = allQ.filter(q => ['completada', 'rechazada', 'vencida', 'cancelada'].includes(q.status));
  const expiringThisWeek = allQ.filter(q => {
    if (!ACTIVE_STATUSES.includes(q.status)) return false;
    const exp = new Date(q.validUntil).getTime();
    return exp < Date.now() + 7 * 86400000 && exp > Date.now();
  }).length;
  const conversionRate = closedQuotes.length ? Math.round((completedQuotes.length / closedQuotes.length) * 100) : 0;
  const avgTicket = activeQuotes.length ? activeQuotes.reduce((s, q) => s + getQuoteTotal(q), 0) / activeQuotes.length : 0;

  const tabCounts: Record<TabId, number> = {
    nuevas: newQuotes.length,
    negociacion: allQ.filter(q => ['en_revision', 'cotizacion_enviada', 'en_negociacion'].includes(q.status)).length,
    aprobadas: allQ.filter(q => ['aprobada', 'anticipo_recibido'].includes(q.status)).length,
    produccion: allQ.filter(q => q.status === 'en_produccion').length,
    historial: closedQuotes.length,
    analisis: 0,
    precios: 0,
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'nuevas', label: 'Nuevas' },
    { id: 'negociacion', label: 'En negociación' },
    { id: 'aprobadas', label: 'Aprobadas' },
    { id: 'produccion', label: 'En producción' },
    { id: 'historial', label: 'Historial' },
    { id: 'analisis', label: 'Análisis' },
    { id: 'precios', label: 'Precios' },
  ];

  // ===== DETAIL VIEW =====
  if (selectedQuote) {
    return <QuoteDetail quote={selectedQuote} onBack={() => setSelectedQuote(null)} onRefresh={() => { fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveQuotes(d); }); }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-[var(--admin-text)] flex items-center gap-2">
          <FileText size={20} className="text-[var(--admin-accent)]" /> Cotizaciones
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors">
            <Plus size={14} /> Crear Cotización Manual
          </button>
          <button onClick={() => { fetch('/api/admin/importexport?type=quotes').then(r => r.json()).then(d => { const rows = d.data || []; if (!rows.length) { toast.error('No hay datos para exportar'); return; } const csv = [Object.keys(rows[0]).join(','), ...rows.map((r: Record<string, unknown>) => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cotizaciones.csv'; a.click(); URL.revokeObjectURL(url); toast.success('CSV descargado'); }).catch(() => toast.error('Error al exportar')); }} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] text-xs rounded-lg hover:bg-[var(--admin-surface2)] transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Create Quote Form */}
      {showCreateForm && (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-accent)]/30 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-[var(--admin-text)]">Nueva Cotización</h4>
            <button onClick={() => setShowCreateForm(false)} className="text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]"><span className="text-lg">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Nombre del cliente *</label><input value={newQuoteForm.customer_name} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_name: e.target.value }))} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40" placeholder="María López" /></div>
            <div><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Email *</label><input type="email" value={newQuoteForm.customer_email} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_email: e.target.value }))} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40" placeholder="maria@email.com" /></div>
            <div><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Teléfono</label><input value={newQuoteForm.customer_phone} onChange={e => setNewQuoteForm(prev => ({ ...prev, customer_phone: e.target.value }))} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40" placeholder="662-123-4567" /></div>
            <div><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Nombre del proyecto</label><input value={newQuoteForm.project_name} onChange={e => setNewQuoteForm(prev => ({ ...prev, project_name: e.target.value }))} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40" placeholder="Regalos corporativos" /></div>
            <div><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Timeline estimado</label><select value={newQuoteForm.timeline} onChange={e => setNewQuoteForm(prev => ({ ...prev, timeline: e.target.value }))} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]"><option>2-3 semanas</option><option>3-4 semanas</option><option>4-6 semanas</option><option>6-8 semanas</option></select></div>
          </div>
          <div className="mt-3"><label className="text-[10px] text-[var(--admin-muted)] uppercase block mb-1">Descripción / Solicitud del cliente</label><textarea value={newQuoteForm.description} onChange={e => setNewQuoteForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none resize-none focus:border-[var(--admin-accent)]/40" placeholder="Describe lo que el cliente necesita..." /></div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]">Cancelar</button>
            <button onClick={handleCreateQuote} disabled={creating} className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">{creating ? 'Creando...' : 'Crear Cotización'}</button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={<FileText size={16} className="text-[var(--admin-accent)]" />} value={String(activeQuotes.length)} label="Cotizaciones activas" sub={`${expiringThisWeek} vencen esta semana`} accent />
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
              tab === t.id ? 'bg-wood-900 text-sand-100' : 'bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)] border border-[var(--admin-border)]'
            }`}
          >
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                tab === t.id ? 'bg-[var(--admin-accent)]/30 text-[var(--admin-accent)]' : 'bg-[var(--admin-surface2)] text-[var(--admin-text-secondary)]'
              }`}>{tabCounts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por # cotización, cliente o producto..."
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none focus:border-wood-400 transition-colors"
        />
      </div>

      {/* Content */}
      {tab === 'precios' ? (
        <QuotePricingPanel />
      ) : tab === 'analisis' ? (
        <AnalyticsTab quotes={allQ} />
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
const NewQuotesList: React.FC<{ quotes: AdminQuote[]; onSelect: (q: AdminQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="space-y-3">
    <p className="text-xs text-[var(--admin-text-secondary)]">⏳ {quotes.length} cotizaciones nuevas</p>
    {quotes.map(q => {
      const badges = getClientBadge(q);
      const isUrgent = hoursAgo(q.date) > 48;
      return (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-[var(--admin-surface)] rounded-xl border shadow-sm overflow-hidden transition-colors ${isUrgent ? 'border-amber-300 bg-amber-50/30' : 'border-[var(--admin-border)]'}`}
        >
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${statusConfig[q.status].dot}`} />
                  <span className="text-xs text-[var(--admin-text)]">{q.number}</span>
                  {badges.map((b, i) => (
                    <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full ${b.cls}`}>{b.text}</span>
                  ))}
                  {isUrgent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">⚠️ +48h sin responder</span>}
                </div>
                <p className="text-xs text-[var(--admin-text)] mt-1">
                  {q.customer.name}
                  {q.customer.tier && (() => { const tb = getQuoteTierBadge(q.customer.tier); return <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={tb.styles.badge}><TierIcon tierId={tb.tierId} size={10} /> {tb.name}</span>; })()}
                  {q.customer.orders > 0 && <span className="text-[var(--admin-muted)] ml-2">— {q.customer.orders} pedidos previos</span>}
                </p>
                <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">{q.customer.email}{q.customer.phone ? ` | ${q.customer.phone}` : ''}</p>
              </div>
              <span className="text-[11px] text-[var(--admin-muted)] whitespace-nowrap">{fmtDateTime(q.date)}</span>
            </div>

            {/* Pieces */}
            <div className="mb-3">
              <p className="text-[11px] text-[var(--admin-text-secondary)] mb-1.5">📦 {q.pieces.length} pieza{q.pieces.length > 1 ? 's' : ''} solicitada{q.pieces.length > 1 ? 's' : ''}:</p>
              <div className="space-y-1.5">
                {q.pieces.map((p, i) => (
                  <div key={p.id} className="text-xs text-[var(--admin-text)] pl-3 border-l-2 border-[var(--admin-border)]">
                    <span className="text-[var(--admin-text)]">{i + 1}. {p.type}</span>
                    {p.type !== 'Servicio de grabado' ? ` — ${p.wood}` : ''}
                    {p.dimensions && <span className="text-[var(--admin-muted)] ml-1">{p.dimensions.length}×{p.dimensions.width}×{p.dimensions.thickness} cm</span>}
                    {p.engravingMaterial && <span className="text-[var(--admin-muted)] ml-1">— {p.engravingMaterial}</span>}
                    {p.engraving && <span className="text-[var(--admin-muted)] ml-1">| Grabado: {p.engraving.type} ({p.engraving.complexity})</span>}
                    <br />
                    <span className="text-[var(--admin-muted)]">Uso: {p.usage} | Cantidad: {p.quantity} {p.quantity > 1 ? 'unidades' : 'unidad'}</span>
                    {p.engraving?.file && <span className="text-[var(--admin-muted)] ml-1">| 📎 {p.engraving.file}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--admin-text-secondary)] pt-3 border-t border-[var(--admin-border)]">
              <span>💰 Estimado: <span className="text-[var(--admin-text)]">{fmt(getQuoteTotal(q))}</span></span>
              <span>📅 Validez: hasta {fmtDate(q.validUntil)}</span>
              {q.pieces[0]?.usage && <span>🏢 Uso: {q.pieces[0].usage}</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => onSelect(q)} className="flex items-center gap-1 px-3 py-1.5 bg-wood-900 text-sand-100 text-[11px] rounded-lg hover:bg-wood-800 transition-colors">
                <Eye size={12} /> Revisar completa
              </button>
              <button onClick={() => onSelect(q)} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] text-[11px] rounded-lg hover:bg-[var(--admin-accent)]/25 transition-colors">
                <Zap size={12} /> Responder rápido
              </button>
              <button className="p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-text)] transition-colors">
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
const NegotiationTable: React.FC<{ quotes: AdminQuote[]; onSelect: (q: AdminQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
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
              <tr key={q.id} className={`hover:bg-[var(--admin-surface2)]/50 transition-colors ${isStale ? 'bg-amber-50/30' : ''}`}>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.number}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.customer.name}</td>
                <td className="px-4 py-3">
                  {q.customer.tier ? (
                    (() => { const tb = getQuoteTierBadge(q.customer.tier); return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={tb.styles.badge}><TierIcon tierId={tb.tierId} size={10} /> {tb.name}</span>; })()
                  ) : <span className="text-[10px] text-[var(--admin-muted)]">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{q.pieces.length}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{fmt(getQuoteTotal(q))}</td>
                <td className="px-4 py-3 text-[11px]">
                  {lastMsg ? (
                    <div>
                      <span className={isStale ? 'text-amber-600' : 'text-[var(--admin-text-secondary)]'}>
                        Hace {Math.max(1, Math.round(hoursAgo(lastMsg.date) / 24))}d {isStale && '⚠️'}
                      </span>
                      <br />
                      <span className="text-[10px] text-[var(--admin-muted)]">({lastMsg.sender === 'client' ? 'cliente' : 'admin'})</span>
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{q.messages.length}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onSelect(q)} className="text-[11px] text-[var(--admin-accent)] hover:underline">Ver detalle</button>
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
const ApprovedTable: React.FC<{ quotes: AdminQuote[]; onSelect: (q: AdminQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
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
              <tr key={q.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.number}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.customer.name}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{fmt(total)}</td>
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
                <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{fmtDate(q.date)}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  {!q.depositPaid && (
                    <button onClick={() => onSelect(q)} className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                      💰 Registrar anticipo
                    </button>
                  )}
                  <button onClick={() => onSelect(q)} className="text-[11px] text-[var(--admin-accent)] hover:underline ml-1">Ver</button>
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
const ProductionTable: React.FC<{ quotes: AdminQuote[]; onSelect: (q: AdminQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
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
              <tr key={q.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.number}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.customer.name}</td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{fmt(getQuoteTotal(q))}</td>
                <td className="px-4 py-3">
                  {q.depositPaid ? (
                    <span className="text-[10px] text-green-600">✅ {fmt(q.depositPaid.amount)}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{prog ? `${prog.completed}/${prog.total}` : q.pieces.length}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[var(--admin-surface2)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--admin-accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-[var(--admin-text-secondary)]">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{q.timeline || '—'}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <button onClick={() => onSelect(q)} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                    📸 Actualizar
                  </button>
                  <button onClick={() => onSelect(q)} className="text-[11px] text-[var(--admin-accent)] hover:underline ml-1">Ver</button>
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
const HistoryTable: React.FC<{ quotes: AdminQuote[]; onSelect: (q: AdminQuote) => void }> = ({ quotes, onSelect }) => (
  <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
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
            <tr key={q.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
              <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.number}</td>
              <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{q.customer.name}</td>
              <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{getPieceCount(q)}</td>
              <td className="px-4 py-3 text-xs text-[var(--admin-text)]">{fmt(getQuoteTotal(q))}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[q.status].cls}`}>{statusConfig[q.status].label}</span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{q.closedDate ? fmtDate(q.closedDate) : '—'}</td>
              <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{q.rejectionReason || '—'}</td>
              <td className="px-4 py-3">
                <button onClick={() => onSelect(q)} className="text-[11px] text-[var(--admin-accent)] hover:underline">Ver</button>
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
    <FileText size={32} className="text-[var(--admin-muted)] mx-auto mb-2" />
    <p className="text-xs text-[var(--admin-muted)]">{text}</p>
  </div>
);

// ===== ANALYTICS TAB (computed from real data) =====
const AnalyticsTab: React.FC<{ quotes: AdminQuote[] }> = ({ quotes }) => {
  const total = quotes.length;
  const responded = quotes.filter(q => q.messages.length > 1 || q.status !== 'nueva').length;
  const negotiating = quotes.filter(q => ['en_revision','cotizacion_enviada','en_negociacion'].includes(q.status)).length;
  const approved = quotes.filter(q => ['aprobada','anticipo_recibido','en_produccion','completada'].includes(q.status)).length;
  const completed = quotes.filter(q => q.status === 'completada').length;

  const funnelData = [
    { stage: 'Recibidas', count: total, pct: 100 },
    { stage: 'Respondidas', count: responded, pct: total ? Math.round(responded/total*100) : 0 },
    { stage: 'En negociación', count: negotiating, pct: total ? Math.round(negotiating/total*100) : 0 },
    { stage: 'Aprobadas', count: approved, pct: total ? Math.round(approved/total*100) : 0 },
    { stage: 'Completadas', count: completed, pct: total ? Math.round(completed/total*100) : 0 },
  ];

  // Rejection reasons from real data
  const rejected = quotes.filter(q => q.status === 'rechazada');
  const reasonCounts: Record<string, number> = {};
  rejected.forEach(q => { const r = q.rejectionReason || 'Sin motivo'; reasonCounts[r] = (reasonCounts[r] || 0) + 1; });
  const rejectionData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value: rejected.length ? Math.round(value/rejected.length*100) : 0 })).sort((a,b) => b.value - a.value).slice(0, 5);
  if (rejectionData.length === 0) rejectionData.push({ name: 'Sin datos', value: 100 });

  // Most quoted product types from real data
  const typeCounts: Record<string, number> = {};
  quotes.forEach(q => q.pieces.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + p.quantity; }));
  const totalPieces = Object.values(typeCounts).reduce((s,v) => s+v, 0) || 1;
  const productData = Object.entries(typeCounts).map(([name, count]) => ({ name, pct: Math.round(count/totalPieces*100) })).sort((a,b) => b.pct - a.pct).slice(0, 5);

  // Most requested woods
  const woodCounts: Record<string, number> = {};
  quotes.forEach(q => q.pieces.forEach(p => { if (p.wood) woodCounts[p.wood] = (woodCounts[p.wood] || 0) + p.quantity; }));
  const totalWood = Object.values(woodCounts).reduce((s,v) => s+v, 0) || 1;
  const woodData = Object.entries(woodCounts).map(([name, count]) => ({ name, pct: Math.round(count/totalWood*100) })).sort((a,b) => b.pct - a.pct).slice(0, 5);

  // Avg response time (hours between creation and first admin message)
  const responseTimes: number[] = [];
  quotes.forEach(q => {
    const adminMsg = q.messages.find(m => m.sender === 'admin');
    if (adminMsg) responseTimes.push(hoursAgo(q.date) - hoursAgo(adminMsg.date));
  });
  const avgResponseHours = responseTimes.length ? Math.round(responseTimes.reduce((s,v)=>s+v,0) / responseTimes.length * 10) / 10 : 0;

  // Completed value
  const completedValue = quotes.filter(q => q.status === 'completada').reduce((s, q) => s + getQuoteTotal(q), 0);

  // Quote vs catalog ratio
  const quoteRevenue = quotes.filter(q => ACTIVE_STATUSES.includes(q.status) || q.status === 'completada').reduce((s, q) => s + getQuoteTotal(q), 0);

  const hasData = total > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-[var(--admin-text)] flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--admin-accent)]" /> Análisis de Cotizaciones
        </h4>
        <select className="text-xs bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-1.5 text-[var(--admin-text)] outline-none">
          <option>Últimos 90 días</option>
          <option>Últimos 30 días</option>
          <option>Último año</option>
        </select>
      </div>

      {/* Funnel */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
        <h5 className="text-xs text-[var(--admin-text)] mb-4">Funnel de Conversión</h5>
        <div className="space-y-3">
          {funnelData.map((d, i) => (
            <div key={d.stage}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--admin-text)]">{d.stage}: {d.count} cotizaciones</span>
                <span className="text-[var(--admin-text-secondary)]">{d.pct}%</span>
              </div>
              <div className="h-6 bg-[var(--admin-surface2)] rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full rounded-md"
                  style={{ background: `linear-gradient(90deg, var(--admin-accent), ${['var(--admin-accent)', '#D4B07A', 'var(--admin-muted)', 'var(--admin-text-secondary)', 'var(--admin-text-secondary)'][i]})` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          {hasData ? (
            <p className="text-xs text-blue-700">💡 {funnelData[4].pct > 30 ? `Buena tasa de conversión (${funnelData[4].pct}%). ` : `Tasa de conversión: ${funnelData[4].pct}%. `}{rejected.length > 0 ? `Principal motivo de rechazo: ${rejectionData[0]?.name || 'N/A'}.` : 'Aún sin rechazos registrados.'}</p>
          ) : (
            <p className="text-xs text-blue-700">💡 Los datos del funnel se poblarán conforme recibas y gestiones cotizaciones.</p>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tiempo promedio respuesta', value: avgResponseHours ? `${avgResponseHours}h` : '—' },
          { label: 'Cotizaciones completadas', value: String(completed) },
          { label: 'Valor completadas', value: completedValue ? fmt(completedValue) : '—' },
          { label: 'Tasa conversión', value: total ? `${funnelData[4].pct}%` : '—' },
        ].map(m => (
          <div key={m.label} className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-4">
            <p className="text-lg text-[var(--admin-text)]">{m.value}</p>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rejection Reasons */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <h5 className="text-xs text-[var(--admin-text)] mb-4">Motivos de Rechazo</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rejectionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {rejectionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <RTooltip formatter={(v: number | string | undefined) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--admin-border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {rejectionData.map((d, i) => (
              <span key={d.name} className="text-[10px] text-[var(--admin-text-secondary)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                {d.name} ({d.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* Most Quoted Products */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <h5 className="text-xs text-[var(--admin-text)] mb-4">Productos Más Cotizados</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 50]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <RTooltip formatter={(v: number | string | undefined) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--admin-border)' }} />
                <Bar dataKey="pct" fill="var(--admin-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Requested Woods */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <h5 className="text-xs text-[var(--admin-text)] mb-4">Maderas Más Solicitadas</h5>
          {woodData.length === 0 ? (
            <p className="text-xs text-[var(--admin-muted)] text-center py-8">Sin datos aún</p>
          ) : (
          <div className="space-y-2">
            {woodData.map((w, i) => (
              <div key={w.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--admin-text)]">{i + 1}. {w.name}</span>
                  <span className="text-[var(--admin-text-secondary)]">{w.pct}%</span>
                </div>
                <div className="h-2 bg-[var(--admin-surface2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${w.pct}%`, background: CHART_COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <h5 className="text-xs text-[var(--admin-text)] mb-4">Resumen</h5>
          {!hasData ? (
            <p className="text-xs text-[var(--admin-muted)] text-center py-8">Aún no hay suficientes cotizaciones para generar análisis detallado. Los datos se poblarán conforme se reciban cotizaciones.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--admin-text-secondary)]">Total cotizaciones</span>
                <span className="text-[var(--admin-text)] font-bold">{total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--admin-text-secondary)]">Valor total pipeline</span>
                <span className="text-[var(--admin-text)] font-bold">{fmt(quoteRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--admin-text-secondary)]">Rechazadas</span>
                <span className="text-[var(--admin-text)]">{rejected.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--admin-text-secondary)]">Productos únicos cotizados</span>
                <span className="text-[var(--admin-text)]">{Object.keys(typeCounts).length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] text-xs rounded-lg hover:bg-[var(--admin-surface2)] transition-colors">
          <Download size={14} /> Exportar reporte (PDF)
        </button>
      </div>
    </div>
  );
};
