"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export const NewsletterAndCTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.warn('[Newsletter] error:', err);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* BLOQUE A: NEWSLETTER */}
      <section className="bg-[#f5f0e8] py-[96px] px-[48px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[64px]">
          {/* Columna izquierda: Placeholder Imagen */}
          <div className="w-full h-full min-h-[300px] bg-[#D7CCC8]"></div>

          {/* Columna derecha: Contenido */}
          <div className="flex flex-col justify-center">
            <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
              Exclusivo
            </h3>
            <h2 className="font-serif text-[36px] text-[#2d2419] mb-[16px]">
              Únete a la Comunidad Qorthe
            </h2>
            <p className="font-sans text-[16px] font-normal text-[#795548] leading-[1.6] mb-[32px]">
              Recibe acceso anticipado a nuevas colecciones, ofertas exclusivas y contenido sobre el mundo de la madera artesanal.
            </p>
            
            <div className="flex flex-row w-full mb-[12px]">
              {submitted ? (
                <p className="font-sans text-[14px] text-[#2d2419] py-[14px]">✅ ¡Gracias por suscribirte!</p>
              ) : (
                <>
                  <input 
                    type="email" 
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="flex-grow bg-[#FFFFFF] border border-[#D7CCC8] p-[14px] font-sans text-[14px] text-[#2d2419] placeholder-[#A1887F] outline-none"
                  />
                  <button 
                    onClick={handleSubscribe}
                    className="bg-[#2d2419] text-[#f5f0e8] font-sans text-[13px] font-bold uppercase px-[24px] py-[14px] whitespace-nowrap hover:bg-[#3d3425] transition-colors"
                  >
                    Suscribirse
                  </button>
                </>
              )}
            </div>
            
            <p className="font-sans text-[12px] text-[#A1887F]">
              Sin spam. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* BLOQUE B: CTA FINAL */}
      <section className="bg-[#2d2419] py-[96px] px-[48px] flex flex-col items-center text-center">
        <h2 className="font-serif text-[48px] text-[#f5f0e8] mb-[16px]">
          ¿Listo para Encontrar tu Pieza?
        </h2>
        <p className="font-sans text-[18px] text-[#f5f0e8] opacity-70 max-w-[600px] mb-[40px]">
          Explora nuestra colección o diseña algo único con nuestro cotizador personalizado
        </p>
        
        <div className="flex flex-col sm:flex-row gap-[16px]">
          <Link href="/shop" className="border border-[#f5f0e8] bg-transparent text-[#f5f0e8] font-sans text-[13px] uppercase tracking-[2px] px-[32px] py-[16px] hover:bg-[#f5f0e8] hover:text-[#2d2419] transition-colors duration-300">
            Ver Colección
          </Link>
          <Link href="/quote" className="bg-[#C5A065] text-[#2d2419] font-sans text-[13px] font-bold uppercase tracking-[2px] px-[32px] py-[16px] hover:bg-[#D7CCC8] transition-colors duration-300">
            Personalizar mi Tabla
          </Link>
        </div>
      </section>
    </div>
  );
};
