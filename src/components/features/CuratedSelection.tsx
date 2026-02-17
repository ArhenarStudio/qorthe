import React from 'react';

export const CuratedSelection = () => {
  const products = [
    { name: "Tabla Parota Rústica", price: "$2,450 MXN" },
    { name: "Set Degustación Cedro", price: "$1,800 MXN" },
    { name: "Tabla Redonda Pino", price: "$950 MXN" },
    { name: "Tabla Nogal Premium", price: "$3,200 MXN" }
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto bg-[#f5f0e8] py-[128px] px-[48px]">
      {/* Encabezado */}
      <div className="text-center mb-[64px]">
        <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
          Selección Curada
        </h3>
        <h2 className="font-serif text-[48px] text-[#2d2419]">
          Piezas Destacadas
        </h2>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        {products.map((product, index) => (
          <div key={index} className="bg-[#FFFFFF] rounded-none">
            {/* Imagen Placeholder */}
            <div className="w-full aspect-[4/3] bg-[#D7CCC8]"></div>
            
            {/* Detalles del Producto */}
            <div className="p-[16px]">
              <h4 className="font-serif text-[18px] text-[#2d2419] mb-[8px]">
                {product.name}
              </h4>
              <p className="font-sans text-[16px] font-bold text-[#2d2419]">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón */}
      <div className="mt-[64px] text-center">
        <button className="bg-transparent border border-[#2d2419] text-[#2d2419] px-[16px] py-[14px] font-sans text-[13px] uppercase tracking-[2px]">
          Ver Toda la Colección
        </button>
      </div>
    </section>
  );
};
