"use client";

import React from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export const addToCart = (product: { name: string; image: string; price: number }) => {
  console.log('Adding to cart:', product);

  toast.custom((t) => (
    <div className="w-full bg-white shadow-xl border border-wood-100 rounded-lg overflow-hidden flex ring-1 ring-black/5">
      <div className="w-16 h-16 shrink-0 bg-wood-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 text-green-700 mb-0.5">
          <div className="bg-green-100 rounded-full p-0.5">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide">Agregado al carrito</span>
        </div>
        <h4 className="text-sm font-serif text-wood-900 truncate pr-2">{product.name}</h4>
      </div>

      <div className="flex items-center pr-4 border-l border-wood-100 pl-4 bg-sand-50/50">
        <button 
          onClick={() => {
            toast.dismiss(t);
            window.dispatchEvent(new CustomEvent('open-cart'));
          }}
          className="text-xs font-medium text-wood-900 hover:text-accent-gold transition-colors whitespace-nowrap"
        >
          Ver Carrito
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right'
  });
};
