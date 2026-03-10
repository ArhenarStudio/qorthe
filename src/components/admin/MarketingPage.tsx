"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Tag, Mail, Image, Zap, Users, BarChart3,
  MoreHorizontal, Eye, Pause, Play, Copy, Trash2, Edit2,
  X, RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle,
  Link2, Gift, TrendingUp, Lightbulb, Download, ExternalLink,
  Megaphone, DollarSign, ShoppingCart, MousePointerClick
} from 'lucide-react';
import {
  type Coupon, type CouponStatus, type CouponType, type CouponTarget, marketingMonthlyTrend,
} from '@/data/adminMockData';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';
import { logger } from '@/src/lib/logger';

// Shared UI components for live tabs
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm ${className}`}>{children}</div>
);
const Badge: React.FC<{ text: string; variant?: string }> = ({ text, variant = 'gray' }) => {
  const colors: Record<string, string> = { green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', gray: 'bg-[var(--surface2)] text-[var(--text-secondary)]', red: 'bg-red-50 text-red-700' };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[variant] || colors.gray}`}>{text}</span>;
};

// ===== TYPES =====
type TabId = 'cupones' | 'campanas' | 'banners' | 'flash' | 'referidos' | 'analisis';

// ===== CONSTANTS =====
const COLORS = ['var(--accent)', 'var(--text-secondary)', 'var(--text-muted)', 'var(--border)', 'var(--text-secondary)'];

const tabItems: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'cupones', label: 'Cupones y Descuentos', icon: Tag },
  { id: 'campanas', label: 'Campañas de Email', icon: Mail },
  { id: 'banners', label: 'Banners del Sitio', icon: Image },
  { id: 'flash', label: 'Ventas Flash', icon: Zap },
  { id: 'referidos', label: 'Referidos', icon: Users },
  { id: 'analisis', label: 'Análisis', icon: BarChart3 },
];

const couponStatusConfig: Record<CouponStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: 'Activo',      cls: 'bg-green-50 text-green-600',   dot: 'bg-green-500' },
  auto:      { label: 'Auto',        cls: 'bg-blue-50 text-blue-600',     dot: 'bg-blue-500' },
  scheduled: { label: 'Programado',  cls: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  paused:    { label: 'Pausado',     cls: 'bg-amber-50 text-amber-600',   dot: 'bg-amber-500' },
  expired:   { label: 'Vencido',     cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
  disabled:  { label: 'Desactivado', cls: 'bg-red-50 text-red-500',       dot: 'bg-red-500' },
};

const couponTypeLabels: Record<CouponType, string> = {
  percentage: '% Descuento',
  fixed: '$ Fijo',
  free_shipping: 'Envío gratis',
  buyget: 'Buy X Get Y',
};

// ===== HELPERS =====
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtNum = (n: number) => new Intl.NumberFormat('es-MX').format(n);

function couponValueLabel(c: Coupon): string {
  if (c.type === 'percentage') return `${c.value}%`;
  if (c.type === 'fixed') return fmt(c.value);
  if (c.type === 'free_shipping') return '100%';
  if (c.type === 'buyget' && c.buygetConfig) return `${c.buygetConfig.buyQty}×${c.buygetConfig.getQty}`;
  return '-';
}

function couponVigencia(c: Coupon): string {
  if (!c.startDate && !c.endDate) return 'Permanente';
  if (c.endDate && !c.startDate) return `Hasta ${fmtDate(c.endDate)}`;
  if (c.startDate && c.endDate) return `${fmtDate(c.startDate)} — ${fmtDate(c.endDate)}`;
  return `Desde ${fmtDate(c.startDate!)}`;
}

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Terminada';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function getTimeUntil(startDate: string): string {
  const diff = new Date(startDate).getTime() - Date.now();
  if (diff <= 0) return 'Ya inició';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `${d}d ${h}h`;
}

