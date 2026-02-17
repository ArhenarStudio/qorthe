import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  FileText, Calendar, DollarSign, CheckCircle, Clock, 
  MessageSquare, Download, ChevronRight, XCircle, Send,
  Paperclip, Image as ImageIcon, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Data
const QUOTATIONS = [
  {
    id: "COT-2024-001",
    projectName: "Mesa de Comedor 'Roble Real'",
    date: "12 Feb 2026",
    validUntil: "28 Feb 2026",
    status: "Pending", // Pending, Approved, Rejected, InProgress
    total: "$45,000.00",
    advanceRequired: "$22,500.00",
    description: "Mesa de comedor para 8 personas en madera de roble macizo con acabado natural mate. Incluye bases de acero negro industrial.",
    timeline: "4-6 semanas",
    pdfUrl: "#",
    chat: [
      { sender: 'admin', text: 'Hola Alejandro, aquí tienes la cotización actualizada con las medidas que solicitaste.', time: '10:30 AM' },
      { sender: 'user', text: 'Gracias! La revisaré hoy mismo.', time: '10:45 AM' }
    ]
  },
  {
    id: "COT-2024-002",
    projectName: "Estantería Modular Biblioteca",
    date: "05 Feb 2026",
    validUntil: "20 Feb 2026",
    status: "Approved",
    total: "$32,800.00",
    advancePaid: "$16,400.00",
    description: "Sistema de estantería modular de pared a pared. Nogal americano.",
    timeline: "5-7 semanas",
    pdfUrl: "#",
    chat: [
      { sender: 'admin', text: 'Recibimos el anticipo, muchas gracias. Comenzaremos con los planos de producción.', time: '05 Feb' },
    ]
  },
  {
    id: "COT-2023-089",
    projectName: "Restauración Sillón Vintage",
    date: "15 Dic 2025",
    validUntil: "30 Dic 2025",
    status: "Completed",
    total: "$8,500.00",
    advancePaid: "$8,500.00",
    description: "Retapizado y restauración de estructura para sillón estilo Mid-Century.",
    timeline: "Entregado",
    pdfUrl: "#",
    chat: []
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400",
    Completed: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400",
    InProgress: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-400"
  };

  const labels = {
    Approved: "Aprobada",
    Pending: "Pendiente",
    Rejected: "Rechazada",
    Completed: "Finalizado",
    InProgress: "En Progreso"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ring-1 ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

export const QuotationsList = () => {
  const [quotations, setQuotations] = useState(QUOTATIONS);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const savedQuotes = JSON.parse(localStorage.getItem('davidson_user_quotes') || '[]');
    if (savedQuotes.length > 0) {
      setQuotations([...savedQuotes, ...QUOTATIONS]);
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send message would go here
    setMessageInput("");
  };

  const handleDownloadPdf = (quoteId: string) => {
    toast.loading("Generando PDF...");
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Cotización ${quoteId} descargada exitosamente`);
    }, 1500);
  };

  const handleApproveQuote = (quoteId: string) => {
    if (confirm("¿Estás seguro de aprobar esta cotización? Se procederá al cargo del anticipo.")) {
      setQuotations(prev => prev.map(q => 
        q.id === quoteId 
          ? { ...q, status: 'Approved', chat: [...q.chat, { sender: 'admin', text: '¡Gracias por tu aprobación! El anticipo ha sido procesado correctamente.', time: 'Ahora' }] } 
          : q
      ));
      toast.success("Cotización aprobada y anticipo procesado");
    }
  };

  const handleRejectQuote = (quoteId: string) => {
    if (confirm("¿Deseas rechazar esta cotización?")) {
      setQuotations(prev => prev.map(q => 
        q.id === quoteId ? { ...q, status: 'Rejected' } : q
      ));
      toast.info("Cotización rechazada");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1">Cotizaciones y Proyectos</h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Gestiona tus proyectos personalizados y presupuestos.</p>
        </div>
        <Link href="/quote" className="px-5 py-2.5 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Nueva Solicitud
        </Link>
      </div>

      <div className="bg-white dark:bg-wood-900 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-wood-100 dark:border-wood-800 overflow-hidden">
        {/* Header Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-wood-50/50 dark:bg-wood-800/50 border-b border-wood-100 dark:border-wood-800 text-[10px] uppercase tracking-widest font-bold text-wood-500 dark:text-wood-400">
          <div className="col-span-4">Proyecto</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-2"></div>
        </div>

        <div className="divide-y divide-wood-100 dark:divide-wood-800">
          {quotations.map((quote) => (
            <div 
              key={quote.id}
              className={`group transition-colors duration-200 ${selectedQuote === quote.id ? 'bg-wood-50/50 dark:bg-wood-800/30' : 'bg-white dark:bg-wood-900 hover:bg-wood-50/30 dark:hover:bg-wood-800/20'}`}
            >
              {/* Row */}
              <div 
                className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer"
                onClick={() => setSelectedQuote(selectedQuote === quote.id ? null : quote.id)}
              >
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-wood-100 dark:bg-wood-800 flex items-center justify-center text-wood-500 dark:text-sand-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-wood-900 dark:text-sand-100">{quote.projectName}</h4>
                      <p className="text-xs text-wood-500 dark:text-wood-400 font-mono mt-0.5">{quote.id}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <span className="md:hidden text-xs font-bold text-wood-400 uppercase tracking-wider block mb-1">Fecha</span>
                  <div className="text-sm text-wood-600 dark:text-sand-300 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    {quote.date}
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <span className="md:hidden text-xs font-bold text-wood-400 uppercase tracking-wider block mb-1">Estado</span>
                  <StatusBadge status={quote.status} />
                </div>

                <div className="col-span-6 md:col-span-2 md:text-right">
                  <span className="md:hidden text-xs font-bold text-wood-400 uppercase tracking-wider block mb-1">Total</span>
                  <span className="font-serif text-lg text-wood-900 dark:text-sand-100">{quote.total}</span>
                </div>

                <div className="col-span-6 md:col-span-2 flex justify-end">
                  <div className={`p-2 rounded-full transition-all duration-300 ${selectedQuote === quote.id ? 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 rotate-90' : 'bg-wood-50 text-wood-400 dark:bg-wood-800 dark:text-wood-400 group-hover:bg-wood-200 group-hover:text-wood-900 dark:group-hover:bg-wood-700 dark:group-hover:text-sand-100'}`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Details Expandable */}
              <AnimatePresence>
                {selectedQuote === quote.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-wood-50/30 dark:bg-wood-800/10"
                  >
                    <div className="p-6 md:p-8 border-t border-wood-100 dark:border-wood-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Left: Info & Actions */}
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest mb-3">Detalles del Proyecto</h5>
                          <p className="text-sm text-wood-600 dark:text-sand-200 leading-relaxed mb-4">{quote.description}</p>
                          <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-2 text-wood-500 dark:text-wood-400">
                              <Clock className="w-4 h-4" />
                              <span>Tiempo estimado: <span className="font-medium text-wood-900 dark:text-sand-100">{quote.timeline}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-wood-500 dark:text-wood-400">
                              <Calendar className="w-4 h-4" />
                              <span>Válida hasta: <span className="font-medium text-wood-900 dark:text-sand-100">{quote.validUntil}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions based on status */}
                        <div className="bg-white dark:bg-wood-800 p-5 rounded-xl border border-wood-100 dark:border-wood-700 shadow-sm space-y-4">
                          <div className="flex items-center justify-between pb-4 border-b border-wood-100 dark:border-wood-700/50">
                            <span className="text-sm font-medium text-wood-600 dark:text-sand-300">Documento Oficial</span>
                            <button 
                              onClick={() => handleDownloadPdf(quote.id)}
                              className="text-xs font-bold uppercase tracking-widest text-wood-900 dark:text-sand-100 hover:text-accent-gold flex items-center gap-2 transition-colors"
                            >
                              <Download className="w-4 h-4" /> Descargar PDF
                            </button>
                          </div>

                          {quote.status === 'Pending' && (
                            <div className="space-y-3 pt-2">
                              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-200 mb-4">
                                Para iniciar la producción se requiere un anticipo del 50%: <strong>{quote.advanceRequired}</strong>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <button 
                                  onClick={() => handleApproveQuote(quote.id)}
                                  className="py-2.5 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-wood-800 transition-colors"
                                >
                                  Aprobar y Pagar
                                </button>
                                <button 
                                  onClick={() => handleRejectQuote(quote.id)}
                                  className="py-2.5 border border-wood-200 dark:border-wood-700 text-wood-600 dark:text-sand-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          )}

                          {quote.status === 'Approved' && (
                            <div className="pt-2">
                              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm text-emerald-800 dark:text-emerald-200">
                                <CheckCircle className="w-5 h-5" />
                                <div>
                                  <p className="font-bold">Proyecto en Marcha</p>
                                  <p className="text-xs opacity-90">Anticipo pagado. Producción iniciada.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {quote.status === 'Rejected' && (
                            <div className="pt-2">
                              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-800 dark:text-red-200">
                                <XCircle className="w-5 h-5" />
                                <div>
                                  <p className="font-bold">Cotización Rechazada</p>
                                  <p className="text-xs opacity-90">Esta propuesta ha sido declinada.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Project Chat */}
                      <div className="flex flex-col h-[400px] bg-wood-50 dark:bg-wood-900/50 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden">
                        <div className="p-4 border-b border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-800 flex justify-between items-center">
                          <h5 className="text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Chat del Proyecto
                          </h5>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {quote.chat.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-wood-400 dark:text-wood-600 text-center p-4">
                              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                              <p className="text-sm">Inicia la conversación sobre este proyecto.</p>
                            </div>
                          ) : (
                            quote.chat.map((msg, idx) => (
                              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                  msg.sender === 'user' 
                                    ? 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 rounded-tr-sm' 
                                    : 'bg-white dark:bg-wood-800 text-wood-800 dark:text-sand-100 border border-wood-100 dark:border-wood-700 rounded-tl-sm shadow-sm'
                                }`}>
                                  {msg.text}
                                </div>
                                <span className="text-[10px] text-wood-400 mt-1 px-1">{msg.time}</span>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-wood-800 border-t border-wood-100 dark:border-wood-700 flex gap-2">
                          <button type="button" className="p-2 text-wood-400 hover:text-wood-600 dark:text-wood-500 dark:hover:text-sand-300 transition-colors">
                            <Paperclip className="w-5 h-5" />
                          </button>
                          <input 
                            type="text" 
                            placeholder="Escribe un mensaje..." 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-wood-900 dark:text-sand-100 placeholder-wood-400"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                          />
                          <button type="submit" className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!messageInput.trim()}>
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};