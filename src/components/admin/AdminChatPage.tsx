"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Send, X, Clock, CheckCheck, User, Search,
  MoreVertical, Archive, Loader2, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Conversation {
  id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  unread_admin: number;
  last_message_at: string;
  last_message_preview: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  created_at: string;
  read: boolean;
}

export const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [isLive, setIsLive] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(true), 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/admin/chat?id=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { toast.error('Error cargando mensajes'); }
    finally { setMessagesLoading(false); }
  }, []);

  // Select conversation
  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedConv) return;
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`admin-chat-${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload: any) => {
        const m = payload.new;
        setMessages(prev => [...prev, m]);
        fetchConversations(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, fetchConversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send admin reply
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedConv.id, text: newMessage.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setNewMessage('');
      fetchConversations(true);
    } catch { toast.error('Error al enviar'); }
    finally { setSending(false); }
  };

  // Close conversation
  const handleClose = async (convId: string) => {
    try {
      await fetch('/api/admin/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: convId, status: 'closed' }),
      });
      toast.success('Conversación cerrada');
      fetchConversations();
      if (selectedConv?.id === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch { toast.error('Error al cerrar'); }
  };

  // Filtered conversations
  const filtered = conversations.filter(c => {
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return c.customer_email.toLowerCase().includes(q) || (c.customer_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffH = (now.getTime() - date.getTime()) / 3600000;
    if (diffH < 24) return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-accent-gold" />
          <h3 className="font-serif text-lg text-wood-900">Chat en Vivo</h3>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={`flex items-center gap-1 ${isLive ? 'text-green-600' : 'text-wood-400'}`}>
            {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isLive ? 'En vivo' : 'Sin conexión'}
          </span>
          <button onClick={() => fetchConversations()} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 h-[600px]">
        {/* Left: Conversation list */}
        <div className="w-80 bg-white rounded-xl border border-wood-100 shadow-sm flex flex-col overflow-hidden shrink-0">
          {/* Search + filters */}
          <div className="p-3 border-b border-wood-100 space-y-2">
            <div className="flex items-center bg-sand-50 rounded-lg px-3 py-1.5">
              <Search size={12} className="text-wood-400 mr-2" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar cliente..." className="flex-1 text-xs bg-transparent outline-none text-wood-900" />
            </div>
            <div className="flex gap-1">
              {(['open', 'closed', 'all'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`text-[10px] px-2 py-1 rounded-md ${statusFilter === s ? 'bg-wood-900 text-white' : 'text-wood-500 hover:bg-sand-50'}`}>
                  {s === 'open' ? 'Abiertas' : s === 'closed' ? 'Cerradas' : 'Todas'}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-wood-400"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-wood-400 text-xs">Sin conversaciones</div>
            ) : filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left p-3 border-b border-wood-50 hover:bg-sand-50/50 transition-colors ${selectedConv?.id === conv.id ? 'bg-accent-gold/5 border-l-2 border-l-accent-gold' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-wood-900 truncate max-w-[160px]">
                    {conv.customer_name || conv.customer_email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-wood-400">{fmtTime(conv.last_message_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-wood-500 truncate max-w-[180px]">{conv.last_message_preview || 'Nueva conversación'}</p>
                  {conv.unread_admin > 0 && (
                    <span className="bg-accent-gold text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {conv.unread_admin}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-wood-300 mt-0.5">{conv.customer_email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Messages */}
        <div className="flex-1 bg-white rounded-xl border border-wood-100 shadow-sm flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center text-wood-300">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecciona una conversación</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-wood-100 flex items-center justify-between bg-sand-50/50">
                <div>
                  <p className="text-sm font-medium text-wood-900">{selectedConv.customer_name || selectedConv.customer_email.split('@')[0]}</p>
                  <p className="text-[10px] text-wood-400">{selectedConv.customer_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedConv.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-wood-100 text-wood-500'}`}>
                    {selectedConv.status === 'open' ? 'Abierta' : 'Cerrada'}
                  </span>
                  {selectedConv.status === 'open' && (
                    <button onClick={() => handleClose(selectedConv.id)} className="text-[10px] text-wood-400 hover:text-red-500 flex items-center gap-1">
                      <Archive size={10} /> Cerrar
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8 text-wood-400"><Loader2 className="w-4 h-4 animate-spin mr-2" /></div>
                ) : messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'admin'
                        ? 'bg-wood-900 text-sand-100 rounded-br-none'
                        : m.sender === 'system'
                          ? 'bg-wood-50 text-wood-400 text-center italic'
                          : 'bg-sand-100 text-wood-900 rounded-bl-none'
                    }`}>
                      <p>{m.text}</p>
                      <p className={`text-[9px] mt-1 ${m.sender === 'admin' ? 'text-sand-300' : 'text-wood-400'}`}>
                        {new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        {m.sender === 'admin' && m.read && <CheckCheck size={10} className="inline ml-1" />}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedConv.status === 'open' && (
                <div className="p-3 border-t border-wood-100 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 px-4 py-2.5 bg-sand-50 border border-wood-200 rounded-xl text-xs outline-none focus:border-accent-gold/40 text-wood-900"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2.5 bg-wood-900 text-sand-100 rounded-xl text-xs hover:bg-wood-800 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={12} /> {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
