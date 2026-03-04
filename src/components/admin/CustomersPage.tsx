"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoyaltyConfigPanel } from './LoyaltyConfigPanel';
import { DEFAULT_LOYALTY_CONFIG, getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { TierIcon, getTierSymbol } from '@/components/ui/TierIcons';
import {
  Search, Users, ArrowLeft, ShoppingBag, Mail, Phone, Plus,
  Download, MoreVertical, Filter, X, Star,
  MapPin, Clock, Eye, Tag, Zap, TrendingUp, Settings2,
  FileText, Calendar, Crown, Send,
  Gift, Shield, UserPlus, BarChart3
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip } from 'recharts';

/* ================================================================
   TIER SYSTEM
   ================================================================ */
// Map legacy tier IDs (bronze/silver/gold/platinum) → real tier IDs (pino/nogal/parota/ebano)
type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'pino' | 'nogal' | 'parota' | 'ebano';

function getTierLabel(tierId: string): string {
  const normalized = normalizeTierId(tierId);
  const tier = DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalized);
  return tier?.name || tierId;
}

function getTierStyles(tierId: string) {
  const normalized = normalizeTierId(tierId);
  const tier = DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalized) || DEFAULT_LOYALTY_CONFIG.tiers[0];
  return getTierInlineStyles(tier);
}

/* ================================================================
   TYPES (matching API response)
   ================================================================ */
interface CustomerFull {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  tier: Tier;
  points: number;
  lifetime_points: number;
  lifetime_spend: number;
  points_multiplier: number;
  total_spent: number;
  total_spent_display: number;
  avg_ticket: number;
  order_count: number;
  last_order_at: string | null;
  days_since_order: number;
  registered_at: string;
  location: string | null;
  status: 'active' | 'inactive' | 'lead';
  tags: string[];
  has_loyalty: boolean;
  supabase_user_id: string | null;
  // Computed for UI compatibility
  avatar: string;
  totalSpent: number;
  orders: number;
  lastOrder: string;
  registered: string;
  avgTicket: number;
  purchasesPerMonth: number;
  engravedPct: number;
  repurchaseProb: number;
}

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  leads: number;
  tierCounts: Record<string, number>;
  avgLtv: number;
  repurchaseRate: number;
  vipCount: number;
}

/** Map API response to UI-compatible CustomerFull */
function mapApiCustomer(c: any): CustomerFull {
  const initials = (c.name || '?').split(' ').map((w: string) => w[0]?.toUpperCase() || '').join('').slice(0, 2);
  const monthsSinceReg = c.registered_at ? Math.max(1, Math.floor((Date.now() - new Date(c.registered_at).getTime()) / (30 * 86400000))) : 1;
  return {
    ...c,
    avatar: initials,
    totalSpent: c.total_spent_display || 0,
    orders: c.order_count || 0,
    lastOrder: c.last_order_at || '',
    registered: c.registered_at || '',
    avgTicket: c.avg_ticket || 0,
    purchasesPerMonth: monthsSinceReg > 0 ? Number(((c.order_count || 0) / monthsSinceReg).toFixed(1)) : 0,
    engravedPct: 0, // TODO: calculate from order metadata
    repurchaseProb: c.order_count > 3 ? 80 : c.order_count > 1 ? 50 : c.order_count === 1 ? 25 : 5,
  };
}

const mockSpendChart = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'].map(m => ({
  mes: m,
  gasto: Math.round(500 + Math.random() * 1500),
}));

const mockPointsHistory = [
  { date: '28 Feb 2026', concept: 'Compra #DSD-0014', points: 850, balance: 12340 },
  { date: '22 Feb 2026', concept: 'Compra #DSD-0013', points: 1100, balance: 11490 },
  { date: '15 Feb 2026', concept: 'Canje en pedido #DSD-0012', points: -500, balance: 10390 },
  { date: '10 Feb 2026', concept: 'Compra #DSD-0012', points: 650, balance: 10890 },
  { date: '01 Feb 2026', concept: 'Bono mensual Oro', points: 200, balance: 10240 },
  { date: '20 Ene 2026', concept: 'Compra #DSD-0011', points: 920, balance: 10040 },
];

const mockOrders = [
  { id: 'DSD-0014', date: '28 Feb 2026', products: 'Tabla Parota Charcuteria Gde', total: 1100, status: 'delivered' },
  { id: 'DSD-0013', date: '22 Feb 2026', products: 'Tabla Cedro Rojo Rustica', total: 1200, status: 'shipped' },
  { id: 'DSD-0012', date: '10 Feb 2026', products: 'Set 3 Tablas + Grabado', total: 3490, status: 'delivered' },
  { id: 'DSD-0011', date: '20 Ene 2026', products: 'Tabla Rosa Morada Gourmet', total: 1650, status: 'delivered' },
  { id: 'DSD-0010', date: '05 Ene 2026', products: 'Mini Tabla Parota Appetizer x2', total: 900, status: 'delivered' },
];

