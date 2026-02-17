"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, FileText, Building2, Receipt, ArrowLeft, Loader2 } from 'lucide-react';

interface InvoiceRequestModalProps {
  onClose: () => void;
  orderId?: string; // Optional: if coming from a specific order
}

export const InvoiceRequestModal: React.FC<InvoiceRequestModalProps> = ({ onClose, orderId }) => {
  const [step, setStep] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(orderId || null);
  const [selectedRFC, setSelectedRFC] = useState('default');
  const [loading, setLoading] = useState(false);

  // Mock Data
  const pendingOrders = [
    { id: 'ORD-8825', date: '14 Feb 2024', total: 4200.00, items: 'Mesa de Centro Nogal' },
    { id: 'ORD-8790', date: '01 Feb 2024', total: 1250.00, items: 'Set de Portavasos' },
  ];

  const fiscalProfiles = [
    { id: 'default', rfc: 'XAXX010101000', name: 'Alejandro García', regime: '612 - Personas Físicas...' },
    { id: 'b2b', rfc: 'ABC123456T12', name: 'Empresa B2B S.A.', regime: '601 - General de Ley...' },
  ];

  const handleEmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3); // Success
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-wood-950/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-wood-900 rounded-2xl shadow-2xl overflow-hidden border border-wood-100 dark:border-wood-800"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-white dark:bg-wood-900 sticky top-0 z-10">
          <div>
             <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">
              {step === 3 ? 'Factura Emitida' : 'Solicitar Factura'}
            </h3>
            {step < 3 && (
              <p className="text-xs text-wood-500 dark:text-sand-400 mt-0.5">
                Paso {step} de 2
              </p>
            )}
          </div>
         
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Step 1: Select Order (if not selected) and Confirm Details */}
                {!orderId && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest">
                      Selecciona un pedido pendiente
                    </label>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                      {pendingOrders.map(order => (
                        <div 
                          key={order.id}
                          onClick={() => setSelectedOrder(order.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${
                            selectedOrder === order.id 
                              ? 'border-wood-900 dark:border-sand-100 bg-wood-50 dark:bg-wood-800 ring-1 ring-wood-900 dark:ring-sand-100 shadow-sm' 
                              : 'border-wood-200 dark:border-wood-700 hover:border-wood-400 bg-white dark:bg-wood-900'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="block font-bold text-wood-900 dark:text-sand-100 text-sm">{order.id}</span>
                              <span className="text-xs text-wood-500">{order.date}</span>
                            </div>
                            <span className="font-serif font-medium text-wood-900 dark:text-sand-100">
                              ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-wood-500 dark:text-wood-400 truncate mt-2 pb-1 border-t border-wood-100 dark:border-wood-700 pt-2">
                            {order.items}
                          </p>
                          
                          {selectedOrder === order.id && (
                            <div className="absolute top-3 right-3 w-4 h-4 bg-wood-900 dark:bg-sand-100 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white dark:text-wood-900" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest">
                      Perfil de Facturación
                    </label>
                    <button className="text-xs font-medium text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 hover:underline flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Gestionar RFCs
                    </button>
                  </div>
                  
                  <div className="grid gap-3">
                    {fiscalProfiles.map(profile => (
                      <div 
                        key={profile.id}
                        onClick={() => setSelectedRFC(profile.id)}
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedRFC === profile.id 
                            ? 'border-wood-900 dark:border-sand-100 bg-wood-50 dark:bg-wood-800 ring-1 ring-wood-900 dark:ring-sand-100 shadow-sm' 
                            : 'border-wood-200 dark:border-wood-700 hover:border-wood-400 bg-white dark:bg-wood-900'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          selectedRFC === profile.id ? 'border-wood-900 dark:border-sand-100' : 'border-wood-300'
                        }`}>
                          {selectedRFC === profile.id && <div className="w-2.5 h-2.5 rounded-full bg-wood-900 dark:bg-sand-100" />}
                        </div>
                        <div>
                          <p className="font-bold text-wood-900 dark:text-sand-100 text-sm">{profile.name}</p>
                          <p className="text-xs font-mono text-wood-500 dark:text-wood-400 mt-0.5">{profile.rfc}</p>
                          <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 bg-wood-100 dark:bg-wood-700 text-wood-600 dark:text-sand-300 rounded-full">
                            {profile.regime.split(' - ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => selectedOrder && setStep(2)}
                    disabled={!selectedOrder}
                    className="w-full flex items-center justify-center gap-2 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 py-4 rounded-xl font-bold tracking-wide hover:bg-wood-800 dark:hover:bg-sand-200 transition-all shadow-lg shadow-wood-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 flex gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Confirmación Final</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1 leading-relaxed">
                      Verifica que los datos sean correctos. Una vez emitida la factura, solo podrás cancelarla mediante una nota de crédito.
                    </p>
                  </div>
                </div>

                <div className="space-y-0 divide-y divide-wood-100 dark:divide-wood-800 border-t border-b border-wood-100 dark:border-wood-800">
                  <div className="flex justify-between py-4">
                    <span className="text-sm text-wood-500 dark:text-wood-400">Pedido Referencia</span>
                    <span className="text-sm font-medium text-wood-900 dark:text-sand-100">{selectedOrder}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-sm text-wood-500 dark:text-wood-400">RFC Receptor</span>
                    <span className="text-sm font-medium text-wood-900 dark:text-sand-100 font-mono">XAXX010101000</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-sm text-wood-500 dark:text-wood-400">Uso CFDI</span>
                    <span className="text-sm font-medium text-wood-900 dark:text-sand-100">G03 - Gastos en general</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-sm text-wood-500 dark:text-wood-400">Método de Pago</span>
                    <span className="text-sm font-medium text-wood-900 dark:text-sand-100">PUE - Pago en una sola exhibición</span>
                  </div>
                  <div className="flex justify-between py-4 items-center">
                    <span className="text-sm font-bold text-wood-900 dark:text-sand-100">Total a Facturar</span>
                    <span className="text-lg font-serif text-wood-900 dark:text-sand-100">$4,250.00</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl font-bold tracking-wide text-wood-600 dark:text-sand-400 hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Atrás
                  </button>
                  <button 
                    onClick={handleEmit}
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 py-4 rounded-xl font-bold tracking-wide hover:bg-wood-800 dark:hover:bg-sand-200 transition-all shadow-lg shadow-wood-900/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Emitir Factura'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-3">¡Factura Emitida con Éxito!</h3>
                <p className="text-wood-500 dark:text-sand-400 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
                  Hemos enviado los archivos XML y PDF a tu correo electrónico registrado y ya están disponibles en tu dashboard.
                </p>
                
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-100 dark:border-wood-700 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-wood-100 dark:hover:bg-wood-700 transition-colors">
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-100 dark:border-wood-700 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-wood-100 dark:hover:bg-wood-700 transition-colors">
                      <FileText className="w-4 h-4" />
                      XML
                    </button>
                  </div>
                  
                  <button 
                    onClick={onClose}
                    className="w-full py-3 text-sm text-wood-500 hover:text-wood-900 dark:text-sand-400 dark:hover:text-sand-200 underline transition-colors"
                  >
                    Volver al Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
