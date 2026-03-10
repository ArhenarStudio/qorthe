"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Send, Paperclip, Mail, Package, CheckCircle, DollarSign,
  MessageSquare, Printer, Copy, ShoppingCart, Hammer, FileText,
  ExternalLink, XCircle, Zap, X
} from 'lucide-react';
import {
  AdminQuote, QuoteStatus, QuotePiece, QuoteMessage, QuoteInternalNote, QuoteCondition,
  QUOTE_STATUS_CONFIG,
  getQuoteTotal, getQuoteCost, getPieceCount,
  fmt, fmtDate, fmtDateTime,
} from './types';
import { toast } from 'sonner';
import { DEFAULT_LOYALTY_CONFIG, getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { TierIcon } from '@/components/ui/TierIcons';

const statusConfig = QUOTE_STATUS_CONFIG;

function getQuoteTierBadge(tierId: string) {
  const normalized = normalizeTierId(tierId);
  const tier = DEFAULT_LOYALTY_CONFIG.tiers.find(t => t.id === normalized) || DEFAULT_LOYALTY_CONFIG.tiers[0];
  return { name: tier.name, styles: getTierInlineStyles(tier), tierId: normalized };
}

const InlineModal: React.FC<{
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmColor?: string;
  children: React.ReactNode;
}> = ({ title, onConfirm, onCancel, confirmLabel = 'Confirmar', confirmColor = 'bg-wood-900', children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
    <div className="bg-[var(--surface)] dark:bg-wood-900 rounded-[var(--radius-card)] shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
      <h4 className="text-sm font-serif font-bold text-wood-900 dark:text-sand-100">{title}</h4>
      {children}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs text-wood-500 hover:text-wood-700">Cancelar</button>
        <button onClick={onConfirm} className={`px-4 py-2 text-xs text-sand-100 rounded-[var(--radius-card)] hover:opacity-90 ${confirmColor}`}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ===== QUOTE DETAIL =====
const QuoteDetail: React.FC<{ quote: AdminQuote; onBack: () => void; onRefresh?: () => void }> = ({ quote: initialQuote, onBack, onRefresh }) => {
  const [q, setQ] = useState(initialQuote);
  const [saving, setSaving] = useState(false);

  // Modal states (replace browser prompt())
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('Transferencia');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertTarget, setConvertTarget] = useState<'order' | 'pos'>('order');

  // Persist changes to Supabase
  const persistQuote = async (updates: Partial<AdminQuote> & Record<string, unknown>) => {
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
    setQ((prev: AdminQuote) => ({ ...prev, messages: updatedMessages }));
    setNewMsg('');
    persistQuote({ messages: updatedMessages });
    toast.success('Mensaje enviado');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = { id: `n_new_${Date.now()}`, author: 'David (Admin)', date: new Date().toISOString(), text: newNote };
    const updatedNotes = [...q.internalNotes, note];
    setQ((prev: AdminQuote) => ({ ...prev, internalNotes: updatedNotes }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg text-wood-900">📋 {q.number}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-[var(--radius-badge)] ${statusConfig[q.status].cls}`}>{statusConfig[q.status].label}</span>
          </div>
          <p className="text-[11px] text-wood-500 mt-1">Recibida: {fmtDateTime(q.date)} | Vence: {fmtDate(q.validUntil)}</p>
          {q.projectName && <p className="text-[11px] text-wood-400 mt-0.5">Proyecto: {q.projectName}</p>}
        </div>
        <select
          value={q.status}
          onChange={e => { const newStatus = e.target.value as QuoteStatus; setQ((prev: AdminQuote) => ({ ...prev, status: newStatus })); persistQuote({ status: newStatus }); toast.success(`Estado cambiado a ${statusConfig[newStatus].label}`); }}
          className="text-xs bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] px-3 py-2 text-wood-900 outline-none"
        >
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Pieces */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-accent-gold" /> Piezas Solicitadas
            </h4>
            <div className="space-y-4">
              {q.pieces.map((p: QuotePiece, i: number) => (
                <PieceCard key={p.id} piece={p} index={i} total={q.pieces.length} />
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-accent-gold" /> Conversación con el Cliente
            </h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
              {q.messages.length === 0 && <p className="text-xs text-wood-400 text-center py-4">Sin mensajes aún</p>}
              {q.messages.map((m: QuoteMessage) => (
                <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 ${m.sender === 'admin' ? 'bg-wood-900 text-sand-100' : 'bg-sand-50 text-wood-900 border border-wood-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] ${m.sender === 'admin' ? 'text-accent-gold' : 'text-wood-500'}`}>
                        {m.sender === 'admin' ? '🏪' : '👤'} {m.senderName}
                      </span>
                      <span className={`text-[10px] ${m.sender === 'admin' ? 'text-wood-400' : 'text-wood-400'}`}>{fmtDateTime(m.date)}</span>
                    </div>
                    <p className="text-xs">{m.text}</p>
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.attachments.map((a: string, ai: number) => (
                          <span key={ai} className={`text-[10px] px-2 py-0.5 rounded-[var(--radius-button)] ${m.sender === 'admin' ? 'bg-wood-800 text-wood-300' : 'bg-[var(--surface)] text-wood-600 border border-wood-200'}`}>
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
                className="flex-1 bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] px-3 py-2 text-xs text-wood-900 outline-none focus:border-wood-400"
              />
              <button className="p-2 text-wood-400 hover:text-wood-700"><Paperclip size={14} /></button>
              <button className="p-2 text-wood-400 hover:text-wood-700"><Mail size={14} /></button>
              <button onClick={handleSendMessage} className="px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-[var(--radius-card)] hover:bg-wood-800 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4 sm:p-5">
            <h4 className="text-sm text-wood-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" /> Notas Internas
              <span className="text-[10px] text-wood-400">(el cliente NO las ve)</span>
            </h4>
            <div className="space-y-3 mb-3">
              {q.internalNotes.length === 0 && <p className="text-xs text-wood-400">Sin notas internas</p>}
              {q.internalNotes.map((n: QuoteInternalNote) => (
                <div key={n.id} className="bg-amber-50/50 border border-amber-100 rounded-[var(--radius-card)] p-3">
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
                className="flex-1 bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] px-3 py-2 text-xs text-wood-900 outline-none focus:border-wood-400"
              />
              <button onClick={handleAddNote} className="px-3 py-2 bg-amber-100 text-amber-700 text-xs rounded-[var(--radius-card)] hover:bg-amber-200 transition-colors">Agregar</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Client */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Cliente</h4>
            <p className="text-sm text-wood-900">{q.customer.name}</p>
            <p className="text-[11px] text-wood-500 mt-1">{q.customer.email}</p>
            {q.customer.phone && <p className="text-[11px] text-wood-500">{q.customer.phone}</p>}
            {q.customer.tier && (
              <div className="flex items-center gap-2 mt-2">
                {(() => { const tb = getQuoteTierBadge(q.customer.tier); return (
                <span className="text-[10px] px-2 py-0.5 rounded-[var(--radius-badge)]" style={tb.styles.badge}>
                  <TierIcon tierId={tb.tierId} size={12} /> {tb.name}
                </span>); })()}
                <span className="text-[10px] text-wood-400">{q.customer.points.toLocaleString()} puntos</span>
              </div>
            )}
            <p className="text-[11px] text-wood-500 mt-2">{q.customer.orders} pedidos previos | {fmt(q.customer.totalSpent)} gastado</p>
            <button className="text-[11px] text-accent-gold mt-2 hover:underline flex items-center gap-1">Ver perfil completo <ExternalLink size={10} /></button>
          </div>

          {/* Financial Summary */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Resumen Financiero</h4>
            <div className="space-y-1.5 text-xs">
              {q.pieces.map((p: QuotePiece, i: number) => (
                <div key={p.id} className="flex justify-between text-wood-600">
                  <span className="truncate mr-2">Pieza {i + 1}: {p.type} ×{p.quantity}</span>
                  <span className="text-wood-900 whitespace-nowrap">{fmt((p.adminPrice ?? p.autoPrice) * p.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-wood-100 pt-1.5 mt-1.5" />
              <div className="flex justify-between text-wood-600"><span>Subtotal</span><span className="text-wood-900">{fmt(subtotal)}</span></div>
              {q.discount && (
                <div className="flex justify-between text-wood-600"><span>Descuento {q.discount.reason} ({q.discount.percent}%)</span><span className="text-[var(--error)]">-{fmt(discountAmt)}</span></div>
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
              <div className="flex justify-between text-wood-600"><span>Ganancia bruta</span><span className="text-[var(--success)]">{fmt(grossProfit)}</span></div>
              <div className="flex justify-between">
                <span className="text-wood-600">Margen bruto</span>
                <span className={`${margin >= 50 ? 'text-[var(--success)]' : margin >= 30 ? 'text-amber-600' : 'text-[var(--error)]'}`}>
                  {margin}% {margin >= 50 ? '✅' : margin >= 30 ? '⚠️' : '❌'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Conditions */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Timeline y Condiciones</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-wood-500">Tiempo estimado</span><span className="text-wood-900">{q.timeline}</span></div>
              <div className="flex justify-between"><span className="text-wood-500">Validez cotización</span><span className="text-wood-900">{fmtDate(q.validUntil)}</span></div>
              {q.conditions.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] text-wood-400 uppercase">Condiciones:</p>
                  {q.conditions.map((c: QuoteCondition, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-wood-600">
                      <span className={c.checked ? 'text-[var(--success)]' : 'text-wood-300'}>{c.checked ? '☑' : '☐'}</span>
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deposit info */}
          {q.depositPaid && (
            <div className="bg-[var(--success-subtle)] rounded-[var(--radius-card)] border border-green-200 p-4">
              <h4 className="text-[11px] text-[var(--success)] uppercase tracking-wider mb-2">💰 Anticipo Registrado</h4>
              <div className="space-y-1 text-xs text-[var(--success)]">
                <p>Monto: {fmt(q.depositPaid.amount)}</p>
                <p>Método: {q.depositPaid.method}</p>
                <p>Ref: {q.depositPaid.ref}</p>
                <p>Fecha: {fmtDate(q.depositPaid.date)}</p>
              </div>
            </div>
          )}

          {/* Production Progress */}
          {q.productionProgress && (
            <div className="bg-[var(--warning-subtle)] rounded-[var(--radius-card)] border border-yellow-200 p-4">
              <h4 className="text-[11px] text-[var(--warning)] uppercase tracking-wider mb-2">🔨 Progreso de Producción</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-[var(--warning-subtle)] rounded-[var(--radius-badge)] overflow-hidden">
                  <div className="h-full bg-accent-gold rounded-[var(--radius-badge)]" style={{ width: `${(q.productionProgress.completed / q.productionProgress.total) * 100}%` }} />
                </div>
                <span className="text-xs text-[var(--warning)]">{q.productionProgress.completed}/{q.productionProgress.total} piezas</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
            <h4 className="text-[11px] text-wood-400 uppercase tracking-wider mb-3">Acciones</h4>
            <div className="space-y-2">
              <ActionButton icon={<FileText size={13} />} label="Generar PDF de cotización" onClick={() => { window.print(); }} />
              <ActionButton icon={<Mail size={13} />} label="Enviar cotización al cliente" onClick={async () => {
                try {
                  const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: `Cotización ${q.number}`, category: 'cotizacion', message: `Estimado/a ${q.customer.name},\n\nAdjunto encontrará su cotización ${q.number} por un total de ${(q.pieces.reduce((s: number, p: { adminPrice?: number; autoPrice: number; quantity: number }) => s + ((p.adminPrice || p.autoPrice) * p.quantity), 0)).toLocaleString()} MXN.\n\nVigencia: ${q.validityDays} días.\nTimeline: ${q.timeline}.\n\nQuedamos a sus órdenes.\nDavidSon's Design`, email: q.customer.email }) });
                  if (res.ok) { setQ((p: AdminQuote) => ({...p, status: p.status === 'nueva' ? 'cotizacion_enviada' : p.status})); persistQuote({ status: q.status === 'nueva' ? 'cotizacion_enviada' : q.status }); toast.success(`Cotización enviada a ${q.customer.email}`); } else throw new Error();
                } catch { toast.error('Error al enviar email'); }
              }} accent />
              <ActionButton icon={<CheckCircle size={13} />} label="Marcar como aprobada" onClick={() => { setQ((p: AdminQuote) => ({...p, status:'aprobada'})); persistQuote({ status: 'aprobada' }); toast.success('Cotización aprobada'); }} />
              <ActionButton icon={<DollarSign size={13} />} label="Registrar anticipo recibido" onClick={() => {
                setDepositAmount(String(Math.round(totalConIva * q.depositPercent / 100)));
                setShowDepositModal(true);
              }} />
              <ActionButton icon={<Hammer size={13} />} label="Iniciar producción" onClick={() => { setQ((p: AdminQuote) => ({...p, status:'en_produccion', productionProgress: { completed: 0, total: p.pieces.reduce((s, pc) => s + pc.quantity, 0) }})); persistQuote({ status: 'en_produccion', production_progress: { completed: 0, total: q.pieces.reduce((s, pc) => s + pc.quantity, 0) } }); toast.success('Producción iniciada'); }} />
              <ActionButton icon={<ShoppingCart size={13} />} label="Convertir a pedido" onClick={() => setShowConvertModal(true)} />
              <div className="border-t border-wood-100 pt-2 mt-2" />
              <ActionButton icon={<Copy size={13} />} label="Duplicar cotización" onClick={async () => {
                try {
                  const res = await fetch('/api/admin/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_email: q.customer.email, customer_name: q.customer.name, customer_phone: q.customer.phone, project_name: q.projectName ? `${q.projectName} (copia)` : 'Copia', pieces: q.pieces, discount: q.discount, conditions: q.conditions, timeline: q.timeline, validity_days: q.validityDays, deposit_percent: q.depositPercent, shipping_included: q.shippingIncluded }) });
                  if (res.ok) { onRefresh?.(); toast.success('Cotización duplicada'); } else throw new Error();
                } catch { toast.error('Error al duplicar'); }
              }} subtle />
              <ActionButton icon={<Printer size={13} />} label="Imprimir" onClick={() => window.print()} subtle />
              <ActionButton icon={<XCircle size={13} />} label="Rechazar / Cancelar" onClick={() => setShowRejectModal(true)} danger />
            </div>
          </div>
        </div>
      </div>

      {/* ── DEPOSIT MODAL ── */}
      {showDepositModal && (
        <InlineModal
          title="💰 Registrar Anticipo"
          confirmLabel="Registrar Anticipo"
          confirmColor="bg-[var(--success)]"
          onCancel={() => setShowDepositModal(false)}
          onConfirm={() => {
            const amt = parseFloat(depositAmount.replace(/[^0-9.]/g, ''));
            if (!amt || amt <= 0) { toast.error('Monto inválido'); return; }
            const depositData = { amount: amt, method: depositMethod, ref: `DEP-${Date.now()}`, date: new Date().toISOString() };
            setQ((p: AdminQuote) => ({ ...p, status: 'anticipo_recibido', depositPaid: depositData }));
            persistQuote({ status: 'anticipo_recibido', deposit_paid: depositData });
            toast.success(`Anticipo de ${fmt(amt)} registrado`);
            setShowDepositModal(false);
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Monto del anticipo</label>
              <input type="text" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] focus:border-accent-gold outline-none"
                placeholder="0.00" autoFocus />
              <p className="text-[10px] text-wood-400 mt-1">Sugerido ({q.depositPercent}%): {fmt(totalConIva * q.depositPercent / 100)}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Método de pago</label>
              <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none">
                <option>Transferencia</option>
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>OXXO</option>
                <option>PayPal</option>
              </select>
            </div>
          </div>
        </InlineModal>
      )}

      {/* ── REJECT MODAL ── */}
      {showRejectModal && (
        <InlineModal
          title="❌ Rechazar / Cancelar Cotización"
          confirmLabel="Confirmar Rechazo"
          confirmColor="bg-[var(--error)]"
          onCancel={() => setShowRejectModal(false)}
          onConfirm={() => {
            if (!rejectReason.trim()) { toast.error('Escribe un motivo'); return; }
            setQ((p: AdminQuote) => ({ ...p, status: 'rechazada', rejectionReason: rejectReason }));
            persistQuote({ status: 'rechazada', rejection_reason: rejectReason });
            toast.success('Cotización rechazada');
            setShowRejectModal(false);
            setRejectReason('');
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Motivo de rechazo</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={3} placeholder="Precio alto, timeline largo, cambió de opinión..."
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] focus:border-accent-gold outline-none resize-none" autoFocus />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Precio alto', 'Timeline largo', 'Cambió de opinión', 'Sin respuesta', 'Otro proveedor'].map(r => (
                <button key={r} onClick={() => setRejectReason(r)}
                  className={`text-[10px] px-2 py-1 rounded-[var(--radius-button)] border transition-colors ${rejectReason === r ? 'border-red-400 bg-[var(--error-subtle)] text-[var(--error)]' : 'border-wood-200 text-wood-500 hover:border-wood-400'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </InlineModal>
      )}

      {/* ── CONVERT TO ORDER MODAL ── */}
      {showConvertModal && (
        <InlineModal
          title="🛒 Convertir Cotización a Pedido"
          confirmLabel={converting ? 'Procesando...' : convertTarget === 'pos' ? 'Enviar al POS' : 'Crear Pedido'}
          confirmColor="bg-accent-gold"
          onCancel={() => !converting && setShowConvertModal(false)}
          onConfirm={async () => {
            if (converting) return;
            setConverting(true);
            try {
              const res = await fetch('/api/admin/quotes/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quote_id: q.id, target: convertTarget }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setQ((p: AdminQuote) => ({ ...p, status: 'en_produccion' }));
                onRefresh?.();
                toast.success(data.message || 'Orden creada exitosamente');
                setShowConvertModal(false);
              } else {
                toast.error(data.error || 'Error al convertir');
              }
            } catch {
              toast.error('Error de conexión');
            } finally {
              setConverting(false);
            }
          }}
        >
          <div className="space-y-4">
            <div className="bg-sand-50 rounded-[var(--radius-card)] p-3 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-wood-500">Cotización</span><span className="text-wood-900 font-bold">{q.number}</span></div>
              <div className="flex justify-between"><span className="text-wood-500">Cliente</span><span className="text-wood-900">{q.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-wood-500">Total</span><span className="text-wood-900 font-bold">{fmt(totalConIva)}</span></div>
              <div className="flex justify-between"><span className="text-wood-500">Piezas</span><span className="text-wood-900">{getPieceCount(q)}</span></div>
            </div>

            {/* Target selector */}
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-2">Destino</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConvertTarget('order')}
                  className={`p-3 rounded-[var(--radius-card)] border-2 text-center text-xs transition-all ${convertTarget === 'order' ? 'border-accent-gold bg-accent-gold/5 text-wood-900 font-bold' : 'border-wood-200 text-wood-500 hover:border-wood-400'}`}>
                  <ShoppingCart size={16} className="mx-auto mb-1" />
                  Orden Medusa
                  <span className="block text-[9px] text-wood-400 mt-0.5">Orden directa en el sistema</span>
                </button>
                <button onClick={() => setConvertTarget('pos')}
                  className={`p-3 rounded-[var(--radius-card)] border-2 text-center text-xs transition-all ${convertTarget === 'pos' ? 'border-accent-gold bg-accent-gold/5 text-wood-900 font-bold' : 'border-wood-200 text-wood-500 hover:border-wood-400'}`}>
                  <Zap size={16} className="mx-auto mb-1" />
                  Punto de Venta
                  <span className="block text-[9px] text-wood-400 mt-0.5">Aparece en historial POS</span>
                </button>
              </div>
            </div>

            {!['aprobada', 'anticipo_recibido'].includes(q.status) && (
              <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-card)] p-3">
                <p className="text-[11px] text-amber-700">⚠️ Estado actual: "{statusConfig[q.status].label}". Se recomienda convertir cuando esté aprobada o con anticipo.</p>
              </div>
            )}
          </div>
        </InlineModal>
      )}
    </div>
  );
};

// ===== ACTION BUTTON =====
const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean; subtle?: boolean; danger?: boolean }> = ({ icon, label, onClick, accent, subtle, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-[var(--radius-card)] transition-colors text-left ${
      danger ? 'text-[var(--error)] hover:bg-[var(--error-subtle)]' :
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
    <div className="border border-wood-100 rounded-[var(--radius-card)] p-4">
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
        <div className="bg-[var(--error-subtle)]/50 border border-red-100 rounded-[var(--radius-card)] p-3 mb-3">
          <p className="text-[10px] text-[var(--error)] uppercase tracking-wider mb-1">🔴 Grabado Láser</p>
          <div className="text-xs text-wood-600 space-y-0.5">
            <p>Tipo: {p.engraving.type}</p>
            <p>Complejidad: {p.engraving.complexity}</p>
            {p.engraving.zones && <p>Zonas: {p.engraving.zones.join(' + ')}</p>}
            {p.engraving.text && <p>Texto: "{p.engraving.text}"</p>}
            {p.engraving.file && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-[var(--surface)] border border-wood-200 rounded-[var(--radius-button)]">📎 {p.engraving.file}</span>
                <button className="text-[10px] text-accent-gold hover:underline">👁️ Preview</button>
                <button className="text-[10px] text-accent-gold hover:underline">⬇️ Descargar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="bg-sand-50 rounded-[var(--radius-card)] p-3">
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
          <span className={`${margin >= 50 ? 'text-[var(--success)]' : margin >= 30 ? 'text-amber-600' : 'text-[var(--error)]'}`}>
            {margin}% {margin >= 50 ? '✅' : margin >= 30 ? '⚠️' : '❌'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ===== ANALYTICS TAB (computed from real data) =====


export { QuoteDetail, InlineModal };
