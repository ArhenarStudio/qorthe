import React from 'react';
import { Search } from 'lucide-react';

export const SearchResultsPage = () => {
  // Cambiar a false para visualizar el Empty State
  const hasResults = true;
  const searchQuery = "tablas de parota";

  const products = [
    { id: 1, name: "Tabla Parota Rústica", price: "$2,450 MXN" },
    { id: 2, name: "Tabla Parota Grande", price: "$3,800 MXN" },
    { id: 3, name: "Tabla Parota Ovalada", price: "$2,900 MXN" },
    { id: 4, name: "Set Parota Individual", price: "$1,650 MXN" },
    { id: 5, name: "Tabla Parota con Grabado", price: "$3,100 MXN" },
    { id: 6, name: "Base Parota Decorativa", price: "$2,200 MXN" },
  ];

  return (
    <div className="w-full bg-[#f5f0e8] min-h-screen flex justify-center">
      <div className="w-full max-w-[1440px] px-[48px] pt-[80px] pb-[128px]">
        
        {hasResults ? (
          <>
            {/* Header de Búsqueda */}
            <div className="mb-[40px]">
              <div className="flex items-baseline gap-2 mb-[8px]">
                <span className="font-sans text-[16px] text-[#795548]">
                  Resultados para
                </span>
                <span className="font-serif text-[24px] italic text-[#2d2419]">
                  {searchQuery}
                </span>
              </div>
              <p className="font-sans text-[13px] text-[#A1887F]">
                {products.length} resultados encontrados
              </p>
            </div>

            {/* Grid de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              {products.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  {/* Imagen Placeholder */}
                  <div className="w-full aspect-[4/3] bg-[#D7CCC8] mb-[16px]" />
                  
                  {/* Detalles del Producto */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-[18px] text-[#2d2419]">
                      {product.name}
                    </h3>
                    <p className="font-sans text-[16px] font-bold text-[#2d2419]">
                      {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-[80px]">
            <Search size={48} color="#D7CCC8" />
            
            <h2 className="font-serif text-[24px] text-[#2d2419] mt-[20px] mb-[12px] text-center">
              No encontramos resultados para tu búsqueda
            </h2>
            
            <p className="font-sans text-[14px] text-[#795548] mb-[32px] text-center">
              Intenta con otros términos o explora nuestra colección completa.
            </p>
            
            <button className="bg-[#2d2419] text-[#f5f0e8] font-sans text-[13px] uppercase tracking-wide px-[28px] py-[14px] hover:bg-opacity-90 transition-opacity">
              Ver Toda la Colección
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
