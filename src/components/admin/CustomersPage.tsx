"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';
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
import { logger } from '@/src/lib/logger';

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
    engravedPct: 0, // Calculated server-side from order metadata in /api/admin/customers
    repurchaseProb: c.order_count > 3 ? 80 : c.order_count > 1 ? 50 : c.order_count === 1 ? 25 : 5,
  };
}


/* ================================================================
   HELPERS
   ================================================================ */
const TierBadge: React.FC<{ tier: Tier; size?: 'sm' | 'md' }> = ({ tier, size = 'sm' }) => {
  const s = getTierStyles(tier);
  const iconSize = size === 'sm' ? 12 : 16;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-none text-white ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}
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
  const { theme } = useAdminTheme(); const t = theme.tokens;
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
          <Users size={18} className="text-[var(--accent)]" />
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "var(--font-heading)" }}>Clientes y Membresías</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-[var(--accent-text)] rounded-none text-xs hover:bg-[var(--accent-hover)] transition-colors">
            <UserPlus size={14} /> Agregar cliente
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] rounded-none text-xs hover:bg-[var(--surface2)] transition-colors">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-6 border-b border-[var(--border)] overflow-x-auto">
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
              tab === t.key ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: Users, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', val: kpis.total, label: 'Total clientes', sub: '+12% vs prev' },
          { icon: UserPlus, color: 'bg-[var(--info-subtle)] text-[var(--info)]', val: kpis.newThisMonth, label: 'Nuevos este mes', sub: '+5 vs prev' },
          { icon: TrendingUp, color: 'bg-[var(--success-subtle)] text-[var(--success)]', val: `$${kpis.avgLtv.toLocaleString()}`, label: 'Valor prom. cliente', sub: '+8% vs prev' },
          { icon: ShoppingBag, color: 'bg-[var(--accent-subtle)] text-[var(--accent)]', val: `${kpis.repurchase}%`, label: 'Tasa de recompra', sub: '+3% vs prev' },
          { icon: Crown, color: 'bg-amber-50 text-amber-700', val: kpis.vips, label: 'Clientes VIP', sub: `${kpis.vipPct}% del total` },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-none ${k.color}`}><k.icon size={14} /></div>
              <span className="text-lg text-[var(--text)]">{k.val}</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">{k.label}</p>
            <p className="text-[10px] text-[var(--success)]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* TAB 1: ALL CUSTOMERS */}
      {tab === 'all' && (
        <div className="space-y-3">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-[var(--surface)] border-2 border-[var(--border)] rounded-none overflow-hidden">
              <Search size={16} className="ml-3 text-[var(--text-muted)]" />
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar por nombre, email o telefono..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div className="flex gap-2 items-center">
              <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="px-3 py-2.5 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                <option value="all">Todos los tiers</option>
                <option value="bronze">Bronce</option>
                <option value="silver">Plata</option>
                <option value="gold">Oro</option>
                <option value="platinum">Platino</option>
              </select>
              <select value={filterActivity} onChange={e => setFilterActivity(e.target.value)} className="px-3 py-2.5 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                <option value="all">Toda actividad</option>
                <option value="recent">Ultimos 30d</option>
                <option value="inactive">Inactivos +90d</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-none border transition-colors ${showFilters ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'}`}>
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-none px-4 py-2.5">
              <span className="text-xs text-[var(--accent)]">{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</span>
              <div className="w-px h-4 bg-[var(--accent)]/20" />
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1"><Mail size={11} /> Email</button>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1"><Star size={11} /> Ajustar puntos</button>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1"><Crown size={11} /> Cambiar tier</button>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1"><Tag size={11} /> Agregar tag</button>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1"><Download size={11} /> Exportar</button>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-secondary)]"><X size={14} /></button>
            </div>
          )}

          {/* Customer Table */}
          <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--surface2)]/50">
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
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map(c => {
                    const inactiveRisk = c.orders > 0 && daysSince(c.lastOrder) > 90;
                    return (
                      <tr key={c.id} className={`hover:bg-[var(--surface2)]/50 transition-colors ${isVip(c.tier) ? 'bg-[var(--accent)]/[0.02]' : ''}`}>
                        <td className="px-3 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-accent-gold rounded" /></td>
                        <td className="px-3 py-3">
                          <button onClick={() => setSelectedCustomer(c)} className="flex items-center gap-2.5 hover:text-[var(--accent)] transition-colors">
                            <div className="w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-medium flex-shrink-0 text-white" style={getTierStyles(c.tier).avatar}>
                              {c.avatar}
                            </div>
                            <span className="text-xs text-[var(--text)] truncate max-w-[140px]">{c.name}</span>
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)] hidden lg:table-cell truncate max-w-[180px]">{c.email}</td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)] hidden md:table-cell">{c.phone || '—'}</td>  
                        <td className="px-3 py-3"><TierBadge tier={c.tier} /></td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)] hidden lg:table-cell">{c.points.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-[var(--text)]">${c.totalSpent.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)] hidden md:table-cell">{c.orders}</td>
                        <td className={`px-3 py-3 text-xs hidden xl:table-cell ${inactiveRisk ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}>
                          {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          {inactiveRisk && <span className="ml-1">⚠</span>}
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === c.id ? null : c.id); }} className="p-1.5 hover:bg-[var(--surface2)] rounded-none text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                              <MoreVertical size={14} />
                            </button>
                            {contextMenu === c.id && (
                              <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none  py-1 z-30 min-w-[180px]" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setSelectedCustomer(c); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><Eye size={12} /> Ver perfil</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><Mail size={12} /> Enviar email</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><Star size={12} /> Ajustar puntos</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><Crown size={12} /> Cambiar tier</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><FileText size={12} /> Agregar nota</button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><ShoppingBag size={12} /> Ver pedidos</button>
                                <div className="border-t border-[var(--border)] my-1" />
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)]"><Plus size={12} /> Crear pedido manual</button>
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
              <div className="p-12 text-center text-[var(--text-muted)] text-sm">
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

  // ── Fetch detail data from API ──
  const [detailOrders, setDetailOrders] = useState<any[]>([]);
  const [detailTransactions, setDetailTransactions] = useState<any[]>([]);
  const [detailAddresses, setDetailAddresses] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setDetailLoading(true);
        const res = await fetch(`/api/admin/customers?id=${customer.id}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setDetailOrders(data.orders || []);
        setDetailTransactions(data.transactions || []);
        setDetailAddresses(data.customer?.addresses || []);
      } catch (err) {
        console.error('[CustomerProfile] fetch error:', err);
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetail();
  }, [customer.id]);

  // ── Form state: Points adjustment ──
  const [pointsAction, setPointsAction] = useState<'add' | 'remove'>('add');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [pointsNote, setPointsNote] = useState('');
  const [pointsSaving, setPointsSaving] = useState(false);

  // ── Form state: Tier change ──
  const [newTier, setNewTier] = useState<string>(customer.tier);
  const [tierReason, setTierReason] = useState('');
  const [tierSaving, setTierSaving] = useState(false);

  // ── Form state: Notes ──
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Fetch notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        setNotesLoading(true);
        const res = await fetch(`/api/admin/customers/notes?email=${encodeURIComponent(customer.email)}`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch { /* notes table may not exist yet */ }
      finally { setNotesLoading(false); }
    }
    fetchNotes();
  }, [customer.email]);

  // Refetch detail helper
  const refetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/customers?id=${customer.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setDetailOrders(data.orders || []);
      setDetailTransactions(data.transactions || []);
    } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }
  };

  // Handle points adjustment
  const handleAdjustPoints = async () => {
    const amount = parseInt(pointsAmount);
    if (!amount || amount <= 0) { toast.error('Ingresa una cantidad v\u00e1lida'); return; }
    setPointsSaving(true);
    try {
      const pts = pointsAction === 'add' ? amount : -amount;
      const reason = [pointsReason, pointsNote].filter(Boolean).join(' — ');
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customer.email, action: 'adjust_points', points: pts, reason }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast.success(`${pointsAction === 'add' ? '+' : '-'}${amount} puntos aplicados. Nuevo balance: ${data.new_balance}`);
      setPointsAmount(''); setPointsReason(''); setPointsNote('');
      refetchDetail();
    } catch { toast.error('Error al ajustar puntos'); }
    finally { setPointsSaving(false); }
  };

  // Handle tier change
  const handleChangeTier = async () => {
    if (newTier === customer.tier && !tierReason) { toast.error('Selecciona un tier diferente'); return; }
    setTierSaving(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customer.email, action: 'change_tier', new_tier: newTier, reason: tierReason }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Tier cambiado a ${getTierLabel(newTier)}`);
      setTierReason('');
      refetchDetail();
    } catch { toast.error('Error al cambiar tier'); }
    finally { setTierSaving(false); }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setNotesSaving(true);
    try {
      const res = await fetch('/api/admin/customers/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customer.email, text: newNote.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
        toast.success('Nota guardada');
      } else { toast.error('Error al guardar nota'); }
    } catch { toast.error('Error al guardar nota'); }
    finally { setNotesSaving(false); }
  };

  // Build spend chart from real orders
  const spendChartData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
      months[key] = 0;
    }
    // Fill with order data
    for (const o of detailOrders) {
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
      if (key in months) months[key] += o.total || 0;
    }
    return Object.entries(months).map(([mes, gasto]) => ({ mes, gasto }));
  }, [detailOrders]);

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
        <button onClick={onBack} className="p-2 hover:bg-[var(--surface2)] rounded-none text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Clientes</p>
          <h3 className="font-serif text-[var(--text)]">Perfil de cliente</h3>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  p-6">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-none flex items-center justify-center text-xl font-medium text-white flex-shrink-0" style={ts.avatar}>
            {customer.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-lg text-[var(--text)]">{customer.name}</h4>
              <TierBadge tier={customer.tier} size="md" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] mt-1">
              <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
              {customer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>}
              {customer.location && <span className="flex items-center gap-1"><MapPin size={12} /> {customer.location}</span>}
              <span className="flex items-center gap-1"><Calendar size={12} /> Cliente desde: {new Date(customer.registered).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Tier progress */}
            <div className="mt-3 max-w-md">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                <span className="inline-flex items-center gap-1"><TierIcon tierId={customer.tier} size={12} /> {getTierLabel(customer.tier)} — {customer.points.toLocaleString()} puntos (${(customer.points * 0.01).toFixed(2)} MXN)</span>
                {nextTierConfig && <span className="inline-flex items-center gap-1"><TierIcon tierId={nextTierConfig.id} size={12} /> {nextTierConfig.name}</span>}
              </div>
              <div className="h-2 bg-[var(--surface2)] rounded-none overflow-hidden">
                <div className="h-full rounded-none transition-all" style={{ width: `${progressPct}%`, ...ts.card }} />
              </div>
              {nextTierConfig && <p className="text-[10px] text-[var(--text-muted)] mt-1">Le faltan ${remaining.toLocaleString()} para subir a {nextTierConfig.name}</p>}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {customer.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-[var(--surface2)] text-[var(--text-secondary)] rounded-none">{t}</span>)}
                <button className="text-[10px] px-2 py-0.5 border border-dashed border-[var(--border)] text-[var(--text-muted)] rounded-none hover:border-[var(--accent)] hover:text-[var(--accent)]">+ Tag</button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border-2 border-[var(--border)] rounded-none hover:bg-[var(--surface2)] flex items-center gap-1"><Mail size={12} /> Email</button>
            <button className="px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border-2 border-[var(--border)] rounded-none hover:bg-[var(--surface2)] flex items-center gap-1"><FileText size={12} /> Nota</button>
            <button className="px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border-2 border-[var(--border)] rounded-none hover:bg-[var(--surface2)] flex items-center gap-1"><Star size={12} /> Puntos</button>
          </div>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
          {[
            { val: `$${customer.totalSpent.toLocaleString()}`, label: 'Gasto total' },
            { val: customer.orders, label: 'Pedidos totales' },
            { val: `$${customer.avgTicket.toLocaleString()}`, label: 'Ticket promedio' },
            { val: customer.purchasesPerMonth.toFixed(1), label: 'Compras/mes' },
            { val: `${customer.engravedPct}%`, label: 'Con grabado' },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <p className="text-lg text-[var(--text)]">{k.val}</p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] overflow-x-auto">
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
              profileTab === t.key ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      
        <div key={profileTab}>
          {profileTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Spend chart */}
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
                <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Gasto por mes (ultimos 12 meses)</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendChartData}>
                      <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Gasto']} />
                      <Bar dataKey="gasto" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Favorites + Patterns */}
              <div className="space-y-4">
                <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
                  <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Productos favoritos</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Tabla Parota Charcuteria Med', buys: 5, total: 4250 },
                      { name: 'Tabla Cedro Rojo Grande', buys: 3, total: 3600 },
                      { name: 'Set 3 Tablas Artesanales', buys: 2, total: 5980 },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-muted)] w-4">{i + 1}.</span>
                        <div className="w-8 h-8 rounded-none bg-[var(--surface2)] flex items-center justify-center flex-shrink-0"><ShoppingBag size={12} className="text-[var(--text-muted)]" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--text)] truncate">{p.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{p.buys} compras (${p.total.toLocaleString()})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
                  <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Patrones de compra</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    {[
                      ['Dia preferido', 'Viernes'],
                      ['Hora preferida', '10:00 - 12:00'],
                      ['Pago favorito', 'Stripe (****4242)'],
                      ['Carrier preferido', 'DHL Express'],
                      ['Usa grabado', `Si (${customer.engravedPct}%)`],
                      ['Usa cupones', 'No'],
                    ].map(([k, v], i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-[var(--border)]">
                        <span className="text-[var(--text-muted)]">{k}</span>
                        <span className="text-[var(--text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 lg:col-span-2">
                <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1"><Zap size={12} /> Predicciones</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-lg text-[var(--success)]">{customer.repurchaseProb}%</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Prob. recompra (30d)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-[var(--text)]">{customer.repurchaseProb > 50 ? 'Bajo' : 'Medio'}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Riesgo de abandono</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-[var(--text)]">$8,500</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Valor est. prox. 12m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-[var(--accent)]">~4 meses</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Llegara a {nextTierConfig ? nextTierConfig.name : 'max'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'orders' && (
            <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] ">
              <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">{detailOrders.length} pedidos | Total: ${customer.totalSpent.toLocaleString()} | Promedio: ${customer.avgTicket.toLocaleString()}</p>
                <button className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1"><Plus size={11} /> Crear pedido manual</button>
              </div>
              {detailLoading ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-xs">Cargando pedidos...</div>
              ) : detailOrders.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-xs">Sin pedidos</div>
              ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--surface2)]/50">
                    <th className="px-5 py-2.5"># Pedido</th>
                    <th className="px-5 py-2.5">Fecha</th>
                    <th className="px-5 py-2.5">Productos</th>
                    <th className="px-5 py-2.5">Total</th>
                    <th className="px-5 py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {detailOrders.map((o: any) => {
                    const statusMap: Record<string, { label: string; cls: string }> = {
                      fulfilled: { label: 'Entregado', cls: 'bg-[var(--success-subtle)] text-[var(--success)]' },
                      not_fulfilled: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-600' },
                      partially_fulfilled: { label: 'Parcial', cls: 'bg-[var(--info-subtle)] text-[var(--info)]' },
                      shipped: { label: 'En camino', cls: 'bg-[var(--info-subtle)] text-[var(--info)]' },
                    };
                    const st = statusMap[o.fulfillment_status] || statusMap[o.status] || { label: o.status || 'N/A', cls: 'bg-[var(--surface2)] text-[var(--text-secondary)]' };
                    const itemsSummary = (o.items || []).map((i: any) => `${i.title}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ') || 'Productos';
                    return (
                    <tr key={o.id} className="hover:bg-[var(--surface2)]/30 transition-colors">
                      <td className="px-5 py-3 text-xs text-[var(--accent)] font-medium">DSD-{String(o.display_id).padStart(4, '0')}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{new Date(o.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text)] max-w-[250px] truncate">{itemsSummary}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text)]">${o.total.toLocaleString()}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-none ${st.cls}`}>{st.label}</span></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          )}

          {profileTab === 'points' && (
            <div className="space-y-4">
              {/* Current status */}
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
                <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">Estado actual</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Tier', val: <TierBadge tier={customer.tier} /> },
                    { label: 'Puntos disponibles', val: <span className="text-sm text-[var(--text)]">{customer.points.toLocaleString()}</span> },
                    { label: 'Valor MXN', val: <span className="text-sm text-[var(--accent)]">${(customer.points * 0.01).toFixed(2)}</span> },
                    { label: 'Ganados lifetime', val: <span className="text-sm text-[var(--text)]">{(customer.points + 1700).toLocaleString()}</span> },
                    { label: 'Canjeados lifetime', val: <span className="text-sm text-[var(--text)]">1,700</span> },
                    { label: 'Multiplicador', val: <span className="text-sm text-[var(--accent)]">{customer.tier === 'silver' ? '1.2x' : customer.tier === 'gold' || customer.tier === 'platinum' ? '1.5x' : '1.0x'}</span> },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-[var(--text-muted)] mb-1">{s.label}</p>
                      {s.val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-3">
                  <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Ajustar puntos</h4>
                  <div className="flex gap-2">
                    <select value={pointsAction} onChange={e => setPointsAction(e.target.value as 'add' | 'remove')} className="px-2 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                      <option value="add">Agregar</option>
                      <option value="remove">Quitar</option>
                    </select>
                    <input type="number" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} placeholder="Cantidad" min="1" className="flex-1 px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none" />
                  </div>
                  <select value={pointsReason} onChange={e => setPointsReason(e.target.value)} className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                    <option value="">Motivo...</option>
                    <option value="Cortesia">Cortes\u00eda</option>
                    <option value="Correccion">Correcci\u00f3n</option>
                    <option value="Bonificacion">Bonificaci\u00f3n</option>
                    <option value="Promocion">Promoci\u00f3n</option>
                  </select>
                  <textarea value={pointsNote} onChange={e => setPointsNote(e.target.value)} placeholder="Nota (opcional)" rows={2} className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none resize-none" />
                  <button onClick={handleAdjustPoints} disabled={pointsSaving || !pointsAmount} className="w-full px-3 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed">{pointsSaving ? 'Aplicando...' : 'Aplicar ajuste'}</button>
                </div>
                <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-3">
                  <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Cambiar tier manualmente</h4>
                  <select value={newTier} onChange={e => setNewTier(e.target.value)} className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                    {DEFAULT_LOYALTY_CONFIG.tiers.map(t => <option key={t.id} value={t.id}>{getTierSymbol(t.id)} {t.name}</option>)}
                  </select>
                  <input value={tierReason} onChange={e => setTierReason(e.target.value)} placeholder="Motivo del cambio" className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none" />
                  <button onClick={handleChangeTier} disabled={tierSaving} className="w-full px-3 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed">{tierSaving ? 'Cambiando...' : 'Cambiar tier'}</button>
                </div>
              </div>

              {/* Points history */}
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] ">
                <div className="px-5 py-3 border-b border-[var(--border)]"><h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Historial de puntos</h4></div>
                {detailLoading ? (
                  <div className="p-8 text-center text-[var(--text-muted)] text-xs">Cargando historial...</div>
                ) : detailTransactions.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)] text-xs">Sin transacciones de puntos</div>
                ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--surface2)]/50">
                      <th className="px-5 py-2.5">Fecha</th><th className="px-5 py-2.5">Concepto</th><th className="px-5 py-2.5">Tipo</th><th className="px-5 py-2.5">Puntos</th><th className="px-5 py-2.5">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {detailTransactions.map((tx: any, i: number) => (
                      <tr key={tx.id || i} className="hover:bg-[var(--surface2)]/30">
                        <td className="px-5 py-2.5 text-xs text-[var(--text-secondary)]">{new Date(tx.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-5 py-2.5 text-xs text-[var(--text)]">{tx.description || tx.order_id || 'Transacción'}</td>
                        <td className="px-5 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-none ${tx.type === 'earn' ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--error-subtle)] text-[var(--error)]'}`}>{tx.type === 'earn' ? 'Ganados' : 'Canjeados'}</span></td>
                        <td className={`px-5 py-2.5 text-xs font-medium ${tx.type === 'earn' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>{tx.type === 'earn' ? '+' : '-'}{tx.points.toLocaleString()}</td>
                        <td className="px-5 py-2.5 text-xs text-[var(--text)]">{(tx.balance_after ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          )}

          {profileTab === 'addresses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailLoading ? (
                <div className="col-span-2 p-8 text-center text-[var(--text-muted)] text-xs">Cargando direcciones...</div>
              ) : detailAddresses.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-[var(--text-muted)] text-xs">Sin direcciones registradas</div>
              ) : (
                detailAddresses.map((a: any, i: number) => {
                  const fullAddress = [a.address_1, a.address_2, a.city, a.province, a.postal_code].filter(Boolean).join(', ');
                  const fullName = [a.first_name, a.last_name].filter(Boolean).join(' ') || customer.name;
                  return (
                    <div key={a.id || i} className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[var(--text)] font-medium">{a.company || (i === 0 ? 'Principal' : `Dirección ${i + 1}`)}</p>
                        {i === 0 && <span className="text-[9px] px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-none">Predeterminada</span>}
                      </div>
                      <p className="text-xs text-[var(--text)] mb-1">{fullName}</p>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">{fullAddress}</p>
                      {a.phone && <p className="text-xs text-[var(--text-secondary)] mb-2 flex items-center gap-1"><Phone size={10} /> {a.phone}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                        <span>{a.country_code?.toUpperCase() || 'MX'}</span>
                        {a.postal_code && <span className="px-1.5 py-0.5 bg-[var(--surface2)] rounded">CP {a.postal_code}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {profileTab === 'activity' && (() => {
            // Build timeline from real orders + transactions
            const timeline: { type: string; date: string; text: string; icon: any }[] = [];
            for (const o of detailOrders) {
              timeline.push({ type: 'order', date: o.created_at, text: `Pedido DSD-${String(o.display_id).padStart(4, '0')} por ${o.total.toLocaleString()}`, icon: ShoppingBag });
            }
            for (const tx of detailTransactions) {
              const isEarn = tx.type === 'earn';
              timeline.push({
                type: 'points',
                date: tx.created_at,
                text: isEarn ? `Ganó ${tx.points.toLocaleString()} puntos — ${tx.description || ''}` : `Canjeó ${tx.points.toLocaleString()} puntos — ${tx.description || ''}`,
                icon: isEarn ? Star : Gift,
              });
            }
            timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return (
            <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5">
              <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">Timeline de actividad</h4>
              {detailLoading ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-xs">Cargando actividad...</div>
              ) : timeline.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-xs">Sin actividad registrada</div>
              ) : (
              <div className="space-y-0">
                {timeline.slice(0, 20).map((a, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-none flex items-center justify-center flex-shrink-0 ${
                        a.type === 'order' ? 'bg-[var(--info-subtle)] text-[var(--info)]' :
                        a.type === 'points' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
                        a.type === 'tier' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' :
                        'bg-[var(--surface2)] text-[var(--text-secondary)]'
                      }`}>
                        <a.icon size={12} />
                      </div>
                      {i < Math.min(timeline.length, 20) - 1 && <div className="w-px flex-1 bg-[var(--surface2)] mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs text-[var(--text)]">{a.text}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{new Date(a.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
            );
          })()}

          {profileTab === 'notes' && (
            <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Notas internas</h4>
                <p className="text-[10px] text-[var(--text-muted)]">El cliente NO ve estas notas</p>
              </div>
              <div className="flex gap-2">
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Agregar nota..." className="flex-1 px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none resize-none" rows={2} />
                <button onClick={handleAddNote} disabled={notesSaving || !newNote.trim()} className="px-4 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)] self-end disabled:opacity-50">{notesSaving ? 'Guardando...' : 'Guardar'}</button>
              </div>
              {notesLoading ? (
                <div className="p-4 text-center text-[var(--text-muted)] text-xs">Cargando notas...</div>
              ) : notes.length === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)] text-xs">Sin notas. Agrega la primera.</div>
              ) : (
              <div className="space-y-3">
                {notes.map((n: any, i: number) => (
                  <div key={n.id || i} className="p-3 rounded-none bg-[var(--surface2)]">
                    <p className="text-xs text-[var(--text)]">{n.text}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{n.author || 'Admin'} — {new Date(n.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {profileTab === 'comms' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Enviar nuevo mensaje</h4>
                  <div className="text-[10px] text-[var(--text-muted)]">Tasa apertura: <span className="text-[var(--success)]">72%</span> | Clics: <span className="text-[var(--accent)]">45%</span></div>
                </div>
                <select className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                  <option value="">Seleccionar plantilla...</option>
                  <option>Tenemos novedades para ti</option>
                  <option>Tus puntos estan por vencer</option>
                  <option>Estas cerca de subir a {nextTierConfig ? nextTierConfig.name : getTierLabel(customer.tier)}!</option>
                  <option>Oferta exclusiva para miembros {getTierLabel(customer.tier)}</option>
                  <option>Necesitamos tu opinion</option>
                  <option>Te extranamos</option>
                  <option>Mensaje personalizado</option>
                </select>
                <textarea placeholder="Contenido del mensaje... Variables: {nombre}, {tier}, {puntos}, {producto_favorito}" rows={3} className="w-full px-3 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none resize-none" />
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)] flex items-center gap-1"><Send size={12} /> Enviar ahora</button>
                  <button className="px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border-2 border-[var(--border)] rounded-none hover:bg-[var(--surface2)] flex items-center gap-1"><Clock size={12} /> Programar</button>
                  <button className="px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface)] border-2 border-[var(--border)] rounded-none hover:bg-[var(--surface2)] flex items-center gap-1"><Eye size={12} /> Preview</button>
                </div>
              </div>
              <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] ">
                <div className="px-5 py-3 border-b border-[var(--border)]"><h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Historial de emails</h4></div>
                <div className="divide-y divide-[var(--border)]">
                  {[
                    { subject: 'Tu pedido #DSD-0014 ha sido entregado', date: '28 Feb 2026', status: 'opened', clicks: 2 },
                    { subject: 'Felicidades! Subiste a Oro', date: '25 Feb 2026', status: 'opened', clicks: 1 },
                    { subject: 'Confirmacion de pedido #DSD-0013', date: '22 Feb 2026', status: 'opened', clicks: 0 },
                    { subject: 'Nuevas colecciones disponibles', date: '15 Feb 2026', status: 'not_opened', clicks: 0 },
                  ].map((e, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--surface2)]/30">
                      <div>
                        <p className="text-xs text-[var(--text)]">{e.subject}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{e.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-none ${e.status === 'opened' ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--surface2)] text-[var(--text-muted)]'}`}>
                          {e.status === 'opened' ? `Abierto${e.clicks > 0 ? ` (${e.clicks} clics)` : ''}` : 'No abierto'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      
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
            <div key={t.key} className="bg-[var(--surface)] rounded-none border  overflow-hidden" style={ts.border}>
              <div className="h-1.5" style={ts.card} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <TierBadge tier={t.key} size="md" />
                  <span className="text-[10px] text-[var(--text-muted)]">{t.pct} del total</span>
                </div>
                <p className="text-2xl text-[var(--text)] mb-1">{t.clients}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-4">Clientes</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Gasto promedio</span><span className="text-[var(--text)]">${t.avgSpend.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tasa recompra</span><span className="text-[var(--text)]">{t.repurchase}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Ingresos</span><span className="text-[var(--text)]">${t.revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">% del ingreso total</span><span style={ts.text}>{t.revPct}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Puntos totales</span><span className="text-[var(--text)]">{t.totalPoints.toLocaleString()}</span></div>
                </div>
                <button className="mt-4 w-full text-center text-[11px] text-[var(--accent)] hover:underline">Ver lista →</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-3">
        <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1"><Zap size={12} className="text-[var(--accent)]" /> Insights accionables</h4>
        {[
          { text: 'El 6% de tus clientes (Oro+Platino) genera el 47% de tus ingresos', type: 'info' },
          { text: '8 clientes Plata estan a menos de $1,000 de subir a Oro', type: 'action', btn: 'Enviar incentivo a Plata cerca de Oro' },
          { text: 'La tasa de recompra sube de 15% (Bronce) a 100% (Platino)', type: 'info' },
          { text: '45 clientes Bronce no han comprado en +90 dias (riesgo de perdida)', type: 'action', btn: 'Enviar campana a Bronce inactivos' },
        ].map((ins, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-[var(--surface2)] rounded-none">
            <Zap size={14} className={ins.type === 'action' ? 'text-[var(--accent)] mt-0.5' : 'text-[var(--text-muted)] mt-0.5'} />
            <div className="flex-1">
              <p className="text-xs text-[var(--text)]">{ins.text}</p>
              {ins.btn && (
                <button className="mt-1.5 text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1">
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
    { name: 'Clientes VIP', type: 'Auto', clients: 15, metric: 'Ingresos $266,700', rule: 'Tier = Oro o Platino', color: 'bg-[var(--accent)]/10 text-[var(--accent)]' },
    { name: 'En riesgo de abandono', type: 'Auto', clients: 45, metric: 'Ultima compra >90d', rule: 'Ultima compra > 90 dias Y Pedidos > 0', color: 'bg-[var(--error-subtle)] text-[var(--error)]' },
    { name: 'Grabado laser frecuente', type: 'Auto', clients: 32, metric: 'Ticket prom $1,420', rule: '>50% compras con grabado', color: 'bg-[var(--accent-subtle)] text-[var(--accent)]' },
    { name: 'Nuevos ultimo mes', type: 'Auto', clients: 18, metric: 'Registros recientes', rule: 'Registro ultimos 30 dias', color: 'bg-[var(--info-subtle)] text-[var(--info)]' },
    { name: 'Compradores corporativos', type: 'Manual', clients: 5, metric: 'Ticket $4,200', rule: 'Seleccion manual', color: 'bg-[var(--success-subtle)] text-[var(--success)]' },
    { name: 'Hermosillo entrega local', type: 'Auto', clients: 42, metric: 'Envio prom $99', rule: 'CP 83000-83999', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-secondary)]">{segments.length} segmentos definidos</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1 px-3 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)]">
          <Plus size={13} /> Crear segmento
        </button>
      </div>

      {showCreate && (
        <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 space-y-4">
          <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Nuevo segmento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nombre del segmento" className="px-3 py-2.5 border-2 border-[var(--border)] rounded-none text-sm text-[var(--text)] outline-none" />
            <select className="px-3 py-2.5 border-2 border-[var(--border)] rounded-none text-sm text-[var(--text)] bg-[var(--surface)] outline-none">
              <option>Automatico (con reglas)</option>
              <option>Manual (seleccionar clientes)</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Reglas</p>
            <div className="flex items-center gap-2">
              <select className="px-2 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                <option>Tier</option><option>Gasto total</option><option>Pedidos</option><option>Ultima compra</option><option>Ubicacion</option><option>Tag</option><option>Puntos</option><option>Usa grabado</option>
              </select>
              <select className="px-2 py-2 text-xs border-2 border-[var(--border)] rounded-none bg-[var(--surface)] text-[var(--text)] outline-none">
                <option>es igual a</option><option>no es igual a</option><option>mayor que</option><option>menor que</option>
              </select>
              <input placeholder="Valor" className="flex-1 px-2 py-2 text-xs border-2 border-[var(--border)] rounded-none text-[var(--text)] outline-none" />
              <button className="p-1 text-[var(--text-muted)] hover:text-[var(--error)]"><X size={14} /></button>
            </div>
            <button className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1"><Plus size={11} /> Agregar regla</button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--surface2)] rounded-none">
            <Users size={14} className="text-[var(--accent)]" />
            <span className="text-xs text-[var(--text)]">15 clientes coinciden con estas reglas</span>
            <button className="text-[11px] text-[var(--accent)] hover:underline ml-auto">Ver lista preview</button>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-xs text-[var(--text-secondary)]">Cancelar</button>
            <button className="px-4 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)]">Crear segmento</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((s, i) => (
          <div key={i} className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)] p-5 hover: transition-">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm text-[var(--text)]">{s.name}</h5>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-none ${s.color}`}>{s.type}</span>
            </div>
            <p className="text-2xl text-[var(--text)] mb-0.5">{s.clients}</p>
            <p className="text-[10px] text-[var(--text-secondary)] mb-2">{s.metric}</p>
            <p className="text-[10px] text-[var(--text-muted)] mb-3 truncate">{s.rule}</p>
            <div className="flex gap-2">
              <button className="text-[11px] text-[var(--accent)] hover:underline">Ver lista</button>
              <span className="text-[var(--text-muted)]">|</span>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text)]">Email</button>
              <span className="text-[var(--text-muted)]">|</span>
              <button className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text)]">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
