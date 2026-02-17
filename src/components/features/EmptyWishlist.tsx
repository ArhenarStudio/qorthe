"use client";

import React from 'react';
import { Heart } from 'lucide-react';

export const EmptyWishlist = () => {
  return (
    <div className="w-[600px] bg-transparent py-[80px] flex flex-col items-center text-center mx-auto">
      {/* 1. Heart Icon */}
      <Heart 
        size={56} 
        color="#D7CCC8" 
        strokeWidth={1.5} 
        fill="none"
        className="mb-[24px]"
      />

      {/* 3. Title */}
      <h2 className="font-serif text-[24px] text-[#2d2419] mb-[12px]">
        Tu lista de deseos está vacía
      </h2>

      {/* 5. Description */}
      <p className="font-sans text-[14px] font-normal text-[#8D6E63] max-w-[400px] leading-[1.6] mb-[32px]">
        Guarda tus piezas favoritas para encontrarlas después. Toca el corazón en cualquier producto para agregarlo aquí.
      </p>

      {/* 7. Button */}
      <button className="bg-[#2d2419] text-[#f5f0e8] font-sans text-[13px] uppercase tracking-[2px] px-[28px] py-[14px]">
        Explorar Colección
      </button>
    </div>
  );
};
