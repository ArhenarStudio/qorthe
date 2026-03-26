"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Award, Check, ChevronRight, Star, CreditCard, Gift, TrendingUp, Shield, Zap, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LoyaltyTier, LoyaltyTierConfig, getTierInlineStyles, getTierBenefits } from '@/data/loyalty';
import { useLoyaltyConfig } from '@/hooks/useLoyaltyConfig';

// --- Sub-components ---

const LoyaltyCard = ({ tier }: { tier: LoyaltyTierConfig }) => {
  const s = getTierInlineStyles(tier);
  return (
    <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-500 scale-105 z-10">
      {/* Background Gradient */}
      <div className="absolute inset-0 rounded-2xl" style={s.card} />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 w-full h-full opacity-[0.03] rounded-2xl pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
      />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none transform translate-x-[-100%] hover:translate-x-[100%]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between" style={s.cardText}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Qorthe</span>
            <span className="text-lg font-serif font-bold italic">Membership</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-current opacity-30 flex items-center justify-center">
             <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-200/40 to-yellow-500/40 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-5 border border-white/30 rounded-sm grid grid-cols-2 gap-px p-1">
               <div className="bg-white/20 rounded-[1px]"></div>
               <div className="bg-white/20 rounded-[1px]"></div>
               <div className="bg-white/20 rounded-[1px]"></div>
               <div className="bg-white/20 rounded-[1px]"></div>
            </div>
          </div>
          <Zap className="w-5 h-5 opacity-60" />
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Titular</p>
            <p className="font-mono text-sm tracking-wide font-medium">USUARIO EJEMPLO</p>
          </div>
          <div className="text-right">
             <p className="text-2xl font-serif font-bold tracking-tight">{tier.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, description, icon: Icon }: { number: string, title: string, description: string, icon: any }) => (
  <div className="relative p-6 rounded-2xl bg-wood-50 dark:bg-wood-800/50 border border-wood-100 dark:border-wood-700 transition-all hover:shadow-lg group">
    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-wood-900 text-sand-50 flex items-center justify-center font-serif font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
      {number}
    </div>
    <div className="mb-4 text-wood-400 dark:text-sand-400 group-hover:text-accent-gold transition-colors">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-serif font-bold text-wood-900 dark:text-sand-50 mb-2">{title}</h3>
    <p className="text-wood-600 dark:text-sand-300 text-sm leading-relaxed">{description}</p>
  </div>
);

// --- Main Page Component ---

export const LoyaltyPage = () => {
  const { tiers: LOYALTY_TIERS, config, loading } = useLoyaltyConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-wood-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-wood-900 transition-colors duration-300">
      
      {/* Hero Section */}
            <section className="relative min-h-[100dvh] lg:min-h-[85vh] overflow-hidden bg-wood-50 dark:bg-wood-950 flex items-center py-12 lg:py-0 transition-colors duration-500">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[80vw] lg:w-[50vw] h-full bg-[#E8E0D5] dark:bg-wood-900/40 opacity-40 skew-x-12 translate-x-10 lg:translate-x-32 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-white dark:bg-wood-900/20 rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2 transition-colors duration-500" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            
            {/* Content - Typography Focused */}
            <div className="w-full lg:col-span-5 space-y-6 lg:space-y-10 text-center lg:text-left order-1">
              <div className="space-y-3 lg:space-y-4">
                <span className="inline-block text-[#C5A065] font-sans text-xs lg:text-sm font-bold tracking-[0.2em] uppercase border-b border-[#C5A065] pb-2">
                  Membership Club
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-wood-900 dark:text-sand-100 leading-[1.15] lg:leading-[1.1] transition-colors duration-300">
                  El arte de <br />
                  <span className="italic text-[#C5A065]">pertenecer.</span>
                </h1>
                <p className="font-sans text-wood-600 dark:text-sand-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0 lg:max-w-md lg:border-l-2 border-[#C5A065]/30 lg:pl-6 transition-colors duration-300">
                  Un ecosistema de recompensas curado para quienes valoran la artesanía y el diseño atemporal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 lg:gap-6 pt-2 lg:pt-4">
                <Link 
                  href="/auth" 
                  className="w-full sm:w-auto group relative px-8 py-4 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 font-sans text-sm tracking-widest uppercase overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 rounded-lg lg:rounded-none shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Unirse al Club <ChevronRight className="w-4 h-4 text-[#C5A065] dark:text-wood-700" />
                  </span>
                  <div className="absolute inset-0 bg-[#3A3A3A] dark:bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </Link>
                <Link 
                  href="/auth" 
                  className="w-full sm:w-auto px-8 py-4 text-wood-900 dark:text-sand-100 font-sans text-sm font-bold tracking-widest uppercase hover:text-[#C5A065] dark:hover:text-[#C5A065] transition-colors border border-wood-200 dark:border-wood-700 lg:border-none rounded-lg lg:rounded-none text-center bg-white/50 dark:bg-wood-800/50 lg:bg-transparent"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
            
            {/* Visual - Cards Display */}
            <div className="w-full lg:col-span-7 relative h-[400px] lg:h-[700px] flex items-center justify-center order-2 mt-4 lg:mt-0">
              {/* Decorative Circle */}
              <div className="absolute w-[280px] lg:w-[500px] h-[280px] lg:h-[500px] border border-[#C5A065]/20 rounded-full" />
              
              <div className="
                w-full h-full 
                flex lg:block 
                items-center 
                overflow-x-auto lg:overflow-visible 
                snap-x snap-mandatory lg:snap-none 
                gap-6 lg:gap-0 
                px-6 lg:px-0 
                pb-8 lg:pb-0
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
              ">
                {config.tiers.map((tier, index) => {
                  // Desktop Positioning (Diagonal Cascade)
                  const desktopClasses = [
                    "lg:top-[68%] lg:left-[2%] lg:z-10 lg:scale-90 lg:opacity-90 lg:hover:z-50 lg:hover:scale-95",    
                    "lg:top-[48%] lg:left-[14%] lg:z-20 lg:scale-95 lg:opacity-95 lg:hover:z-50 lg:hover:scale-100",  
                    "lg:top-[28%] lg:left-[26%] lg:z-30 lg:scale-100 lg:hover:z-50 lg:hover:scale-105",             
                    "lg:top-[8%] lg:left-[38%] lg:z-40 lg:scale-105 lg:hover:scale-110 lg:shadow-2xl"               
                  ][index];

                  return (
                    <div 
                      key={tier.id}
                      className={`
                        relative lg:absolute 
                        flex-none w-[280px] lg:w-[320px] 
                        snap-center
                        transition-all duration-700 ease-out 
                        ${desktopClasses}
                      `}
                    >
                       {/* Connection Line (Desktop Only) */}
                       {index < config.tiers.length - 1 && (
                         <div className="hidden lg:block absolute top-1/2 -right-[15%] w-[30%] h-px bg-[#C5A065]/30 -z-10 rotate-[-15deg]" />
                       )}
                       
                       <LoyaltyCard tier={tier} />
                       
                       {/* Label (Desktop Only) */}
                       <div className="hidden lg:block absolute -bottom-8 left-6 text-wood-400 font-serif italic text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                         Nivel {tier.name}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white dark:bg-wood-900 border-t border-wood-100 dark:border-wood-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-wood-900 dark:text-sand-50 mb-4">¿Cómo funciona?</h2>
            <p className="text-wood-500 dark:text-sand-400 max-w-2xl mx-auto">
              Nuestro sistema es simple y transparente. Sin letras chiquitas, solo recompensas reales por valorar el buen diseño.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard 
              number="01"
              title="Compra y Acumula"
              description={`Por cada $1 MXN que inviertes en piezas Qorthe, recibes ${config.points_per_mxn} punto${config.points_per_mxn > 1 ? 's' : ''} en tu cuenta automáticamente.`}
              icon={CreditCard}
            />
            <StepCard 
              number="02"
              title="Sube de Nivel"
              description="Acumula puntos para desbloquear niveles superiores. Tus puntos no caducan mientras te mantengas activo."
              icon={TrendingUp}
            />
            <StepCard 
              number="03"
              title="Disfruta"
              description={`Usa tus puntos como dinero efectivo en el checkout. ${config.min_redeem_points} puntos equivalen a $${(config.min_redeem_points * config.point_value_mxn).toFixed(2)} MXN de descuento directo.`}
              icon={Gift}
            />
          </div>

          {/* Conversion Infographic */}
          <div className="mt-16 bg-wood-50 dark:bg-wood-800 rounded-2xl p-8 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 border border-wood-100 dark:border-wood-700">
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold text-wood-900 dark:text-sand-50 mb-1">{config.points_per_mxn}</span>
              <span className="text-xs uppercase tracking-widest text-wood-500 dark:text-sand-400">Punto{config.points_per_mxn > 1 ? 's' : ''}</span>
            </div>
            <div className="h-px w-20 bg-wood-300 dark:bg-wood-600 relative">
               <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-wood-400 dark:text-sand-500">=</div>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold text-accent-gold mb-1">${config.point_value_mxn}</span>
              <span className="text-xs uppercase tracking-widest text-wood-500 dark:text-sand-400">MXN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers System */}
      <section className="py-20 bg-wood-50 dark:bg-wood-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-wood-900 dark:text-sand-50 mb-4">Niveles y Beneficios</h2>
            <p className="text-wood-500 dark:text-sand-400">Cuanto más coleccionas, más exclusivo se vuelve tu acceso.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {config.tiers.map((tier) => {
              const minPesos = Math.round(tier.min_spend / 100);
              const maxPesos = tier.max_spend ? Math.round(tier.max_spend / 100) : null;
              const range = maxPesos 
                ? `$${minPesos.toLocaleString()} - $${maxPesos.toLocaleString()}`
                : `$${minPesos.toLocaleString()}+`;
              const s = getTierInlineStyles(tier);
              const benefits = getTierBenefits(tier);
              
              return (
                <div key={tier.id} className="bg-white dark:bg-wood-900 rounded-2xl overflow-hidden shadow-xl border border-wood-100 dark:border-wood-800 flex flex-col hover:-translate-y-2 transition-transform duration-300">
                  {/* Visual Header */}
                  <div className="h-24 relative overflow-hidden flex items-center justify-center" style={s.card}>
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                    <h3 className="font-serif text-2xl font-bold" style={s.cardText}>{tier.name}</h3>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6 pb-6 border-b border-wood-100 dark:border-wood-800">
                      <p className="text-xs uppercase tracking-wider text-wood-400 dark:text-sand-500 mb-1">Gasto Acumulado</p>
                      <p className="font-bold text-lg text-wood-900 dark:text-sand-100">{range}</p>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-wood-600 dark:text-sand-300">
                          <Check className="w-4 h-4 text-accent-gold mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-auto">
                      <div className="w-full h-1 rounded-full opacity-50" style={s.card} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-wood-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h2 className="font-serif text-4xl md:text-5xl text-sand-50 mb-6">Empieza tu colección hoy</h2>
           <p className="text-sand-200 max-w-2xl mx-auto mb-10 text-lg">
             Cada pieza cuenta una historia. Deja que tus compras cuenten la tuya y obtén recompensas por ello.
           </p>
           <Link href="/auth" className="inline-flex items-center gap-2 px-10 py-5 bg-sand-100 text-wood-900 rounded-xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform">
             Crear cuenta gratuita
           </Link>
           <p className="mt-6 text-sm text-wood-400">
             ¿Ya tienes cuenta? <Link href="/auth" className="text-sand-100 underline hover:text-white">Inicia sesión</Link> para ver tu nivel.
           </p>
        </div>
      </section>

    </div>
  );
};
