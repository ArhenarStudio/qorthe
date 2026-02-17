"use client";

import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "La tabla de Parota que compré superó mis expectativas. La veta es única y el acabado es impecable. Mis invitados siempre preguntan por ella.",
      name: "María González"
    },
    {
      text: "Pedí una tabla personalizada con grabado para un regalo de bodas. El proceso fue sencillo y el resultado fue una pieza de arte.",
      name: "Roberto Sánchez"
    },
    {
      text: "Tengo tres tablas DavidSon's en mi restaurante. La calidad es consistente y el servicio al cliente es excepcional.",
      name: "Chef Daniel Ortega"
    }
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto bg-[#2d2419] py-[128px] px-[48px]">
      {/* Encabezado */}
      <div className="text-left mb-[64px]">
        <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
          Nuestros Clientes
        </h3>
        <h2 className="font-serif text-[48px] text-[#f5f0e8] mb-[16px]">
          Lo Que Dicen
        </h2>
        <div className="flex items-center gap-[12px]">
          <span className="font-sans font-bold text-[24px] text-[#f5f0e8]">4.8</span>
          <div className="flex gap-[4px]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="#C5A065" stroke="none" className="w-[18px] h-[18px]" />
            ))}
          </div>
          <span className="font-sans text-[14px] text-[#f5f0e8] opacity-50">
            (126 reseñas)
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {testimonials.map((t, index) => (
          <div key={index} className="bg-[#4E342E] p-[32px] rounded-none flex flex-col">
            {/* Estrellas Card */}
            <div className="flex gap-[2px] mb-[20px]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} fill="#C5A065" stroke="none" className="w-[14px] h-[14px]" />
              ))}
            </div>

            {/* Texto Testimonio */}
            <p className="font-serif italic text-[17px] text-[#f5f0e8] opacity-80 leading-[1.6] mb-[24px]">
              {t.text}
            </p>

            {/* Línea Divisoria */}
            <div className="w-[40px] h-[1px] bg-[#C5A065] mb-[20px]"></div>

            {/* Nombre y Verificación */}
            <div>
              <p className="font-sans font-bold text-[14px] text-[#f5f0e8] mb-[4px]">
                {t.name}
              </p>
              <p className="font-sans text-[12px] text-[#C5A065]">
                Cliente Verificado
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
