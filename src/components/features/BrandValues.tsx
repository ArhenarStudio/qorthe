import React from 'react';
import { Leaf, Shield, Truck, Heart } from 'lucide-react';

export const BrandValues = () => {
  const values = [
    {
      icon: <Leaf strokeWidth={1.5} className="w-[28px] h-[28px] text-[#2d2419]" />,
      title: "Madera Sustentable",
      description: "Seleccionamos maderas de fuentes responsables y certificadas"
    },
    {
      icon: <Shield strokeWidth={1.5} className="w-[28px] h-[28px] text-[#2d2419]" />,
      title: "Garantía de por Vida",
      description: "Cada pieza respaldada por nuestra garantía contra defectos"
    },
    {
      icon: <Truck strokeWidth={1.5} className="w-[28px] h-[28px] text-[#2d2419]" />,
      title: "Envío Protegido",
      description: "Empaque especializado para que tu pieza llegue perfecta"
    },
    {
      icon: <Heart strokeWidth={1.5} className="w-[28px] h-[28px] text-[#2d2419]" />,
      title: "Hecho a Mano",
      description: "Cada tabla tallada por artesanos mexicanos expertos"
    }
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto bg-[#f0ebe5] py-[128px] px-[48px]">
      {/* Encabezado */}
      <div className="text-center mb-[80px]">
        <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
          La Diferencia DavidSon's
        </h3>
        <h2 className="font-serif text-[48px] text-[#2d2419]">
          Compromiso con la Excelencia
        </h2>
      </div>

      {/* Grid de Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[32px]">
        {values.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Círculo del ícono */}
            <div className="w-[64px] h-[64px] rounded-full border-[1.5px] border-[#C5A065] bg-transparent flex items-center justify-center mb-[24px]">
              {value.icon}
            </div>
            
            {/* Título */}
            <h4 className="font-serif text-[20px] font-bold text-[#2d2419] text-center mb-[12px]">
              {value.title}
            </h4>
            
            {/* Descripción */}
            <p className="font-sans text-[14px] font-normal text-[#795548] text-center leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