// ===== KPI CARD =====
const KpiCard: React.FC<{ icon: React.ReactNode; value: string; label: string; sub: string; accent?: boolean }> = ({ icon, value, label, sub, accent }) => (
  <div className={`bg-[var(--surface)] rounded-xl border shadow-sm p-4 ${accent ? 'border-[var(--accent)]/30' : 'border-[var(--border)]'}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-[var(--accent)]/15' : 'bg-[var(--surface2)]'}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-sans text-[var(--text)]">{value}</p>
    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{label}</p>
    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{sub}</p>
  </div>
);

// ===== STATUS BADGE =====
const StatusBadge: React.FC<{ status: CouponStatus }> = ({ status }) => {
  const cfg = couponStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ===== COUPON FORM MODAL =====
const CouponFormModal: React.FC<{ coupon?: Coupon | null; onClose: () => void }> = ({ coupon, onClose }) => {
  const [code, setCode] = useState(coupon?.code || '');
  const [internalName, setInternalName] = useState(coupon?.internalName || '');
  const [discountType, setDiscountType] = useState<CouponType>(coupon?.type || 'percentage');
  const [value, setValue] = useState(coupon?.value?.toString() || '10');
  const [target, setTarget] = useState<CouponTarget>(coupon?.target || 'order');
  const [isAutomatic, setIsAutomatic] = useState(coupon?.isAutomatic || false);
  const [usesLimit, setUsesLimit] = useState(coupon?.usesLimit?.toString() || '');
  const [usesPerCustomer, setUsesPerCustomer] = useState(coupon?.usesPerCustomer?.toString() || '1');
  const [minPurchase, setMinPurchase] = useState(coupon?.minPurchase?.toString() || '');
  const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount?.toString() || '');
  const [vigencia, setVigencia] = useState<'permanent' | 'range'>(coupon?.endDate ? 'range' : 'permanent');

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-[60] flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-[var(--surface)] rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[var(--accent)]" />
            <h3 className="font-serif text-[var(--text)]">{coupon ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--surface2)] rounded-lg transition-colors"><X size={16} className="text-[var(--text-muted)]" /></button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Información Básica</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Código del cupón *</label>
                <div className="flex gap-2">
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} placeholder="BIENVENIDO10" className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" />
                  <button onClick={generateCode} className="px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-colors flex items-center gap-1"><RefreshCw size={12} /> Auto</button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Solo mayúsculas, números y guiones.</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Nombre interno</label>
                <input value={internalName} onChange={e => setInternalName(e.target.value)} placeholder="Descuento bienvenida nuevos clientes" className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">Tipo de aplicación</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[var(--text)]">
                    <input type="radio" checked={!isAutomatic} onChange={() => setIsAutomatic(false)} className="accent-[var(--accent)]" /> Manual (cliente ingresa código)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--text)]">
                    <input type="radio" checked={isAutomatic} onChange={() => setIsAutomatic(true)} className="accent-[var(--accent)]" /> Automático (sin código)
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Discount Type */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Tipo de Descuento</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(['percentage', 'fixed', 'free_shipping', 'buyget'] as CouponType[]).map(t => (
                <button key={t} onClick={() => setDiscountType(t)} className={`px-3 py-2 rounded-lg text-xs border transition-colors ${discountType === t ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-wood-300'}`}>
                  {couponTypeLabels[t]}
                </button>
              ))}
            </div>
            {(discountType === 'percentage' || discountType === 'fixed') && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--text-secondary)]">Valor:</label>
                <input value={value} onChange={e => setValue(e.target.value)} className="w-20 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                <span className="text-xs text-[var(--text-secondary)]">{discountType === 'percentage' ? '%' : 'MXN'}</span>
              </div>
            )}
            {discountType === 'percentage' && (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-xs text-[var(--text-secondary)]">Máximo descuento:</label>
                <input value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="Sin límite" className="w-28 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                <span className="text-xs text-[var(--text-secondary)]">MXN</span>
              </div>
            )}
          </section>

          {/* Target */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">¿Dónde se aplica?</h4>
            <div className="space-y-2">
              {([
                { v: 'order' as CouponTarget, l: 'Todo el pedido' },
                { v: 'products' as CouponTarget, l: 'Productos específicos' },
                { v: 'categories' as CouponTarget, l: 'Categorías específicas' },
                { v: 'collections' as CouponTarget, l: 'Colecciones específicas' },
                { v: 'shipping' as CouponTarget, l: 'Solo envío' },
              ]).map(t => (
                <label key={t.v} className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <input type="radio" checked={target === t.v} onChange={() => setTarget(t.v)} className="accent-[var(--accent)]" /> {t.l}
                </label>
              ))}
            </div>
          </section>

          {/* Conditions */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Condiciones</h4>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--text-secondary)]">Compra mínima:</label>
              <input value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder="Sin mínimo" className="w-28 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              <span className="text-xs text-[var(--text-secondary)]">MXN</span>
            </div>
          </section>

          {/* Usage Limits */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Límites de Uso</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Usos totales máximos</label>
                <input value={usesLimit} onChange={e => setUsesLimit(e.target.value)} placeholder="Sin límite" className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Usos por cliente</label>
                <input value={usesPerCustomer} onChange={e => setUsesPerCustomer(e.target.value)} placeholder="Sin límite" className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          </section>

          {/* Vigencia */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Vigencia</h4>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-xs text-[var(--text)]">
                <input type="radio" checked={vigencia === 'permanent'} onChange={() => setVigencia('permanent')} className="accent-[var(--accent)]" /> Permanente
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text)]">
                <input type="radio" checked={vigencia === 'range'} onChange={() => setVigencia('range')} className="accent-[var(--accent)]" /> Rango de fechas
              </label>
            </div>
            {vigencia === 'range' && (
              <div className="flex items-center gap-2">
                <input type="date" className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                <span className="text-xs text-[var(--text-muted)]">hasta</span>
                <input type="date" className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
            )}
          </section>

          {/* Preview */}
          <section>
            <h4 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Preview en checkout</h4>
            <div className="bg-[var(--surface2)] rounded-lg border border-[var(--border)] p-4 text-xs text-[var(--text)]">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} className="text-[var(--accent)]" />
                <span className="font-medium">Código aplicado: {code || 'CODIGO'}</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                Descuento: -{discountType === 'percentage' ? `${value || 0}%` : discountType === 'fixed' ? fmt(Number(value) || 0) : 'Envío gratis'}
              </p>
              <div className="border-t border-[var(--border)] mt-2 pt-2 space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>$850.00</span></div>
                <div className="flex justify-between text-green-600"><span>Descuento:</span><span>-{discountType === 'percentage' ? fmt(850 * (Number(value) || 0) / 100) : discountType === 'fixed' ? fmt(Number(value) || 0) : '$0'}</span></div>
                <div className="flex justify-between"><span>Envío:</span><span>{discountType === 'free_shipping' ? <span className="line-through text-[var(--text-muted)]">$285.00</span> : '$285.00'}</span></div>
                <div className="flex justify-between font-medium border-t border-[var(--border)] pt-1 mt-1"><span>Total:</span><span>{fmt(
                  discountType === 'percentage' ? 850 - (850 * (Number(value) || 0) / 100) + 285 :
                  discountType === 'fixed' ? 850 - (Number(value) || 0) + 285 :
                  discountType === 'free_shipping' ? 850 : 1135
                )}</span></div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[var(--border)] bg-[var(--surface2)]/50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">Cancelar</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">Guardar borrador</button>
            <button onClick={() => { toast.success(coupon ? 'Cupón actualizado' : 'Cupón creado'); onClose(); }} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors">
              {coupon ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ═══ LIVE TABS: Campaigns, Banners, Flash Sales, Referrals ═══

const CampaignsTabLive: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = () => { fetch('/api/admin/marketing/campaigns').then(r => r.ok ? r.json() : null).then(d => { if (d) setCampaigns(d.campaigns || []); }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e)).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);
  const handleCreate = async () => { const res = await fetch('/api/admin/marketing/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Nueva campaña', subject: '' }) }); if (res.ok) { toast.success('Campaña creada'); fetchData(); } };
  const handleDelete = async (id: string) => { const res = await fetch(`/api/admin/marketing/campaigns?id=${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Campaña eliminada'); fetchData(); } };
  const handleToggle = async (c: any, status: string) => { await fetch('/api/admin/marketing/campaigns', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, status }) }); toast.success('Estado actualizado'); fetchData(); };
  if (loading) return <Card className="p-8 text-center text-[var(--text-muted)]">Cargando campañas...</Card>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-[var(--text-secondary)]">{campaigns.length} campañas</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--accent)]/90 flex items-center gap-1"><Plus size={12} /> Nueva Campaña</button></div>
      {campaigns.length === 0 ? <Card className="p-12 text-center"><Mail className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--text-secondary)]">Sin campañas creadas</p></Card> : (
        <Card className="divide-y divide-[var(--border)]">{campaigns.map(c => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[var(--surface2)]/50 transition-colors">
            <div className="min-w-0 flex-1"><p className="text-sm font-medium text-[var(--text)]">{c.name}</p><p className="text-[10px] text-[var(--text-muted)]">{c.subject || 'Sin asunto'} · {c.segment} · {new Date(c.created_at).toLocaleDateString('es-MX')}</p></div>
            <div className="flex items-center gap-2 ml-4">
              <Badge text={c.status === 'sent' ? 'Enviada' : c.status === 'scheduled' ? 'Programada' : 'Borrador'} variant={c.status === 'sent' ? 'green' : c.status === 'scheduled' ? 'blue' : 'amber'} />
              {c.status === 'draft' && <button onClick={() => handleToggle(c, 'scheduled')} className="text-[10px] text-[var(--accent)] hover:underline">Programar</button>}
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>))}</Card>
      )}
    </div>
  );
};

const BannersTabLive: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = () => { fetch('/api/admin/marketing/banners').then(r => r.ok ? r.json() : null).then(d => { if (d) setBanners(d.banners || []); }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e)).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);
  const handleCreate = async () => { const res = await fetch('/api/admin/marketing/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Nuevo banner' }) }); if (res.ok) { toast.success('Banner creado'); fetchData(); } };
  const handleToggle = async (b: any) => { await fetch('/api/admin/marketing/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, is_active: !b.is_active }) }); toast.success(b.is_active ? 'Desactivado' : 'Activado'); fetchData(); };
  const handleDelete = async (id: string) => { const res = await fetch(`/api/admin/marketing/banners?id=${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Banner eliminado'); fetchData(); } };
  const LOCATIONS: Record<string, string> = { hero: 'Hero', announcement_bar: 'Barra de anuncio', category: 'Categoría', popup: 'Pop-up', footer: 'Footer' };
  if (loading) return <Card className="p-8 text-center text-[var(--text-muted)]">Cargando banners...</Card>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-[var(--text-secondary)]">{banners.length} banners</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--accent)]/90 flex items-center gap-1"><Plus size={12} /> Nuevo Banner</button></div>
      {banners.length === 0 ? <Card className="p-12 text-center"><Image className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--text-secondary)]">Sin banners creados</p></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{banners.map(b => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-sm font-medium text-[var(--text)]">{b.name}</p><p className="text-[10px] text-[var(--text-muted)]">{LOCATIONS[b.location] || b.location}</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(b)} className={"w-9 h-5 rounded-full transition-colors " + (b.is_active ? "bg-green-500" : "bg-wood-200")}><div className={"w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-transform " + (b.is_active ? "translate-x-4" : "translate-x-0.5")} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1 text-[var(--text-muted)] hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            {b.image_url ? <div className="aspect-[3/1] bg-[var(--surface2)] rounded-lg overflow-hidden mb-2"><img src={b.image_url} alt={b.alt_text} className="w-full h-full object-cover" /></div> : <div className="aspect-[3/1] bg-[var(--surface2)] rounded-lg flex items-center justify-center mb-2"><Image className="w-8 h-8 text-[var(--text-muted)]" /></div>}
            <Badge text={b.is_active ? 'Activo' : 'Inactivo'} variant={b.is_active ? 'green' : 'gray'} />
          </Card>))}</div>
      )}
    </div>
  );
};

