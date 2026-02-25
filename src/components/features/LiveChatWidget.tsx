"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveChatWidgetProps {
  footerOffset?: number;
}

const BASE_BOTTOM_MOBILE = 208; // bottom-52 = 13rem = 208px
const BASE_BOTTOM_DESKTOP = 112; // bottom-28 = 7rem = 112px

export const LiveChatWidget = ({ footerOffset = 0 }: LiveChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; time: string }[]>([
    { text: "Hola, bienvenido a DavidSon's Design. ¿En qué podemos ayudarte hoy?", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const baseBottom = isMobile ? BASE_BOTTOM_MOBILE : BASE_BOTTOM_DESKTOP;
  const computedBottom = baseBottom + footerOffset;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{ bottom: `${computedBottom}px` }}
      className="fixed right-6 z-50 flex flex-col items-end pointer-events-none transition-[bottom] duration-300 ease-out"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-wood-200 overflow-hidden pointer-events-auto origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-wood-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-wood-700 flex items-center justify-center border border-wood-600">
                    <MessageSquare size={20} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-wood-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Soporte DavidSon&apos;s</h3>
                  <p className="text-xs text-wood-300">En línea</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-wood-300 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-sand-50 space-y-4 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isUser ? 'bg-wood-900 text-white self-end rounded-br-none' : 'bg-white border border-wood-200 text-wood-800 self-start rounded-bl-none'}`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 text-wood-400`}>{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input */}
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
        className="text-wood-900 dark:text-sand-100 hover:text-accent-gold p-2 transition-colors pointer-events-auto flex items-center justify-center relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 bg-wood-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat en vivo
        </span>
      </motion.button>
    </motion.div>
  );
};
