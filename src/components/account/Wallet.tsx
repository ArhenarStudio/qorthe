"use client";

import React from 'react';
import { CreditCard, ShieldCheck, Award, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { getTierInlineStyles, normalizeTierId } from '@/data/loyalty';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useLoyaltyConfig } from '@/hooks/useLoyaltyConfig';
import { useAuth } from '@/contexts/AuthContext';

export const Wallet = () => {
  const { user, medusaCustomer } = useAuth();
  const { profile: loyaltyProfile } = useLoyalty();
  const { config: loyaltyConfig } = useLoyaltyConfig();
  const rawTierId = loyaltyProfile?.current_tier || 'pino';
  const normalizedId = normalizeTierId(rawTierId);
  const currentTierConfig = loyaltyConfig.tiers.find(t => t.id === normalizedId) || loyaltyConfig.tiers[0];
  const tierStyles = getTierInlineStyles(currentTierConfig);

  // Real data
  const currentPoints = loyaltyProfile?.points_balance ?? 0;
  const pointsValue = (currentPoints * 0.01).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const displayName = medusaCustomer?.first_name
    ? [medusaCustomer.first_name, medusaCustomer.last_name].filter(Boolean).join(' ')
    : user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Miembro';
  const customerIdDisplay = user?.id ? `DS-${user.id.slice(-4).toUpperCase()}` : 'DS-----';
  const memberSince = loyaltyProfile?.created_at
    ? new Date(loyaltyProfile.created_at).toLocaleDateString('es-MX', { month: '2-digit', year: '2-digit' })
    : user?.created_at
      ? new Date(user.created_at).toLocaleDateString('es-MX', { month: '2-digit', year: '2-digit' })
      : '--/--';

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-50">Billetera Digital</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* DavidSon's Design Member Card (Real Data) */}
        <motion.div 
           whileHover={{ y: -5 }}
           className="relative aspect-[1.58/1] max-w-md rounded-2xl p-8 border shadow-xl overflow-hidden group/card"
           style={{ ...tierStyles.card, ...tierStyles.cardText, borderColor: currentTierConfig.colors.gradient_from + '60' }}
        >
             {/* Card Texture */}
             <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out z-10 pointer-events-none"></div>

             {/* Inner Layout */}
             <div className="relative z-20 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-serif text-xl tracking-wide leading-none text-wood-900">DavidSon&apos;s</h3>
                      <p className="text-[9px] uppercase tracking-widest mt-1.5 text-wood-600 font-medium">Design Member</p>
                   </div>
                   <span className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm" style={tierStyles.badge}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTierConfig.colors.gradient_via }}></div>
                      {currentTierConfig.name}
                   </span>
                </div>

                {/* Balance Block */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 opacity-90">
                      <div className="w-10 h-7 rounded bg-gradient-to-tr from-yellow-100 to-yellow-600 shadow-inner border border-yellow-700/30 flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '4px 4px' }}></div>
                         <div className="w-5 h-3 border border-black/20 rounded-sm"></div>
                      </div>
                      <CreditCard className="w-5 h-5 text-wood-600 rotate-90" strokeWidth={1.5} />
                   </div>
                   
                   <div>
                      <div className="flex justify-between items-end text-[10px] uppercase tracking-wider mb-0.5 text-wood-600 font-medium">
                         <span>Saldo Disponible</span>
                         <span className="font-mono text-wood-800">{currentPoints.toLocaleString()} pts</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                         <span className="font-mono text-3xl tracking-tight drop-shadow-sm truncate text-wood-900">
                           ${pointsValue}
                         </span>
                         <span className="text-[10px] font-bold text-wood-600 mb-1">MXN</span>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t border-wood-900/10 pt-3">
                   <div>
                       <p className="text-[7px] uppercase tracking-widest mb-0.5 text-wood-500 font-bold">Miembro Desde</p>
                       <p className="font-mono text-[10px] text-wood-800">{memberSince}</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[7px] uppercase tracking-widest mb-0.5 text-wood-500 font-bold">ID Cliente</p>
                       <p className="font-mono text-[10px] text-wood-800 tracking-wider">{customerIdDisplay}</p>
                   </div>
                </div>
             </div>
        </motion.div>

        {/* Payment Methods Info */}
        <div className="flex flex-col justify-center gap-6">
          <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-wood-900 dark:text-sand-100 mb-1">Métodos de pago seguros</h4>
                <p className="text-xs text-wood-500 dark:text-sand-400 leading-relaxed">
                  Tus datos de pago son procesados de forma segura por Stripe y MercadoPago al momento del checkout. No almacenamos información de tarjetas.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-wood-100 dark:bg-wood-800 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-wood-500 dark:text-sand-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-wood-900 dark:text-sand-100 mb-1">Puntos de lealtad</h4>
                <p className="text-xs text-wood-500 dark:text-sand-400 leading-relaxed">
                  Tienes <span className="font-bold text-wood-900 dark:text-sand-100">{currentPoints.toLocaleString()} puntos</span> disponibles (${pointsValue} MXN). Puedes canjearlos como descuento en tu próxima compra desde el checkout.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sand-50 dark:bg-wood-800/50 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-wood-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-wood-400 dark:text-sand-500 leading-relaxed">
              Aceptamos Visa, Mastercard, American Express vía Stripe, y todos los métodos de MercadoPago (tarjeta, OXXO, transferencia). También puedes pagar con PayPal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
