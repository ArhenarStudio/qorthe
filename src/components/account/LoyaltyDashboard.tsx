import React, { useState } from 'react';
import { Award, Gift, TrendingUp, Info, ChevronRight, Check, Lock, AlertCircle, Plus, Minus, History, HelpCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOYALTY_TIERS } from '@/data/loyalty';

// --- Types ---
interface PointHistoryItem {
  id: string;
  date: string;
  concept: string;
  points: number;
  type: 'earned' | 'redeemed';
}

// --- Mock Data ---
const HISTORY_MOCK: PointHistoryItem[] = [
  { id: '1', date: '14 Feb 2024', concept: 'Compra #4829 - Cartera Piel', points: 1250, type: 'earned' },
  { id: '2', date: '10 Feb 2024', concept: 'Canje de puntos', points: -500, type: 'redeemed' },
  { id: '3', date: '01 Feb 2024', concept: 'Bono de bienvenida', points: 200, type: 'earned' },
  { id: '4', date: '20 Ene 2024', concept: 'Compra #4102 - Cinturón', points: 850, type: 'earned' },
];

const FAQS = [
  { q: '¿Cómo gano puntos?', a: 'Ganas 1 punto por cada $1 MXN gastado en productos elegibles. Los puntos se abonan una vez que tu pedido ha sido entregado.' },
  { q: '¿Cuánto valen mis puntos?', a: 'Cada punto equivale a $0.01 MXN. Por ejemplo, 1,000 puntos son $10 MXN de descuento.' },
  { q: '¿Cómo canjeo mis puntos?', a: 'Puedes canjear tus puntos directamente en el checkout. Selecciona la opción "Usar puntos" antes de finalizar tu compra.' },
  { q: '¿Los puntos caducan?', a: 'Sí, los puntos tienen una vigencia de 12 meses desde la fecha en que fueron generados.' },
  { q: '¿Cómo subo de nivel?', a: 'Subes de nivel acumulando compras. El nivel se calcula en base a tu gasto total histórico en la tienda.' },
];

