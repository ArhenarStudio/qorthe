"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Archive, Loader2, Wifi, WifiOff, RefreshCw,
  Search, Settings2, Zap, HelpCircle, User, Package, Award, DollarSign,
  Plus, Trash2, Save, Clock, CheckCheck, ChevronRight, X, MessageCircle,
  Bot, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';
import { createClient } from '@/lib/supabase/client';

// ═══ Types ═══
interface Conversation { id: string; customer_email: string; customer_name: string; status: string; unread_admin: number; last_message_at: string; last_message_preview: string; }
interface Message { id: string; sender: string; text: string; created_at: string; read: boolean; }
interface CustomerInfo { email: string; name: string; orders: any[]; orderCount: number; tier: string; points: number; lifetimeSpend: number; }
interface ChatConfig { welcome_message: string; away_message: string; auto_replies: any[]; faqs: any[]; pre_chat_form: any; business_hours: any; quick_replies: string[]; }

type Tab = 'conversations' | 'config';

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const tierColors: Record<string, string> = { pino: 'bg-green-100 text-green-700', nogal: 'bg-amber-100 text-amber-700', parota: 'bg-orange-100 text-orange-700', ebano: 'bg-stone-800 text-stone-100' };

export const AdminChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('conversations');
  // primitivos via src/theme/primitives — leen de useTheme() directamente
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [isLive, setIsLive] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Config state
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configDirty, setConfigDirty] = useState(false);

  // ═══ Fetch conversations ═══
  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/admin/chat?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setTotalUnread(data.stats?.unread || 0);
        setIsLive(true);
      }
    } catch { if (!silent) setIsLive(false); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchConversations(); const i = setInterval(() => fetchConversations(true), 10000); return () => clearInterval(i); }, [fetchConversations]);

  // ═══ Fetch messages + customer info ═══
  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    setCustomerInfo(null);
    try {
      const res = await fetch(`/api/admin/chat?id=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.customerInfo) setCustomerInfo(data.customerInfo);
      }
    } catch { toast.error('Error cargando mensajes'); }
    finally { setMessagesLoading(false); }
  }, []);

  const selectConversation = (conv: Conversation) => { setSelectedConv(conv); fetchMessages(conv.id); };

  // ═══ Realtime ═══
  useEffect(() => {
    if (!selectedConv) return;
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase.channel(`admin-chat-${selectedConv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConv.id}` }, (p: any) => {
        setMessages(prev => [...prev, p.new]);
        fetchConversations(true);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, fetchConversations]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ═══ Send / Close ═══
  const handleSend = async (text?: string) => {
    const msg = (text || newMessage).trim();
    if (!msg || !selectedConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: selectedConv.id, text: msg }) });
      if (!res.ok) throw new Error();
      setNewMessage('');
      fetchConversations(true);
    } catch { toast.error('Error al enviar'); }
    finally { setSending(false); }
  };

  const handleClose = async (convId: string) => {
    await fetch('/api/admin/chat', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: convId, status: 'closed' }) });
    toast.success('Conversación cerrada');
    fetchConversations();
    if (selectedConv?.id === convId) { setSelectedConv(null); setMessages([]); setCustomerInfo(null); }
  };

  // ═══ Config ═══
  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/admin/chat/config');
      if (res.ok) { const data = await res.json(); if (data.config) setConfig(data.config); }
    } catch (_err) { void _err; }
    finally { setConfigLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'config') fetchConfig(); }, [activeTab, fetchConfig]);

  const saveConfig = async () => {
    if (!config) return;
    try {
      const res = await fetch('/api/admin/chat/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      if (!res.ok) throw new Error();
      toast.success('Configuración guardada');
      setConfigDirty(false);
    } catch { toast.error('Error al guardar'); }
  };

  const updateConfig = (key: string, value: any) => { setConfig(prev => prev ? { ...prev, [key]: value } : prev); setConfigDirty(true); };

  const filtered = conversations.filter(c => !searchQ || c.customer_email.toLowerCase().includes(searchQ.toLowerCase()) || (c.customer_name || '').toLowerCase().includes(searchQ.toLowerCase()));
  const fmtTime = (d: string) => { const date = new Date(d); const diffH = (Date.now() - date.getTime()) / 3600000; return diffH < 24 ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }); };

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={18} className="text-[var(--admin-accent)]" />
          <h3 className="font-serif text-lg text-[var(--admin-text)]">Chat en Vivo</h3>
          {totalUnread > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{totalUnread}</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--admin-surface2)] rounded-lg p-0.5">
            {([['conversations', 'Conversaciones', MessageCircle], ['config', 'Configuración', Settings2]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${activeTab === id ? 'bg-[var(--admin-surface)] shadow-sm text-[var(--admin-text)]' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]'}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <span className={`flex items-center gap-1 text-[10px] ${isLive ? 'text-green-600' : 'text-[var(--admin-muted)]'}`}>
            {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
          </span>
        </div>
      </div>

      {/* ═══ TAB: CONVERSATIONS ═══ */}
      {activeTab === 'conversations' && (
        <div className="flex gap-4 h-[620px]">
          {/* Left: List */}
          <div className="w-72 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="p-3 border-b border-[var(--admin-border)] space-y-2">
              <div className="flex items-center bg-[var(--admin-surface2)] rounded-lg px-3 py-1.5">
                <Search size={12} className="text-[var(--admin-muted)] mr-2" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar..." className="flex-1 text-xs bg-transparent outline-none text-[var(--admin-text)]" />
              </div>
              <div className="flex gap-1">
                {(['open', 'closed', 'all'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`text-[10px] px-2 py-1 rounded-md ${statusFilter === s ? 'bg-wood-900 text-white' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]'}`}>
                    {s === 'open' ? 'Abiertas' : s === 'closed' ? 'Cerradas' : 'Todas'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="flex items-center justify-center py-12 text-[var(--admin-muted)]"><Loader2 className="w-4 h-4 animate-spin" /></div>
              : filtered.length === 0 ? <div className="text-center py-12 text-[var(--admin-muted)] text-xs">Sin conversaciones</div>
              : filtered.map(conv => (
                <button key={conv.id} onClick={() => selectConversation(conv)} className={`w-full text-left p-3 border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface2)]/50 transition-colors ${selectedConv?.id === conv.id ? 'bg-[var(--admin-accent)]/5 border-l-2 border-l-accent-gold' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--admin-text)] truncate max-w-[140px]">{conv.customer_name || conv.customer_email.split('@')[0]}</span>
                    <span className="text-[10px] text-[var(--admin-muted)]">{fmtTime(conv.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[var(--admin-text-secondary)] truncate max-w-[160px]">{conv.last_message_preview || 'Nueva'}</p>
                    {conv.unread_admin > 0 && <span className="bg-[var(--admin-accent)] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unread_admin}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Messages */}
          <div className="flex-1 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-col overflow-hidden">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-[var(--admin-muted)]"><MessageSquare className="w-10 h-10 opacity-30" /></div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-surface2)]/50">
                  <div>
                    <p className="text-sm font-medium text-[var(--admin-text)]">{selectedConv.customer_name || selectedConv.customer_email.split('@')[0]}</p>
                    <p className="text-[10px] text-[var(--admin-muted)]">{selectedConv.customer_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowCustomerPanel(!showCustomerPanel)} className="text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] flex items-center gap-1"><User size={10} /> Info</button>
                    {selectedConv.status === 'open' && <button onClick={() => handleClose(selectedConv.id)} className="text-[10px] text-[var(--admin-muted)] hover:text-red-500 flex items-center gap-1"><Archive size={10} /> Cerrar</button>}
                  </div>
                </div>

                {/* Quick replies bar */}
                {config?.quick_replies && config.quick_replies.length > 0 && selectedConv.status === 'open' && (
                  <div className="px-3 py-2 border-b border-[var(--admin-border)] flex gap-1.5 overflow-x-auto">
                    <Zap size={10} className="text-[var(--admin-accent)] shrink-0 mt-1" />
                    {config.quick_replies.map((qr: string, i: number) => (
                      <button key={i} onClick={() => handleSend(qr)} className="text-[10px] px-2.5 py-1 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-full whitespace-nowrap hover:bg-[var(--admin-accent)]/20 transition-colors">{qr}</button>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? <div className="flex items-center justify-center py-8 text-[var(--admin-muted)]"><Loader2 className="w-4 h-4 animate-spin" /></div>
                  : messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${m.sender === 'admin' ? 'bg-wood-900 text-sand-100 rounded-br-none' : m.sender === 'system' ? 'bg-[var(--admin-surface2)] text-[var(--admin-muted)] text-center italic max-w-full' : 'bg-[var(--admin-surface2)] text-[var(--admin-text)] rounded-bl-none'}`}>
                        <p>{m.text}</p>
                        <p className={`text-[9px] mt-1 ${m.sender === 'admin' ? 'text-sand-300' : 'text-[var(--admin-muted)]'}`}>
                          {new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          {m.sender === 'admin' && m.read && <CheckCheck size={10} className="inline ml-1" />}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {selectedConv.status === 'open' && (
                  <div className="p-3 border-t border-[var(--admin-border)] flex gap-2">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Escribe tu respuesta..." className="flex-1 px-4 py-2.5 bg-[var(--admin-surface2)] border border-[var(--admin-border)] rounded-xl text-xs outline-none focus:border-[var(--admin-accent)]/40" />
                    <button onClick={() => handleSend()} disabled={sending || !newMessage.trim()} className="px-4 py-2.5 bg-wood-900 text-sand-100 rounded-xl text-xs hover:bg-wood-800 disabled:opacity-50 flex items-center gap-1.5"><Send size={12} /></button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Customer Info Panel */}
          {showCustomerPanel && selectedConv && (
            <div className="w-64 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-[var(--admin-border)]">
                <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider flex items-center gap-1.5"><User size={12} /> Cliente</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!customerInfo ? (
                  <div className="text-center py-8 text-[var(--admin-muted)]"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                ) : (
                  <>
                    {/* Name & Email */}
                    <div>
                      <p className="text-sm font-medium text-[var(--admin-text)]">{customerInfo.name}</p>
                      <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{customerInfo.email}</p>
                    </div>

                    {/* Tier */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tierColors[customerInfo.tier] || 'bg-[var(--admin-surface2)] text-[var(--admin-text-secondary)]'}`}>{customerInfo.tier}</span>
                      <span className="text-[10px] text-[var(--admin-text-secondary)]">{customerInfo.points.toLocaleString()} pts</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[var(--admin-surface2)] rounded-lg p-2">
                        <p className="text-[10px] text-[var(--admin-muted)]">Pedidos</p>
                        <p className="text-sm font-medium text-[var(--admin-text)]">{customerInfo.orderCount}</p>
                      </div>
                      <div className="bg-[var(--admin-surface2)] rounded-lg p-2">
                        <p className="text-[10px] text-[var(--admin-muted)]">Gasto total</p>
                        <p className="text-sm font-medium text-[var(--admin-text)]">{fmt(customerInfo.lifetimeSpend)}</p>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    {customerInfo.orders.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider mb-2 flex items-center gap-1"><Package size={10} /> Últimos pedidos</p>
                        <div className="space-y-1.5">
                          {customerInfo.orders.slice(0, 5).map((o: any) => (
                            <div key={o.id} className="flex items-center justify-between text-[11px] bg-[var(--admin-surface2)]/50 rounded-lg px-2 py-1.5">
                              <span className="text-[var(--admin-text-secondary)]">#{o.id}</span>
                              <span className="text-[var(--admin-text)] font-medium">{fmt(o.total)}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${o.status === 'fulfilled' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{o.status === 'fulfilled' ? 'Entregado' : 'Pendiente'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: CONFIG ═══ */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {configLoading || !config ? (
            <div className="flex items-center justify-center py-20 text-[var(--admin-muted)]"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando configuración...</div>
          ) : (
            <>
              {/* Save bar */}
              {configDirty && (
                <div className="bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-[var(--admin-accent)] font-medium">Tienes cambios sin guardar</p>
                  <button onClick={saveConfig} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-xs hover:bg-[var(--admin-accent)]/90"><Save size={12} /> Guardar</button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Welcome & Away Messages */}
                <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
                  <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider mb-4 flex items-center gap-1.5"><MessageCircle size={12} /> Mensajes Automáticos</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Mensaje de bienvenida</label>
                      <textarea value={config.welcome_message} onChange={e => updateConfig('welcome_message', e.target.value)} rows={3} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40 resize-none" />
                      <p className="text-[9px] text-[var(--admin-muted)] mt-1">Se muestra al cliente cuando abre el chat.</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Mensaje fuera de horario</label>
                      <textarea value={config.away_message} onChange={e => updateConfig('away_message', e.target.value)} rows={3} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40 resize-none" />
                      <p className="text-[9px] text-[var(--admin-muted)] mt-1">Se muestra cuando el equipo no está disponible.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Replies */}
                <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
                  <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider mb-4 flex items-center gap-1.5"><Zap size={12} /> Respuestas Rápidas</h4>
                  <p className="text-[10px] text-[var(--admin-muted)] mb-3">Botones de respuesta rápida que aparecen arriba del campo de texto.</p>
                  <div className="space-y-2">
                    {(config.quick_replies || []).map((qr: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={qr} onChange={e => { const arr = [...config.quick_replies]; arr[i] = e.target.value; updateConfig('quick_replies', arr); }} className="flex-1 border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--admin-accent)]/40" />
                        <button onClick={() => { const arr = config.quick_replies.filter((_: string, idx: number) => idx !== i); updateConfig('quick_replies', arr); }} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    ))}
                    <button onClick={() => updateConfig('quick_replies', [...(config.quick_replies || []), ''])} className="flex items-center gap-1 text-[10px] text-[var(--admin-accent)] hover:underline"><Plus size={10} /> Agregar respuesta rápida</button>
                  </div>
                </div>

                {/* FAQs */}
                <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
                  <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider mb-4 flex items-center gap-1.5"><HelpCircle size={12} /> Preguntas Frecuentes del Chat</h4>
                  <p className="text-[10px] text-[var(--admin-muted)] mb-3">Se muestran como botones al inicio del chat. El cliente puede seleccionar una y recibe la respuesta automáticamente.</p>
                  <div className="space-y-3">
                    {(config.faqs || []).map((faq: any, i: number) => (
                      <div key={i} className="border border-[var(--admin-border)] rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={faq.question || ''} onChange={e => { const arr = [...config.faqs]; arr[i] = { ...arr[i], question: e.target.value }; updateConfig('faqs', arr); }} placeholder="Pregunta" className="flex-1 border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none" />
                          <button onClick={() => updateConfig('faqs', config.faqs.filter((_: any, idx: number) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                        <textarea value={faq.answer || ''} onChange={e => { const arr = [...config.faqs]; arr[i] = { ...arr[i], answer: e.target.value }; updateConfig('faqs', arr); }} placeholder="Respuesta automática" rows={2} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none resize-none" />
                      </div>
                    ))}
                    <button onClick={() => updateConfig('faqs', [...(config.faqs || []), { question: '', answer: '' }])} className="flex items-center gap-1 text-[10px] text-[var(--admin-accent)] hover:underline"><Plus size={10} /> Agregar FAQ</button>
                  </div>
                </div>

                {/* Auto-Replies (keyword triggers) */}
                <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
                  <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider mb-4 flex items-center gap-1.5"><Bot size={12} /> Auto-Respuestas por Palabra Clave</h4>
                  <p className="text-[10px] text-[var(--admin-muted)] mb-3">Si el mensaje del cliente contiene la palabra clave, se envía la respuesta automáticamente.</p>
                  <div className="space-y-3">
                    {(config.auto_replies || []).map((ar: any, i: number) => (
                      <div key={i} className="border border-[var(--admin-border)] rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={ar.keyword || ''} onChange={e => { const arr = [...config.auto_replies]; arr[i] = { ...arr[i], keyword: e.target.value }; updateConfig('auto_replies', arr); }} placeholder="Palabra clave (ej: envío, devolución)" className="flex-1 border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none" />
                          <button onClick={() => updateConfig('auto_replies', config.auto_replies.filter((_: any, idx: number) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                        <textarea value={ar.response || ''} onChange={e => { const arr = [...config.auto_replies]; arr[i] = { ...arr[i], response: e.target.value }; updateConfig('auto_replies', arr); }} placeholder="Respuesta automática" rows={2} className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none resize-none" />
                      </div>
                    ))}
                    <button onClick={() => updateConfig('auto_replies', [...(config.auto_replies || []), { keyword: '', response: '' }])} className="flex items-center gap-1 text-[10px] text-[var(--admin-accent)] hover:underline"><Plus size={10} /> Agregar auto-respuesta</button>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5 lg:col-span-2">
                  <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider mb-4 flex items-center gap-1.5"><Clock size={12} /> Horario de Atención</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 text-xs text-[var(--admin-text)] cursor-pointer">
                      <input type="checkbox" checked={config.business_hours?.enabled || false} onChange={e => updateConfig('business_hours', { ...config.business_hours, enabled: e.target.checked })} className="rounded border-wood-300 text-[var(--admin-accent)]" />
                      Activar horario de atención
                    </label>
                    <span className="text-[10px] text-[var(--admin-muted)]">Fuera de horario se muestra el mensaje de ausencia</span>
                  </div>
                  {config.business_hours?.enabled && (
                    <div className="grid grid-cols-5 gap-3">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, i) => {
                        const key = ['mon', 'tue', 'wed', 'thu', 'fri'][i];
                        const schedule = config.business_hours?.schedule?.[key] || { start: '09:00', end: '18:00' };
                        return (
                          <div key={day} className="bg-[var(--admin-surface2)] rounded-lg p-3">
                            <p className="text-[10px] font-bold text-[var(--admin-text)] mb-2">{day}</p>
                            <input type="time" value={schedule.start} onChange={e => { const bh = { ...config.business_hours }; bh.schedule = { ...bh.schedule, [key]: { ...schedule, start: e.target.value } }; updateConfig('business_hours', bh); }} className="w-full text-[10px] border border-[var(--admin-border)] rounded px-2 py-1 mb-1" />
                            <input type="time" value={schedule.end} onChange={e => { const bh = { ...config.business_hours }; bh.schedule = { ...bh.schedule, [key]: { ...schedule, end: e.target.value } }; updateConfig('business_hours', bh); }} className="w-full text-[10px] border border-[var(--admin-border)] rounded px-2 py-1" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