const FlashSalesTabLive: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = () => { fetch('/api/admin/marketing/flash-sales').then(r => r.ok ? r.json() : null).then(d => { if (d) setSales(d.flashSales || []); }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e)).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);
  const handleCreate = async () => { const res = await fetch('/api/admin/marketing/flash-sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Nueva venta flash' }) }); if (res.ok) { toast.success('Venta flash creada'); fetchData(); } };
  const handleToggle = async (s: any) => { await fetch('/api/admin/marketing/flash-sales', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, is_active: !s.is_active }) }); toast.success(s.is_active ? 'Desactivada' : 'Activada'); fetchData(); };
  const handleDelete = async (id: string) => { const res = await fetch(`/api/admin/marketing/flash-sales?id=${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Venta eliminada'); fetchData(); } };
  const isActive = (s: any) => s.is_active && new Date(s.ends_at) > new Date();
  if (loading) return <Card className="p-8 text-center text-[var(--text-muted)]">Cargando ventas flash...</Card>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-[var(--text-secondary)]">{sales.length} ventas flash</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--accent)]/90 flex items-center gap-1"><Plus size={12} /> Nueva Venta Flash</button></div>
      {sales.length === 0 ? <Card className="p-12 text-center"><Zap className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--text-secondary)]">Sin ventas flash</p></Card> : (
        <Card className="divide-y divide-[var(--border)]">{sales.map(s => (
          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[var(--surface2)]/50 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text)]">{s.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{s.discount_value}{s.discount_type === 'percentage' ? '%' : ' MXN'} OFF · {new Date(s.starts_at).toLocaleDateString('es-MX')} → {new Date(s.ends_at).toLocaleDateString('es-MX')}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge text={isActive(s) ? 'Activa' : s.is_active ? 'Expirada' : 'Inactiva'} variant={isActive(s) ? 'green' : 'gray'} />
              <button onClick={() => handleToggle(s)} className={"w-9 h-5 rounded-full transition-colors " + (s.is_active ? "bg-green-500" : "bg-wood-200")}><div className={"w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-transform " + (s.is_active ? "translate-x-4" : "translate-x-0.5")} /></button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>))}</Card>
      )}
    </div>
  );
};

const ReferralsTabLive: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = () => { fetch('/api/admin/marketing/referrals').then(r => r.ok ? r.json() : null).then(d => { if (d) { setCodes(d.codes || []); setRedemptions(d.redemptions || []); } }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e)).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);
  const handleCreate = async () => { const res = await fetch('/api/admin/marketing/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); if (res.ok) { toast.success('Código de referido creado'); fetchData(); } };
  const handleToggle = async (c: any) => { await fetch('/api/admin/marketing/referrals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, is_active: !c.is_active }) }); toast.success(c.is_active ? 'Desactivado' : 'Activado'); fetchData(); };
  const handleDelete = async (id: string) => { const res = await fetch(`/api/admin/marketing/referrals?id=${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Código eliminado'); fetchData(); } };
  if (loading) return <Card className="p-8 text-center text-[var(--text-muted)]">Cargando referidos...</Card>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-[var(--text-secondary)]">{codes.length} códigos · {redemptions.length} canjes</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--accent)]/90 flex items-center gap-1"><Plus size={12} /> Nuevo Código</button></div>
      {codes.length === 0 ? <Card className="p-12 text-center"><Gift className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--text-secondary)]">Sin códigos de referido</p></Card> : (
        <Card className="divide-y divide-[var(--border)]">{codes.map(c => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[var(--surface2)]/50 transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><code className="text-sm font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">{c.code}</code><Badge text={c.is_active ? 'Activo' : 'Inactivo'} variant={c.is_active ? 'green' : 'gray'} /></div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{c.owner_name || c.owner_email || 'Sin asignar'} · {c.discount_value}% descuento · {c.reward_value}% recompensa · {c.uses} usos</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado'); }} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg"><Copy size={14} /></button>
              <button onClick={() => handleToggle(c)} className={"w-9 h-5 rounded-full transition-colors " + (c.is_active ? "bg-green-500" : "bg-wood-200")}><div className={"w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-transform " + (c.is_active ? "translate-x-4" : "translate-x-0.5")} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>))}</Card>
      )}
    </div>
  );
};