const mockActivity = [
  { type: 'order', date: '28 Feb 2026', text: 'Realizo pedido #DSD-0014 por $1,100', icon: ShoppingBag },
  { type: 'points', date: '28 Feb 2026', text: 'Gano 850 puntos por compra', icon: Star },
  { type: 'tier', date: '25 Feb 2026', text: 'Subio a tier Oro', icon: Crown },
  { type: 'order', date: '22 Feb 2026', text: 'Realizo pedido #DSD-0013 por $1,200', icon: ShoppingBag },
  { type: 'points', date: '15 Feb 2026', text: 'Canjeo 500 puntos ($5.00 MXN)', icon: Gift },
  { type: 'admin', date: '10 Feb 2026', text: 'Admin ajusto +200 puntos (cortesia)', icon: Shield },
  { type: 'order', date: '10 Feb 2026', text: 'Realizo pedido #DSD-0012 por $3,490', icon: ShoppingBag },
];

/* ================================================================
   HELPERS
   ================================================================ */
const TierBadge: React.FC<{ tier: Tier; size?: 'sm' | 'md' }> = ({ tier, size = 'sm' }) => {
  const s = getTierStyles(tier);
  const iconSize = size === 'sm' ? 12 : 16;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full text-white ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}
      style={s.card}
    >
      <TierIcon tierId={tier} size={iconSize} /> {getTierLabel(tier)}
    </span>
  );
};

