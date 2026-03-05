"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Search, Filter, Plus, ChevronRight, Clock, CheckCircle,
  AlertTriangle, User, Package, Shield, Receipt, Truck, Tag,
  Send, Loader2, RefreshCw, Archive, ArrowLeft, Eye, Pencil, X,
  Wifi, WifiOff, BookOpen, BarChart3, ShieldCheck, FileText
} from 'lucide-react';
import { toast } from 'sonner';

// ═══ Types ═══
type Tab = 'tickets' | 'warranty' | 'metrics';
type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type WarrantyStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'replaced' | 'refunded';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Abierto', color: 'bg-blue-50 text-blue-600', icon: Clock },
  in_progress: { label: 'En proceso', color: 'bg-amber-50 text-amber-600', icon: Loader2 },
  waiting_customer: { label: 'Esperando cliente', color: 'bg-purple-50 text-purple-600', icon: User },
  resolved: { label: 'Resuelto', color: 'bg-green-50 text-green-600', icon: CheckCircle },
  closed: { label: 'Cerrado', color: 'bg-wood-100 text-wood-500', icon: Archive },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-wood-50 text-wood-500' },
  normal: { label: 'Normal', color: 'bg-blue-50 text-blue-600' },
  high: { label: 'Alta', color: 'bg-orange-50 text-orange-600' },
  urgent: { label: 'Urgente', color: 'bg-red-50 text-red-600' },
};

const categoryConfig: Record<string, { label: string; icon: React.ElementType }> = {
  pedido: { label: 'Pedido', icon: Package },
  envio: { label: 'Envío', icon: Truck },
  producto: { label: 'Producto', icon: Tag },
  garantia: { label: 'Garantía', icon: Shield },
  facturacion: { label: 'Facturación', icon: Receipt },
  otro: { label: 'Otro', icon: MessageSquare },
};

const warrantyStatusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Enviada', color: 'bg-blue-50 text-blue-600' },
  reviewing: { label: 'En revisión', color: 'bg-amber-50 text-amber-600' },
  approved: { label: 'Aprobada', color: 'bg-green-50 text-green-600' },
  rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-600' },
  replaced: { label: 'Reemplazada', color: 'bg-emerald-50 text-emerald-600' },
  refunded: { label: 'Reembolsada', color: 'bg-indigo-50 text-indigo-600' },
};

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// ═══ MAIN COMPONENT ═══
export const HelpDeskPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [warrantyClaims, setWarrantyClaims] = useState<any[]>([]);
  const [warrantyPolicy, setWarrantyPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [agents, setAgents] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);

  // Detail view
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Warranty detail
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  // ═══ Fetch data ═══
  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [tkRes, wrRes, polRes, agRes, rtRes] = await Promise.all([
        fetch('/api/admin/tickets').then(r => r.ok ? r.json() : null),
        fetch('/api/admin/warranty').then(r => r.ok ? r.json() : null),
        fetch('/api/admin/warranty?type=policy').then(r => r.ok ? r.json() : null),
        fetch('/api/admin/agents').then(r => r.ok ? r.json() : null),
        fetch('/api/admin/agents?type=routing').then(r => r.ok ? r.json() : null),
      ]);
      if (tkRes) setTickets(tkRes.tickets || []);
      if (wrRes) setWarrantyClaims(wrRes.claims || []);
      if (polRes?.policy) setWarrantyPolicy(polRes.policy);
      if (agRes) setAgents(agRes.agents || []);
      if (rtRes) setRoutingRules(rtRes.rules || []);
      setIsLive(true);
    } catch { setIsLive(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); const i = setInterval(() => fetchAll(true), 15000); return () => clearInterval(i); }, [fetchAll]);

  // ═══ Ticket detail ═══
  const openTicketDetail = async (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets?id=${ticket.id}`);
      if (res.ok) {
        const data = await res.json();
        setTicketMessages(data.messages || []);
      }
    } catch {}
    finally { setDetailLoading(false); }
  };

  // ═══ Send reply ═══
  const handleReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: selectedTicket.id, text: newReply.trim(), sender: 'admin', is_internal: isInternal }),
      });
      setTicketMessages(prev => [...prev, { id: Date.now(), sender: 'admin', text: newReply.trim(), is_internal: isInternal, created_at: new Date().toISOString() }]);
      setNewReply('');
      toast.success(isInternal ? 'Nota interna añadida' : 'Respuesta enviada');
    } catch { toast.error('Error al enviar'); }
    finally { setSending(false); }
  };

  // ═══ Update ticket ═══
  const updateTicket = async (id: string, updates: any) => {
    try {
      await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      toast.success('Ticket actualizado');
      fetchAll(true);
      if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, ...updates });
    } catch { toast.error('Error'); }
  };

  // ═══ Update warranty claim ═══
  const updateClaim = async (id: string, updates: any) => {
    try {
      await fetch('/api/admin/warranty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      toast.success('Garantía actualizada');
      fetchAll(true);
      if (selectedClaim?.id === id) setSelectedClaim({ ...selectedClaim, ...updates });
    } catch { toast.error('Error'); }
  };

  // ═══ Filter tickets ═══
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (departmentFilter !== 'all' && t.department !== departmentFilter) return false;
    if (agentFilter !== 'all' && t.assigned_agent_id !== agentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (t.subject || '').toLowerCase().includes(q) || (t.customer_email || '').toLowerCase().includes(q) || (t.customer_name || '').toLowerCase().includes(q) || (`T-${t.ticket_number}`).includes(q);
    }
    return true;
  });

  const departments = [...new Set(tickets.map(t => t.department).filter(Boolean))].sort();

  const filteredClaims = warrantyClaims.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.product_title || '').toLowerCase().includes(q) || (c.customer_email || '').toLowerCase().includes(q) || (c.customer_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    urgent: tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
  };
  const warrantyStats = {
    total: warrantyClaims.length,
    pending: warrantyClaims.filter(c => c.status === 'submitted' || c.status === 'reviewing').length,
    approved: warrantyClaims.filter(c => c.status === 'approved').length,
  };

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-accent-gold" />
          <h3 className="font-serif text-lg text-wood-900">Soporte & Garantías</h3>
          {ticketStats.open > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{ticketStats.open} abiertos</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-wood-100 rounded-lg p-0.5">
            {([['tickets', `Tickets (${ticketStats.total})`, MessageSquare], ['warranty', `Garantías (${warrantyStats.total})`, Shield], ['metrics', 'Métricas', BarChart3]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => { setTab(id); setSelectedTicket(null); setSelectedClaim(null); setStatusFilter('all'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${tab === id ? 'bg-white shadow-sm text-wood-900' : 'text-wood-500 hover:text-wood-700'}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <span className={`flex items-center gap-1 text-[10px] ${isLive ? 'text-green-600' : 'text-wood-400'}`}>
            {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
          </span>
          <button onClick={() => fetchAll()} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400"><RefreshCw size={12} /></button>
        </div>
      </div>

      {/* ═══ TICKETS TAB ═══ */}
      {tab === 'tickets' && !selectedTicket && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Abiertos', value: ticketStats.open, color: 'text-blue-600' },
              { label: 'En proceso', value: ticketStats.inProgress, color: 'text-amber-600' },
              { label: 'Urgentes', value: ticketStats.urgent, color: 'text-red-600' },
              { label: 'Total', value: ticketStats.total, color: 'text-wood-900' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-wood-100 p-4">
                <p className="text-[10px] text-wood-400 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-wood-100 p-3">
            <div className="flex items-center bg-sand-50 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
              <Search size={12} className="text-wood-400 mr-2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por # ticket, asunto, cliente..." className="flex-1 text-xs bg-transparent outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Estado: Todos</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Prioridad: Todas</option>
              {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Categoría: Todas</option>
              {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Área: Todas</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Agente: Todos</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.department})</option>)}
            </select>
          </div>

          {/* Ticket list */}
          <div className="bg-white rounded-xl border border-wood-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-wood-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-wood-400 text-xs">Sin tickets{statusFilter !== 'all' ? ` con estado "${statusConfig[statusFilter]?.label}"` : ''}</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Cliente</th>
                    <th className="px-4 py-2">Asunto</th>
                    <th className="px-4 py-2">Categoría</th>
                    <th className="px-4 py-2">Prioridad</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Área</th>
                    <th className="px-4 py-2">Asignado</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => {
                    const sc = statusConfig[t.status] || statusConfig.open;
                    const pc = priorityConfig[t.priority] || priorityConfig.normal;
                    const cc = categoryConfig[t.category] || categoryConfig.otro;
                    const CatIcon = cc.icon;
                    return (
                      <tr key={t.id} onClick={() => openTicketDetail(t)} className="border-b border-wood-50 hover:bg-sand-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-wood-600">T-{t.ticket_number}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-wood-900">{t.customer_name || t.customer_email?.split('@')[0]}</p>
                          <p className="text-[10px] text-wood-400">{t.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-wood-700 max-w-[200px] truncate">{t.subject}</td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1 text-[10px] text-wood-500"><CatIcon size={10} /> {cc.label}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span></td>
                        <td className="px-4 py-3 text-[10px] text-wood-500">{t.department || <span className="text-wood-300 italic">Sin asignar</span>}</td>
                        <td className="px-4 py-3 text-[10px] text-wood-600">{t.assigned_to || <span className="text-wood-300 italic">—</span>}</td>
                        <td className="px-4 py-3 text-[10px] text-wood-400 whitespace-nowrap">{fmtDate(t.created_at)}</td>
                        <td className="px-4 py-3"><ChevronRight size={12} className="text-wood-300" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══ TICKET DETAIL ═══ */}
      {tab === 'tickets' && selectedTicket && (
        <div className="space-y-4">
          <button onClick={() => { setSelectedTicket(null); setTicketMessages([]); }} className="flex items-center gap-1 text-xs text-wood-500 hover:text-wood-700"><ArrowLeft size={12} /> Volver a tickets</button>

          <div className="flex gap-4">
            {/* Main content */}
            <div className="flex-1 space-y-4">
              {/* Ticket header */}
              <div className="bg-white rounded-xl border border-wood-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-wood-900">{selectedTicket.subject}</h4>
                    <p className="text-[10px] text-wood-400 mt-1">T-{selectedTicket.ticket_number} · {selectedTicket.customer_name || selectedTicket.customer_email} · {fmtDate(selectedTicket.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(priorityConfig[selectedTicket.priority] || priorityConfig.normal).color}`}>{(priorityConfig[selectedTicket.priority] || priorityConfig.normal).label}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(statusConfig[selectedTicket.status] || statusConfig.open).color}`}>{(statusConfig[selectedTicket.status] || statusConfig.open).label}</span>
                  </div>
                </div>
                {selectedTicket.description && <p className="text-xs text-wood-600 bg-sand-50 rounded-lg p-3">{selectedTicket.description}</p>}
              </div>

              {/* Messages */}
              <div className="bg-white rounded-xl border border-wood-100 p-5">
                <h5 className="text-xs font-medium text-wood-900 uppercase tracking-wider mb-4">Conversación</h5>
                {detailLoading ? (
                  <div className="py-8 text-center text-wood-400"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                ) : ticketMessages.length === 0 ? (
                  <p className="text-xs text-wood-400 py-4 text-center">Sin mensajes aún</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {ticketMessages.map(m => (
                      <div key={m.id} className={`p-3 rounded-xl text-xs ${m.sender === 'admin' ? (m.is_internal ? 'bg-amber-50 border border-amber-200' : 'bg-wood-900 text-sand-100') : 'bg-sand-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-medium ${m.sender === 'admin' ? (m.is_internal ? 'text-amber-600' : 'text-sand-300') : 'text-wood-400'}`}>
                            {m.sender === 'admin' ? (m.is_internal ? '🔒 Nota interna' : 'Admin') : 'Cliente'}
                          </span>
                          <span className={`text-[9px] ${m.sender === 'admin' && !m.is_internal ? 'text-sand-400' : 'text-wood-300'}`}>{fmtDate(m.created_at)}</span>
                        </div>
                        <p className={m.sender === 'admin' && !m.is_internal ? 'text-sand-100' : ''}>{m.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t border-wood-100 pt-4 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="flex items-center gap-1.5 text-[10px] text-wood-500 cursor-pointer">
                        <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded border-wood-300 text-amber-500" />
                        Nota interna (no visible al cliente)
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <textarea value={newReply} onChange={e => setNewReply(e.target.value)} rows={2} placeholder={isInternal ? 'Agregar nota interna...' : 'Responder al cliente...'} className="flex-1 px-3 py-2 bg-sand-50 border border-wood-200 rounded-xl text-xs outline-none focus:border-accent-gold/40 resize-none" />
                      <button onClick={handleReply} disabled={sending || !newReply.trim()} className="px-4 py-2 bg-wood-900 text-sand-100 rounded-xl text-xs hover:bg-wood-800 disabled:opacity-50 self-end flex items-center gap-1.5"><Send size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar — actions */}
            <div className="w-64 space-y-4 shrink-0">
              {/* Status */}
              <div className="bg-white rounded-xl border border-wood-100 p-4">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider mb-3">Estado</h5>
                <div className="space-y-1.5">
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <button key={key} onClick={() => updateTicket(selectedTicket.id, { status: key })} className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${selectedTicket.status === key ? val.color + ' font-medium' : 'hover:bg-sand-50 text-wood-500'}`}>
                      <val.icon size={12} /> {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="bg-white rounded-xl border border-wood-100 p-4">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider mb-3">Prioridad</h5>
                <div className="space-y-1.5">
                  {Object.entries(priorityConfig).map(([key, val]) => (
                    <button key={key} onClick={() => updateTicket(selectedTicket.id, { priority: key })} className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${selectedTicket.priority === key ? val.color + ' font-medium' : 'hover:bg-sand-50 text-wood-500'}`}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign to agent */}
              <div className="bg-white rounded-xl border border-wood-100 p-4">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider mb-3">Asignar a</h5>
                <select value={selectedTicket.assigned_agent_id || ''} onChange={e => {
                  const agent = agents.find((a: any) => a.id === e.target.value);
                  updateTicket(selectedTicket.id, { assigned_agent_id: e.target.value || null, assigned_to: agent?.name || null, department: agent?.department || selectedTicket.department });
                }} className="w-full text-xs border border-wood-200 rounded-lg px-2 py-2 bg-white">
                  <option value="">Sin asignar</option>
                  {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name} — {a.department} ({a.openTickets} abiertos)</option>)}
                </select>
                {selectedTicket.department && <p className="text-[10px] text-wood-400 mt-2">Área: <span className="font-medium text-wood-600">{selectedTicket.department}</span></p>}
                {!selectedTicket.escalated && (
                  <button onClick={() => updateTicket(selectedTicket.id, { escalated: true, priority: 'urgent' })} className="mt-3 w-full text-[10px] text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">Escalar ticket</button>
                )}
                {selectedTicket.escalated && <p className="text-[10px] text-red-500 font-medium mt-2">Ticket escalado</p>}
              </div>

              {/* Info */}
              <div className="bg-white rounded-xl border border-wood-100 p-4 space-y-3">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider">Info</h5>
                <div><p className="text-[9px] text-wood-400">Cliente</p><p className="text-xs text-wood-900">{selectedTicket.customer_name || selectedTicket.customer_email?.split('@')[0]}</p><p className="text-[10px] text-wood-400">{selectedTicket.customer_email}</p></div>
                {selectedTicket.order_id && <div><p className="text-[9px] text-wood-400">Pedido</p><p className="text-xs text-wood-900">#{selectedTicket.order_id}</p></div>}
                <div><p className="text-[9px] text-wood-400">Categoría</p><p className="text-xs text-wood-700">{(categoryConfig[selectedTicket.category] || categoryConfig.otro).label}</p></div>
                <div><p className="text-[9px] text-wood-400">Creado</p><p className="text-xs text-wood-600">{fmtDate(selectedTicket.created_at)}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ WARRANTY TAB ═══ */}
      {tab === 'warranty' && !selectedClaim && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pendientes', value: warrantyStats.pending, color: 'text-amber-600' },
              { label: 'Aprobadas', value: warrantyStats.approved, color: 'text-green-600' },
              { label: 'Total', value: warrantyStats.total, color: 'text-wood-900' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-wood-100 p-4">
                <p className="text-[10px] text-wood-400 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-wood-100 p-3">
            <div className="flex items-center bg-sand-50 rounded-lg px-3 py-1.5 flex-1">
              <Search size={12} className="text-wood-400 mr-2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto, cliente..." className="flex-1 text-xs bg-transparent outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="all">Estado: Todos</option>
              {Object.entries(warrantyStatusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Claims list */}
          <div className="bg-white rounded-xl border border-wood-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-wood-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center text-wood-400 text-xs">Sin reclamos de garantía</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Cliente</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Defecto</th>
                    <th className="px-4 py-2">Garantía</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map(c => {
                    const ws = warrantyStatusConfig[c.status] || warrantyStatusConfig.submitted;
                    return (
                      <tr key={c.id} onClick={() => setSelectedClaim(c)} className="border-b border-wood-50 hover:bg-sand-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-wood-600">W-{c.claim_number}</td>
                        <td className="px-4 py-3 text-xs text-wood-700">{c.customer_name || c.customer_email?.split('@')[0]}</td>
                        <td className="px-4 py-3 text-xs text-wood-900 max-w-[150px] truncate">{c.product_title}</td>
                        <td className="px-4 py-3 text-xs text-wood-600">{c.defect_type}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_within_warranty ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{c.is_within_warranty ? 'Vigente' : 'Vencida'}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ws.color}`}>{ws.label}</span></td>
                        <td className="px-4 py-3 text-[10px] text-wood-400 whitespace-nowrap">{fmtDate(c.created_at)}</td>
                        <td className="px-4 py-3"><ChevronRight size={12} className="text-wood-300" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══ WARRANTY CLAIM DETAIL ═══ */}
      {tab === 'warranty' && selectedClaim && (
        <div className="space-y-4">
          <button onClick={() => setSelectedClaim(null)} className="flex items-center gap-1 text-xs text-wood-500 hover:text-wood-700"><ArrowLeft size={12} /> Volver</button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-wood-100 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-wood-900">Garantía W-{selectedClaim.claim_number}</h4>
                  <p className="text-[10px] text-wood-400 mt-1">{selectedClaim.customer_name || selectedClaim.customer_email} · Pedido #{selectedClaim.order_display_id || selectedClaim.order_id}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(warrantyStatusConfig[selectedClaim.status] || warrantyStatusConfig.submitted).color}`}>{(warrantyStatusConfig[selectedClaim.status] || warrantyStatusConfig.submitted).label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sand-50 rounded-lg p-3"><p className="text-[9px] text-wood-400 uppercase">Producto</p><p className="text-xs text-wood-900 font-medium">{selectedClaim.product_title}</p></div>
                <div className="bg-sand-50 rounded-lg p-3"><p className="text-[9px] text-wood-400 uppercase">Tipo de defecto</p><p className="text-xs text-wood-900">{selectedClaim.defect_type}</p></div>
                <div className="bg-sand-50 rounded-lg p-3"><p className="text-[9px] text-wood-400 uppercase">Fecha de compra</p><p className="text-xs text-wood-900">{selectedClaim.purchase_date ? fmtDate(selectedClaim.purchase_date) : '—'}</p></div>
                <div className="bg-sand-50 rounded-lg p-3"><p className="text-[9px] text-wood-400 uppercase">Garantía</p><p className="text-xs"><span className={selectedClaim.is_within_warranty ? 'text-green-600 font-medium' : 'text-red-500'}>{selectedClaim.is_within_warranty ? `Vigente (${selectedClaim.warranty_days} días)` : 'Vencida'}</span></p></div>
              </div>
              {selectedClaim.defect_description && <div className="bg-sand-50 rounded-lg p-3"><p className="text-[9px] text-wood-400 uppercase mb-1">Descripción</p><p className="text-xs text-wood-700">{selectedClaim.defect_description}</p></div>}
              {selectedClaim.photo_urls?.length > 0 && (
                <div><p className="text-[9px] text-wood-400 uppercase mb-2">Fotos evidencia</p><div className="flex gap-2">{selectedClaim.photo_urls.map((url: string, i: number) => <img key={i} src={url} alt={`Evidencia ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border" />)}</div></div>
              )}
              {/* Admin notes */}
              <div>
                <p className="text-[9px] text-wood-400 uppercase mb-1">Notas admin</p>
                <textarea value={selectedClaim.admin_notes || ''} onChange={e => setSelectedClaim({ ...selectedClaim, admin_notes: e.target.value })} rows={2} placeholder="Agregar notas internas..." className="w-full px-3 py-2 bg-sand-50 border border-wood-200 rounded-lg text-xs outline-none resize-none" />
                <button onClick={() => updateClaim(selectedClaim.id, { admin_notes: selectedClaim.admin_notes })} className="mt-1 text-[10px] text-accent-gold hover:underline">Guardar notas</button>
              </div>
            </div>

            {/* Actions sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-wood-100 p-4">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider mb-3">Cambiar estado</h5>
                <div className="space-y-1.5">
                  {Object.entries(warrantyStatusConfig).map(([key, val]) => (
                    <button key={key} onClick={() => updateClaim(selectedClaim.id, { status: key })} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedClaim.status === key ? val.color + ' font-medium' : 'hover:bg-sand-50 text-wood-500'}`}>{val.label}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-wood-100 p-4">
                <h5 className="text-[10px] font-medium text-wood-400 uppercase tracking-wider mb-3">Resolución</h5>
                <select value={selectedClaim.resolution_type || ''} onChange={e => updateClaim(selectedClaim.id, { resolution_type: e.target.value })} className="w-full text-xs border border-wood-200 rounded-lg px-2 py-1.5 bg-white mb-2">
                  <option value="">Seleccionar resolución</option>
                  <option value="replacement">Reemplazo de producto</option>
                  <option value="refund">Reembolso completo</option>
                  <option value="partial_refund">Reembolso parcial</option>
                  <option value="repair">Reparación</option>
                  <option value="no_action">Sin acción</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ METRICS TAB ═══ */}
      {tab === 'metrics' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tickets abiertos', value: ticketStats.open, sub: `de ${ticketStats.total} total` },
            { label: 'Tickets urgentes', value: ticketStats.urgent, sub: 'alta + urgente' },
            { label: 'Garantías pendientes', value: warrantyStats.pending, sub: `de ${warrantyStats.total} total` },
            { label: 'Garantías aprobadas', value: warrantyStats.approved, sub: warrantyStats.total > 0 ? `${Math.round((warrantyStats.approved / warrantyStats.total) * 100)}% aprobación` : '0%' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-wood-100 p-5">
              <p className="text-[10px] text-wood-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-3xl font-bold text-wood-900 mt-1">{m.value}</p>
              <p className="text-[10px] text-wood-400 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
