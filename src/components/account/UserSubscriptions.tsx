import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, Wrench, Zap, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// Mock Data
const SUBSCRIPTIONS = [
  {
    id: 'sub-01',
    name: 'Plan Mantenimiento Premium',
    type: 'Maintenance',
    status: 'active',
    price: '$850 MXN / mes',
    nextBilling: '15 Mar 2026',
    description: 'Limpieza profunda y encerado mensual de mesas de madera maciza.',
    features: [
      'Visita mensual de especialista',
      'Aceite y cera orgánica importada',
      'Reparación de rayaduras superficiales',
      'Garantía extendida en acabados'
    ],
    icon: Wrench
  },
  {
    id: 'sub-02',
    name: 'Seguro de Protección Total',
    type: 'Insurance',
    status: 'active',
    price: '$420 MXN / mes',
    nextBilling: '28 Feb 2026',
    description: 'Cobertura contra daños accidentales, líquidos y manchas.',
    features: [
      'Cobertura 100% en manchas',
      'Sustitución de piezas dañadas',
      'Sin deducible'
    ],
    icon: Shield
  }
];

export const UserSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTIONS);

  const handleCancel = (id: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta suscripción? Perderás los beneficios al final del ciclo actual.')) {
      setSubscriptions(subscriptions.map(s => 
        s.id === id ? { ...s, status: 'cancelled' } : s
      ));
      toast.success('Suscripción cancelada correctamente');
    }
  };

  const handleRenew = (id: string) => {
    setSubscriptions(subscriptions.map(s => 
        s.id === id ? { ...s, status: 'active' } : s
      ));
    toast.success('Suscripción reactivada');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-accent-gold" /> Suscripciones y Servicios
        </h2>
        <p className="text-sm text-wood-500 dark:text-wood-400">Administra tus planes de mantenimiento recurrentes y seguros.</p>
      </div>

      <div className="grid gap-6">
        {subscriptions.map((sub) => (
          <motion.div 
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden transition-all ${
              sub.status === 'active' 
                ? 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800 shadow-sm' 
                : 'bg-wood-50 dark:bg-wood-900/40 border-wood-100 dark:border-wood-800 opacity-80 grayscale-[0.5]'
            }`}
          >
            {/* Status Badge */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl ${
              sub.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                : 'bg-wood-200 text-wood-600 dark:bg-wood-800 dark:text-wood-400'
            }`}>
              {sub.status === 'active' ? 'Activa' : 'Cancelada'}
            </div>

            {/* Icon Column */}
            <div className="shrink-0">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                sub.status === 'active' 
                  ? 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900' 
                  : 'bg-wood-200 text-wood-500 dark:bg-wood-800 dark:text-wood-600'
              }`}>
                <sub.icon size={32} strokeWidth={1.5} />
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">{sub.name}</h3>
                <p className="font-mono font-medium text-lg text-wood-900 dark:text-sand-100">{sub.price}</p>
              </div>
              
              <p className="text-sm text-wood-600 dark:text-sand-300 mb-6 max-w-2xl">{sub.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {sub.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-wood-500 dark:text-wood-400">
                    <CheckCircle className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-wood-100 dark:border-wood-800 gap-4">
                 <div className="flex items-center gap-2 text-xs font-medium text-wood-500 dark:text-wood-400">
                   <Clock className="w-4 h-4" />
                   {sub.status === 'active' ? (
                     <span>Próximo cargo: <span className="text-wood-900 dark:text-sand-100">{sub.nextBilling}</span></span>
                   ) : (
                     <span>Expira el: <span className="text-wood-900 dark:text-sand-100">{sub.nextBilling}</span></span>
                   )}
                 </div>

                 <div className="flex gap-3">
                   {sub.status === 'active' ? (
                     <>
                       <button className="px-4 py-2 border border-wood-200 dark:border-wood-700 text-wood-600 dark:text-sand-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors">
                         Cambiar Método de Pago
                       </button>
                       <button 
                         onClick={() => handleCancel(sub.id)}
                         className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                       >
                         Cancelar
                       </button>
                     </>
                   ) : (
                     <button 
                       onClick={() => handleRenew(sub.id)}
                       className="px-6 py-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                     >
                       Reactivar Plan
                     </button>
                   )}
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upgrade / Promo Section */}
      <div className="bg-accent-gold/10 dark:bg-accent-gold/5 rounded-2xl p-6 border border-accent-gold/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-accent-gold/20 rounded-full text-wood-900 dark:text-sand-100">
             <Zap className="w-6 h-6" />
           </div>
           <div>
             <h4 className="font-bold text-wood-900 dark:text-sand-100 text-sm uppercase tracking-wide">¿Necesitas mantenimiento puntual?</h4>
             <p className="text-xs text-wood-600 dark:text-wood-400 mt-1">Contrata servicios individuales para tus muebles sin suscripción mensual.</p>
           </div>
        </div>
        <button className="whitespace-nowrap px-5 py-2.5 bg-accent-gold text-wood-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-sm">
          Ver Catálogo de Servicios
        </button>
      </div>
    </div>
  );
};
