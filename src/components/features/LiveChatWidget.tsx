"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; time: string }[]>([
    { text: "Hola, bienvenido a Qorthe. ¿En qué podemos ayudarte hoy?", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMsg = { text: message, isUser: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Gracias por tu mensaje. Un asesor se pondrá en contacto contigo en breve.", 
        isUser: false, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-wood-200 overflow-hidden origin-bottom-right"
          >
            <div className="bg-wood-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-wood-700 flex items-center justify-center border border-wood-600">
                    <MessageSquare size={20} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-wood-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Soporte Qorthe</h3>
                  <p className="text-xs text-wood-300">En línea</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-wood-300 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4 bg-sand-50 space-y-4 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isUser ? 'bg-wood-900 text-white self-end rounded-br-none' : 'bg-white border border-wood-200 text-wood-800 self-start rounded-bl-none'}`}>
                  <p>{msg.text}</p>
                  <span className="text-[10px] block mt-1 text-wood-400">{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-wood-100 flex items-center gap-2">
              <button type="button" className="text-wood-400 hover:text-wood-600 p-2 rounded-full hover:bg-wood-50 transition-colors">
                <Paperclip size={18} />
              </button>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..." 
                className="flex-1 bg-sand-50 border border-wood-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-wood-900 transition-colors placeholder:text-wood-400 text-wood-900"
              />
              <button type="submit" disabled={!message.trim()} className="bg-wood-900 text-white p-2 rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-wood-900 hover:text-accent-gold p-2.5 rounded-full shadow-md pointer-events-auto flex items-center justify-center relative group"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        <span className="absolute right-full mr-3 bg-wood-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat en vivo
        </span>
      </motion.button>
    </div>
  );
};
