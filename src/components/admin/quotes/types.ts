// ═══════════════════════════════════════════════════════════════
// Quote Admin Types — Source of truth for admin cotizaciones
// Matches Supabase quotes table + API response shape
// ═══════════════════════════════════════════════════════════════

export type QuoteStatus =
  | 'nueva' | 'en_revision' | 'cotizacion_enviada' | 'en_negociacion'
  | 'aprobada' | 'anticipo_recibido' | 'en_produccion'
  | 'completada' | 'rechazada' | 'vencida' | 'cancelada';

export interface QuotePiece {
  id: string;
  type: string;
  category?: string;
  wood?: string;
  secondWood?: string;
  woodRatio?: string;
  material?: string;
  dimensions?: { length: number; width: number; thickness: number };
  quantity: number;
  usage?: string;
  engraving?: {
    type: string;
    complexity: string;
    zones?: string[];
    file?: string;
    text?: string;
  };
  engravingMaterial?: string;
  textile?: {
    technique?: string;
    color?: string;
    printZone?: string;
  };
  autoPrice: number;
  adminPrice?: number;
  costEstimate?: number;
  unitPrice?: number;
  lineTotal?: number;
  notes?: string;
  internalNote?: string;
}

export interface QuoteMessage {
  id: string;
  sender: 'client' | 'admin';
  senderName: string;
  date: string;
  text: string;
  attachments?: string[];
}

export interface QuoteInternalNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface QuoteCondition {
  text: string;
  checked: boolean;
}

export interface QuoteDeposit {
  amount: number;
  method: string;
  ref: string;
  date: string;
}

export interface QuoteProductionProgress {
  completed: number;
  total: number;
}

export interface QuoteDiscount {
  percent: number;
  reason: string;
}

export interface QuoteCustomer {
  name: string;
  email: string;
  phone: string;
  tier: string | null;
  points: number;
  totalSpent: number;
  orders: number;
}

export interface AdminQuote {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  customer: QuoteCustomer;
  projectName?: string;
  pieces: QuotePiece[];
  discount?: QuoteDiscount;
  shippingIncluded: boolean;
  timeline: string;
  validityDays: number;
  depositPercent: number;
  conditions: QuoteCondition[];
  messages: QuoteMessage[];
  internalNotes: QuoteInternalNote[];
  depositPaid?: QuoteDeposit;
  productionProgress?: QuoteProductionProgress;
  rejectionReason?: string;
  closedDate?: string;
}

// ── Status Config ───────────────────────────────────────────

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; cls: string; dot: string }> = {
  nueva:              { label: 'Nueva',              cls: 'bg-[var(--info-subtle)] text-[var(--info)]',    dot: 'bg-blue-500' },
  en_revision:        { label: 'En revisión',        cls: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-500' },
  cotizacion_enviada: { label: 'Cotización enviada', cls: 'bg-[var(--accent-subtle)] text-[var(--accent)]', dot: 'bg-purple-500' },
  en_negociacion:     { label: 'En negociación',     cls: 'bg-[var(--warning-subtle)] text-[var(--warning)]', dot: 'bg-orange-500' },
  aprobada:           { label: 'Aprobada',           cls: 'bg-[var(--success-subtle)] text-[var(--success)]',   dot: 'bg-green-500' },
  anticipo_recibido:  { label: 'Anticipo recibido',  cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  en_produccion:      { label: 'En producción',      cls: 'bg-[var(--warning-subtle)] text-[var(--warning)]', dot: 'bg-yellow-500' },
  completada:         { label: 'Completada',         cls: 'bg-[var(--surface2)] text-[var(--success)]',   dot: 'bg-green-400' },
  rechazada:          { label: 'Rechazada',          cls: 'bg-[var(--error-subtle)] text-[var(--error)]',       dot: 'bg-red-500' },
  vencida:            { label: 'Vencida',            cls: 'bg-[var(--surface2)] text-[var(--text-muted)]',    dot: 'bg-gray-400' },
  cancelada:          { label: 'Cancelada',          cls: 'bg-[var(--surface3)] text-[var(--text-secondary)]',    dot: 'bg-gray-500' },
};

// ── Helpers ─────────────────────────────────────────────────

export function getQuoteTotal(q: AdminQuote): number {
  const subtotal = q.pieces.reduce((s, p) => s + (p.adminPrice ?? p.autoPrice ?? p.unitPrice ?? 0) * p.quantity, 0);
  const disc = q.discount ? subtotal * (q.discount.percent / 100) : 0;
  return subtotal - disc;
}

export function getQuoteCost(q: AdminQuote): number {
  return q.pieces.reduce((s, p) => s + (p.costEstimate ?? 0) * p.quantity, 0);
}

export function getPieceCount(q: AdminQuote): number {
  return q.pieces.reduce((s, p) => s + p.quantity, 0);
}

export function hoursAgo(d: string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const ACTIVE_STATUSES: QuoteStatus[] = [
  'nueva', 'en_revision', 'cotizacion_enviada', 'en_negociacion',
  'aprobada', 'anticipo_recibido', 'en_produccion',
];
