"use client";

import React, { useState, useEffect } from 'react';
import { Package, MapPin, CreditCard, ChevronRight, TrendingUp, Lock, Mail, Award, Clock, AlertCircle, CheckCircle, ArrowRight, Info, Loader2 } from 'lucide-react';
import { AccountSection } from '@/components/pages/AccountPage';
import { getTierName, normalizeTierId, getTierInlineStyles, LoyaltyTierConfig } from '@/data/loyalty';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useLoyaltyConfig } from '@/hooks/useLoyaltyConfig';
const appleWalletImg = "/images/apple-wallet.png";
const googleWalletImg = "/images/google-wallet.png";

interface AccountOverviewProps {
  onChangeSection: (section: AccountSection) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({ onChangeSection }) => {
  const { user, medusaCustomer } = useAuth();
  const { profile: loyaltyProfile, loading: loyaltyLoading } = useLoyalty();
  const { config: loyaltyConfig } = useLoyaltyConfig();

  // Derive display name
  const displayName = medusaCustomer?.first_name
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Miembro';

  // Real Loyalty State from Supabase (with fallback to 0 for new users)
  // lifetime_spend is stored in centavos in Supabase, convert to pesos for display
  const lifetimeSpend = loyaltyProfile?.lifetime_spend ? loyaltyProfile.lifetime_spend / 100 : 0;
  const currentPoints = loyaltyProfile?.points_balance ?? 0;
  const rawTierId = loyaltyProfile?.current_tier || 'pino';
  const normalizedId = normalizeTierId(rawTierId);
  const lifetimeSpendCentavos = loyaltyProfile?.lifetime_spend ?? 0;
  const currentTierConfig: LoyaltyTierConfig = loyaltyConfig.tiers.find(t => t.id === normalizedId)
    || loyaltyConfig.tiers.find(t => lifetimeSpendCentavos >= t.min_spend && (t.max_spend === null || lifetimeSpendCentavos <= t.max_spend))
    || loyaltyConfig.tiers[0];
  const tierStyles = getTierInlineStyles(currentTierConfig);

  // Member since date from loyalty profile or user created_at
  const memberSince = loyaltyProfile?.created_at
    ? new Date(loyaltyProfile.created_at).toLocaleDateString('es-MX', { month: '2-digit', year: 'numeric' })
    : user?.created_at
      ? new Date(user.created_at).toLocaleDateString('es-MX', { month: '2-digit', year: 'numeric' })
      : '--/--';

  // Customer ID display (short hash from user id)
  const customerIdDisplay = user?.id
    ? `DS-${user.id.slice(-4).toUpperCase()}`
    : 'DS-----';

  // ── Fetch last order from Medusa ──
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
    async function fetchLastOrder() {
      try {
        if (!user?.email) return;
        const res = await fetch(`/api/account/orders?limit=1`);
        if (res.ok) {
          const data = await res.json();
          const orders = data.orders || [];
          if (orders.length > 0) setLastOrder(orders[0]);
        }
      } catch { /* silent */ }
      finally { setOrderLoading(false); }
    }
    fetchLastOrder();
  }, [user?.email]);

  // Derive order progress from fulfillment_status
  const getOrderProgress = (order: any): number => {
    if (!order) return 0;
    const fs = order.fulfillment_status;
    if (fs === 'fulfilled' || fs === 'delivered') return 4;
    if (fs === 'shipped' || fs === 'partially_shipped') return 3;
    if (fs === 'partially_fulfilled') return 2;
    // not_fulfilled but payment captured = confirmed/in production
    if (order.payment_status === 'captured') return 1;
    return 0;
  };

  const activeOrder = lastOrder ? {
    id: String(lastOrder.display_id || '').padStart(4, '0'),
    status: lastOrder.fulfillment_status || 'pending',
    date: new Date(lastOrder.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    items: (lastOrder.items || []).map((i: any) => i.title || 'Producto'),
    total: `${((lastOrder.total || 0) / 100).toLocaleString()} MXN`,
    progress: getOrderProgress(lastOrder),
  } : null;

  // Dynamic notifications based on real state
  const notifications: { id: number; text: string; date: string; type: string }[] = [];
  if (currentPoints >= 1000) {
    notifications.push({ id: 1, text: `Tienes ${currentPoints.toLocaleString()} puntos disponibles (${(currentPoints * 0.01).toFixed(2)} MXN). ¡Úsalos en tu próxima compra!`, date: 'Programa de lealtad', type: 'success' });
  }
  if (activeOrder && activeOrder.progress < 4 && activeOrder.progress > 0) {
    notifications.push({ id: 2, text: `Tu pedido #${activeOrder.id} está en proceso.`, date: activeOrder.date, type: 'warning' });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Row: Loyalty & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Card */}
        {/* DavidSon's Premium Member Card Module */}
        <div className="lg:col-span-3 bg-wood-50 dark:bg-wood-900/50 rounded-3xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm relative overflow-hidden group">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-wood-200/20 dark:bg-wood-800/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            
            {/* Top Section: Welcome & Progress */}
            <div>
               <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 mb-6">
                  <div>
                    <h2 className="font-serif text-3xl text-wood-900 dark:text-sand-50 mb-1">Hola, {displayName}</h2>
                    <p className="text-wood-500 dark:text-sand-300 text-sm">
                       Tienes <span className="font-bold text-wood-900 dark:text-sand-100">${(currentPoints * 0.01).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span> disponibles en puntos.
                    </p>
                  </div>
               </div>
               
               {/* Progress Bar Area */}
               {(() => {
                  const nextTierConfig = loyaltyConfig.tiers.find(t => t.min_spend > lifetimeSpendCentavos);
                  const nextTierThresholdPesos = nextTierConfig ? Math.round(nextTierConfig.min_spend / 100) : lifetimeSpend;
                  const progressPercent = nextTierConfig ? Math.min(100, (lifetimeSpend / nextTierThresholdPesos) * 100) : 100;
                  const nextTierStyles = nextTierConfig ? getTierInlineStyles(nextTierConfig) : null;
                  
                  return (
                    <div className="bg-white dark:bg-wood-800 rounded-xl p-5 border border-wood-100 dark:border-wood-700 shadow-sm mb-2">
                      <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2">
                           <Award className="w-4 h-4 text-accent-gold" />
                           <span className="text-xs font-bold uppercase tracking-wider text-wood-500 dark:text-sand-300">
                              {nextTierConfig ? `Próximo Nivel: ${nextTierConfig.name}` : 'Nivel Máximo Alcanzado'}
                           </span>
                         </div>
                         <span className="text-xs font-bold text-wood-900 dark:text-sand-100">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-wood-100 dark:bg-wood-900 rounded-full overflow-hidden mb-3">
                         <div 
                           className="h-full rounded-full transition-all duration-1000"
                           style={{ width: `${progressPercent}%`, backgroundColor: currentTierConfig.colors.gradient_via }}
                         ></div>
                      </div>
                      <div className="flex justify-between items-start text-xs">
                         <span className="text-wood-500 dark:text-sand-400">
                            {nextTierConfig ? `Faltan $${(nextTierThresholdPesos - lifetimeSpend).toLocaleString()} para subir de nivel` : 'Disfruta de tus beneficios exclusivos.'}
                         </span>
                      </div>
                    </div>
                  );
               })()}
            </div>

            {/* Bottom Section: Card & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               {/* Digital Card */}
               <div className="lg:col-span-7 xl:col-span-6">
                  <div 
                     className="w-full aspect-[1.58/1] rounded-2xl p-8 border shadow-xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.01] cursor-pointer group/card"
                     style={{ ...tierStyles.card, borderColor: currentTierConfig.colors.gradient_from + '60' }}
                     onClick={() => onChangeSection('wallet')}
                  >
                     {/* Card Texture */}
                     <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                     <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out z-10 pointer-events-none"></div>

                     {/* Inner Layout */}
                     <div className="relative z-20 h-full flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-serif text-xl tracking-wide leading-none text-wood-900">DavidSon's</h3>
                              <p className="text-[9px] uppercase tracking-widest mt-1.5 text-wood-600 font-medium">Design Member</p>
                           </div>
                           <span className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm" style={tierStyles.badge}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTierConfig.colors.gradient_via }}></div>
                              {currentTierConfig.name}
                           </span>
                        </div>

                        {/* Balance Block */}
                        <div className="flex flex-col gap-5">
                           <div className="flex items-center gap-3 opacity-90">
                              <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-yellow-100 to-yellow-600 shadow-inner border border-yellow-700/30 flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '4px 4px' }}></div>
                                 <div className="w-6 h-4 border border-black/20 rounded-sm"></div>
                              </div>
                              <CreditCard className="w-6 h-6 text-wood-500 rotate-90" strokeWidth={1.5} />
                           </div>
                           
                           <div>
                              <div className="flex justify-between items-end text-[10px] uppercase tracking-wider mb-1 text-wood-600 font-medium">
                                 <span>Saldo Disponible</span>
                                 <span className="font-mono text-wood-800">{currentPoints.toLocaleString()} pts</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                 <span className="font-mono text-2xl sm:text-3xl tracking-tight drop-shadow-sm truncate text-wood-900">
                                   ${(currentPoints * 0.01).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                 </span>
                                 <span className="text-xs font-bold text-wood-500 mb-1">MXN</span>
                              </div>
                           </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-end border-t border-wood-900/10 dark:border-white/10 pt-4">
                           <div>
                               <p className="text-[8px] uppercase tracking-widest mb-0.5 text-wood-500 dark:text-sand-500 font-bold">Miembro Desde</p>
                               <p className="font-mono text-[10px] text-wood-800 dark:text-sand-200">{memberSince}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-[8px] uppercase tracking-widest mb-0.5 text-wood-500 dark:text-sand-500 font-bold">ID Cliente</p>
                               <p className="font-mono text-[10px] text-wood-800 dark:text-sand-200 tracking-wider">{customerIdDisplay}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Action Buttons (Right Grid) */}
               <div className="lg:col-span-5 xl:col-span-6 flex flex-col gap-4 h-full">
                   {/* Wallet Integration — Próximamente */}
                   <div className="grid grid-cols-2 gap-3 shrink-0">
                       <button disabled className="w-full h-12 bg-black/40 text-white/50 rounded-xl flex items-center justify-center px-2 cursor-not-allowed relative">
                          <span className="text-xs font-medium mr-1.5">Add to</span>
                          <span className="text-sm font-bold tracking-wide">Apple Wallet</span>
                          <span className="absolute -top-2 -right-2 text-[8px] bg-accent-gold text-white px-1.5 py-0.5 rounded-full font-bold">Pronto</span>
                       </button>
                       <button disabled className="w-full h-12 bg-black/40 text-white/50 rounded-xl flex items-center justify-center px-2 cursor-not-allowed relative">
                          <span className="text-xs font-medium mr-1.5">Add to</span>
                          <span className="text-sm font-bold tracking-wide">Google Wallet</span>
                          <span className="absolute -top-2 -right-2 text-[8px] bg-accent-gold text-white px-1.5 py-0.5 rounded-full font-bold">Pronto</span>
                       </button>
                   </div>

                   {/* Management Tools */}
                   <div className="flex flex-col gap-3 flex-1">
                       <button 
                          onClick={() => onChangeSection('loyalty')}
                          className="group flex items-center p-4 rounded-2xl bg-wood-50 dark:bg-wood-800/40 border border-wood-100 dark:border-wood-700 hover:bg-white dark:hover:bg-wood-800 hover:shadow-md transition-all text-left"
                       >
                          <div className="w-10 h-10 rounded-full bg-wood-200/50 dark:bg-wood-700/50 flex items-center justify-center text-wood-700 dark:text-sand-200 group-hover:bg-wood-900 group-hover:text-sand-50 dark:group-hover:bg-sand-50 dark:group-hover:text-wood-900 transition-colors shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <span className="block text-sm font-serif font-bold text-wood-900 dark:text-sand-50">Historial</span>
                            <span className="text-[10px] text-wood-500 dark:text-wood-400 leading-tight block truncate">Consulta tus movimientos y puntos.</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-wood-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                       </button>

                       <a href="/programa-lealtad" className="group flex items-center p-4 rounded-2xl bg-wood-50 dark:bg-wood-800/40 border border-wood-100 dark:border-wood-700 hover:bg-white dark:hover:bg-wood-800 hover:shadow-md transition-all text-left">
                          <div className="w-10 h-10 rounded-full bg-wood-200/50 dark:bg-wood-700/50 flex items-center justify-center text-wood-700 dark:text-sand-200 group-hover:bg-accent-gold group-hover:text-wood-900 transition-colors shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <span className="block text-sm font-serif font-bold text-wood-900 dark:text-sand-50">Beneficios</span>
                            <span className="text-[10px] text-wood-500 dark:text-wood-400 leading-tight block truncate">Conoce las ventajas de tu nivel.</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-wood-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                       </a>
                   </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Middle Row: Active Order Tracking */}
      <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
        {orderLoading ? (
          <div className="flex items-center justify-center py-8 text-wood-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando pedidos...</div>
        ) : !activeOrder ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 mx-auto mb-3 text-wood-200 dark:text-wood-700" />
            <p className="text-sm text-wood-500 dark:text-sand-400 mb-3">Aún no tienes pedidos</p>
            <a href="/shop" className="text-sm text-accent-gold hover:underline font-medium">Explorar productos →</a>
          </div>
        ) : (
        <>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Último Pedido</h3>
              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                #DSD-{activeOrder.id}
              </span>
            </div>
            <p className="text-sm text-wood-500 dark:text-sand-400">Realizado el {activeOrder.date} • Total: <span className="font-medium text-wood-900 dark:text-sand-200">{activeOrder.total}</span></p>
          </div>
          <button 
            onClick={() => onChangeSection('orders')}
            className="text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Ver detalles <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Order Progress Bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-wood-100 dark:bg-wood-800 rounded-full w-full absolute top-1/2 -translate-y-1/2"></div>
          <div 
            className="h-2 bg-accent-gold rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
            style={{ width: `${activeOrder.progress * 25}%` }}
          ></div>
          <div className="relative z-10 flex justify-between w-full px-1">
            {[
              { label: 'Confirmado', icon: CheckCircle },
              { label: 'Producción', icon: Award },
              { label: 'Enviado', icon: Package },
              { label: 'Entregado', icon: MapPin }
            ].map((step, index) => {
              const isCompleted = index < activeOrder.progress;
              const isCurrent = index === activeOrder.progress;
              const isActive = index <= activeOrder.progress;
              const Icon = step.icon;
              
              return (
                <div key={step.label} className="flex flex-col items-center gap-3">
                  <div 
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                      isCurrent ? 'scale-125' : ''
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-colors duration-300 bg-white/0 ${
                        isCurrent 
                          ? 'text-accent-gold filter drop-shadow-sm fill-wood-900/0' 
                          : isActive 
                            ? 'text-wood-900 dark:text-sand-100 fill-wood-900/0' 
                            : 'text-wood-300 dark:text-wood-700 fill-wood-900/0'
                      }`} 
                      strokeWidth={isActive ? 2 : 1.5} 
                    />
                    
                    {/* Current Step Ambient Glow */}
                    {isCurrent && (
                      <>
                        <span className="absolute -inset-2 rounded-full bg-accent-gold/5 blur-md" />
                        <span className="absolute -inset-1 rounded-full border border-accent-gold/30 animate-ping opacity-50" />
                      </>
                    )}
                  </div>
                  
                  {/* Text Label - Prioritized visibility for current step */}
                  <div className={`flex flex-col items-center transition-all duration-300 ${isCurrent ? 'opacity-100 translate-y-0' : 'opacity-60 hover:opacity-100'}`}>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      isCurrent 
                        ? 'text-wood-900 dark:text-sand-100' 
                        : 'text-wood-400 dark:text-wood-600'
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-medium text-accent-gold mt-0.5">En proceso</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-wood-50 dark:bg-wood-800/50 rounded-xl p-4 flex items-start gap-4">
          <div className="w-12 h-12 bg-white dark:bg-wood-800 rounded-lg flex items-center justify-center border border-wood-100 dark:border-wood-700 shrink-0">
             <Package className="w-6 h-6 text-wood-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-wood-900 dark:text-sand-100 mb-0.5">{activeOrder.items[0]}</p>
            {activeOrder.items.length > 1 && (
              <p className="text-xs text-wood-500 dark:text-sand-400">+{activeOrder.items.length - 1} artículo(s) más</p>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Bottom Row: Services & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
          <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-gold" />
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Mis Pedidos', desc: 'Ver historial de compras', section: 'orders' as AccountSection, icon: Package },
              { label: 'Mis Direcciones', desc: 'Gestionar direcciones de envío', section: 'addresses' as AccountSection, icon: MapPin },
              { label: 'Programa de Lealtad', desc: `${currentPoints.toLocaleString()} puntos disponibles`, section: 'loyalty' as AccountSection, icon: Award },
            ].map((action) => (
              <button key={action.label} onClick={() => onChangeSection(action.section)} className="w-full flex items-center justify-between p-3 bg-wood-50 dark:bg-wood-800/30 rounded-xl border border-wood-100 dark:border-wood-800/50 hover:bg-wood-100 dark:hover:bg-wood-800 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 text-wood-400" />
                  <div>
                    <p className="text-sm font-medium text-wood-900 dark:text-sand-100">{action.label}</p>
                    <p className="text-xs text-wood-500 dark:text-sand-400">{action.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-wood-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Important Notifications */}
        <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
          <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-wood-400" />
            Avisos Importantes
          </h3>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-wood-400 dark:text-sand-500 py-4 text-center">Todo en orden. Sin avisos pendientes.</p>
            ) : notifications.map(notif => (
              <div key={notif.id} className="flex gap-3 items-start group cursor-pointer hover:bg-wood-50 dark:hover:bg-wood-800/30 p-2 -mx-2 rounded-lg transition-colors">
                 <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                   notif.type === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                 }`}></div>
                 <div>
                   <p className="text-sm text-wood-700 dark:text-sand-200 leading-snug group-hover:text-wood-900 dark:group-hover:text-sand-100 transition-colors">
                     {notif.text}
                   </p>
                   <p className="text-[10px] text-wood-400 dark:text-sand-500 mt-1 uppercase tracking-wider font-medium">
                     {notif.date}
                   </p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};