"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Headphones, Search, Clock, CheckCircle, AlertTriangle,
  MessageSquare, User, Send, Paperclip, Tag,
  BarChart3, Star, Zap, BookOpen, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
type HelpTab = 'inbox' | 'faq' | 'metrics';

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string | null;
  orderId: string | null;
  created: string;
  lastReply: string;
  messages: number;
  channel: 'email' | 'chat' | 'whatsapp';
}

interface ChatMessage {
  id: string;
  from: 'customer' | 'agent';
  name: string;
  text: string;
  time: string;
}

const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'Nuevo', color: 'text-blue-600', bg: 'bg-blue-50' },
  assigned: { label: 'Asignado', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  in_progress: { label: 'En progreso', color: 'text-amber-600', bg: 'bg-amber-50' },
  waiting_customer: { label: 'Esperando cliente', color: 'text-purple-600', bg: 'bg-purple-50' },
  resolved: { label: 'Resuelto', color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: 'Cerrado', color: 'text-wood-500', bg: 'bg-wood-50' },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string; dot: string }> = {
  low: { label: 'Baja', color: 'text-wood-400', dot: 'bg-wood-300' },
  normal: { label: 'Normal', color: 'text-blue-500', dot: 'bg-blue-400' },
  high: { label: 'Alta', color: 'text-amber-500', dot: 'bg-amber-400' },
  urgent: { label: 'Urgente', color: 'text-red-500', dot: 'bg-red-500' },
};

const mockTickets: Ticket[] = [
  { id: 'TK-401', subject: 'Mi tabla llego con una esquina danada', customer: 'Maria Garcia', email: 'maria@email.com', category: 'Envio', priority: 'high', status: 'in_progress', assignee: 'Sofia (Soporte)', orderId: '#162', created: '28 Feb', lastReply: 'Hace 2h', messages: 4, channel: 'email' },
  { id: 'TK-400', subject: 'Quiero saber si hacen tablas de 60cm', customer: 'Pedro Sanchez', email: 'pedro@email.com', category: 'Pre-venta', priority: 'normal', status: 'new', assignee: null, orderId: null, created: '28 Feb', lastReply: 'Hace 4h', messages: 1, channel: 'chat' },
  { id: 'TK-399', subject: 'No puedo subir mi archivo para grabado', customer: 'Ana Lopez', email: 'ana@email.com', category: 'Grabado laser', priority: 'normal', status: 'assigned', assignee: 'Carlos (Taller)', orderId: '#160', created: '27 Feb', lastReply: 'Hace 6h', messages: 3, channel: 'whatsapp' },
  { id: 'TK-398', subject: 'Solicito factura CFDI para pedido #155', customer: 'Roberto Corp SA', email: 'roberto@corp.com', category: 'Facturacion', priority: 'normal', status: 'waiting_customer', assignee: 'Sofia (Soporte)', orderId: '#155', created: '27 Feb', lastReply: 'Hace 1d', messages: 5, channel: 'email' },
  { id: 'TK-397', subject: 'Estado de mi cotizacion COT-2026-042', customer: 'Laura Martinez', email: 'laura@email.com', category: 'Cotizacion', priority: 'low', status: 'resolved', assignee: 'David (Admin)', orderId: null, created: '26 Feb', lastReply: 'Hace 2d', messages: 6, channel: 'email' },
  { id: 'TK-396', subject: 'Mi cuenta no me deja ver mis puntos', customer: 'Miguel Torres', email: 'miguel@email.com', category: 'Cuenta', priority: 'normal', status: 'resolved', assignee: 'Sofia (Soporte)', orderId: null, created: '25 Feb', lastReply: 'Hace 3d', messages: 3, channel: 'chat' },
  { id: 'TK-395', subject: 'El grabado no quedo como el preview', customer: 'Sofia Ruiz', email: 'sofia@email.com', category: 'Grabado laser', priority: 'urgent', status: 'in_progress', assignee: 'Carlos (Taller)', orderId: '#148', created: '24 Feb', lastReply: 'Hace 1d', messages: 8, channel: 'whatsapp' },
];

