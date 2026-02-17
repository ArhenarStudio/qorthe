"use client";

import React from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';

// Mock Data
const SUBSCRIPTIONS = [
  {
    id: 'sub-001',
    service: 'Mantenimiento Premium de Madera',
    item: 'Mesa de Comedor Nogal',
    price: 850.00,
    interval: 'Anual',
    nextDate: '15 Oct 2024',
    status: 'active',
    features: ['Limpieza profunda', 'Hidratación con aceites', 'Reparación de rasguños leves']
  },
  {
    id: 'sub-002',
    service: 'Garantía Extendida Plus',
    item: 'Sillón Eames Lounge',
    price: 450.00,
    interval: 'Anual',
    nextDate: '22 Nov 2024',
    status: 'active',
    features: ['Cobertura de manchas', 'Ajuste de tornillería', 'Revisión estructural']
  },
  {
    id: 'sub-003',
    service: 'Limpieza de Textiles',
    item: 'Sofá Modular',
    price: 1200.00,
    interval: 'Semestral',
    nextDate: '10 Feb 2024',
    status: 'overdue',
    features: ['Lavado en seco', 'Tratamiento anti-ácaros']
  }
];

export const SubscriptionsList = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1">Suscripciones</h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Gestiona tus servicios recurrentes y mantenimientos.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {SUBSCRIPTIONS.map((sub) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm relative overflow-hidden"
          >
            {/* Status Indicator Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              sub.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />

            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 pl-2">
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-serif text-wood-900 dark:text-sand-100">{sub.service}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      sub.status === 'active' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>
                      {sub.status === 'active' ? 'Activo' : 'Pago Pendiente'}
                    </span>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-sand-400">Asociado a: <span className="font-medium text-wood-700 dark:text-sand-300">{sub.item}</span></p>
                </div>

                {/* Features List */}
                <ul className="space-y-2">
                  {sub.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-wood-600 dark:text-wood-400">
                      <CheckCircle className="w-3 h-3 text-accent-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action / Info Side */}
              <div className="flex flex-col md:items-end gap-4 min-w-[200px] border-t md:border-t-0 md:border-l border-wood-100 dark:border-wood-800 pt-4 md:pt-0 md:pl-6">
                <div className="text-right">
                  <span className="text-2xl font-serif text-wood-900 dark:text-sand-100 block">
                    ${sub.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-wood-400 uppercase tracking-widest font-medium">
                    Facturación {sub.interval}
                  </span>
                </div>

                <div className={`p-3 rounded-xl w-full text-sm flex items-center gap-3 ${
                  sub.status === 'overdue' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200' 
                    : 'bg-wood-50 dark:bg-wood-800 text-wood-600 dark:text-sand-300'
                }`}>
                  {sub.status === 'overdue' ? <AlertTriangle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  <div className="flex-1">
                    <p className="font-medium text-xs uppercase tracking-wide opacity-70">Próximo Cobro</p>
                    <p className="font-bold">{sub.nextDate}</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-wood-500 hover:text-wood-900 border border-wood-200 dark:border-wood-700 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors">
                    Gestionar
                  </button>
                  {sub.status === 'overdue' && (
                    <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-white bg-wood-900 dark:bg-sand-100 dark:text-wood-900 rounded-lg shadow-sm hover:opacity-90">
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Banner for new services */}
      <div className="bg-wood-900 dark:bg-sand-100 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 text-sand-50 dark:text-wood-900">
          <h3 className="font-serif text-xl mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-gold" /> Protege tu inversión
          </h3>
          <p className="text-sm opacity-80 max-w-md">
            Suscríbete a nuestros planes de mantenimiento y extiende la vida útil de tus muebles de lujo.
          </p>
        </div>
        <button className="relative z-10 px-6 py-3 bg-white dark:bg-wood-900 text-wood-900 dark:text-sand-100 text-xs font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-transform shadow-lg">
          Ver Planes Disponibles
        </button>
      </div>
    </div>
  );
};
