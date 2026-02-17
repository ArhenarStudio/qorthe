import React from 'react';
import { X } from 'lucide-react';

export const ToastNotification = () => {
  return (
    <div 
      className="relative w-[380px] bg-[#FFFFFF] border border-[#EFEBE9] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(45,36,25,0.12)]"
    >
      {/* Botón Cerrar */}
      <button className="absolute top-[8px] right-[8px] flex items-center justify-center cursor-pointer z-10">
        <X size={12} color="#A1887F" />
      </button>

      {/* Contenido Principal */}
      <div className="flex items-center p-[16px]">
        {/* Imagen Placeholder */}
        <div className="w-[48px] h-[48px] bg-[#D7CCC8] rounded-[8px] flex-shrink-0"></div>

        {/* Textos */}
        <div className="ml-[14px] flex-grow flex flex-col justify-center">
          <p className="font-sans text-[14px] font-bold text-[#2d2419] leading-tight mb-[4px]">
            Tabla Parota Rústica
          </p>
          <p className="font-sans text-[12px] font-normal text-[#8D6E63] leading-tight">
            Agregado al carrito
          </p>
        </div>

        {/* Link Ver Carrito */}
        <button className="font-sans text-[12px] font-bold text-[#2d2419] underline ml-[14px] whitespace-nowrap cursor-pointer">
          Ver Carrito
        </button>
      </div>

      {/* Barra de Progreso */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C5A065]"></div>
    </div>
  );
};
