"use client";

import React from 'react';
import Link from 'next/link';
import { useProducts } from '../../hooks/useProducts';

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=1000&auto=format&fit=crop";

export const CuratedSelection = () => {
  const { products, loading } = useProducts();
  const displayProducts = products.slice(0, 4);

  return (
    <section className="w-full max-w-[1440px] mx-auto bg-[#f5f0e8] py-[128px] px-[48px]">
      <div className="text-center mb-[64px]">
        <h3 className="font-sans text-[10px] uppercase tracking-[3px] text-[#C5A065] mb-[12px]">
          Selección Curada
        </h3>
        <h2 className="font-serif text-[48px] text-[#2d2419]">
          Piezas Destacadas
        </h2>
      </div>

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
          displayProducts.map((product) => (
            <Link href={`/shop/${product.handle}`} key={product.id} className="bg-[#FFFFFF] rounded-none hover:shadow-lg transition-shadow">
              <div className="w-full aspect-[4/3] bg-[#D7CCC8] overflow-hidden">
                {product.featuredImage && (
                  <img src={product.featuredImage.url} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-[16px]">
                <h4 className="font-serif text-[18px] text-[#2d2419] mb-[8px]">
                  {product.title}
                </h4>
                <p className="font-sans text-[16px] font-bold text-[#2d2419]">
                  ${product.priceRange.minVariantPrice.amount.toLocaleString()} {product.priceRange.minVariantPrice.currencyCode}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-[64px] text-center">
        <Link href="/shop" className="bg-transparent border border-[#2d2419] text-[#2d2419] px-[16px] py-[14px] font-sans text-[13px] uppercase tracking-[2px] hover:bg-[#2d2419] hover:text-[#f5f0e8] transition-colors">
          Ver Toda la Colección
        </Link>
      </div>
    </section>
  );
};