const mockMessages: ChatMessage[] = [
  { id: '1', from: 'customer', name: 'Maria Garcia', text: 'Hola, recibi mi tabla de Parota hoy pero tiene una esquina danada. Adjunto fotos.', time: '10:30 AM' },
  { id: '2', from: 'agent', name: 'Sofia (Soporte)', text: 'Hola Maria, lamento mucho lo sucedido. Ya vi las fotos y confirmo el dano. Vamos a procesar una devolucion o reenvio, lo que prefieras.', time: '10:45 AM' },
  { id: '3', from: 'customer', name: 'Maria Garcia', text: 'Prefiero un cambio por favor, la tabla es hermosa pero no puedo usarla con ese dano.', time: '11:02 AM' },
  { id: '4', from: 'agent', name: 'Sofia (Soporte)', text: 'Perfecto, ya cree la solicitud de cambio RMA-001. Te enviaremos la guia de recoleccion por email. La nueva tabla sale en 3-5 dias habiles.', time: '11:15 AM' },
];

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className} style={style}>{children}</div>;
}

// ===== TICKET DETAIL =====
function TicketDetail({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const st = statusConfig[ticket.status];
  const pr = priorityConfig[ticket.priority];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-wood-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose} className="text-wood-400 hover:text-wood-600 lg:hidden"><X size={16} /></button>
          <div className="min-w-0">
            <h3 className="text-xs font-medium text-wood-900 truncate">{ticket.subject}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-wood-400">{ticket.id}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
              <span className="flex items-center gap-1 text-[10px]"><span className={'w-1.5 h-1.5 rounded-full ' + pr.dot} /><span className={pr.color}>{pr.label}</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <select defaultValue={ticket.status} onChange={() => toast.success('Estado actualizado')} className="border border-wood-200 rounded-lg px-2 py-1 text-[10px] bg-white">
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Info bar */}
      <div className="px-4 py-2 bg-sand-50 border-b border-wood-100 flex flex-wrap items-center gap-3 text-[10px] text-wood-500">
        <span><User size={10} className="inline mr-1" />{ticket.customer}</span>
        <span>📧 {ticket.email}</span>
        <span><Tag size={10} className="inline mr-1" />{ticket.category}</span>
        {ticket.orderId && <span className="text-accent-gold cursor-pointer hover:underline">Pedido {ticket.orderId}</span>}
        {ticket.assignee && <span>→ {ticket.assignee}</span>}
        <span className="ml-auto"><Clock size={10} className="inline mr-1" />Creado: {ticket.created}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map(msg => (
          <div key={msg.id} className={'flex ' + (msg.from === 'agent' ? 'justify-end' : 'justify-start')}>
            <div className={'max-w-[80%] ' + (msg.from === 'agent' ? 'bg-accent-gold/10 border-accent-gold/20' : 'bg-sand-50 border-wood-100') + ' border rounded-xl px-4 py-2.5'}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium text-wood-900">{msg.name}</span>
                <span className="text-[9px] text-wood-400">{msg.time}</span>
              </div>
              <p className="text-xs text-wood-700 leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply */}
      <div className="px-4 py-3 border-t border-wood-100">
        <div className="flex items-center gap-2 mb-2">
          <button className="text-[10px] text-wood-500 border border-wood-200 rounded px-2 py-0.5 hover:bg-wood-50">Respuestas rapidas ▼</button>
          <button className="text-[10px] text-wood-500 border border-wood-200 rounded px-2 py-0.5 hover:bg-wood-50 flex items-center gap-1"><Zap size={8} /> Nota interna</button>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 border border-wood-200 rounded-lg overflow-hidden">
            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Escribe una respuesta..." rows={2} className="w-full px-3 py-2 text-xs outline-none resize-none" />
            <div className="flex items-center px-2 py-1 bg-sand-50 border-t border-wood-100">
              <button className="p-1 text-wood-400 hover:text-wood-600"><Paperclip size={12} /></button>
            </div>
          </div>
          <button onClick={() => { if (reply.trim()) { toast.success('Respuesta enviada'); setReply(''); } }} className="p-2.5 bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== FAQ TAB =====
function FaqTab() {
  const faqs = [
    { q: 'Cuales son los tiempos de envio?', a: 'Hermosillo: mismo dia (2-4h). Nacional: 3-5 dias habiles con Estafeta, 2-3 con DHL.', views: 342 },
    { q: 'Puedo devolver un producto con grabado?', a: 'Los productos con grabado laser son personalizados y no aceptan devolucion, excepto si llegan danados.', views: 218 },
    { q: 'Como funciona el grabado laser?', a: 'Sube tu diseno en SVG, PNG o PDF. Nuestro equipo lo revisa y te enviaremos un preview antes de proceder.', views: 195 },
    { q: 'Que maderas utilizan?', a: 'Trabajamos con Parota, Nogal, Cerezo y Maple mexicanos. Cada pieza es unica por las vetas naturales.', views: 167 },
    { q: 'Hacen piezas personalizadas?', a: 'Si, solicita una cotizacion en nuestra seccion de Cotizaciones. Tiempo estimado: 4-6 semanas.', views: 145 },
    { q: 'Cuales son los metodos de pago?', a: 'Aceptamos Visa, Mastercard, Amex (via Stripe), MercadoPago (debito, OXXO, SPEI) y transferencia bancaria para cotizaciones.', views: 134 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-wood-400">Base de conocimiento publica para clientes</p>
        <button className="px-3 py-1.5 text-xs text-accent-gold border border-accent-gold/30 rounded-lg hover:bg-accent-gold/5 flex items-center gap-1"><Plus size={10} /> Nueva pregunta</button>
      </div>
      <Card className="divide-y divide-wood-50">
        {faqs.map((faq, i) => (
          <div key={i} className="p-4 hover:bg-sand-50/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-wood-900">{faq.q}</p>
              <span className="text-[9px] text-wood-400">{faq.views} vistas</span>
            </div>
            <p className="text-[11px] text-wood-500 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ===== METRICS TAB =====
function MetricsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tickets abiertos', value: '12', icon: MessageSquare, color: 'text-blue-500' },
          { label: 'Tiempo 1ra respuesta', value: '28 min', icon: Clock, color: 'text-amber-500' },
          { label: 'Tiempo resolucion', value: '4.2h', icon: CheckCircle, color: 'text-green-500' },
          { label: 'CSAT promedio', value: '4.6/5', icon: Star, color: 'text-accent-gold' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <s.icon size={14} className={s.color + ' mb-2'} />
            <p className="text-lg font-serif text-wood-900">{s.value}</p>
            <p className="text-[10px] text-wood-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider mb-3">Por categoria</h4>
          {[
            { cat: 'Envio', count: 15, pct: 30 },
            { cat: 'Pre-venta', count: 10, pct: 20 },
            { cat: 'Grabado laser', count: 8, pct: 16 },
            { cat: 'Pedido', count: 7, pct: 14 },
            { cat: 'Cotizacion', count: 5, pct: 10 },
            { cat: 'Facturacion', count: 3, pct: 6 },
            { cat: 'Cuenta', count: 2, pct: 4 },
          ].map(c => (
            <div key={c.cat} className="flex items-center gap-3 py-1.5">
              <span className="text-xs text-wood-700 w-24">{c.cat}</span>
              <div className="flex-1 h-1.5 bg-wood-100 rounded-full"><div className="h-full bg-accent-gold rounded-full" style={{ width: c.pct + '%' }} /></div>
              <span className="text-[10px] text-wood-400 w-6 text-right">{c.count}</span>
            </div>
          ))}
        </Card>

        <Card className="p-5">
          <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider mb-3">Rendimiento por agente</h4>
          {[
            { name: 'Sofia (Soporte)', resolved: 28, avg: '3.8h', csat: 4.7 },
            { name: 'Carlos (Taller)', resolved: 15, avg: '5.2h', csat: 4.5 },
            { name: 'David (Admin)', resolved: 8, avg: '2.1h', csat: 4.9 },
          ].map(a => (
            <div key={a.name} className="flex items-center gap-3 py-2 border-b border-wood-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-accent-gold/20 flex items-center justify-center text-[10px] font-bold text-accent-gold">{a.name[0]}</div>
              <div className="flex-1">
                <p className="text-xs font-medium text-wood-900">{a.name}</p>
                <p className="text-[10px] text-wood-400">{a.resolved} resueltos · Avg: {a.avg}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <Star size={10} className="text-amber-400" fill="currentColor" />
                <span className="text-xs text-wood-700">{a.csat}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ===== MAIN =====
export const HelpDeskPage: React.FC = () => {
  const [tab, setTab] = useState<HelpTab>('inbox');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = mockTickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = mockTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;

  const tabs: Array<{ id: HelpTab; label: string; icon: React.ElementType }> = [
    { id: 'inbox', label: `Bandeja (${openCount})`, icon: MessageSquare },
    { id: 'faq', label: 'Base de conocimiento', icon: BookOpen },
    { id: 'metrics', label: 'Metricas', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-wood-900 flex items-center gap-2">
            <Headphones size={20} className="text-accent-gold" /> Centro de Soporte
          </h1>
          <p className="text-xs text-wood-400 mt-0.5">Gestiona tickets, chat en vivo y base de conocimiento</p>
        </div>
        <button onClick={() => toast.success('Nuevo ticket creado')} className="px-3 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
          <Plus size={12} /> Nuevo ticket
        </button>
      </div>

      <div className="flex gap-1 border-b border-wood-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedTicket(null); }}
            className={'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 ' + (tab === t.id ? 'border-accent-gold text-accent-gold font-medium' : 'border-transparent text-wood-500 hover:text-wood-700')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 lg:gap-0">
          {/* Ticket list */}
          <Card className={'overflow-hidden flex flex-col ' + (selectedTicket ? 'hidden lg:flex' : '')}>
            <div className="px-3 py-2 border-b border-wood-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-wood-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tickets..." className="w-full pl-8 pr-3 py-1.5 border border-wood-200 rounded-lg text-[11px] outline-none" />
              </div>
              <div className="flex gap-1 mt-2 overflow-x-auto">
                {(['all', 'new', 'in_progress', 'waiting_customer'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={'px-2 py-0.5 text-[9px] rounded-full whitespace-nowrap transition-colors ' + (statusFilter === s ? 'bg-accent-gold/10 text-accent-gold font-medium' : 'text-wood-400 hover:bg-wood-50')}>
                    {s === 'all' ? 'Todos' : statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-wood-50" style={{ maxHeight: '550px' }}>
              {filtered.map(t => {
                const st = statusConfig[t.status];
                const pr = priorityConfig[t.priority];
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button key={t.id} onClick={() => setSelectedTicket(t)}
                    className={'w-full text-left px-4 py-3 transition-colors ' + (isSelected ? 'bg-accent-gold/5 border-l-2 border-l-accent-gold' : 'hover:bg-sand-50/50 border-l-2 border-l-transparent')}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={'w-1.5 h-1.5 rounded-full ' + pr.dot} />
                        <span className="text-[10px] font-mono text-wood-400">{t.id}</span>
                        <span className="text-[9px] text-wood-300">·</span>
                        <span className="text-[9px] text-wood-400">{t.channel === 'email' ? '📧' : t.channel === 'chat' ? '💬' : '📱'}</span>
                      </div>
                      <span className="text-[9px] text-wood-400">{t.lastReply}</span>
                    </div>
                    <p className="text-[11px] font-medium text-wood-900 truncate">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-wood-500">{t.customer}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Ticket detail */}
          {selectedTicket ? (
            <Card className="overflow-hidden flex flex-col lg:ml-0 lg:rounded-l-none lg:border-l-0" style={{ minHeight: '550px' }}>
              <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
            </Card>
          ) : (
            <Card className="hidden lg:flex items-center justify-center text-center p-8 lg:rounded-l-none lg:border-l-0" style={{ minHeight: '550px' }}>
              <div>
                <MessageSquare size={32} className="text-wood-200 mx-auto mb-3" />
                <p className="text-xs text-wood-400">Selecciona un ticket para ver los detalles</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'faq' && <FaqTab />}
      {tab === 'metrics' && <MetricsTab />}
    </div>
  );
};