const CuponesTab: React.FC<{ search: string }> = ({ search }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | CouponStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CouponType>('all');
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // ── Live promotions from Medusa ──
  const [livePromotions, setLivePromotions] = useState<Coupon[] | null>(null);
  const [promoLoading, setPromoLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchPromotions = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setPromoLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/marketing?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLivePromotions(data.promotions || []);
        setIsLive(true);
      }
    } catch (err) {
      console.error('[CuponesTab] fetch error:', err);
      if (!silent) setIsLive(false);
    } finally {
      setPromoLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    fetchPromotions();
    const interval = setInterval(() => fetchPromotions(true), 60000);
    return () => clearInterval(interval);
  }, [fetchPromotions]);

  const filtered = useMemo(() => {
    let list = livePromotions || [];
    // Status and search already filtered server-side, but apply type filter client-side
    if (typeFilter !== 'all') list = list.filter(c => c.type === typeFilter);
    return list;
  }, [livePromotions, typeFilter]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]">
          <option value="all">Todos los estados</option>
          {Object.entries(couponStatusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]">
          <option value="all">Todos los tipos</option>
          {Object.entries(couponTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={() => setEditingCoupon(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs hover:bg-[var(--accent)]/90 transition-colors">
            <Plus size={14} /> Nuevo Cupón
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--surface2)]/80 border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Código</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Aplica a</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Usos</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Vigencia</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-[var(--text-secondary)] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[var(--text)]">{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado'); }} className="p-0.5 hover:bg-[var(--surface2)] rounded"><Copy size={10} className="text-[var(--text-muted)]" /></button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{c.internalName}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{couponTypeLabels[c.type]}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{couponValueLabel(c)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.targetLabel}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.usesCount}/{c.usesLimit ?? '∞'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{couponVigencia(c)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="p-1 hover:bg-[var(--surface2)] rounded-lg"><MoreHorizontal size={14} className="text-[var(--text-muted)]" /></button>
                    {menuOpen === c.id && (
                      <div className="absolute right-4 top-10 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-10 w-36">
                        <button onClick={() => { setEditingCoupon(c); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface2)] flex items-center gap-2"><Edit2 size={12} /> Editar</button>
                        <button onClick={() => { toast.success(c.status === 'active' ? 'Cupón pausado' : 'Cupón activado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface2)] flex items-center gap-2">
                          {c.status === 'active' ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Activar</>}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface2)] flex items-center gap-2"><Copy size={12} /> Copiar código</button>
                        <button onClick={() => { toast.success('Cupón eliminado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12} /> Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] flex flex-wrap gap-x-4 gap-y-1">
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1" /> Activo = en uso</span>
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" /> Auto = se aplica automáticamente</span>
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1" /> Prog. = programado</span>
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1" /> Venc. = vencido</span>
        </div>
      </div>

      <AnimatePresence>
        {editingCoupon !== undefined && <CouponFormModal coupon={editingCoupon} onClose={() => setEditingCoupon(undefined)} />}
      </AnimatePresence>
    </>
  );
};


const AnalisisTab: React.FC = () => {
  const channelData = [
    { canal: 'Cupones manuales', ingresos: 22400, costo: 3200, roi: 7.0, pedidos: 32, ticket: 700 },
    { canal: 'Ventas flash', ingresos: 18600, costo: 2800, roi: 6.6, pedidos: 24, ticket: 775 },
    { canal: 'Campañas email', ingresos: 14200, costo: 0, roi: Infinity, pedidos: 18, ticket: 789 },
    { canal: 'Referidos', ingresos: 8400, costo: 1600, roi: 5.3, pedidos: 12, ticket: 700 },
    { canal: 'Promo automáticas', ingresos: 4800, costo: 600, roi: 8.0, pedidos: 8, ticket: 600 },
  ];

  const topCoupons = [
    { code: 'BIENVENIDO10', usos: 42, ingresos: 28400, descOtorgado: 2840, roi: 10, ticket: 676 },
    { code: 'VIP15', usos: 12, ingresos: 18200, descOtorgado: 2730, roi: 6.7, ticket: 1517 },
    { code: 'ENVIOGRATIS', usos: 35, ingresos: 15800, descOtorgado: 5250, roi: 3.0, ticket: 451 },
    { code: 'PAROTA500', usos: 8, ingresos: 8400, descOtorgado: 4000, roi: 2.1, ticket: 1050 },
  ];

  const emailPerf = [
    { name: 'Lanzamiento Primavera', enviados: 248, apertura: 42, clics: 12, ventas: 8, ingresos: 8400 },
    { name: 'Puntos por vencer', enviados: 45, apertura: 68, clics: 28, ventas: 5, ingresos: 3200 },
    { name: 'Descuento VIP exclusivo', enviados: 15, apertura: 80, clics: 35, ventas: 4, ingresos: 6800 },
  ];

  const bannerPerf = [
    { name: 'Envío gratis +$2,500', impresiones: 15400, clics: 1248, ctr: 8.1, ventas: 42000 },
    { name: 'Grabado láser', impresiones: 14800, clics: 856, ctr: 5.8, ventas: 12400 },
    { name: 'Colección Primavera', impresiones: 8200, clics: 342, ctr: 4.2, ventas: 5600 },
    { name: 'Barra BIENVENIDO10', impresiones: 22000, clics: 320, ctr: 1.5, ventas: 2800 },
  ];

  const insights = [
    'El 78% de los ingresos son orgánicos. Marketing es un buen complemento, no una dependencia. Seguir invirtiendo en SEO y reviews.',
    'Los cupones VIP generan el ticket más alto ($1,517). Crear más exclusividad para tiers altos.',
    'Las ventas flash de productos específicos funcionan mejor que descuentos generales. Seguir con flash de categorías individuales.',
    'El programa de referidos tiene 67% conversión registro→compra. Incrementar la recompensa podría acelerar el crecimiento.',
  ];

  const channelPie = channelData.map(c => ({ name: c.canal, value: c.ingresos }));

  return (
    <div className="space-y-6">
      {/* Executive Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={<DollarSign size={16} className="text-[var(--accent)]" />} value="$68,400" label="Ingresos atribuidos a marketing" sub="18% del total" accent />
        <KpiCard icon={<Tag size={16} className="text-[var(--text-muted)]" />} value="$8,200" label="Costo total de marketing" sub="descuentos" />
        <KpiCard icon={<TrendingUp size={16} className="text-[var(--text-muted)]" />} value="3.2x" label="ROI" sub="Por cada $1 genera $3.20" />
        <KpiCard icon={<ShoppingCart size={16} className="text-[var(--text-muted)]" />} value="22%" label="% Ventas con descuento" sub="" />
      </div>

      {/* Rendimiento por canal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50">
            <h4 className="text-xs font-medium text-[var(--text)]">Rendimiento por canal</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2 text-[var(--text-secondary)] font-medium">Canal</th>
                  <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ingresos</th>
                  <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Costo</th>
                  <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">ROI</th>
                  <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Pedidos</th>
                  <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map(c => (
                  <tr key={c.canal} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/30">
                    <td className="px-4 py-2 font-medium text-[var(--text)]">{c.canal}</td>
                    <td className="px-4 py-2 text-right text-[var(--text)]">{fmt(c.ingresos)}</td>
                    <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.costo === 0 ? '$0*' : fmt(c.costo)}</td>
                    <td className="px-4 py-2 text-right font-medium text-[var(--accent)]">{c.roi === Infinity ? '∞' : `${c.roi}x`}</td>
                    <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.pedidos}</td>
                    <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{fmt(c.ticket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-[9px] text-[var(--text-muted)] border-t border-[var(--border)]">* Costo email = $0 (sin costo de plataforma) | ** Costo referidos = puntos valorados en MXN</div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-4">
          <h4 className="text-xs font-medium text-[var(--text)] mb-3">Por canal</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={channelPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {channelPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={(v: any) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {channelPie.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[var(--text-secondary)] truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Coupons */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50">
          <h4 className="text-xs font-medium text-[var(--text)]">Top cupones por rendimiento</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 text-[var(--text-secondary)] font-medium">Código</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Usos</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ingresos</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Desc. otorgado</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">ROI</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ticket prom</th>
              </tr>
            </thead>
            <tbody>
              {topCoupons.map(c => (
                <tr key={c.code} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/30">
                  <td className="px-4 py-2 font-mono font-medium text-[var(--text)]">{c.code}</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.usos}</td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--text)]">{fmt(c.ingresos)}</td>
                  <td className="px-4 py-2 text-right text-red-500">{fmt(c.descOtorgado)}</td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--accent)]">{c.roi}x</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{fmt(c.ticket)} {c.ticket > 1000 && '⭐'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] bg-[var(--accent)]/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
          VIP15 tiene el ticket promedio más alto ($1,517). Considerar hacer más promociones exclusivas para clientes VIP.
        </div>
      </div>

      {/* Email Performance */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50">
          <h4 className="text-xs font-medium text-[var(--text)]">Rendimiento de campañas email</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 text-[var(--text-secondary)] font-medium">Campaña</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Enviados</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Apertura</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Clics</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ventas</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {emailPerf.map(c => (
                <tr key={c.name} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/30">
                  <td className="px-4 py-2 font-medium text-[var(--text)]">{c.name}</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.enviados}</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.apertura}%</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.clics}%</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{c.ventas}</td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--text)]">{fmt(c.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] bg-[var(--accent)]/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
          Las campañas a segmentos pequeños (VIP, puntos) tienen mucho mejor apertura y conversión que las masivas. Segmentar más.
        </div>
      </div>

      {/* Banner Performance */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50">
          <h4 className="text-xs font-medium text-[var(--text)]">Rendimiento de banners</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 text-[var(--text-secondary)] font-medium">Banner</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Impresiones</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Clics</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">CTR</th>
                <th className="text-right px-4 py-2 text-[var(--text-secondary)] font-medium">Ventas atrib.</th>
              </tr>
            </thead>
            <tbody>
              {bannerPerf.map(b => (
                <tr key={b.name} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/30">
                  <td className="px-4 py-2 font-medium text-[var(--text)]">{b.name}</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{fmtNum(b.impresiones)}</td>
                  <td className="px-4 py-2 text-right text-[var(--text-secondary)]">{fmtNum(b.clics)}</td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--accent)]">{b.ctr}%</td>
                  <td className="px-4 py-2 text-right font-medium text-[var(--text)]">{fmt(b.ventas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] bg-[var(--accent)]/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
          El banner "Envío gratis" tiene el mejor CTR y ventas atribuidas. La barra superior tiene muchas impresiones pero bajo CTR — considerar rotar el mensaje.
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
        <h4 className="text-xs font-medium text-[var(--text)] mb-4">Tendencia mensual</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={marketingMonthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2da" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#8a7a6a' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <RTooltip formatter={(v: any) => fmt(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="marketing" stroke="var(--accent)" strokeWidth={2} name="Marketing" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="organic" stroke="var(--text-secondary)" strokeWidth={2} name="Orgánico" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-medium text-[var(--text)]">Insights automáticos</h4>
          <button className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline"><Download size={10} /> Exportar reporte (PDF)</button>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-[var(--accent)]/5 rounded-lg p-3">
              <Lightbulb size={14} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <p>{ins}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const MarketingPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('cupones');
  const { t } = useTheme();
  // primitivos via src/theme/primitives — leen de useTheme() directamente
  const [search, setSearch] = useState('');

  // ── Live promotion stats ──
  const [promoStats, setPromoStats] = useState<{ total: number; active: number; scheduled: number; expired: number }>({ total: 0, active: 0, scheduled: 0, expired: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/marketing?limit=200');
        if (res.ok) {
          const data = await res.json();
          setPromoStats(data.stats || { total: 0, active: 0, scheduled: 0, expired: 0 });
        }
      } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }
    }
    fetchStats();
  }, []);

  // KPIs (real for coupons, 0 for unimplemented features)
  const activeCoupons = promoStats.active;
  const expiringCoupons = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-[var(--accent)]" />
          <h2 className="font-serif text-lg text-[var(--text)]">Marketing</h2>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-xs hover:bg-[var(--accent)]/90 transition-colors self-start sm:self-auto">
          <Plus size={14} /> Nueva Campaña
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={<Tag size={16} className="text-[var(--accent)]" />} value={String(activeCoupons)} label="Cupones activos" sub={expiringCoupons > 0 ? `${expiringCoupons} por vencer` : 'Ninguno por vencer'} accent />
        <KpiCard icon={<DollarSign size={16} className="text-[var(--text-muted)]" />} value={`${promoStats.total}`} label="Cupones creados" sub={`${promoStats.expired} expirados`} />
        <KpiCard icon={<Mail size={16} className="text-[var(--text-muted)]" />} value="0" label="Campañas email" sub="Próximamente" />
        <KpiCard icon={<Zap size={16} className="text-[var(--text-muted)]" />} value="0" label="Ventas flash" sub="Próximamente" />
        <KpiCard icon={<TrendingUp size={16} className="text-[var(--accent)]" />} value={`${promoStats.active + promoStats.expired}`} label="Promociones totales" sub={`${promoStats.active} activas`} accent />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-0 overflow-x-auto -mb-px">
          {tabItems.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {tab !== 'analisis' && tab !== 'flash' && tab !== 'referidos' && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cupón, campaña o banner..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'cupones' && <CuponesTab search={search} />}
          {tab === 'campanas' && <CampaignsTabLive />}
          {tab === 'banners' && <BannersTabLive />}
          {tab === 'flash' && <FlashSalesTabLive />}
          {tab === 'referidos' && <ReferralsTabLive />}
          {tab === 'analisis' && <AnalisisTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
