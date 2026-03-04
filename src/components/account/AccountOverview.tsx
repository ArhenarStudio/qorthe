"use client";

import React from 'react';
import { Package, MapPin, CreditCard, ChevronRight, TrendingUp, Lock, Mail, Award, Clock, AlertCircle, CheckCircle, ArrowRight, Info, Loader2 } from 'lucide-react';
import { AccountSection } from '@/components/pages/AccountPage';
import { LOYALTY_TIERS, getTierName, normalizeTierId } from '@/data/loyalty';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';
const appleWalletImg = "/images/apple-wallet.png";
const googleWalletImg = "/images/google-wallet.png";

interface AccountOverviewProps {
  onChangeSection: (section: AccountSection) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({ onChangeSection }) => {
  const { user, medusaCustomer } = useAuth();
  const { profile: loyaltyProfile, loading: loyaltyLoading } = useLoyalty();

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
  const currentTier = LOYALTY_TIERS.find(t => t.id === normalizeTierId(rawTierId))
    || LOYALTY_TIERS.find(t => lifetimeSpend >= t.minSpend && (t.maxSpend === null || lifetimeSpend <= t.maxSpend))
    || LOYALTY_TIERS[0];

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

  // Mock Data for Dashboard
  const activeOrder = {
    id: '4829',
    status: 'En Producción',
    date: '14 Feb 2024',
    items: ['Cartera Bifold - Piel Exótica', 'Cinturón Clásico'],
    total: '$3,850 MXN',
    progress: 2 // 0: Placed, 1: Confirmed, 2: Production, 3: Shipped, 4: Delivered
  };

  const activeServices = [
    { id: 1, name: 'Grabado de Iniciales', item: 'Cartera Bifold', status: 'En proceso' }
  ];

  const notifications = [
    { id: 1, text: 'Tu devolución del pedido #4102 ha sido aprobada.', date: 'Hace 2 horas', type: 'success' },
    { id: 2, text: 'Tienes un cupón de 10% por vencer en 3 días.', date: 'Hace 1 día', type: 'warning' }
  ];

  const walletBalance = 1200.00;

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
                  const nextTier = LOYALTY_TIERS.find(t => t.minSpend > lifetimeSpend);
                  const nextTierThreshold = nextTier ? nextTier.minSpend : lifetimeSpend;
                  const progressPercent = nextTier ? Math.min(100, (lifetimeSpend / nextTierThreshold) * 100) : 100;
                  
                  return (
                    <div className="bg-white dark:bg-wood-800 rounded-xl p-5 border border-wood-100 dark:border-wood-700 shadow-sm mb-2">
                      <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2">
                           <Award className="w-4 h-4 text-accent-gold" />
                           <span className="text-xs font-bold uppercase tracking-wider text-wood-500 dark:text-sand-300">
                              {nextTier ? `Próximo Nivel: ${nextTier.name}` : 'Nivel Máximo Alcanzado'}
                           </span>
                         </div>
                         <span className="text-xs font-bold text-wood-900 dark:text-sand-100">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-wood-100 dark:bg-wood-900 rounded-full overflow-hidden mb-3">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                              currentTier.id === 'ebano' ? 'bg-indigo-500' :
                              currentTier.id === 'parota' ? 'bg-yellow-600' :
                              currentTier.id === 'nogal' ? 'bg-amber-700' :
                              'bg-amber-500'
                           }`}
                           style={{ width: `${progressPercent}%` }}
                         ></div>
                      </div>
                      <div className="flex justify-between items-start text-xs">
                         <span className="text-wood-500 dark:text-sand-400">
                            {nextTier ? `Faltan $${(nextTierThreshold - lifetimeSpend).toLocaleString()} para subir de nivel` : 'Disfruta de tus beneficios exclusivos.'}
                         </span>
                         {nextTier && <span className="font-medium text-wood-900 dark:text-sand-200 text-right max-w-[50%]">Desbloquea: {nextTier.benefits[nextTier.benefits.length - 1]}</span>}
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
                     className={`w-full aspect-[1.58/1] rounded-2xl p-8 border shadow-xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.01] cursor-pointer group/card ${currentTier.styles.card}`}
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
                           <span className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${currentTier.styles.badge.replace('bg-', 'bg-opacity-80 bg-')}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${currentTier.id === 'ebano' ? 'bg-indigo-600' : currentTier.id === 'parota' ? 'bg-yellow-700' : currentTier.id === 'nogal' ? 'bg-amber-800' : 'bg-amber-600'}`}></div>
                              {currentTier.name}
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
                   {/* Wallet Integration Actions */}
                   <div className="grid grid-cols-2 gap-3 shrink-0">
                       <button className="group hover:scale-[1.02] active:scale-95 transition-all w-full h-12 bg-black text-white rounded-xl shadow-md flex items-center justify-center px-2">
                          <span className="text-xs font-medium text-white/80 mr-1.5">Add to</span>
                          <span className="text-sm font-bold tracking-wide">Apple Wallet</span>
                       </button>

                       <button className="group hover:scale-[1.02] active:scale-95 transition-all w-full h-12 bg-black text-white rounded-xl shadow-md flex items-center justify-center px-2">
                          <span className="text-xs font-medium text-white/80 mr-1.5">Add to</span>
                          <span className="text-sm font-bold tracking-wide">Google Wallet</span>
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
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Último Pedido</h3>
              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                #{activeOrder.id}
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
      </div>

      {/* Bottom Row: Services & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Services */}
        <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
          <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-gold" />
            Servicios Activos
          </h3>
          <div className="space-y-3">
            {activeServices.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-wood-50 dark:bg-wood-800/30 rounded-xl border border-wood-100 dark:border-wood-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-wood-900 dark:text-sand-100">{service.name}</p>
                    <p className="text-xs text-wood-500 dark:text-sand-400">{service.item}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-md uppercase tracking-wider">
                  {service.status}
                </span>
              </div>
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
            {notifications.map(notif => (
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