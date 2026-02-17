"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/data/products';
import { addToCart } from '@/utils/cartActions';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-wood-900 border border-wood-100/50 dark:border-wood-800 hover:border-accent-gold/30 dark:hover:border-accent-gold/30 hover:shadow-xl hover:shadow-wood-900/5 dark:hover:shadow-black/20 transition-all duration-500 rounded-sm overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm">
            Nuevo
          </span>
        )}
        {!product.inStock && (
          <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-wood-50 dark:bg-wood-800">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} view 2`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic
            }}
            className="p-2 bg-white dark:bg-wood-800 text-wood-900 dark:text-sand-100 rounded-full hover:bg-wood-100 dark:hover:bg-wood-700 transition-colors shadow-lg"
            title="Guardar en favoritos"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-full hover:bg-accent-gold dark:hover:bg-accent-gold hover:text-wood-900 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Añadir al carrito"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5 bg-white dark:bg-wood-900 border-t border-wood-50 dark:border-wood-800">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-wood-600 dark:text-sand-300 font-bold border-b border-wood-200 dark:border-wood-700 pb-0.5">
            {product.category}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 text-xs font-bold text-wood-700 dark:text-sand-200 bg-wood-50 dark:bg-wood-800 px-2 py-0.5 rounded-full">
              <span className="text-accent-gold">★</span>
              <span>{product.rating}</span>
            </div>
          )}
        </div>
        <Link href={`/shop/${product.slug}`} className="block group-hover:text-accent-gold transition-colors">
          <h3 className="text-lg font-serif font-medium text-wood-900 dark:text-sand-100 leading-tight mb-3 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-3 border-t border-wood-100 dark:border-wood-800">
          <span className="text-lg font-bold text-wood-900 dark:text-sand-100 font-sans">
            ${product.price.toLocaleString()}
          </span>
          <button 
            onClick={handleAddToCart}
            className="text-xs font-bold uppercase tracking-wider text-wood-500 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors flex items-center gap-1"
          >
            + Añadir
          </button>
        </div>
      </div>
    </motion.div>
  );
};
