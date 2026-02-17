import React from 'react';

const USES_DATA = [
  {
    id: 1,
    title: "Charcutería & Servicio",
    description: "Eleva tus reuniones con tablas diseñadas para compartir.",
    price: "Desde $2,450 MXN"
  },
  {
    id: 2,
    title: "Eventos & Decoración",
    description: "Centros de mesa y bases que transforman espacios.",
    price: "Desde $1,800 MXN"
  },
  {
    id: 3,
    title: "Mobiliario Auxiliar",
    description: "Piezas funcionales que añaden calidez a tu hogar.",
    price: "Desde $3,500 MXN"
  }
];

export const UsesShowcase = () => {
  return (
    <section className="w-full bg-[#f5f0e8] dark:bg-[#1a140e] py-[128px] px-[48px]">
      <div className="max-w-[1440px] mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-[64px]">
          <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
            Versatilidad
          </h3>
          <h2 className="font-serif text-[48px] text-[#2d2419] dark:text-[#f5f0e8] leading-tight">
            Un Lienzo, Múltiples Escenarios
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {USES_DATA.map((item) => (
            <div key={item.id} className="bg-[#FFFFFF] dark:bg-[#2d2419] rounded-none">
              {/* Imagen placeholder */}
              <div className="w-full aspect-video bg-[#D7CCC8]" />
              
              {/* Contenido */}
              <div className="p-[24px]">
                <h4 className="font-serif text-[22px] text-[#2d2419] dark:text-[#f5f0e8] mb-[8px]">
                  {item.title}
                </h4>
                <p className="font-sans text-[14px] text-[#795548] dark:text-[#A1887F] leading-[1.6] mb-[16px]">
                  {item.description}
                </p>
                <p className="font-sans text-[18px] font-bold text-[#2d2419] dark:text-[#f5f0e8]">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