// --- Main Component ---
export const LoyaltyDashboard = () => {
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  // User State Mock
  const currentPoints = 2540;
  const lifetimeSpend = 6500;
  
  const currentTier = LOYALTY_TIERS.find(t => lifetimeSpend >= t.minSpend && (t.maxSpend === null || lifetimeSpend <= t.maxSpend)) || LOYALTY_TIERS[0];
  const nextTier = LOYALTY_TIERS.find(t => t.minSpend > lifetimeSpend);
  const nextTierThreshold = nextTier ? nextTier.minSpend : lifetimeSpend;
  const spendProgress = Math.min(100, (lifetimeSpend / nextTierThreshold) * 100);
  const pointsValueMXN = (currentPoints * 0.01).toFixed(2);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Summary Card */}
      <div className={`rounded-2xl p-6 md:p-10 border shadow-xl relative overflow-hidden transition-colors duration-500 ${currentTier.styles.card}`}>
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${currentTier.styles.badge}`}>
                Nivel {currentTier.name}
              </span>
              <div className="group relative">
                <Info className="w-4 h-4 text-wood-900/40 cursor-help mix-blend-multiply" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-wood-900 text-sand-50 text-xs text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  1 punto = $0.01 MXN
                </div>
              </div>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl mb-2 flex items-baseline gap-2 text-wood-900">
              {currentPoints.toLocaleString()} <span className="text-lg md:text-2xl font-sans font-light text-wood-900/60">Puntos</span>
            </h2>
            <p className="text-wood-800 font-light">
              Equivalente a <span className="font-medium text-wood-900">${pointsValueMXN} MXN</span> para tu próxima compra
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsRedeemModalOpen(true)}
              className="px-6 py-4 text-sm font-bold bg-wood-900 hover:bg-wood-800 text-sand-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1 min-w-[140px]"
            >
              <Gift className="w-6 h-6 mb-1" />
              <span>Usar mis puntos</span>
            </button>
            <button 
              onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-4 text-sm font-bold bg-white/60 hover:bg-white/80 backdrop-blur-md text-wood-900 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-white/40 flex flex-col items-center justify-center gap-1 min-w-[140px]"
            >
              <Award className="w-6 h-6 mb-1" />
              <span>Ver beneficios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      {nextTier && (
        <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-wood-900 dark:text-sand-100 font-medium mb-1">Tu progreso a nivel {nextTier.name}</h3>
              <p className="text-sm text-wood-500 dark:text-sand-400">
                Te faltan <span className="font-bold text-wood-800 dark:text-sand-200">${(nextTierThreshold - lifetimeSpend).toLocaleString()} MXN</span> para desbloquear nuevos beneficios.
              </p>
            </div>
            <span className="text-sm font-medium text-wood-600 dark:text-sand-300 bg-wood-50 dark:bg-wood-800 px-3 py-1 rounded-lg">
              {Math.round(spendProgress)}%
            </span>
          </div>
          
          <div className="h-3 w-full bg-wood-100 dark:bg-wood-800 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${spendProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-wood-600 to-accent-gold rounded-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-wood-400 dark:text-sand-500 font-medium tracking-wide">
            <span>${lifetimeSpend.toLocaleString()} MXN Acumulados</span>
            <span>Meta: ${nextTierThreshold.toLocaleString()} MXN</span>
          </div>
        </div>
      )}

      {/* Tiers Grid */}
      <div id="benefits" className="space-y-6">
        <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100">Niveles del Programa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {LOYALTY_TIERS.map((tier) => {
            const isCurrent = currentTier.id === tier.id;
            const isLocked = lifetimeSpend < tier.minSpend;
            
            return (
              <div 
                key={tier.id}
                className={`group relative flex flex-col bg-white dark:bg-wood-900 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  isCurrent 
                    ? 'border-accent-gold shadow-xl ring-1 ring-accent-gold/20 z-10 scale-[1.02]' 
                    : 'border-wood-100 dark:border-wood-800 hover:border-wood-300 dark:hover:border-wood-700 hover:shadow-lg'
                } ${isLocked ? 'opacity-75 grayscale-[0.1]' : ''}`}
              >
                {/* Decorative Top Bar */}
                <div className={`h-1.5 w-full ${tier.styles.card}`}></div>

                <div className="p-6 flex flex-col h-full relative">
                  {/* Status Badge */}
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3" /> Actual
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner mb-4 transition-transform group-hover:scale-105 duration-500 ${tier.styles.icon}`}>
                        {isLocked ? <Lock className="w-6 h-6" /> : <Award className="w-7 h-7" />}
                     </div>
                     
                     <h4 className="font-serif text-2xl font-bold text-wood-900 dark:text-sand-50 mb-2">
                       {tier.name}
                     </h4>
                     
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-wood-400 dark:text-wood-500 mb-0.5">
                         Gasto Anual Requerido
                       </span>
                       <span className="font-sans font-medium text-wood-700 dark:text-sand-200">
                        {tier.maxSpend 
                          ? `$${tier.minSpend.toLocaleString()} - $${tier.maxSpend.toLocaleString()}`
                          : `$${tier.minSpend.toLocaleString()}+`
                        }
                       </span>
                     </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-wood-100 dark:bg-wood-800 mb-6"></div>

                  {/* Benefits List */}
                  <ul className="space-y-3.5 flex-1">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm group/item">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          isLocked 
                            ? 'bg-wood-100 text-wood-400 dark:bg-wood-800 dark:text-wood-600' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className={`leading-snug transition-colors ${
                          isLocked 
                            ? 'text-wood-400 dark:text-wood-600' 
                            : 'text-wood-600 dark:text-sand-200 group-hover/item:text-wood-900 dark:group-hover/item:text-sand-50 font-medium'
                        }`}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Exclusive Star */}
                  {tier.minSpend >= 10000 && !isLocked && !isCurrent && (
                    <div className="mt-6 pt-4 border-t border-wood-50 dark:border-wood-800/50 flex justify-center">
                       <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest flex items-center gap-1.5">
                         <Star className="w-3 h-3 fill-current" /> Nivel Exclusivo
                       </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100">Historial de Puntos</h3>
            <div className="flex gap-2">
              <select className="bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-lg text-sm px-3 py-1.5 text-wood-600 dark:text-sand-300 focus:outline-none focus:ring-1 focus:ring-accent-gold">
                <option>Todos</option>
                <option>Ganados</option>
                <option>Redimidos</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 overflow-hidden">
             {HISTORY_MOCK.length > 0 ? (
               <div className="divide-y divide-wood-100 dark:divide-wood-800">
                 {HISTORY_MOCK.map((item) => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                         item.type === 'earned' 
                           ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                           : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                       }`}>
                         {item.type === 'earned' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">{item.concept}</p>
                         <p className="text-xs text-wood-400 dark:text-sand-500">{item.date}</p>
                       </div>
                     </div>
                     <span className={`font-mono font-medium ${
                       item.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-wood-900 dark:text-sand-100'
                     }`}>
                       {item.type === 'earned' ? '+' : ''}{item.points} pts
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 text-center text-wood-400">
                 <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p>Aún no tienes movimientos en tu historial.</p>
               </div>
             )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100">Preguntas Frecuentes</h3>
          <div className="bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 p-2 divide-y divide-wood-100 dark:divide-wood-800">
            {FAQS.map((faq, i) => (
              <details key={i} className="group p-4">
                <summary className="flex items-center justify-between font-medium text-wood-800 dark:text-sand-200 cursor-pointer list-none text-sm">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-wood-400" />
                </summary>
                <p className="mt-3 text-sm text-wood-500 dark:text-sand-400 leading-relaxed pl-1">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      <AnimatePresence>
        {isRedeemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-wood-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-wood-100 dark:border-wood-800 flex justify-between items-center">
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Canjear Puntos</h3>
                <button onClick={() => setIsRedeemModalOpen(false)} className="text-wood-400 hover:text-wood-900 dark:hover:text-sand-100">
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-wood-50 dark:bg-wood-800 p-4 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-wood-600 dark:text-sand-300">Puntos disponibles</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100">{currentPoints} pts</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 dark:text-sand-300 mb-2">
                    ¿Cuántos puntos deseas usar?
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-wood-700 bg-white dark:bg-wood-950 text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-wood-400">pts</span>
                  </div>
                  <p className="mt-2 text-sm text-wood-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Equivalente a <span className="font-bold text-wood-900 dark:text-sand-200">$0.00 MXN</span>
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>El descuento se aplicará automáticamente en tu próxima compra al finalizar el pedido.</p>
                </div>

                <button 
                  className="w-full py-3.5 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 font-medium rounded-xl hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors shadow-lg"
                  onClick={() => setIsRedeemModalOpen(false)}
                >
                  Aplicar canje
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};