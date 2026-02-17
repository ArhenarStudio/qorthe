import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, ChevronDown, ChevronUp, MessageCircle, 
  Mail, Search, Ticket, Plus, Send, FileText, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'faq' | 'tickets' | 'chat';

// --- MOCK DATA ---

const FAQS = [
  {
    category: 'Pedidos',
    items: [
      { q: "¿Cuál es la política de devoluciones?", a: "Aceptamos devoluciones gratuitas dentro de los 30 días posteriores a la recepción de su pedido, siempre que los artículos estén en su estado original." },
      { q: "¿Cómo puedo rastrear mi pedido?", a: "Una vez enviado su pedido, recibirá un correo electrónico con un enlace de seguimiento. También puede consultar el estado en 'Mis Pedidos'." }
    ]
  },
  {
    category: 'Envíos',
    items: [
      { q: "¿Realizan envíos internacionales?", a: "Sí, realizamos envíos a más de 50 países. Los costos se calculan al finalizar la compra." },
      { q: "¿Cuánto tarda el envío estándar?", a: "El envío estándar suele tardar entre 3 y 5 días hábiles dentro del país." }
    ]
  },
  {
    category: 'Producto',
    items: [
      { q: "¿Ofrecen garantía de autenticidad?", a: "Absolutamente. Todos los productos son verificados por expertos y garantizamos su autenticidad al 100%." },
      { q: "¿Puedo personalizar un mueble?", a: "Sí, ofrecemos servicios de personalización en ciertos artículos. Busque la opción 'Personalizar' en la página del producto." }
    ]
  }
];

const MOCK_TICKETS = [
  { id: 'T-1023', subject: 'Problema con la factura', status: 'open', date: 'Hace 2 horas', lastUpdate: 'Esperando respuesta de soporte' },
  { id: 'T-0992', subject: 'Consulta sobre garantía', status: 'closed', date: '10 Feb 2024', lastUpdate: 'Resuelto' },
];

