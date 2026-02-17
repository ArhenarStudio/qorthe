"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PauseCircle, XCircle, CreditCard, RefreshCw, ShieldCheck, Calendar, ChevronRight } from 'lucide-react';

interface Subscription {
  id: string;
  service: string;
  item: string;
  price: number;
  interval: string;
  nextDate: string;
  status: string;
  features: string[];
}

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export const SubscriptionManagementModal: React.FC<SubscriptionManagementModalProps> = ({ isOpen, onClose, subscription }) => {
  if (!subscription) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-wood-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-wood-100 dark:border-wood-800"
          >
            {/* Header */}
            <div className="relative h-24 bg-wood-900 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1z\' fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
               <div className="z-10 text-center">
                 <h3 className="font-serif text-xl text-sand-50">Gestionar Suscripción</h3>
                 <p className="text-xs text-sand-300 uppercase tracking-widest mt-1">ID: {subscription.id}</p>
               </div>
               <button 
                 onClick={onClose}
                 className="absolute top-4 right-4 text-sand-300 hover:text-white transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6">
              {/* Subscription Summary */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-wood-50 dark:bg-wood-800 flex items-center justify-center shrink-0 border border-wood-200 dark:border-wood-700">
                  <ShieldCheck className="w-6 h-6 text-wood-600 dark:text-sand-300" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 leading-tight mb-1">
                    {subscription.service}
                  </h4>
                  <p className="text-sm text-wood-500 dark:text-sand-400">
                    Aplicado a: <span className="font-medium text-wood-800 dark:text-sand-200">{subscription.item}</span>
                  </p>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-wood-50 dark:bg-wood-800/50 rounded-xl p-4 mb-6 border border-wood-100 dark:border-wood-700/50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <Calendar className="w-4 h-4 text-wood-400" />
                   <div>
                     <p className="text-xs text-wood-500 dark:text-sand-400 uppercase tracking-wide font-bold">Próxima Renovación</p>
                     <p className="text-sm font-medium text-wood-900 dark:text-sand-100">{subscription.nextDate}</p>
                   </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-wood-500 dark:text-sand-400 uppercase tracking-wide font-bold">Monto</p>
                    <p className="text-sm font-medium text-wood-900 dark:text-sand-100">${subscription.price.toFixed(2)}</p>
                 </div>
              </div>

              {/* Actions Grid */}
              <div className="grid gap-3">
                <button className="flex items-center justify-between p-4 rounded-xl border border-wood-200 dark:border-wood-700 hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-wood-900 dark:text-sand-100 group-hover:text-wood-700 dark:group-hover:text-sand-50">Método de Pago</span>
                      <span className="block text-xs text-wood-500 dark:text-sand-400">Actualizar tarjeta vinculada</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-wood-400" />
                </button>

                <button className="flex items-center justify-between p-4 rounded-xl border border-wood-200 dark:border-wood-700 hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <PauseCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-wood-900 dark:text-sand-100 group-hover:text-wood-700 dark:group-hover:text-sand-50">Pausar Suscripción</span>
                      <span className="block text-xs text-wood-500 dark:text-sand-400">Saltar el próximo ciclo</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-wood-400" />
                </button>

                <button className="flex items-center justify-between p-4 rounded-xl border border-wood-200 dark:border-wood-700 hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-wood-900 dark:text-sand-100 group-hover:text-wood-700 dark:group-hover:text-sand-50">Cancelar Servicio</span>
                      <span className="block text-xs text-wood-500 dark:text-sand-400">Detener renovación automática</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-wood-400" />
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-wood-100 dark:border-wood-800 flex justify-center">
                <button className="text-xs text-wood-400 hover:text-wood-600 dark:hover:text-sand-300 underline underline-offset-2">
                  Ver términos y condiciones del servicio
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
