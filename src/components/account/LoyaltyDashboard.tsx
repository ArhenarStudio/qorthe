"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Gift, TrendingUp, Info, ChevronRight, Check, Lock, AlertCircle, Plus, Minus, History, HelpCircle, Star, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOYALTY_TIERS } from '@/data/loyalty';
import { useAuth } from '@/contexts/AuthContext';

// --- Types ---
interface LoyaltyProfile {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  lifetime_spend: number; // in centavos
  tier: string;
  points_multiplier: number;
  joined_at: string;
  updated_at: string;
}

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';
  description: string;
  order_id?: string;
  order_display_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

const FAQS = [
  { q: '¿Cómo gano puntos?', a: 'Ganas 1 punto por cada $1 MXN gastado en productos elegibles. Los puntos se abonan una vez que tu pedido ha sido entregado.' },
  { q: '¿Cuánto valen mis puntos?', a: 'Cada punto equivale a $0.01 MXN. Por ejemplo, 1,000 puntos son $10 MXN de descuento.' },
  { q: '¿Cómo canjeo mis puntos?', a: 'Puedes canjear tus puntos directamente en el checkout. Selecciona la opción "Usar puntos" antes de finalizar tu compra.' },
  { q: '¿Los puntos caducan?', a: 'Sí, los puntos tienen una vigencia de 12 meses desde la fecha en que fueron generados.' },
  { q: '¿Cómo subo de nivel?', a: 'Subes de nivel acumulando compras. El nivel se calcula en base a tu gasto total histórico en la tienda.' },
];

// --- Date formatter ---
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// --- Main Component ---
export const LoyaltyDashboard = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'earn' | 'redeem'>('all');

  // Fetch loyalty data
  const fetchLoyalty = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/loyalty?user_id=${user.id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch');

      setProfile(data.profile);
      setTransactions(data.transactions || []);
    } catch (err: any) {
      console.error('[Loyalty] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  // Redeem points
  const handleRedeem = async () => {
    const pts = parseInt(redeemAmount);
    if (!pts || pts <= 0 || !session?.access_token) return;
    
    setRedeeming(true);
    setRedeemError(null);

    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'redeem',
          points: pts,
          description: 'Canje de puntos desde cuenta',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setRedeemError(data.error || 'Error al canjear');
        return;
      }

      // Refresh data
      await fetchLoyalty();
      setIsRedeemModalOpen(false);
      setRedeemAmount('');
    } catch (err: any) {
      setRedeemError(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  // Derived values
  const currentPoints = profile?.points || 0;
  const lifetimeSpend = profile ? profile.lifetime_spend / 100 : 0; // convert centavos to pesos
  
  const currentTier = LOYALTY_TIERS.find(
    t => lifetimeSpend >= t.minSpend && (t.maxSpend === null || lifetimeSpend <= t.maxSpend)
  ) || LOYALTY_TIERS[0];
  
  const nextTier = LOYALTY_TIERS.find(t => t.minSpend > lifetimeSpend);
  const nextTierThreshold = nextTier ? nextTier.minSpend : lifetimeSpend;
  const spendProgress = nextTier ? Math.min(100, (lifetimeSpend / nextTierThreshold) * 100) : 100;
  const pointsValueMXN = (currentPoints * 0.01).toFixed(2);

  // Filter transactions
  const filteredTx = txFilter === 'all'
    ? transactions
    : transactions.filter(t => 
        txFilter === 'earn' ? t.points > 0 : t.points < 0
      );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
        <span className="ml-3 text-wood-500">Cargando programa de lealtad...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
        <button onClick={fetchLoyalty} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

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
              {profile?.points_multiplier && profile.points_multiplier > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                  {profile.points_multiplier}x puntos
                </span>
              )}
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
              onClick={() => { setIsRedeemModalOpen(true); setRedeemError(null); setRedeemAmount(''); }}
              disabled={currentPoints === 0}
              className="px-6 py-4 text-sm font-bold bg-wood-900 hover:bg-wood-800 text-sand-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
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
                <div className={`h-1.5 w-full ${tier.styles.card}`}></div>
                <div className="p-6 flex flex-col h-full relative">
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3" /> Actual
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner mb-4 transition-transform group-hover:scale-105 duration-500 ${tier.styles.icon}`}>
                        {isLocked ? <Lock className="w-6 h-6" /> : <Award className="w-7 h-7" />}
                     </div>
                     <h4 className="font-serif text-2xl font-bold text-wood-900 dark:text-sand-50 mb-2">{tier.name}</h4>
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-wood-400 dark:text-wood-500 mb-0.5">Gasto Acumulado</span>
                       <span className="font-sans font-medium text-wood-700 dark:text-sand-200">
                        {tier.maxSpend 
                          ? `$${tier.minSpend.toLocaleString()} - $${tier.maxSpend.toLocaleString()}`
                          : `$${tier.minSpend.toLocaleString()}+`
                        }
                       </span>
                     </div>
                  </div>
                  <div className="h-px w-full bg-wood-100 dark:bg-wood-800 mb-6"></div>
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
              <select 
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value as any)}
                className="bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-lg text-sm px-3 py-1.5 text-wood-600 dark:text-sand-300 focus:outline-none focus:ring-1 focus:ring-accent-gold"
              >
                <option value="all">Todos</option>
                <option value="earn">Ganados</option>
                <option value="redeem">Redimidos</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 overflow-hidden">
             {filteredTx.length > 0 ? (
               <div className="divide-y divide-wood-100 dark:divide-wood-800">
                 {filteredTx.map((item) => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                         item.points > 0
                           ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                           : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                       }`}>
                         {item.points > 0 ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">{item.description}</p>
                         <p className="text-xs text-wood-400 dark:text-sand-500">{formatDate(item.created_at)}</p>
                       </div>
                     </div>
                     <span className={`font-mono font-medium ${
                       item.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-wood-900 dark:text-sand-100'
                     }`}>
                       {item.points > 0 ? '+' : ''}{item.points} pts
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 text-center text-wood-400">
                 <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p>Aún no tienes movimientos en tu historial.</p>
                 <p className="text-xs mt-2">Realiza una compra para empezar a acumular puntos.</p>
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
                  <span className="font-bold text-wood-900 dark:text-sand-100">{currentPoints.toLocaleString()} pts</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 dark:text-sand-300 mb-2">
                    ¿Cuántos puntos deseas usar?
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      max={currentPoints}
                      min={1}
                      className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-wood-700 bg-white dark:bg-wood-950 text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-wood-400">pts</span>
                  </div>
                  <p className="mt-2 text-sm text-wood-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Equivalente a <span className="font-bold text-wood-900 dark:text-sand-200">
                      ${(parseInt(redeemAmount || '0') * 0.01).toFixed(2)} MXN
                    </span>
                  </p>
                </div>

                {redeemError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {redeemError}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>El descuento se aplicará automáticamente en tu próxima compra al finalizar el pedido.</p>
                </div>

                <button 
                  className="w-full py-3.5 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 font-medium rounded-xl hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleRedeem}
                  disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > currentPoints || redeeming}
                >
                  {redeeming && <Loader2 className="w-4 h-4 animate-spin" />}
                  {redeeming ? 'Canjeando...' : 'Aplicar canje'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
