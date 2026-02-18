"use client";

import React from 'react';
import Link from 'next/link';
import { useMedusaProducts } from '../../hooks/useMedusaProducts';

export const CuratedSelection = () => {
  const { products: medusaProducts, loading } = useMedusaProducts();

  // Use Medusa products if available, otherwise fallback
  const displayProducts = medusaProducts.length > 0
    ? medusaProducts.slice(0, 4).map(p => ({
        name: p.name,
        price: `$${p.price.toLocaleString()} MXN`,
        slug: p.slug,
        image: p.images[0] || null,
      }))
    : [
        { name: "Tabla Parota Rústica", price: "$2,450 MXN", slug: "tabla-parota-rustica", image: null },
        { name: "Set Degustación Cedro", price: "$1,800 MXN", slug: "set-degustacion-cedro", image: null },
        { name: "Tabla Redonda Pino", price: "$950 MXN", slug: "tabla-redonda-pino", image: null },
        { name: "Tabla Nogal Premium", price: "$3,200 MXN", slug: "tabla-nogal-premium", image: null },
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
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#FFFFFF] rounded-none animate-pulse">
              <div className="w-full aspect-[4/3] bg-[#D7CCC8]" />
              <div className="p-[16px] space-y-2">
                <div className="h-5 bg-[#D7CCC8] rounded w-3/4" />
                <div className="h-4 bg-[#D7CCC8] rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          displayProducts.map((product, index) => (
            <Link href={`/shop/${product.slug}`} key={index} className="bg-[#FFFFFF] rounded-none hover:shadow-lg transition-shadow">
              {/* Imagen */}
              <div className="w-full aspect-[4/3] bg-[#D7CCC8] overflow-hidden">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              
              {/* Detalles del Producto */}
              <div className="p-[16px]">
                <h4 className="font-serif text-[18px] text-[#2d2419] mb-[8px]">
                  {product.name}
                </h4>
                <p className="font-sans text-[16px] font-bold text-[#2d2419]">
                  {product.price}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Botón */}
      <div className="mt-[64px] text-center">
        <Link href="/shop" className="bg-transparent border border-[#2d2419] text-[#2d2419] px-[16px] py-[14px] font-sans text-[13px] uppercase tracking-[2px] hover:bg-[#2d2419] hover:text-[#f5f0e8] transition-colors">
          Ver Toda la Colección
        </Link>
      </div>
    </section>
  );
};
