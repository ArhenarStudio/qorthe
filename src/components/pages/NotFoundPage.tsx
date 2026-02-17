import React from 'react';

export const NotFoundPage = () => {
  return (
    <div className="w-full max-w-[1440px] h-[900px] bg-[#f5f0e8] flex flex-col items-center justify-center mx-auto">
      {/* 1. Logo Placeholder */}
      <div className="w-[120px] h-[120px] bg-[#D7CCC8] mb-[48px]"></div>

      {/* 3 & 4. 404 Background & Overlay Title */}
      <div className="relative flex items-center justify-center mb-[16px]">
        {/* Texto "404" de fondo */}
        <span className="font-serif text-[180px] text-[#D7CCC8] leading-none select-none">
          404
        </span>
        {/* Texto "Página No Encontrada" superpuesto */}
        <h1 className="absolute font-serif text-[36px] text-[#2d2419]">
          Página No Encontrada
        </h1>
      </div>

      {/* 6. Descripción */}
      <p className="font-sans text-[16px] font-normal text-[#795548] max-w-[480px] text-center leading-[1.6] mb-[40px]">
        Parece que esta pieza no está en nuestra colección. Pero tenemos muchas otras esperándote.
      </p>

      {/* 8. Botones */}
      <div className="flex gap-[16px]">
        <button className="bg-[#2d2419] text-[#f5f0e8] font-sans text-[13px] uppercase tracking-[2px] px-[32px] py-[16px]">
          Volver al Inicio
        </button>
        <button className="bg-transparent border border-[#2d2419] text-[#2d2419] font-sans text-[13px] uppercase tracking-[2px] px-[32px] py-[16px]">
          Ver Colección
        </button>
      </div>
    </div>
  );
};