const MOCK_CHAT_HISTORY = [
  { id: 1, sender: 'bot', text: '¡Hola! Soy el asistente virtual de DavidSon\'s. ¿En qué puedo ayudarte hoy?', time: '10:00 AM' },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket State
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'general', message: '' });

  // Chat State
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_HISTORY);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;

    const ticket = {
      id: `T-${Math.floor(Math.random() * 10000)}`,
      subject: newTicket.subject,
      status: 'open',
      date: 'Ahora',
      lastUpdate: 'Recibido'
    };

    setTickets([ticket, ...tickets]);
    setIsCreatingTicket(false);
    setNewTicket({ subject: '', category: 'general', message: '' });
    toast.success('Ticket creado correctamente');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: 'Gracias por tu mensaje. Un agente se conectará contigo en breve.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  // Filter FAQs
  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  // --- RENDER CONTENT ---

  const renderContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="space-y-6">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-wood-400" />
                <input 
                  type="text" 
                  placeholder="Buscar ayuda..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm text-wood-900 dark:text-sand-100 placeholder-wood-400 focus:outline-none focus:ring-2 focus:ring-wood-900 dark:focus:ring-sand-200 transition-all"
                />
              </div>

              <div className="space-y-6 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category, catIndex) => (
                    <div key={catIndex}>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-sand-400 mb-3 ml-1">{category.category}</h4>
                      <div className="space-y-2">
                        {category.items.map((faq, index) => {
                          const key = `${catIndex}-${index}`;
                          const isOpen = openFaqIndex === key;
                          return (
                            <div key={key} className="border border-wood-100 dark:border-wood-800 rounded-xl overflow-hidden bg-white dark:bg-wood-900/50 hover:border-wood-300 dark:hover:border-wood-600 transition-colors">
                              <button 
                                onClick={() => setOpenFaqIndex(isOpen ? null : key)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left"
                              >
                                <span className="font-medium text-sm text-wood-900 dark:text-sand-100 pr-4">{faq.q}</span>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-wood-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-wood-400 shrink-0" />}
                              </button>
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                  >
                                    <div className="px-4 pb-4 text-sm text-wood-600 dark:text-wood-300 border-t border-wood-50 dark:border-wood-800/50 pt-3 leading-relaxed">
                                      {faq.a}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-wood-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No encontramos respuestas para "{searchQuery}"</p>
                  </div>
                )}
              </div>
          </div>
        );

      case 'tickets':
        if (isCreatingTicket) {
          return (
             <div className="h-[480px] flex flex-col">
               <button 
                 onClick={() => setIsCreatingTicket(false)} 
                 className="flex items-center gap-2 text-sm text-wood-500 hover:text-wood-900 mb-4 transition-colors w-fit"
               >
                 <ChevronDown className="w-4 h-4 rotate-90" /> Volver a mis tickets
               </button>
               
               <h3 className="text-lg font-serif text-wood-900 dark:text-sand-100 mb-6">Nuevo Ticket de Soporte</h3>
               
               <form onSubmit={handleCreateTicket} className="flex-1 flex flex-col gap-4">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Asunto</label>
                   <input 
                     required
                     value={newTicket.subject}
                     onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                     className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-wood-900 outline-none"
                     placeholder="Ej: Problema con mi pedido #4829"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Categoría</label>
                   <select 
                     value={newTicket.category}
                     onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                     className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-wood-900 outline-none"
                   >
                     <option value="general">Consulta General</option>
                     <option value="order">Problema con Pedido</option>
                     <option value="payment">Pagos y Facturación</option>
                     <option value="return">Devoluciones</option>
                   </select>
                 </div>
                 
                 <div className="flex-1">
                   <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Mensaje</label>
                   <textarea 
                     required
                     value={newTicket.message}
                     onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                     className="w-full h-full min-h-[120px] px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-wood-900 outline-none resize-none"
                     placeholder="Describe tu problema detalladamente..."
                   />
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
                 >
                   Enviar Ticket
                 </button>
               </form>
             </div>
          );
        }

        return (
          <div className="h-[480px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100">Mis Tickets</h3>
                <p className="text-xs text-wood-500">Historial de solicitudes</p>
              </div>
              <button 
                onClick={() => setIsCreatingTicket(true)}
                className="flex items-center gap-2 px-4 py-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
              >
                <Plus className="w-3 h-3" /> Crear Ticket
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {tickets.length > 0 ? (
                tickets.map(ticket => (
                  <div key={ticket.id} className="p-4 border border-wood-100 dark:border-wood-800 rounded-xl bg-white dark:bg-wood-900/50 hover:border-wood-300 dark:hover:border-wood-600 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500' : 'bg-wood-300'}`} />
                         <span className="font-medium text-wood-900 dark:text-sand-100 text-sm">{ticket.subject}</span>
                      </div>
                      <span className="text-[10px] font-mono text-wood-400">#{ticket.id}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-wood-500 dark:text-wood-400">
                        <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.date}</p>
                        <p className="mt-1 text-wood-400 italic">{ticket.lastUpdate}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-wood-300 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-12 h-12 bg-wood-50 dark:bg-wood-800 rounded-full flex items-center justify-center mb-3">
                    <Ticket className="w-6 h-6 text-wood-300" />
                  </div>
                  <p className="text-wood-500 mb-4">No tienes tickets abiertos.</p>
                  <button onClick={() => setIsCreatingTicket(true)} className="text-wood-900 font-medium text-sm underline">Crear uno nuevo</button>
                </div>
              )}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="h-[480px] flex flex-col bg-wood-50 dark:bg-wood-900/30 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden">
             {/* Chat Area */}
             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-tr-none' 
                        : 'bg-white dark:bg-wood-800 text-wood-800 dark:text-sand-200 border border-wood-200 dark:border-wood-700 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-wood-400 dark:text-wood-500' : 'text-wood-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-wood-800 p-3 rounded-2xl rounded-tl-none border border-wood-200 dark:border-wood-700 shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-wood-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-wood-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-wood-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                )}
             </div>

             {/* Input Area */}
             <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-wood-900 border-t border-wood-100 dark:border-wood-800 flex gap-2">
               <button type="button" className="p-2 text-wood-400 hover:text-wood-600 transition-colors">
                 <FileText className="w-5 h-5" />
               </button>
               <input 
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 placeholder="Escribe un mensaje..."
                 className="flex-1 bg-transparent text-sm text-wood-900 dark:text-sand-100 placeholder-wood-400 focus:outline-none"
               />
               <button 
                 type="submit" 
                 disabled={!chatInput.trim()}
                 className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
               >
                 <Send className="w-4 h-4" />
               </button>
             </form>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-wood-950 shadow-2xl overflow-hidden rounded-2xl border border-wood-100 dark:border-wood-800 flex flex-col max-h-[90vh]"
          >
            {/* Header with Tabs */}
            <div className="border-b border-wood-100 dark:border-wood-800 bg-wood-50/50 dark:bg-wood-900/50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 leading-none">Centro de Ayuda</h3>
                    <p className="text-xs text-wood-500 mt-1">Soporte 24/7</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors rounded-full hover:bg-wood-200/20">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-6 gap-6">
                <button 
                  onClick={() => setActiveTab('faq')}
                  className={`pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'faq' ? 'border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'border-transparent text-wood-400 hover:text-wood-600'}`}
                >
                  FAQ
                </button>
                <button 
                  onClick={() => setActiveTab('tickets')}
                  className={`pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'border-transparent text-wood-400 hover:text-wood-600'}`}
                >
                  Tickets
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`pb-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'chat' ? 'border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'border-transparent text-wood-400 hover:text-wood-600'}`}
                >
                  Chat en Vivo
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-wood-50 dark:bg-wood-900 border-t border-wood-100 dark:border-wood-800 flex justify-between items-center text-xs text-wood-500 dark:text-wood-400">
              <span>DavidSon's Support Team</span>
              <div className="flex gap-4">
                 <a href="#" className="hover:text-wood-900 dark:hover:text-sand-100 hover:underline">Política de Privacidad</a>
                 <a href="#" className="hover:text-wood-900 dark:hover:text-sand-100 hover:underline">Términos de Servicio</a>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