const isVip = (t: Tier) => ['gold', 'platinum', 'parota', 'ebano'].includes(t);
const daysSince = (d: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : Infinity;

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export const CustomersPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [tab, setTab] = useState<'all' | 'membership' | 'segments' | 'config'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFull | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Live data from API ─────────────────────────────────
  const [allCustomers, setAllCustomers] = useState<CustomerFull[]>([]);
  const [apiStats, setApiStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchCustomers = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (searchQ) params.set('search', searchQ);
      if (filterTier !== 'all') params.set('tier', filterTier);
      if (filterActivity === 'inactive') params.set('status', 'inactive');
      if (filterActivity === 'recent') params.set('status', 'active');
      params.set('limit', '200');
      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAllCustomers((data.customers || []).map(mapApiCustomer));
      if (data.stats) setApiStats(data.stats);
      setIsLive(true);
    } catch (err) {
      console.error('[CustomersPage] fetch error:', err);
      if (!silent) setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [searchQ, filterTier, filterActivity]);

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(() => fetchCustomers(true), 60000);
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  const filtered = allCustomers; // Filtering is done server-side

  const kpis = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.total,
        newThisMonth: allCustomers.filter(c => daysSince(c.registered) <= 30).length,
        avgLtv: apiStats.avgLtv,
        repurchase: apiStats.repurchaseRate,
        vips: apiStats.vipCount,
        vipPct: apiStats.total > 0 ? Math.round(apiStats.vipCount / apiStats.total * 100) : 0,
      };
    }
    return { total: 0, newThisMonth: 0, avgLtv: 0, repurchase: 0, vips: 0, vipPct: 0 };
  }, [apiStats, allCustomers]);

  const toggleSelect = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const toggleAll = () => setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)));

  /* Customer profile view */
  if (selectedCustomer) {
    return <CustomerProfile customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="space-y-4" onClick={() => setContextMenu(null)}>
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-accent-gold" />
          <h3 className="font-serif text-lg text-wood-900">Clientes y Membresías</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors">
            <UserPlus size={14} /> Agregar cliente
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 text-wood-600 rounded-lg text-xs hover:bg-sand-50 transition-colors">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-6 border-b border-wood-100 overflow-x-auto">
        {[
          { key: 'all' as const, label: 'Todos los Clientes', icon: Users },
          { key: 'membership' as const, label: 'Por Membresía', icon: Crown },
          { key: 'segments' as const, label: 'Segmentos', icon: Tag },
          { key: 'config' as const, label: 'Config. del Programa', icon: Settings2 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 pb-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-accent-gold text-accent-gold' : 'border-transparent text-wood-400 hover:text-wood-600'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: Users, color: 'bg-accent-gold/10 text-accent-gold', val: kpis.total, label: 'Total clientes', sub: '+12% vs prev' },
          { icon: UserPlus, color: 'bg-blue-50 text-blue-600', val: kpis.newThisMonth, label: 'Nuevos este mes', sub: '+5 vs prev' },
          { icon: TrendingUp, color: 'bg-green-50 text-green-600', val: `$${kpis.avgLtv.toLocaleString()}`, label: 'Valor prom. cliente', sub: '+8% vs prev' },
          { icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', val: `${kpis.repurchase}%`, label: 'Tasa de recompra', sub: '+3% vs prev' },
          { icon: Crown, color: 'bg-amber-50 text-amber-700', val: kpis.vips, label: 'Clientes VIP', sub: `${kpis.vipPct}% del total` },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-wood-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${k.color}`}><k.icon size={14} /></div>
              <span className="text-lg text-wood-900">{k.val}</span>
            </div>
            <p className="text-[11px] text-wood-500">{k.label}</p>
            <p className="text-[10px] text-green-600">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* TAB 1: ALL CUSTOMERS */}
      {tab === 'all' && (
        <div className="space-y-3">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-wood-200 rounded-lg overflow-hidden">
              <Search size={16} className="ml-3 text-wood-400" />
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar por nombre, email o telefono..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-wood-900 placeholder:text-wood-400"
              />
            </div>
            <div className="flex gap-2 items-center">
              <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="px-3 py-2.5 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                <option value="all">Todos los tiers</option>
                <option value="bronze">Bronce</option>
                <option value="silver">Plata</option>
                <option value="gold">Oro</option>
                <option value="platinum">Platino</option>
              </select>
              <select value={filterActivity} onChange={e => setFilterActivity(e.target.value)} className="px-3 py-2.5 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                <option value="all">Toda actividad</option>
                <option value="recent">Ultimos 30d</option>
                <option value="inactive">Inactivos +90d</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-lg border transition-colors ${showFilters ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold' : 'bg-white border-wood-200 text-wood-400'}`}>
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-accent-gold/5 border border-accent-gold/20 rounded-xl px-4 py-2.5">
              <span className="text-xs text-accent-gold">{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</span>
              <div className="w-px h-4 bg-accent-gold/20" />
              <button className="text-[11px] text-wood-600 hover:text-accent-gold flex items-center gap-1"><Mail size={11} /> Email</button>
              <button className="text-[11px] text-wood-600 hover:text-accent-gold flex items-center gap-1"><Star size={11} /> Ajustar puntos</button>
              <button className="text-[11px] text-wood-600 hover:text-accent-gold flex items-center gap-1"><Crown size={11} /> Cambiar tier</button>
              <button className="text-[11px] text-wood-600 hover:text-accent-gold flex items-center gap-1"><Tag size={11} /> Agregar tag</button>
              <button className="text-[11px] text-wood-600 hover:text-accent-gold flex items-center gap-1"><Download size={11} /> Exportar</button>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-wood-400 hover:text-wood-600"><X size={14} /></button>
            </motion.div>
          )}

          {/* Customer Table */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-3 py-3 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-accent-gold rounded" /></th>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3 hidden lg:table-cell">Email</th>
                    <th className="px-3 py-3 hidden md:table-cell">Telefono</th>
                    <th className="px-3 py-3">Tier</th>
                    <th className="px-3 py-3 hidden lg:table-cell">Puntos</th>
                    <th className="px-3 py-3">Gasto total</th>
                    <th className="px-3 py-3 hidden md:table-cell">Pedidos</th>
                    <th className="px-3 py-3 hidden xl:table-cell">Ultimo pedido</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {filtered.map(c => {
                    const inactiveRisk = c.orders > 0 && daysSince(c.lastOrder) > 90;
                    return (
                      <tr key={c.id} className={`hover:bg-sand-50/50 transition-colors ${isVip(c.tier) ? 'bg-accent-gold/[0.02]' : ''}`}>
                        <td className="px-3 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-accent-gold rounded" /></td>
                        <td className="px-3 py-3">
                          <button onClick={() => setSelectedCustomer(c)} className="flex items-center gap-2.5 hover:text-accent-gold transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 text-white" style={getTierStyles(c.tier).avatar}>
                              {c.avatar}
                            </div>
                            <span className="text-xs text-wood-900 truncate max-w-[140px]">{c.name}</span>
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-wood-500 hidden lg:table-cell truncate max-w-[180px]">{c.email}</td>
                        <td className="px-3 py-3 text-xs text-wood-500 hidden md:table-cell">{c.phone || '—'}</td>  
                        <td className="px-3 py-3"><TierBadge tier={c.tier} /></td>
                        <td className="px-3 py-3 text-xs text-wood-600 hidden lg:table-cell">{c.points.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-wood-900">${c.totalSpent.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-wood-600 hidden md:table-cell">{c.orders}</td>
                        <td className={`px-3 py-3 text-xs hidden xl:table-cell ${inactiveRisk ? 'text-red-500' : 'text-wood-500'}`}>
                          {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          {inactiveRisk && <span className="ml-1">⚠</span>}
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === c.id ? null : c.id); }} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600">
                              <MoreVertical size={14} />
                            </button>
                            {contextMenu === c.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-wood-200 rounded-xl shadow-xl py-1 z-30 min-w-[180px]" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setSelectedCustomer(c); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><Eye size={12} /> Ver perfil</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><Mail size={12} /> Enviar email</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><Star size={12} /> Ajustar puntos</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><Crown size={12} /> Cambiar tier</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><FileText size={12} /> Agregar nota</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><ShoppingBag size={12} /> Ver pedidos</button>
                                <div className="border-t border-wood-100 my-1" />
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50"><Plus size={12} /> Crear pedido manual</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-wood-400 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POR MEMBRESÍA */}
      {tab === 'membership' && <MembershipTab customers={allCustomers} />}

      {/* TAB 3: SEGMENTOS */}
      {tab === 'segments' && <SegmentsTab />}

      {/* TAB 4: CONFIG — Connected to /api/loyalty/config */}
      {tab === 'config' && <LoyaltyConfigPanel />}
    </div>
  );
};

/* ================================================================
   CUSTOMER PROFILE
   ================================================================ */
const CustomerProfile: React.FC<{ customer: CustomerFull; onBack: () => void }> = ({ customer, onBack }) => {
  const [profileTab, setProfileTab] = useState<'summary' | 'orders' | 'points' | 'addresses' | 'activity' | 'notes' | 'comms'>('summary');
  const ts = getTierStyles(customer.tier);
  const tierIds = DEFAULT_LOYALTY_CONFIG.tiers.map(t => t.id);
  const currentNorm = normalizeTierId(customer.tier);
  const currentIdx = tierIds.indexOf(currentNorm);
  const nextTierConfig = currentIdx < tierIds.length - 1 ? DEFAULT_LOYALTY_CONFIG.tiers[currentIdx + 1] : null;
  const nextMin = nextTierConfig ? Math.round(nextTierConfig.min_spend / 100) : null;
  const progressPct = nextMin ? Math.min(100, (customer.totalSpent / nextMin) * 100) : 100;
  const remaining = nextMin ? nextMin - customer.totalSpent : 0;

  return (
    <div className="space-y-4">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-[10px] text-wood-400 uppercase tracking-wider">Clientes</p>
          <h3 className="font-serif text-wood-900">Perfil de cliente</h3>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-medium text-white flex-shrink-0" style={ts.avatar}>
            {customer.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-lg text-wood-900">{customer.name}</h4>
              <TierBadge tier={customer.tier} size="md" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-wood-500 mt-1">
              <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
              {customer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>}
              {customer.location && <span className="flex items-center gap-1"><MapPin size={12} /> {customer.location}</span>}
              <span className="flex items-center gap-1"><Calendar size={12} /> Cliente desde: {new Date(customer.registered).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Tier progress */}
            <div className="mt-3 max-w-md">
              <div className="flex items-center justify-between text-[10px] text-wood-400 mb-1">
                <span className="inline-flex items-center gap-1"><TierIcon tierId={customer.tier} size={12} /> {getTierLabel(customer.tier)} — {customer.points.toLocaleString()} puntos (${(customer.points * 0.01).toFixed(2)} MXN)</span>
                {nextTierConfig && <span className="inline-flex items-center gap-1"><TierIcon tierId={nextTierConfig.id} size={12} /> {nextTierConfig.name}</span>}
              </div>
              <div className="h-2 bg-wood-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, ...ts.card }} />
              </div>
              {nextTierConfig && <p className="text-[10px] text-wood-400 mt-1">Le faltan ${remaining.toLocaleString()} para subir a {nextTierConfig.name}</p>}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {customer.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-sand-100 text-wood-600 rounded-full">{t}</span>)}
                <button className="text-[10px] px-2 py-0.5 border border-dashed border-wood-200 text-wood-400 rounded-full hover:border-accent-gold hover:text-accent-gold">+ Tag</button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-3 py-2 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50 flex items-center gap-1"><Mail size={12} /> Email</button>
            <button className="px-3 py-2 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50 flex items-center gap-1"><FileText size={12} /> Nota</button>
            <button className="px-3 py-2 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50 flex items-center gap-1"><Star size={12} /> Puntos</button>
          </div>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-wood-100">
          {[
            { val: `$${customer.totalSpent.toLocaleString()}`, label: 'Gasto total' },
            { val: customer.orders, label: 'Pedidos totales' },
            { val: `$${customer.avgTicket.toLocaleString()}`, label: 'Ticket promedio' },
            { val: customer.purchasesPerMonth.toFixed(1), label: 'Compras/mes' },
            { val: `${customer.engravedPct}%`, label: 'Con grabado' },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <p className="text-lg text-wood-900">{k.val}</p>
              <p className="text-[10px] text-wood-400 uppercase tracking-wider">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile tabs */}
      <div className="flex items-center gap-4 border-b border-wood-100 overflow-x-auto">
        {[
          { key: 'summary' as const, label: 'Resumen' },
          { key: 'orders' as const, label: 'Pedidos' },
          { key: 'points' as const, label: 'Puntos' },
          { key: 'addresses' as const, label: 'Direcciones' },
          { key: 'activity' as const, label: 'Actividad' },
          { key: 'notes' as const, label: 'Notas' },
          { key: 'comms' as const, label: 'Comunicaciones' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setProfileTab(t.key)}
            className={`pb-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
              profileTab === t.key ? 'border-accent-gold text-accent-gold' : 'border-transparent text-wood-400 hover:text-wood-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={profileTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {profileTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Spend chart */}
              <div className="bg-white rounded-xl border border-wood-100 p-5">
                <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Gasto por mes (ultimos 12 meses)</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockSpendChart}>
                      <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Gasto']} />
                      <Bar dataKey="gasto" fill="#C5A065" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Favorites + Patterns */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-wood-100 p-5">
                  <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Productos favoritos</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Tabla Parota Charcuteria Med', buys: 5, total: 4250 },
                      { name: 'Tabla Cedro Rojo Grande', buys: 3, total: 3600 },
                      { name: 'Set 3 Tablas Artesanales', buys: 2, total: 5980 },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-wood-400 w-4">{i + 1}.</span>
                        <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center flex-shrink-0"><ShoppingBag size={12} className="text-wood-400" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-wood-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-wood-400">{p.buys} compras (${p.total.toLocaleString()})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-wood-100 p-5">
                  <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3">Patrones de compra</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    {[
                      ['Dia preferido', 'Viernes'],
                      ['Hora preferida', '10:00 - 12:00'],
                      ['Pago favorito', 'Stripe (****4242)'],
                      ['Carrier preferido', 'DHL Express'],
                      ['Usa grabado', `Si (${customer.engravedPct}%)`],
                      ['Usa cupones', 'No'],
                    ].map(([k, v], i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-wood-50">
                        <span className="text-wood-400">{k}</span>
                        <span className="text-wood-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-white rounded-xl border border-wood-100 p-5 lg:col-span-2">
                <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Zap size={12} /> Predicciones</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-lg text-green-600">{customer.repurchaseProb}%</p>
                    <p className="text-[10px] text-wood-400">Prob. recompra (30d)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-wood-900">{customer.repurchaseProb > 50 ? 'Bajo' : 'Medio'}</p>
                    <p className="text-[10px] text-wood-400">Riesgo de abandono</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-wood-900">$8,500</p>
                    <p className="text-[10px] text-wood-400">Valor est. prox. 12m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-accent-gold">~4 meses</p>
                    <p className="text-[10px] text-wood-400">Llegara a {nextTierConfig ? nextTierConfig.name : 'max'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'orders' && (
            <div className="bg-white rounded-xl border border-wood-100 shadow-sm">
              <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
                <p className="text-xs text-wood-500">{customer.orders} pedidos | Total: ${customer.totalSpent.toLocaleString()} | Promedio: ${customer.avgTicket.toLocaleString()}</p>
                <button className="text-[11px] text-accent-gold hover:underline flex items-center gap-1"><Plus size={11} /> Crear pedido manual</button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-5 py-2.5"># Pedido</th>
                    <th className="px-5 py-2.5">Fecha</th>
                    <th className="px-5 py-2.5">Productos</th>
                    <th className="px-5 py-2.5">Total</th>
                    <th className="px-5 py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {mockOrders.map(o => (
                    <tr key={o.id} className="hover:bg-sand-50/30 transition-colors">
                      <td className="px-5 py-3 text-xs text-accent-gold font-medium">{o.id}</td>
                      <td className="px-5 py-3 text-xs text-wood-500">{o.date}</td>
                      <td className="px-5 py-3 text-xs text-wood-700">{o.products}</td>
                      <td className="px-5 py-3 text-xs text-wood-900">${o.total.toLocaleString()}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{o.status === 'delivered' ? 'Entregado' : 'En camino'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {profileTab === 'points' && (
            <div className="space-y-4">
              {/* Current status */}
              <div className="bg-white rounded-xl border border-wood-100 p-5">
                <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-4">Estado actual</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Tier', val: <TierBadge tier={customer.tier} /> },
                    { label: 'Puntos disponibles', val: <span className="text-sm text-wood-900">{customer.points.toLocaleString()}</span> },
                    { label: 'Valor MXN', val: <span className="text-sm text-accent-gold">${(customer.points * 0.01).toFixed(2)}</span> },
                    { label: 'Ganados lifetime', val: <span className="text-sm text-wood-900">{(customer.points + 1700).toLocaleString()}</span> },
                    { label: 'Canjeados lifetime', val: <span className="text-sm text-wood-900">1,700</span> },
                    { label: 'Multiplicador', val: <span className="text-sm text-accent-gold">{customer.tier === 'silver' ? '1.2x' : customer.tier === 'gold' || customer.tier === 'platinum' ? '1.5x' : '1.0x'}</span> },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-wood-400 mb-1">{s.label}</p>
                      {s.val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-3">
                  <h4 className="text-xs text-wood-400 uppercase tracking-wider">Ajustar puntos</h4>
                  <div className="flex gap-2">
                    <select className="px-2 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                      <option>Agregar</option>
                      <option>Quitar</option>
                    </select>
                    <input type="number" placeholder="Cantidad" className="flex-1 px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none" />
                  </div>
                  <select className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="">Motivo...</option>
                    <option>Cortesia</option>
                    <option>Correccion</option>
                    <option>Bonificacion</option>
                    <option>Promocion</option>
                  </select>
                  <textarea placeholder="Nota (opcional)" rows={2} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none resize-none" />
                  <label className="flex items-center gap-1.5 text-[10px] text-wood-500"><input type="checkbox" className="accent-accent-gold rounded" /> Notificar al cliente</label>
                  <button className="w-full px-3 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800">Aplicar ajuste</button>
                </div>
                <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-3">
                  <h4 className="text-xs text-wood-400 uppercase tracking-wider">Cambiar tier manualmente</h4>
                  <select className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    {DEFAULT_LOYALTY_CONFIG.tiers.map(t => <option key={t.id} value={t.id}>{getTierSymbol(t.id)} {t.name}</option>)}
                  </select>
                  <input placeholder="Motivo del cambio" className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none" />
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-wood-700"><input type="radio" name="tierDur" defaultChecked className="accent-accent-gold" /> Permanente</label>
                    <label className="flex items-center gap-1.5 text-xs text-wood-700"><input type="radio" name="tierDur" className="accent-accent-gold" /> Temporal</label>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-wood-500"><input type="checkbox" className="accent-accent-gold rounded" /> Notificar al cliente</label>
                  <button className="w-full px-3 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800">Cambiar tier</button>
                </div>
              </div>

              {/* Points history */}
              <div className="bg-white rounded-xl border border-wood-100 shadow-sm">
                <div className="px-5 py-3 border-b border-wood-100"><h4 className="text-xs text-wood-400 uppercase tracking-wider">Historial de puntos</h4></div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                      <th className="px-5 py-2.5">Fecha</th><th className="px-5 py-2.5">Concepto</th><th className="px-5 py-2.5">Puntos</th><th className="px-5 py-2.5">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-50">
                    {mockPointsHistory.map((p, i) => (
                      <tr key={i} className="hover:bg-sand-50/30">
                        <td className="px-5 py-2.5 text-xs text-wood-500">{p.date}</td>
                        <td className="px-5 py-2.5 text-xs text-wood-700">{p.concept}</td>
                        <td className={`px-5 py-2.5 text-xs font-medium ${p.points > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.points > 0 ? '+' : ''}{p.points.toLocaleString()}</td>
                        <td className="px-5 py-2.5 text-xs text-wood-900">{p.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {profileTab === 'addresses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Casa (Predeterminada)', name: 'David Perez', address: 'Blvd. Morelos #234, Col. Centro, Hermosillo, Sonora 83000', phone: '662-361-0742', uses: 10, zone: 'Local Hermosillo' },
                { label: 'Oficina', name: 'David Perez - RockSage Capital', address: 'Torre Kyo, Piso 8, Blvd. Rodriguez, Hermosillo, Sonora 83100', phone: '662-361-0742', uses: 4, zone: 'Local Hermosillo' },
              ].map((a, i) => (
                <div key={i} className="bg-white rounded-xl border border-wood-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-wood-900 font-medium">{a.label}</p>
                    <button className="text-[10px] text-accent-gold hover:underline">Editar</button>
                  </div>
                  <p className="text-xs text-wood-700 mb-1">{a.name}</p>
                  <p className="text-xs text-wood-500 mb-1">{a.address}</p>
                  <p className="text-xs text-wood-500 mb-2 flex items-center gap-1"><Phone size={10} /> {a.phone}</p>
                  <div className="flex items-center gap-3 text-[10px] text-wood-400">
                    <span>Usada {a.uses} veces</span>
                    <span className="px-1.5 py-0.5 bg-sand-100 rounded">{a.zone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {profileTab === 'activity' && (
            <div className="bg-white rounded-xl border border-wood-100 p-5">
              <h4 className="text-xs text-wood-400 uppercase tracking-wider mb-4">Timeline de actividad</h4>
              <div className="space-y-0">
                {mockActivity.map((a, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        a.type === 'order' ? 'bg-blue-50 text-blue-600' :
                        a.type === 'points' ? 'bg-accent-gold/10 text-accent-gold' :
                        a.type === 'tier' ? 'bg-purple-50 text-purple-600' :
                        'bg-wood-100 text-wood-500'
                      }`}>
                        <a.icon size={12} />
                      </div>
                      {i < mockActivity.length - 1 && <div className="w-px flex-1 bg-wood-100 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs text-wood-700">{a.text}</p>
                      <p className="text-[10px] text-wood-400">{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileTab === 'notes' && (
            <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-wood-400 uppercase tracking-wider">Notas internas</h4>
                <p className="text-[10px] text-wood-400">El cliente NO ve estas notas</p>
              </div>
              <div className="flex gap-2">
                <textarea placeholder="Agregar nota..." className="flex-1 px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none resize-none" rows={2} />
                <button className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 self-end">Guardar</button>
              </div>
              <div className="space-y-3">
                {[
                  { author: 'Admin', date: '28 Feb 2026, 14:30', text: 'Cliente solicito factura para su empresa. Datos enviados por email.', pinned: true },
                  { author: 'Admin', date: '15 Feb 2026, 10:00', text: 'Interesado en set corporativo para 20 empleados. Dar seguimiento la proxima semana.', pinned: false },
                ].map((n, i) => (
                  <div key={i} className={`p-3 rounded-xl ${n.pinned ? 'bg-accent-gold/5 border border-accent-gold/20' : 'bg-sand-50'}`}>
                    {n.pinned && <p className="text-[9px] text-accent-gold uppercase tracking-wider mb-1">📌 Fijada</p>}
                    <p className="text-xs text-wood-700">{n.text}</p>
                    <p className="text-[10px] text-wood-400 mt-1">{n.author} — {n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileTab === 'comms' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-wood-400 uppercase tracking-wider">Enviar nuevo mensaje</h4>
                  <div className="text-[10px] text-wood-400">Tasa apertura: <span className="text-green-600">72%</span> | Clics: <span className="text-accent-gold">45%</span></div>
                </div>
                <select className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                  <option value="">Seleccionar plantilla...</option>
                  <option>Tenemos novedades para ti</option>
                  <option>Tus puntos estan por vencer</option>
                  <option>Estas cerca de subir a {nextTierConfig ? nextTierConfig.name : getTierLabel(customer.tier)}!</option>
                  <option>Oferta exclusiva para miembros {getTierLabel(customer.tier)}</option>
                  <option>Necesitamos tu opinion</option>
                  <option>Te extranamos</option>
                  <option>Mensaje personalizado</option>
                </select>
                <textarea placeholder="Contenido del mensaje... Variables: {nombre}, {tier}, {puntos}, {producto_favorito}" rows={3} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none resize-none" />
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 flex items-center gap-1"><Send size={12} /> Enviar ahora</button>
                  <button className="px-3 py-2 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50 flex items-center gap-1"><Clock size={12} /> Programar</button>
                  <button className="px-3 py-2 text-xs text-wood-600 bg-white border border-wood-200 rounded-lg hover:bg-sand-50 flex items-center gap-1"><Eye size={12} /> Preview</button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-wood-100 shadow-sm">
                <div className="px-5 py-3 border-b border-wood-100"><h4 className="text-xs text-wood-400 uppercase tracking-wider">Historial de emails</h4></div>
                <div className="divide-y divide-wood-50">
                  {[
                    { subject: 'Tu pedido #DSD-0014 ha sido entregado', date: '28 Feb 2026', status: 'opened', clicks: 2 },
                    { subject: 'Felicidades! Subiste a Oro', date: '25 Feb 2026', status: 'opened', clicks: 1 },
                    { subject: 'Confirmacion de pedido #DSD-0013', date: '22 Feb 2026', status: 'opened', clicks: 0 },
                    { subject: 'Nuevas colecciones disponibles', date: '15 Feb 2026', status: 'not_opened', clicks: 0 },
                  ].map((e, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-sand-50/30">
                      <div>
                        <p className="text-xs text-wood-700">{e.subject}</p>
                        <p className="text-[10px] text-wood-400">{e.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'opened' ? 'bg-green-50 text-green-600' : 'bg-wood-100 text-wood-400'}`}>
                          {e.status === 'opened' ? `Abierto${e.clicks > 0 ? ` (${e.clicks} clics)` : ''}` : 'No abierto'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ================================================================
   TAB 2: MEMBERSHIP
   ================================================================ */
const MembershipTab: React.FC<{ customers: CustomerFull[] }> = ({ customers }) => {
  const tiers: { key: Tier; clients: number; pct: string; avgSpend: number; totalPoints: number; repurchase: string; revenue: number; revPct: string }[] = [
    { key: 'bronze', clients: 180, pct: '72.6%', avgSpend: 820, totalPoints: 48200, repurchase: '15%', revenue: 147600, revPct: '26%' },
    { key: 'silver', clients: 45, pct: '18.1%', avgSpend: 5400, totalPoints: 156200, repurchase: '48%', revenue: 243000, revPct: '43%' },
    { key: 'gold', clients: 12, pct: '4.8%', avgSpend: 14200, totalPoints: 128400, repurchase: '82%', revenue: 170400, revPct: '30%' },
    { key: 'platinum', clients: 3, pct: '1.2%', avgSpend: 32100, totalPoints: 89800, repurchase: '100%', revenue: 96300, revPct: '17%' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(t => {
          const ts = getTierStyles(t.key);
          return (
            <div key={t.key} className="bg-white rounded-xl border shadow-sm overflow-hidden" style={ts.border}>
              <div className="h-1.5" style={ts.card} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <TierBadge tier={t.key} size="md" />
                  <span className="text-[10px] text-wood-400">{t.pct} del total</span>
                </div>
                <p className="text-2xl text-wood-900 mb-1">{t.clients}</p>
                <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-4">Clientes</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-wood-400">Gasto promedio</span><span className="text-wood-900">${t.avgSpend.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-wood-400">Tasa recompra</span><span className="text-wood-900">{t.repurchase}</span></div>
                  <div className="flex justify-between"><span className="text-wood-400">Ingresos</span><span className="text-wood-900">${t.revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-wood-400">% del ingreso total</span><span style={ts.text}>{t.revPct}</span></div>
                  <div className="flex justify-between"><span className="text-wood-400">Puntos totales</span><span className="text-wood-900">{t.totalPoints.toLocaleString()}</span></div>
                </div>
                <button className="mt-4 w-full text-center text-[11px] text-accent-gold hover:underline">Ver lista →</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-3">
        <h4 className="text-xs text-wood-400 uppercase tracking-wider flex items-center gap-1"><Zap size={12} className="text-accent-gold" /> Insights accionables</h4>
        {[
          { text: 'El 6% de tus clientes (Oro+Platino) genera el 47% de tus ingresos', type: 'info' },
          { text: '8 clientes Plata estan a menos de $1,000 de subir a Oro', type: 'action', btn: 'Enviar incentivo a Plata cerca de Oro' },
          { text: 'La tasa de recompra sube de 15% (Bronce) a 100% (Platino)', type: 'info' },
          { text: '45 clientes Bronce no han comprado en +90 dias (riesgo de perdida)', type: 'action', btn: 'Enviar campana a Bronce inactivos' },
        ].map((ins, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-sand-50 rounded-xl">
            <Zap size={14} className={ins.type === 'action' ? 'text-accent-gold mt-0.5' : 'text-wood-400 mt-0.5'} />
            <div className="flex-1">
              <p className="text-xs text-wood-700">{ins.text}</p>
              {ins.btn && (
                <button className="mt-1.5 text-[11px] text-accent-gold hover:underline flex items-center gap-1">
                  <Send size={10} /> {ins.btn}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================
   TAB 3: SEGMENTS
   ================================================================ */
const SegmentsTab: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const segments = [
    { name: 'Clientes VIP', type: 'Auto', clients: 15, metric: 'Ingresos $266,700', rule: 'Tier = Oro o Platino', color: 'bg-accent-gold/10 text-accent-gold' },
    { name: 'En riesgo de abandono', type: 'Auto', clients: 45, metric: 'Ultima compra >90d', rule: 'Ultima compra > 90 dias Y Pedidos > 0', color: 'bg-red-50 text-red-500' },
    { name: 'Grabado laser frecuente', type: 'Auto', clients: 32, metric: 'Ticket prom $1,420', rule: '>50% compras con grabado', color: 'bg-purple-50 text-purple-600' },
    { name: 'Nuevos ultimo mes', type: 'Auto', clients: 18, metric: 'Registros recientes', rule: 'Registro ultimos 30 dias', color: 'bg-blue-50 text-blue-600' },
    { name: 'Compradores corporativos', type: 'Manual', clients: 5, metric: 'Ticket $4,200', rule: 'Seleccion manual', color: 'bg-green-50 text-green-600' },
    { name: 'Hermosillo entrega local', type: 'Auto', clients: 42, metric: 'Envio prom $99', rule: 'CP 83000-83999', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-wood-500">{segments.length} segmentos definidos</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1 px-3 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800">
          <Plus size={13} /> Crear segmento
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-wood-100 p-5 space-y-4">
          <h4 className="text-xs text-wood-400 uppercase tracking-wider">Nuevo segmento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nombre del segmento" className="px-3 py-2.5 border border-wood-200 rounded-lg text-sm text-wood-900 outline-none" />
            <select className="px-3 py-2.5 border border-wood-200 rounded-lg text-sm text-wood-700 bg-white outline-none">
              <option>Automatico (con reglas)</option>
              <option>Manual (seleccionar clientes)</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-wood-400 uppercase tracking-wider">Reglas</p>
            <div className="flex items-center gap-2">
              <select className="px-2 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                <option>Tier</option><option>Gasto total</option><option>Pedidos</option><option>Ultima compra</option><option>Ubicacion</option><option>Tag</option><option>Puntos</option><option>Usa grabado</option>
              </select>
              <select className="px-2 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                <option>es igual a</option><option>no es igual a</option><option>mayor que</option><option>menor que</option>
              </select>
              <input placeholder="Valor" className="flex-1 px-2 py-2 text-xs border border-wood-200 rounded-lg text-wood-900 outline-none" />
              <button className="p-1 text-wood-400 hover:text-red-500"><X size={14} /></button>
            </div>
            <button className="text-[11px] text-accent-gold hover:underline flex items-center gap-1"><Plus size={11} /> Agregar regla</button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-sand-50 rounded-xl">
            <Users size={14} className="text-accent-gold" />
            <span className="text-xs text-wood-700">15 clientes coinciden con estas reglas</span>
            <button className="text-[11px] text-accent-gold hover:underline ml-auto">Ver lista preview</button>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-xs text-wood-500">Cancelar</button>
            <button className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800">Crear segmento</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-wood-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm text-wood-900">{s.name}</h5>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${s.color}`}>{s.type}</span>
            </div>
            <p className="text-2xl text-wood-900 mb-0.5">{s.clients}</p>
            <p className="text-[10px] text-wood-500 mb-2">{s.metric}</p>
            <p className="text-[10px] text-wood-400 mb-3 truncate">{s.rule}</p>
            <div className="flex gap-2">
              <button className="text-[11px] text-accent-gold hover:underline">Ver lista</button>
              <span className="text-wood-200">|</span>
              <button className="text-[11px] text-wood-500 hover:text-wood-700">Email</button>
              <span className="text-wood-200">|</span>
              <button className="text-[11px] text-wood-500 hover:text-wood-700">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
