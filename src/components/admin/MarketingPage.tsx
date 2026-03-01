"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Tag, Mail, Image, Zap, Users, BarChart3,
  MoreHorizontal, Eye, Pause, Play, Copy, Trash2, Edit2,
  X, RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle,
  Link2, Gift, TrendingUp, Lightbulb, Download, ExternalLink,
  Megaphone, DollarSign, ShoppingCart, MousePointerClick
} from 'lucide-react';
import {
  mockCoupons, mockEmailCampaigns, mockBanners, mockFlashSales,
  mockTopReferrers, mockReferrals, marketingMonthlyTrend,
  type Coupon, type CouponStatus, type CouponType, type CouponTarget,
  type EmailCampaign, type SiteBanner, type FlashSale, type Referral, type TopReferrer
} from '@/data/adminMockData';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

// ===== TYPES =====
type TabId = 'cupones' | 'campanas' | 'banners' | 'flash' | 'referidos' | 'analisis';

// ===== CONSTANTS =====
const COLORS = ['#C5A065', '#5D4037', '#A1887F', '#D7CCC8', '#8D6E63'];

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-wood-100">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-accent-gold" />
            <h3 className="font-serif text-wood-900">{coupon ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sand-50 rounded-lg transition-colors"><X size={16} className="text-wood-400" /></button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Información Básica</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Código del cupón *</label>
                <div className="flex gap-2">
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} placeholder="BIENVENIDO10" className="flex-1 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold transition-colors" />
                  <button onClick={generateCode} className="px-3 py-2 bg-sand-50 border border-wood-200 rounded-lg text-xs text-wood-600 hover:bg-sand-100 transition-colors flex items-center gap-1"><RefreshCw size={12} /> Auto</button>
                </div>
                <p className="text-[10px] text-wood-400 mt-1">Solo mayúsculas, números y guiones.</p>
              </div>
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Nombre interno</label>
                <input value={internalName} onChange={e => setInternalName(e.target.value)} placeholder="Descuento bienvenida nuevos clientes" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold transition-colors" />
              </div>
              <div>
                <label className="text-xs text-wood-600 mb-2 block">Tipo de aplicación</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-wood-700">
                    <input type="radio" checked={!isAutomatic} onChange={() => setIsAutomatic(false)} className="accent-[#C5A065]" /> Manual (cliente ingresa código)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-wood-700">
                    <input type="radio" checked={isAutomatic} onChange={() => setIsAutomatic(true)} className="accent-[#C5A065]" /> Automático (sin código)
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Discount Type */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Tipo de Descuento</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(['percentage', 'fixed', 'free_shipping', 'buyget'] as CouponType[]).map(t => (
                <button key={t} onClick={() => setDiscountType(t)} className={`px-3 py-2 rounded-lg text-xs border transition-colors ${discountType === t ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-wood-200 text-wood-600 hover:border-wood-300'}`}>
                  {couponTypeLabels[t]}
                </button>
              ))}
            </div>
            {(discountType === 'percentage' || discountType === 'fixed') && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-wood-600">Valor:</label>
                <input value={value} onChange={e => setValue(e.target.value)} className="w-20 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
                <span className="text-xs text-wood-500">{discountType === 'percentage' ? '%' : 'MXN'}</span>
              </div>
            )}
            {discountType === 'percentage' && (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-xs text-wood-600">Máximo descuento:</label>
                <input value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="Sin límite" className="w-28 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
                <span className="text-xs text-wood-500">MXN</span>
              </div>
            )}
          </section>

          {/* Target */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">¿Dónde se aplica?</h4>
            <div className="space-y-2">
              {([
                { v: 'order' as CouponTarget, l: 'Todo el pedido' },
                { v: 'products' as CouponTarget, l: 'Productos específicos' },
                { v: 'categories' as CouponTarget, l: 'Categorías específicas' },
                { v: 'collections' as CouponTarget, l: 'Colecciones específicas' },
                { v: 'shipping' as CouponTarget, l: 'Solo envío' },
              ]).map(t => (
                <label key={t.v} className="flex items-center gap-2 text-xs text-wood-700">
                  <input type="radio" checked={target === t.v} onChange={() => setTarget(t.v)} className="accent-[#C5A065]" /> {t.l}
                </label>
              ))}
            </div>
          </section>

          {/* Conditions */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Condiciones</h4>
            <div className="flex items-center gap-2">
              <label className="text-xs text-wood-600">Compra mínima:</label>
              <input value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder="Sin mínimo" className="w-28 bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
              <span className="text-xs text-wood-500">MXN</span>
            </div>
          </section>

          {/* Usage Limits */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Límites de Uso</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Usos totales máximos</label>
                <input value={usesLimit} onChange={e => setUsesLimit(e.target.value)} placeholder="Sin límite" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
              </div>
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Usos por cliente</label>
                <input value={usesPerCustomer} onChange={e => setUsesPerCustomer(e.target.value)} placeholder="Sin límite" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
              </div>
            </div>
          </section>

          {/* Vigencia */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Vigencia</h4>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-xs text-wood-700">
                <input type="radio" checked={vigencia === 'permanent'} onChange={() => setVigencia('permanent')} className="accent-[#C5A065]" /> Permanente
              </label>
              <label className="flex items-center gap-2 text-xs text-wood-700">
                <input type="radio" checked={vigencia === 'range'} onChange={() => setVigencia('range')} className="accent-[#C5A065]" /> Rango de fechas
              </label>
            </div>
            {vigencia === 'range' && (
              <div className="flex items-center gap-2">
                <input type="date" className="bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
                <span className="text-xs text-wood-400">hasta</span>
                <input type="date" className="bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
              </div>
            )}
          </section>

          {/* Preview */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Preview en checkout</h4>
            <div className="bg-sand-50 rounded-lg border border-wood-200 p-4 text-xs text-wood-700">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} className="text-accent-gold" />
                <span className="font-medium">Código aplicado: {code || 'CODIGO'}</span>
              </div>
              <p className="text-wood-500">
                Descuento: -{discountType === 'percentage' ? `${value || 0}%` : discountType === 'fixed' ? fmt(Number(value) || 0) : 'Envío gratis'}
              </p>
              <div className="border-t border-wood-200 mt-2 pt-2 space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>$850.00</span></div>
                <div className="flex justify-between text-green-600"><span>Descuento:</span><span>-{discountType === 'percentage' ? fmt(850 * (Number(value) || 0) / 100) : discountType === 'fixed' ? fmt(Number(value) || 0) : '$0'}</span></div>
                <div className="flex justify-between"><span>Envío:</span><span>{discountType === 'free_shipping' ? <span className="line-through text-wood-400">$285.00</span> : '$285.00'}</span></div>
                <div className="flex justify-between font-medium border-t border-wood-200 pt-1 mt-1"><span>Total:</span><span>{fmt(
                  discountType === 'percentage' ? 850 - (850 * (Number(value) || 0) / 100) + 285 :
                  discountType === 'fixed' ? 850 - (Number(value) || 0) + 285 :
                  discountType === 'free_shipping' ? 850 : 1135
                )}</span></div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-wood-100 bg-sand-50/50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-xs text-wood-600 hover:text-wood-900 transition-colors">Cancelar</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs border border-wood-200 rounded-lg text-wood-600 hover:bg-white transition-colors">Guardar borrador</button>
            <button onClick={() => { toast.success(coupon ? 'Cupón actualizado' : 'Cupón creado'); onClose(); }} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
              {coupon ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===== EMAIL CAMPAIGN MODAL =====
const CampaignFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('Todos los clientes');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('scratch');
  const [sendOption, setSendOption] = useState<'now' | 'scheduled' | 'smart'>('now');
  const [abTest, setAbTest] = useState(false);

  const segments = ['Todos los clientes', 'VIP', 'En riesgo', 'Grabado frecuente', 'Nuevos', 'Corporativos', 'Hermosillo', 'Inactivos >90d', 'Puntos >1000', 'Oro + Platino'];
  const templates = [
    { id: 'scratch', label: 'Desde cero' },
    { id: 'launch', label: 'Lanzamiento producto' },
    { id: 'discount', label: 'Descuento' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'recovery', label: 'Recuperación carrito' },
    { id: 'reactivation', label: 'Reactivación' },
    { id: 'season', label: 'Temporada' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-[60] flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-wood-100">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-accent-gold" />
            <h3 className="font-serif text-wood-900">Nueva Campaña de Email</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sand-50 rounded-lg transition-colors"><X size={16} className="text-wood-400" /></button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-wood-600 mb-1 block">Nombre de la campaña</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Lanzamiento Set Primavera 2026" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold transition-colors" />
          </div>

          {/* Destinatarios */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Destinatarios</h4>
            <div>
              <label className="text-xs text-wood-600 mb-1 block">Segmento</label>
              <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold">
                {segments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="text-[10px] text-wood-400 mt-2">Destinatarios estimados: <span className="font-medium text-wood-600">248 clientes</span></p>
            <div className="space-y-1 mt-2">
              <label className="flex items-center gap-2 text-[11px] text-wood-600"><input type="checkbox" className="accent-[#C5A065]" /> Excluir clientes que compraron en los últimos 7 días</label>
              <label className="flex items-center gap-2 text-[11px] text-wood-600"><input type="checkbox" className="accent-[#C5A065]" /> Excluir clientes que recibieron email en los últimos 3 días</label>
            </div>
          </section>

          {/* Contenido */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Contenido del Email</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Plantilla</label>
                <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold">
                  {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-wood-600 mb-1 block">Remitente</label>
                <input defaultValue="DavidSon's Design <contacto@davidsonsdesign.com>" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs text-wood-600 mb-1 block">Asunto *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="{nombre}, descubre nuestra nueva colección 🌿" className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
              <p className="text-[10px] text-wood-400 mt-1">Variables: {'{nombre}'} {'{tier}'} {'{puntos}'} {'{ciudad}'}</p>
            </div>
            <div className="mt-3">
              <label className="text-xs text-wood-600 mb-1 block">Preview text</label>
              <input placeholder="Lo que se ve antes de abrir el email..." className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-2 text-sm text-wood-900 outline-none focus:border-accent-gold" />
            </div>

            {/* Email Editor Preview */}
            <div className="mt-4 border border-wood-200 rounded-lg overflow-hidden">
              <div className="bg-wood-50 px-3 py-2 text-[10px] text-wood-500 border-b border-wood-200">Editor de email — Vista previa</div>
              <div className="grid grid-cols-[140px_1fr] min-h-[200px]">
                <div className="border-r border-wood-200 p-2 space-y-1">
                  {['Texto', 'Imagen', 'Producto', 'Botón', 'Divider', '2 cols', 'Review', 'Cupón', 'Social', 'Footer'].map(b => (
                    <div key={b} className="text-[10px] text-wood-500 bg-sand-50 rounded px-2 py-1.5 hover:bg-sand-100 transition-colors">{b}</div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 flex flex-col items-center">
                  <div className="w-full max-w-[320px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-12 h-12 bg-accent-gold/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-accent-gold font-serif text-sm">D</span>
                    </div>
                    <p className="text-xs text-wood-700 mb-2">Hola {'{nombre}'},</p>
                    <p className="text-[11px] text-wood-500 mb-3">Descubre nuestra nueva colección de primavera con maderas de temporada.</p>
                    <div className="w-full h-24 bg-sand-50 rounded mb-3 flex items-center justify-center text-[10px] text-wood-400">Imagen del producto</div>
                    <button className="bg-accent-gold text-white text-[11px] px-4 py-1.5 rounded">Ver colección</button>
                    <div className="border-t border-wood-100 mt-3 pt-2 text-[9px] text-wood-400">DavidSon's Design | Hermosillo, Son.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Envío */}
          <section>
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Envío</h4>
            <div className="space-y-2">
              {([
                { v: 'now' as const, l: 'Enviar ahora' },
                { v: 'scheduled' as const, l: 'Programar' },
                { v: 'smart' as const, l: 'Envío inteligente (hora preferida de cada cliente)' },
              ]).map(o => (
                <label key={o.v} className="flex items-center gap-2 text-xs text-wood-700">
                  <input type="radio" checked={sendOption === o.v} onChange={() => setSendOption(o.v)} className="accent-[#C5A065]" /> {o.l}
                </label>
              ))}
              {sendOption === 'scheduled' && (
                <div className="flex items-center gap-2 ml-6">
                  <input type="date" className="bg-sand-50 border border-wood-200 rounded-lg px-3 py-1.5 text-xs text-wood-900 outline-none focus:border-accent-gold" />
                  <input type="time" className="bg-sand-50 border border-wood-200 rounded-lg px-3 py-1.5 text-xs text-wood-900 outline-none focus:border-accent-gold" />
                </div>
              )}
            </div>
          </section>

          {/* A/B Test */}
          <section>
            <label className="flex items-center gap-2 text-xs text-wood-700 mb-2">
              <input type="checkbox" checked={abTest} onChange={e => setAbTest(e.target.checked)} className="accent-[#C5A065]" /> Activar A/B test
            </label>
            {abTest && (
              <div className="ml-6 space-y-2 border-l-2 border-accent-gold/30 pl-3">
                <div>
                  <label className="text-[10px] text-wood-500 block">Variante A: Asunto actual</label>
                  <label className="text-[10px] text-wood-500 block mt-1">Variante B:</label>
                  <input placeholder="Asunto alternativo..." className="w-full bg-sand-50 border border-wood-200 rounded-lg px-3 py-1.5 text-xs text-wood-900 outline-none focus:border-accent-gold mt-1" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] text-wood-500">% de prueba: <input type="number" defaultValue={20} className="w-12 bg-sand-50 border border-wood-200 rounded px-1.5 py-0.5 text-xs text-center" />%</label>
                  <label className="text-[10px] text-wood-500">Ganador por: <select className="bg-sand-50 border border-wood-200 rounded px-1.5 py-0.5 text-xs"><option>Apertura</option><option>Clics</option></select></label>
                  <label className="text-[10px] text-wood-500">Esperar: <input type="number" defaultValue={4} className="w-10 bg-sand-50 border border-wood-200 rounded px-1.5 py-0.5 text-xs text-center" />h</label>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-wood-100 bg-sand-50/50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-xs text-wood-600 hover:text-wood-900 transition-colors">Cancelar</button>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-600 hover:bg-white transition-colors">Guardar borrador</button>
            <button className="px-3 py-2 text-xs border border-wood-200 rounded-lg text-wood-600 hover:bg-white transition-colors">Enviar prueba</button>
            <button onClick={() => { toast.success('Campaña creada'); onClose(); }} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
              {sendOption === 'now' ? 'Enviar ahora' : 'Programar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===== TAB: CUPONES =====
const CuponesTab: React.FC<{ search: string }> = ({ search }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | CouponStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CouponType>('all');
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...mockCoupons];
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter(c => c.type === typeFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(s) || c.internalName.toLowerCase().includes(s));
    }
    return list;
  }, [statusFilter, typeFilter, search]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="bg-white border border-wood-200 rounded-lg px-3 py-1.5 text-xs text-wood-700 outline-none focus:border-accent-gold">
          <option value="all">Todos los estados</option>
          {Object.entries(couponStatusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="bg-white border border-wood-200 rounded-lg px-3 py-1.5 text-xs text-wood-700 outline-none focus:border-accent-gold">
          <option value="all">Todos los tipos</option>
          {Object.entries(couponTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={() => setEditingCoupon(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs hover:bg-accent-gold/90 transition-colors">
            <Plus size={14} /> Nuevo Cupón
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-sand-50/80 border-b border-wood-100">
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Código</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Aplica a</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Usos</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Vigencia</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-wood-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-wood-50 hover:bg-sand-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-wood-900">{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado'); }} className="p-0.5 hover:bg-sand-50 rounded"><Copy size={10} className="text-wood-400" /></button>
                    </div>
                    <p className="text-[10px] text-wood-400 mt-0.5">{c.internalName}</p>
                  </td>
                  <td className="px-4 py-3 text-wood-600">{couponTypeLabels[c.type]}</td>
                  <td className="px-4 py-3 font-medium text-wood-900">{couponValueLabel(c)}</td>
                  <td className="px-4 py-3 text-wood-600">{c.targetLabel}</td>
                  <td className="px-4 py-3 text-wood-600">{c.usesCount}/{c.usesLimit ?? '∞'}</td>
                  <td className="px-4 py-3 text-wood-600">{couponVigencia(c)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="p-1 hover:bg-sand-50 rounded-lg"><MoreHorizontal size={14} className="text-wood-400" /></button>
                    {menuOpen === c.id && (
                      <div className="absolute right-4 top-10 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-10 w-36">
                        <button onClick={() => { setEditingCoupon(c); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-wood-700 hover:bg-sand-50 flex items-center gap-2"><Edit2 size={12} /> Editar</button>
                        <button onClick={() => { toast.success(c.status === 'active' ? 'Cupón pausado' : 'Cupón activado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-wood-700 hover:bg-sand-50 flex items-center gap-2">
                          {c.status === 'active' ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Activar</>}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-wood-700 hover:bg-sand-50 flex items-center gap-2"><Copy size={12} /> Copiar código</button>
                        <button onClick={() => { toast.success('Cupón eliminado'); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12} /> Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-wood-400 border-t border-wood-50 flex flex-wrap gap-x-4 gap-y-1">
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

// ===== TAB: CAMPAÑAS =====
const CampanasTab: React.FC<{ search: string }> = ({ search }) => {
  const [showForm, setShowForm] = useState(false);

  const campaignStatusCfg: Record<string, { label: string; cls: string }> = {
    sent: { label: 'Enviada', cls: 'bg-green-50 text-green-600' },
    scheduled: { label: 'Programada', cls: 'bg-purple-50 text-purple-600' },
    draft: { label: 'Borrador', cls: 'bg-gray-100 text-gray-500' },
  };

  const filtered = useMemo(() => {
    if (!search) return mockEmailCampaigns;
    const s = search.toLowerCase();
    return mockEmailCampaigns.filter(c => c.name.toLowerCase().includes(s) || c.segment.toLowerCase().includes(s));
  }, [search]);

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs hover:bg-accent-gold/90 transition-colors">
          <Plus size={14} /> Nueva Campaña
        </button>
      </div>

      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-sand-50/80 border-b border-wood-100">
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Campaña</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Segmento</th>
                <th className="text-right px-4 py-3 text-wood-500 font-medium">Enviados</th>
                <th className="text-right px-4 py-3 text-wood-500 font-medium">Apertura</th>
                <th className="text-right px-4 py-3 text-wood-500 font-medium">Clics</th>
                <th className="text-right px-4 py-3 text-wood-500 font-medium">Ventas</th>
                <th className="text-left px-4 py-3 text-wood-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-wood-50 hover:bg-sand-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-wood-900">{c.name}</p>
                    <p className="text-[10px] text-wood-400 mt-0.5 truncate max-w-[240px]">{c.subject}</p>
                  </td>
                  <td className="px-4 py-3 text-wood-600">{c.segment}</td>
                  <td className="px-4 py-3 text-right text-wood-600">{c.sentCount ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-wood-600">{c.openRate != null ? `${c.openRate}%` : '—'}</td>
                  <td className="px-4 py-3 text-right text-wood-600">{c.clickRate != null ? `${c.clickRate}%` : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-wood-900">{c.revenue != null ? fmt(c.revenue) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${campaignStatusCfg[c.status]?.cls}`}>
                      {c.status === 'sent' && <CheckCircle size={10} />}
                      {c.status === 'scheduled' && <Clock size={10} />}
                      {campaignStatusCfg[c.status]?.label}
                      {c.scheduledDate && ` ${fmtDate(c.scheduledDate)}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-wood-400 border-t border-wood-50">
          Promedio general: Apertura 48% | Clics 18% | Conversión email→venta 6.8%
        </div>
      </div>

      <AnimatePresence>
        {showForm && <CampaignFormModal onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </>
  );
};

// ===== TAB: BANNERS =====
const BannersTab: React.FC<{ search: string }> = ({ search }) => {
  const bannerStatusCfg: Record<string, { label: string; cls: string }> = {
    active: { label: 'Activo', cls: 'bg-green-50 text-green-600' },
    paused: { label: 'Pausado', cls: 'bg-amber-50 text-amber-600' },
    scheduled: { label: 'Programado', cls: 'bg-purple-50 text-purple-600' },
  };

  const heroBanners = mockBanners.filter(b => b.location === 'hero');
  const announcementBanners = mockBanners.filter(b => b.location === 'announcement');
  const categoryBanners = mockBanners.filter(b => b.location === 'category');
  const checkoutBanners = mockBanners.filter(b => b.location === 'checkout');

  const BannerCard: React.FC<{ b: SiteBanner; showDrag?: boolean }> = ({ b, showDrag }) => (
    <div className="flex items-start gap-4 p-4 border-b border-wood-50 last:border-0 hover:bg-sand-50/30 transition-colors">
      {showDrag && <span className="text-wood-300 mt-1 text-xs select-none">≡</span>}
      <div className="w-16 h-10 bg-sand-50 rounded border border-wood-200 flex items-center justify-center flex-shrink-0">
        <Image size={14} className="text-wood-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-wood-900 truncate">{b.title}</p>
          <span className={`inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-full ${bannerStatusCfg[b.status]?.cls}`}>
            {bannerStatusCfg[b.status]?.label}
          </span>
        </div>
        {b.subtitle && <p className="text-[10px] text-wood-400 mt-0.5">{b.subtitle}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-wood-400">
          {b.link && <span>Link: {b.link}</span>}
          {b.startDate && b.endDate ? <span>{fmtDate(b.startDate)} — {fmtDate(b.endDate)}</span> : !b.startDate && !b.endDate ? <span>Permanente</span> : null}
          <span>Clics: {fmtNum(b.clicks)} | CTR: {b.ctr}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="p-1.5 hover:bg-sand-100 rounded-lg text-wood-400 transition-colors"><Edit2 size={12} /></button>
        <button onClick={() => toast.success(b.status === 'active' ? 'Banner pausado' : 'Banner activado')} className="p-1.5 hover:bg-sand-100 rounded-lg text-wood-400 transition-colors">
          {b.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button className="p-1.5 hover:bg-sand-100 rounded-lg text-wood-400 transition-colors"><BarChart3 size={12} /></button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs hover:bg-accent-gold/90 transition-colors">
          <Plus size={14} /> Nuevo Banner
        </button>
      </div>

      <div className="space-y-6">
        {/* Hero Banners */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
            <h4 className="text-xs font-medium text-wood-900">Homepage — Hero Banners (carrusel)</h4>
          </div>
          {heroBanners.sort((a, b) => a.position - b.position).map(b => <BannerCard key={b.id} b={b} showDrag />)}
          <div className="px-4 py-2 text-[10px] text-wood-400 border-t border-wood-50">≡ Arrastra para reordenar el carrusel</div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
            <h4 className="text-xs font-medium text-wood-900">Barra de anuncio (top bar)</h4>
          </div>
          {announcementBanners.map(b => (
            <div key={b.id} className="p-4 border-b border-wood-50 last:border-0 hover:bg-sand-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-full max-w-xs rounded-lg px-3 py-2 text-center text-xs" style={{ backgroundColor: b.bgColor || '#2d2419', color: b.textColor || '#C5A065' }}>
                  {b.title}
                </div>
                <span className={`inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-full ${bannerStatusCfg[b.status]?.cls}`}>
                  {bannerStatusCfg[b.status]?.label}
                </span>
                <div className="ml-auto flex gap-1">
                  <button className="p-1.5 hover:bg-sand-100 rounded-lg text-wood-400"><Edit2 size={12} /></button>
                  <button className="p-1.5 hover:bg-sand-100 rounded-lg text-wood-400"><Pause size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Banners */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
            <h4 className="text-xs font-medium text-wood-900">Banners por categoría</h4>
          </div>
          {categoryBanners.map(b => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3 border-b border-wood-50 last:border-0 hover:bg-sand-50/30">
              <span className="text-xs text-wood-600 w-36">{b.categoryName}:</span>
              <div className="w-12 h-8 bg-sand-50 rounded border border-wood-200 flex items-center justify-center"><Image size={10} className="text-wood-300" /></div>
              <p className="text-xs text-wood-900 flex-1 truncate">{b.title}</p>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${bannerStatusCfg[b.status]?.cls}`}>{bannerStatusCfg[b.status]?.label}</span>
              <button className="p-1 hover:bg-sand-100 rounded text-wood-400"><Edit2 size={12} /></button>
            </div>
          ))}
          {['Accesorios', 'Servicios'].map(cat => (
            <div key={cat} className="flex items-center gap-3 px-4 py-3 border-b border-wood-50 last:border-0">
              <span className="text-xs text-wood-600 w-36">{cat}:</span>
              <span className="text-[10px] text-wood-400">— Sin banner asignado</span>
              <button className="ml-auto text-[10px] text-accent-gold hover:underline">+ Crear</button>
            </div>
          ))}
        </div>

        {/* Checkout Banners */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
            <h4 className="text-xs font-medium text-wood-900">Banner de checkout (pre-compra)</h4>
          </div>
          {checkoutBanners.map(b => <BannerCard key={b.id} b={b} />)}
        </div>
      </div>
    </>
  );
};

// ===== TAB: VENTAS FLASH =====
const FlashTab: React.FC = () => {
  const flashStatusCfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active: { label: 'ACTIVA AHORA', cls: 'bg-red-50 text-red-600 border-red-200', icon: <Zap size={12} /> },
    scheduled: { label: 'PROGRAMADA', cls: 'bg-purple-50 text-purple-600 border-purple-200', icon: <Clock size={12} /> },
    completed: { label: 'COMPLETADA', cls: 'bg-gray-100 text-gray-500 border-gray-200', icon: <CheckCircle size={12} /> },
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs hover:bg-accent-gold/90 transition-colors">
          <Plus size={14} /> Nueva Venta Flash
        </button>
      </div>

      <div className="space-y-4">
        {mockFlashSales.map(fs => {
          const cfg = flashStatusCfg[fs.status];
          return (
            <div key={fs.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${fs.status === 'active' ? 'border-red-200' : 'border-wood-100'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={fs.status === 'active' ? 'text-red-500' : 'text-wood-400'} />
                    <h4 className="text-sm font-medium text-wood-900">{fs.name}</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${cfg.cls}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                <p className="text-xs text-wood-600 mb-3">{fs.description}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-wood-500 mb-4">
                  <span>Inicio: {fmtDate(fs.startDate)} → Fin: {fmtDate(fs.endDate)}</span>
                  {fs.status === 'active' && <span className="text-red-500 font-medium">Tiempo restante: {getTimeRemaining(fs.endDate)}</span>}
                  {fs.status === 'scheduled' && <span className="text-purple-500 font-medium">Inicia en: {getTimeUntil(fs.startDate)}</span>}
                </div>

                {/* Stats */}
                {(fs.status === 'active' || fs.status === 'completed') && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-sand-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-sans text-wood-900">{fs.salesCount}</p>
                      <p className="text-[10px] text-wood-400">Ventas</p>
                    </div>
                    <div className="bg-sand-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-sans text-wood-900">{fmt(fs.revenue)}</p>
                      <p className="text-[10px] text-wood-400">Ingresos</p>
                    </div>
                    <div className="bg-sand-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-sans text-wood-900">{fmtNum(fs.visits)}</p>
                      <p className="text-[10px] text-wood-400">Visitas</p>
                    </div>
                    <div className="bg-sand-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-sans text-wood-900">{fs.conversion}%</p>
                      <p className="text-[10px] text-wood-400">Conversión</p>
                    </div>
                  </div>
                )}

                {/* Products */}
                {fs.products.length > 0 && fs.products[0].originalPrice > 0 && (
                  <div className="text-[11px] text-wood-600 mb-3">
                    <span className="text-wood-400">Productos: </span>
                    {fs.products.map((p, i) => (
                      <span key={i}>
                        {i > 0 && ', '}
                        {p.name} (<span className="line-through text-wood-400">{fmt(p.originalPrice)}</span> → <span className="text-red-500 font-medium">{fmt(p.flashPrice)}</span>)
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-[11px] border border-wood-200 rounded-lg text-wood-600 hover:bg-sand-50 transition-colors">
                    {fs.status === 'completed' ? 'Ver reporte' : 'Ver detalle'}
                  </button>
                  {fs.status === 'active' && (
                    <>
                      <button onClick={() => toast.success('Venta flash pausada')} className="px-3 py-1.5 text-[11px] border border-wood-200 rounded-lg text-wood-600 hover:bg-sand-50 transition-colors flex items-center gap-1"><Pause size={10} /> Pausar</button>
                      <button onClick={() => toast.success('Venta flash terminada')} className="px-3 py-1.5 text-[11px] border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">Terminar ahora</button>
                    </>
                  )}
                  {fs.status === 'scheduled' && (
                    <>
                      <button className="px-3 py-1.5 text-[11px] border border-wood-200 rounded-lg text-wood-600 hover:bg-sand-50 transition-colors">Editar</button>
                      <button onClick={() => toast.success('Venta flash cancelada')} className="px-3 py-1.5 text-[11px] border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ===== TAB: REFERIDOS =====
const ReferidosTab: React.FC = () => {
  const tierCfg: Record<string, { cls: string }> = {
    platino: { cls: 'bg-slate-200 text-slate-700' },
    oro: { cls: 'bg-accent-gold/20 text-accent-gold' },
    plata: { cls: 'bg-gray-100 text-gray-600' },
    bronce: { cls: 'bg-amber-100 text-amber-700' },
  };
  const refStatusCfg: Record<string, { label: string; cls: string }> = {
    purchased: { label: 'Compró', cls: 'bg-green-50 text-green-600' },
    registered: { label: 'Registrado', cls: 'bg-amber-50 text-amber-600' },
    link_visited: { label: 'Link visitado', cls: 'bg-gray-100 text-gray-500' },
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-medium text-wood-900">Configuración del Programa</h4>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Activo</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-wood-600">
          <div className="space-y-2">
            <p><span className="text-wood-400">Recompensa referidor:</span> 500 puntos de lealtad</p>
            <p><span className="text-wood-400">Se acredita:</span> Cuando el referido hace su primera compra</p>
            <p><span className="text-wood-400">Máximo referidos:</span> Sin límite</p>
          </div>
          <div className="space-y-2">
            <p><span className="text-wood-400">Recompensa referido:</span> 15% cupón + 200 puntos bonus</p>
            <p><span className="text-wood-400">Compra mínima:</span> $500 MXN</p>
            <p><span className="text-wood-400">Link:</span> davidsonsdesign.com/ref/{'{codigo}'}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={<Link2 size={16} className="text-accent-gold" />} value="156" label="Links compartidos" sub="este mes" />
        <KpiCard icon={<Users size={16} className="text-wood-400" />} value="42" label="Registros de referidos" sub="27% conv." />
        <KpiCard icon={<ShoppingCart size={16} className="text-wood-400" />} value="28" label="Compras de referidos" sub="67% conv." />
        <KpiCard icon={<DollarSign size={16} className="text-accent-gold" />} value="$24,800" label="Ingresos de referidos" sub="$886 ticket" accent />
      </div>

      {/* Top Referrers */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
          <h4 className="text-xs font-medium text-wood-900">Top Referidores</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wood-100">
                <th className="text-left px-4 py-2 text-wood-500 font-medium">#</th>
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Tier</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Links</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Registros</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Compras</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Puntos ganados</th>
              </tr>
            </thead>
            <tbody>
              {mockTopReferrers.map(r => (
                <tr key={r.rank} className="border-b border-wood-50 hover:bg-sand-50/30">
                  <td className="px-4 py-2 font-medium text-wood-900">{r.rank}</td>
                  <td className="px-4 py-2 font-medium text-wood-900">{r.name}</td>
                  <td className="px-4 py-2"><span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${tierCfg[r.tier]?.cls}`}>{r.tier}</span></td>
                  <td className="px-4 py-2 text-right text-wood-600">{r.linksShared}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{r.registrations}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{r.purchases}</td>
                  <td className="px-4 py-2 text-right font-medium text-accent-gold">{fmtNum(r.pointsEarned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
          <h4 className="text-xs font-medium text-wood-900">Historial de Referidos</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wood-100">
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Referidor</th>
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Referido</th>
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Estado</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Recompensa</th>
              </tr>
            </thead>
            <tbody>
              {mockReferrals.map(r => (
                <tr key={r.id} className="border-b border-wood-50 hover:bg-sand-50/30">
                  <td className="px-4 py-2 text-wood-600">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2 font-medium text-wood-900">{r.referrerName}</td>
                  <td className="px-4 py-2 text-wood-700">{r.referredName}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${refStatusCfg[r.status]?.cls}`}>
                      {refStatusCfg[r.status]?.label}
                      {r.purchaseAmount && ` (${fmt(r.purchaseAmount)})`}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {r.rewardStatus === 'credited'
                      ? <span className="text-green-600 font-medium">+{r.rewardPoints} pts</span>
                      : <span className="text-wood-400">Pendiente</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== TAB: ANÁLISIS =====
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
        <KpiCard icon={<DollarSign size={16} className="text-accent-gold" />} value="$68,400" label="Ingresos atribuidos a marketing" sub="18% del total" accent />
        <KpiCard icon={<Tag size={16} className="text-wood-400" />} value="$8,200" label="Costo total de marketing" sub="descuentos" />
        <KpiCard icon={<TrendingUp size={16} className="text-wood-400" />} value="3.2x" label="ROI" sub="Por cada $1 genera $3.20" />
        <KpiCard icon={<ShoppingCart size={16} className="text-wood-400" />} value="22%" label="% Ventas con descuento" sub="" />
      </div>

      {/* Rendimiento por canal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
            <h4 className="text-xs font-medium text-wood-900">Rendimiento por canal</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-wood-100">
                  <th className="text-left px-4 py-2 text-wood-500 font-medium">Canal</th>
                  <th className="text-right px-4 py-2 text-wood-500 font-medium">Ingresos</th>
                  <th className="text-right px-4 py-2 text-wood-500 font-medium">Costo</th>
                  <th className="text-right px-4 py-2 text-wood-500 font-medium">ROI</th>
                  <th className="text-right px-4 py-2 text-wood-500 font-medium">Pedidos</th>
                  <th className="text-right px-4 py-2 text-wood-500 font-medium">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map(c => (
                  <tr key={c.canal} className="border-b border-wood-50 hover:bg-sand-50/30">
                    <td className="px-4 py-2 font-medium text-wood-900">{c.canal}</td>
                    <td className="px-4 py-2 text-right text-wood-700">{fmt(c.ingresos)}</td>
                    <td className="px-4 py-2 text-right text-wood-600">{c.costo === 0 ? '$0*' : fmt(c.costo)}</td>
                    <td className="px-4 py-2 text-right font-medium text-accent-gold">{c.roi === Infinity ? '∞' : `${c.roi}x`}</td>
                    <td className="px-4 py-2 text-right text-wood-600">{c.pedidos}</td>
                    <td className="px-4 py-2 text-right text-wood-600">{fmt(c.ticket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-[9px] text-wood-400 border-t border-wood-50">* Costo email = $0 (sin costo de plataforma) | ** Costo referidos = puntos valorados en MXN</div>
        </div>

        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
          <h4 className="text-xs font-medium text-wood-900 mb-3">Por canal</h4>
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
                <span className="text-wood-600 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Coupons */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
          <h4 className="text-xs font-medium text-wood-900">Top cupones por rendimiento</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wood-100">
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Código</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Usos</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Ingresos</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Desc. otorgado</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">ROI</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Ticket prom</th>
              </tr>
            </thead>
            <tbody>
              {topCoupons.map(c => (
                <tr key={c.code} className="border-b border-wood-50 hover:bg-sand-50/30">
                  <td className="px-4 py-2 font-mono font-medium text-wood-900">{c.code}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{c.usos}</td>
                  <td className="px-4 py-2 text-right font-medium text-wood-900">{fmt(c.ingresos)}</td>
                  <td className="px-4 py-2 text-right text-red-500">{fmt(c.descOtorgado)}</td>
                  <td className="px-4 py-2 text-right font-medium text-accent-gold">{c.roi}x</td>
                  <td className="px-4 py-2 text-right text-wood-600">{fmt(c.ticket)} {c.ticket > 1000 && '⭐'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-wood-500 border-t border-wood-50 bg-accent-gold/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-accent-gold flex-shrink-0 mt-0.5" />
          VIP15 tiene el ticket promedio más alto ($1,517). Considerar hacer más promociones exclusivas para clientes VIP.
        </div>
      </div>

      {/* Email Performance */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
          <h4 className="text-xs font-medium text-wood-900">Rendimiento de campañas email</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wood-100">
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Campaña</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Enviados</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Apertura</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Clics</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Ventas</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {emailPerf.map(c => (
                <tr key={c.name} className="border-b border-wood-50 hover:bg-sand-50/30">
                  <td className="px-4 py-2 font-medium text-wood-900">{c.name}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{c.enviados}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{c.apertura}%</td>
                  <td className="px-4 py-2 text-right text-wood-600">{c.clics}%</td>
                  <td className="px-4 py-2 text-right text-wood-600">{c.ventas}</td>
                  <td className="px-4 py-2 text-right font-medium text-wood-900">{fmt(c.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-wood-500 border-t border-wood-50 bg-accent-gold/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-accent-gold flex-shrink-0 mt-0.5" />
          Las campañas a segmentos pequeños (VIP, puntos) tienen mucho mejor apertura y conversión que las masivas. Segmentar más.
        </div>
      </div>

      {/* Banner Performance */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100 bg-sand-50/50">
          <h4 className="text-xs font-medium text-wood-900">Rendimiento de banners</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wood-100">
                <th className="text-left px-4 py-2 text-wood-500 font-medium">Banner</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Impresiones</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Clics</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">CTR</th>
                <th className="text-right px-4 py-2 text-wood-500 font-medium">Ventas atrib.</th>
              </tr>
            </thead>
            <tbody>
              {bannerPerf.map(b => (
                <tr key={b.name} className="border-b border-wood-50 hover:bg-sand-50/30">
                  <td className="px-4 py-2 font-medium text-wood-900">{b.name}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{fmtNum(b.impresiones)}</td>
                  <td className="px-4 py-2 text-right text-wood-600">{fmtNum(b.clics)}</td>
                  <td className="px-4 py-2 text-right font-medium text-accent-gold">{b.ctr}%</td>
                  <td className="px-4 py-2 text-right font-medium text-wood-900">{fmt(b.ventas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[10px] text-wood-500 border-t border-wood-50 bg-accent-gold/5 flex items-start gap-1.5">
          <Lightbulb size={12} className="text-accent-gold flex-shrink-0 mt-0.5" />
          El banner "Envío gratis" tiene el mejor CTR y ventas atribuidas. La barra superior tiene muchas impresiones pero bajo CTR — considerar rotar el mensaje.
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
        <h4 className="text-xs font-medium text-wood-900 mb-4">Tendencia mensual</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={marketingMonthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2da" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#8a7a6a' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <RTooltip formatter={(v: any) => fmt(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="marketing" stroke="#C5A065" strokeWidth={2} name="Marketing" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="organic" stroke="#5D4037" strokeWidth={2} name="Orgánico" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-medium text-wood-900">Insights automáticos</h4>
          <button className="flex items-center gap-1 text-[10px] text-accent-gold hover:underline"><Download size={10} /> Exportar reporte (PDF)</button>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-wood-600 bg-accent-gold/5 rounded-lg p-3">
              <Lightbulb size={14} className="text-accent-gold flex-shrink-0 mt-0.5" />
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
  const [search, setSearch] = useState('');

  // KPIs
  const activeCoupons = mockCoupons.filter(c => c.status === 'active' || c.status === 'auto').length;
  const expiringCoupons = mockCoupons.filter(c => c.status === 'active' && c.endDate && new Date(c.endDate).getTime() - Date.now() < 7 * 86400000).length;
  const activeCampaigns = mockEmailCampaigns.filter(c => c.status === 'sent').length;
  const scheduledCampaigns = mockEmailCampaigns.filter(c => c.status === 'scheduled').length;
  const activeFlash = mockFlashSales.filter(f => f.status === 'active').length;
  const activeFlashEnd = mockFlashSales.find(f => f.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-accent-gold" />
          <h2 className="font-serif text-lg text-wood-900">Marketing</h2>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-accent-gold text-white rounded-lg text-xs hover:bg-accent-gold/90 transition-colors self-start sm:self-auto">
          <Plus size={14} /> Nueva Campaña
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={<Tag size={16} className="text-accent-gold" />} value={String(activeCoupons)} label="Cupones activos" sub={expiringCoupons > 0 ? `${expiringCoupons} por vencer` : 'Ninguno por vencer'} accent />
        <KpiCard icon={<DollarSign size={16} className="text-wood-400" />} value="$12,400" label="Ingresos atribuidos a marketing" sub="este mes · 18% del total" />
        <KpiCard icon={<Mail size={16} className="text-wood-400" />} value={String(activeCampaigns)} label="Campañas activas" sub={scheduledCampaigns > 0 ? `+${scheduledCampaigns} programada` : ''} />
        <KpiCard icon={<Zap size={16} className="text-wood-400" />} value={String(activeFlash)} label="Venta flash activa" sub={activeFlashEnd ? `Termina en ${getTimeRemaining(activeFlashEnd.endDate)}` : ''} />
        <KpiCard icon={<TrendingUp size={16} className="text-accent-gold" />} value="3.2x" label="ROI prom. de marketing" sub="Por cada $1 invertido" accent />
      </div>

      {/* Tabs */}
      <div className="border-b border-wood-200">
        <div className="flex gap-0 overflow-x-auto -mb-px">
          {tabItems.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-accent-gold text-accent-gold' : 'border-transparent text-wood-400 hover:text-wood-600'
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cupón, campaña o banner..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-900 outline-none focus:border-accent-gold transition-colors"
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
          {tab === 'campanas' && <CampanasTab search={search} />}
          {tab === 'banners' && <BannersTab search={search} />}
          {tab === 'flash' && <FlashTab />}
          {tab === 'referidos' && <ReferidosTab />}
          {tab === 'analisis' && <AnalisisTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
