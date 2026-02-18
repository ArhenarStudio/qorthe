"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import type { CommerceProduct } from '@/lib/commerce';
import { getMetafield } from '@/lib/commerce/types';

export const ShopPage = () => {
  const { products, loading } = useProducts();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | 'All'>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Extract unique materials from product metadata
  const materials = useMemo(() => {
    const mats = new Set<string>();
    products.forEach(p => {
      const mat = getMetafield(p, "materials", "primary_wood");
      if (mat) mats.add(mat);
    });
    return ['All', ...Array.from(mats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedMaterial !== 'All') {
      result = result.filter(p => getMetafield(p, "materials", "primary_wood") === selectedMaterial);
    }

    result = result.filter(p => {
      const price = p.priceRange.minVariantPrice.amount;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceRange.minVariantPrice.amount - b.priceRange.minVariantPrice.amount);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceRange.minVariantPrice.amount - a.priceRange.minVariantPrice.amount);
    }

    return result;
  }, [products, selectedMaterial, priceRange, sortBy]);

  return (
    <div className="bg-sand-100 dark:bg-wood-950 min-h-screen pt-24 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-wood-900 dark:bg-black text-sand-100 py-16 md:py-24 mb-12 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-accent-gold text-xs font-bold tracking-[0.2em] uppercase mb-4"
          >
            Catálogo 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif mb-6"
          >
            Colección DavidSon&apos;s
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-sand-100/70 font-light text-lg"
          >
            Piezas de autor diseñadas para conectar. Cada tabla cuenta una historia única tallada en maderas preciosas.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-24 z-30 bg-sand-100/90 dark:bg-wood-950/90 backdrop-blur-md py-4 border-b border-wood-900/5 dark:border-sand-100/5 transition-colors duration-300">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-sm font-medium text-wood-900 dark:text-sand-100 hover:text-accent-gold dark:hover:text-accent-gold transition-colors uppercase tracking-wider"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros {selectedMaterial !== 'All' && '(1)'}
          </button>

          <div className="flex items-center gap-4">
             <span className="text-sm text-wood-500 dark:text-sand-400 hidden md:inline-block">
               {loading ? 'Cargando...' : `Mostrando ${filteredProducts.length} resultados`}
             </span>
             <div className="flex items-center gap-2 relative group">
               <span className="text-xs text-wood-500 dark:text-sand-400 uppercase tracking-widest">Ordenar por:</span>
               <select 
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                 className="bg-transparent border-none text-wood-900 dark:text-sand-100 font-medium text-sm focus:ring-0 cursor-pointer pr-8 [&>option]:text-wood-900"
               >
                 <option value="featured">Destacados</option>
                 <option value="price-asc">Precio: Menor a Mayor</option>
                 <option value="price-desc">Precio: Mayor a Menor</option>
               </select>
             </div>
          </div>
        </div>

        <div className="flex gap-12 items-start">
          
          {/* Filters Sidebar (Desktop) */}
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: isFilterOpen ? '280px' : '0px',
              opacity: isFilterOpen ? 1 : 0,
              display: isFilterOpen ? 'block' : 'none'
            }}
            className="hidden md:block shrink-0 sticky top-48 overflow-hidden"
          >
            <div className="w-[280px] space-y-10 pr-8 border-r border-wood-900/10 dark:border-sand-100/10 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              
              {/* Materials Filter */}
              <div>
                <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-4 border-b border-wood-900/10 dark:border-sand-100/10 pb-2">Madera</h3>
                <ul className="space-y-2">
                  {materials.map(mat => (
                    <li key={mat}>
                      <button 
                        onClick={() => setSelectedMaterial(mat)}
                        className={`text-sm hover:text-accent-gold transition-colors w-full text-left py-1 ${selectedMaterial === mat ? 'font-bold text-wood-900 dark:text-sand-100 pl-2 border-l-2 border-accent-gold' : 'text-wood-600 dark:text-sand-300'}`}
                      >
                        {mat === 'All' ? 'Ver Todo' : mat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-4 border-b border-wood-900/10 dark:border-sand-100/10 pb-2">Precio</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-wood-500 dark:text-sand-400">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 bg-wood-200 dark:bg-wood-700 rounded-lg appearance-none cursor-pointer accent-wood-900 dark:accent-sand-100"
                  />
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-wood-900 rounded-sm overflow-hidden">
                    <div className="aspect-[4/5] bg-wood-200 dark:bg-wood-800" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-wood-200 dark:bg-wood-800 rounded w-1/3" />
                      <div className="h-5 bg-wood-200 dark:bg-wood-800 rounded w-3/4" />
                      <div className="h-4 bg-wood-200 dark:bg-wood-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-wood-500 dark:text-sand-400 text-lg font-light">No encontramos productos con esos filtros.</p>
                <button 
                  onClick={() => {
                    setSelectedMaterial('All');
                    setPriceRange([0, 5000]);
                  }}
                  className="mt-4 text-accent-gold underline hover:text-wood-900 dark:hover:text-sand-100"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
