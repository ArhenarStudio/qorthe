"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CommerceProduct } from '@/lib/commerce';
import { getMetafield } from '@/lib/commerce/types';
import { formatPrice } from '@/config/shipping';

interface ProductCardProps {
  product: CommerceProduct;
  onAddToCart?: (variantId: string) => void;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=1000&auto=format&fit=crop";

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const router = useRouter();
  const mainImage = product.featuredImage?.url ?? PLACEHOLDER_IMG;
  const price = product.priceRange.minVariantPrice;
  const inStock = product.variants.some(v => v.availableForSale);
  const material = getMetafield(product, "materials", "primary_wood") ?? "";
  const isMultiVariant = product.variants.length > 1;
  const defaultVariant = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Multi-variant: navigate to detail page so user picks the right option
    if (isMultiVariant) {
      router.push(`/shop/${product.handle}`);
      return;
    }
    if (onAddToCart && defaultVariant) {
      onAddToCart(defaultVariant.id);
    }
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
        {!inStock && (
          <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link href={`/shop/${product.handle}`} className="block relative aspect-[4/5] overflow-hidden bg-wood-50 dark:bg-wood-800">
        <img 
          src={mainImage} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3">
          <button 
            onClick={(e) => { e.preventDefault(); }}
            className="p-2 bg-white dark:bg-wood-800 text-wood-900 dark:text-sand-100 rounded-full hover:bg-wood-100 dark:hover:bg-wood-700 transition-colors shadow-lg"
            title="Guardar en favoritos"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={!inStock}
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
            {material || product.productType || "Artesanal"}
          </span>
        </div>
        <Link href={`/shop/${product.handle}`} className="block group-hover:text-accent-gold transition-colors">
          <h3 className="text-lg font-serif font-medium text-wood-900 dark:text-sand-100 leading-tight mb-3 line-clamp-2 min-h-[3rem]">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-3 border-t border-wood-100 dark:border-wood-800">
          <span className="text-lg font-bold text-wood-900 dark:text-sand-100 font-sans">
            {isMultiVariant ? 'Desde ' : ''}{formatPrice(price.amount, price.currencyCode)}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={!inStock}
            className="text-xs font-bold uppercase tracking-wider text-wood-500 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isMultiVariant ? 'Ver opciones' : '+ Añadir'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
