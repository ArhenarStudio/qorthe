import React from 'react';

export const HeroSectionV2 = () => {
  return (
    <section className="relative w-full h-[900px] bg-[#1a140e] overflow-hidden flex flex-col items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,20,14,0.8) 0%, rgba(26,20,14,0.5) 50%, rgba(26,20,14,0.9) 100%)'
        }}
      ></div>

      {/* Main Content Centered */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        
        {/* 1. Badge */}
        <div className="border border-[#C5A065] bg-transparent px-[20px] py-[8px] mb-[32px]">
          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065]">
            Artesanía Mexicana desde 2020
          </span>
        </div>

        {/* 3. Title Line 1 */}
        <h1 className="font-serif text-[96px] text-[#f5f0e8] leading-tight">
          Madera con
        </h1>

        {/* 4. Title Line 2 */}
        <h1 className="font-serif text-[96px] italic text-[#C5A065] leading-tight mb-[8px]">
          Alma
        </h1>
        
        {/* 5. Line under Alma */}
        <div className="w-[80px] h-[2px] bg-[#C5A065] mb-[24px]"></div>

        {/* 7. Subtitle */}
        <p className="font-sans text-[20px] font-normal text-[#f5f0e8] opacity-80 max-w-[600px] leading-[1.6] mb-[40px]">
          Piezas únicas en Parota, Cedro y Rosa Morada. Diseñadas para celebrar la vida.
        </p>

        {/* 9. Button */}
        <button className="border border-[#f5f0e8] bg-transparent text-[#f5f0e8] font-sans text-[13px] uppercase tracking-[3px] px-[40px] py-[18px] mb-[48px] hover:bg-[#f5f0e8] hover:text-[#1a140e] transition-colors duration-300">
          Ver Colección
        </button>

        {/* 11. Trust Line */}
        <p className="font-sans text-[11px] uppercase tracking-[2px] text-[#f5f0e8] opacity-50">
          Envío Gratis +$2,500 &nbsp;·&nbsp; Garantía de por Vida &nbsp;·&nbsp; Hecho en México
        </p>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <span className="font-sans text-[9px] uppercase tracking-[3px] text-[#f5f0e8] opacity-40 mb-[12px] whitespace-nowrap">
          Descubre la esencia
        </span>
        <div className="w-[1px] h-[48px] bg-[#f5f0e8] opacity-30"></div>
      </div>
    </section>
  );
};
