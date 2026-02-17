"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, TrendingUp, Package, AlertCircle, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { products, Product } from '@/data/products';

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Optional: Clear query on close or keep it? 
      // User intent suggests "premium experience", usually keeping query is annoying if you reopen.
      // Let's clear it after a delay or immediately.
      setTimeout(() => setQuery(''), 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Mock Search Logic
  const searchResults = useMemo(() => {
    if (!query.trim()) return { products: [], categories: [], suggestions: [] };

    const lowerQuery = query.toLowerCase();
    
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.category.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );

    const matchedCategories = Array.from(new Set(products.map(p => p.category)))
      .filter(c => c.toLowerCase().includes(lowerQuery));

    // Mock suggestions based on product names
    const suggestions = products
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .map(p => p.name)
      .slice(0, 3);

    return {
      products: matchedProducts,
      categories: matchedCategories,
      suggestions: suggestions
    };
  }, [query]);

  // Simulated Loading
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500); // 500ms debounce/mock load
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const handleProductClick = (slug: string) => {
    router.push(`/shop/${slug}`);
    onClose();
  };

  const handleCategoryClick = (category: string) => {
    router.push('/shop');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-wood-950/40 backdrop-blur-xl z-[90]"
            onClick={onClose}
          />

          {/* Main Container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col pointer-events-none"
          >
            {/* Content Wrapper - Pointer events enabled here */}
            <div className="w-full h-full pointer-events-auto flex flex-col bg-sand-100/95 dark:bg-wood-900/95 shadow-2xl overflow-hidden">
              
              {/* --- HEADER: INPUT --- */}
              <div className="container mx-auto px-6 md:px-12 pt-8 pb-4 md:pt-12 md:pb-6 shrink-0 relative">
                <button 
                  onClick={onClose}
                  className="absolute top-1 right-1 md:top-6 md:right-6 p-4 z-50 text-wood-900/60 dark:text-sand-100/60 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <div className="max-w-4xl mx-auto w-full relative">
                  <label htmlFor="global-search" className="sr-only">Buscar</label>
                  <div className="relative group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-wood-900/30 dark:text-sand-100/30 group-focus-within:text-wood-900 dark:group-focus-within:text-sand-100 transition-colors duration-300" />
                    <input
                      ref={inputRef}
                      id="global-search"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full bg-transparent border-b-2 border-wood-900/10 dark:border-sand-100/10 text-xl md:text-4xl lg:text-5xl font-serif text-wood-900 dark:text-sand-100 py-4 pl-10 md:pl-16 pr-12 focus:outline-none focus:border-wood-900 dark:focus:border-sand-100 transition-colors duration-300 placeholder:text-wood-900/20 dark:placeholder:text-sand-100/20"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* --- BODY: RESULTS --- */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
                <div className="container mx-auto px-6 md:px-12 py-8 max-w-6xl">
                  
                  {isLoading ? (
                    /* LOADING SKELETON */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 animate-pulse">
                      <div className="md:col-span-3 space-y-4">
                        <div className="h-4 w-24 bg-wood-900/10 dark:bg-sand-100/10 rounded"></div>
                        <div className="h-8 w-full bg-wood-900/5 dark:bg-sand-100/5 rounded"></div>
                        <div className="h-8 w-3/4 bg-wood-900/5 dark:bg-sand-100/5 rounded"></div>
                      </div>
                      <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="aspect-[3/4] bg-wood-900/5 dark:bg-sand-100/5 rounded-lg"></div>
                        ))}
                      </div>
                    </div>
                  ) : error ? (
                    /* ERROR STATE */
                    <div className="flex flex-col items-center justify-center py-20 text-wood-500 dark:text-sand-400">
                       <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                       <p>Hubo un problema al buscar. Intenta nuevamente.</p>
                    </div>
                  ) : !query ? (
                    /* --- INITIAL STATE --- */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                      
                      {/* Popular Searches */}
                      <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-wood-900/40 dark:text-sand-100/40 mb-6 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Tendencias
                        </h3>
                        <div className="flex flex-col gap-3">
                          {["Mesa de centro", "Tabla personalizada", "Recámara minimal", "Regalos corporativos"].map((term) => (
                            <button
                              key={term}
                              onClick={() => setQuery(term)}
                              className="text-lg md:text-xl text-left text-wood-800 dark:text-sand-200 hover:text-wood-500 dark:hover:text-white transition-colors py-1 group flex items-center justify-between"
                            >
                              {term}
                              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Featured Products (Hero) */}
                      <div className="md:col-span-8 lg:col-span-9">
                        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-wood-900/40 dark:text-sand-100/40 mb-6 flex items-center gap-2">
                           <Package className="w-3 h-3" />
                           Destacados
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {products.filter(p => p.rating && p.rating > 4.5).slice(0, 3).map((product) => (
                            <motion.div
                              key={product.id}
                              whileHover={{ y: -5 }}
                              className="group cursor-pointer"
                              onClick={() => handleProductClick(product.slug)}
                            >
                              <div className="aspect-[4/5] overflow-hidden rounded-sm mb-4 relative bg-wood-100 dark:bg-wood-800">
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                              </div>
                              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 leading-tight mb-1 group-hover:underline decoration-wood-900/30 dark:decoration-sand-100/30 underline-offset-4">
                                {product.name}
                              </h4>
                              <p className="text-sm text-wood-500 dark:text-sand-400">
                                ${product.price.toLocaleString()}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* --- RESULTS STATE --- */
                    <div className="space-y-12">
                      
                      {/* No Results */}
                      {searchResults.products.length === 0 && searchResults.categories.length === 0 && (
                         <div className="text-center py-20">
                            <h3 className="text-2xl md:text-3xl font-serif text-wood-900 dark:text-sand-100 mb-2">
                              No encontramos resultados para "{query}"
                            </h3>
                            <p className="text-wood-500 dark:text-sand-400 mb-8">
                              Explora nuestras piezas destacadas o intenta con otro término.
                            </p>
                            <div className="flex justify-center">
                              <button 
                                onClick={() => setQuery('')}
                                className="px-6 py-2 border border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100 hover:bg-wood-900 hover:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-wood-900 transition-colors uppercase tracking-widest text-xs font-bold"
                              >
                                Ver Recomendaciones
                              </button>
                            </div>
                         </div>
                      )}

                      {/* Suggestions / Categories Matches */}
                      {(searchResults.suggestions.length > 0 || searchResults.categories.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          <div className="md:col-span-3">
                             {searchResults.categories.length > 0 && (
                               <div className="mb-8">
                                 <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-wood-900/40 dark:text-sand-100/40 mb-4">
                                   Categorías
                                 </h3>
                                 <div className="flex flex-wrap gap-2">
                                   {searchResults.categories.map(cat => (
                                     <button
                                       key={cat}
                                       onClick={() => handleCategoryClick(cat)}
                                       className="px-3 py-1 bg-wood-900/5 dark:bg-sand-100/5 hover:bg-wood-900/10 dark:hover:bg-sand-100/10 text-wood-900 dark:text-sand-100 text-sm rounded-full transition-colors"
                                     >
                                       {cat}
                                     </button>
                                   ))}
                                 </div>
                               </div>
                             )}
                             
                             {searchResults.suggestions.length > 0 && (
                               <div>
                                 <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-wood-900/40 dark:text-sand-100/40 mb-4">
                                   Sugerencias
                                 </h3>
                                 <ul className="space-y-2">
                                   {searchResults.suggestions.map(sugg => (
                                     <li key={sugg}>
                                       <button 
                                         onClick={() => setQuery(sugg)}
                                         className="text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 text-sm transition-colors flex items-center gap-2"
                                       >
                                         <Search className="w-3 h-3 opacity-50" />
                                         {sugg}
                                       </button>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             )}
                          </div>

                          {/* Product Results */}
                          <div className="md:col-span-9">
                             <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-wood-900/40 dark:text-sand-100/40 mb-6">
                               Productos ({searchResults.products.length})
                             </h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                               {searchResults.products.map(product => (
                                 <motion.div
                                    key={product.id}
                                    layoutId={`search-product-${product.id}`}
                                    className="group cursor-pointer flex flex-col gap-3"
                                    onClick={() => handleProductClick(product.slug)}
                                  >
                                    <div className="aspect-[3/4] overflow-hidden bg-wood-100 dark:bg-wood-800 relative">
                                      <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                      <div className="absolute top-2 right-2 bg-wood-900/90 text-sand-100 text-[10px] px-2 py-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 leading-tight group-hover:text-wood-600 dark:group-hover:text-sand-300 transition-colors">
                                        {product.name}
                                      </h4>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-light text-wood-500 dark:text-sand-400">
                                          ${product.price.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-wood-400 dark:text-sand-500/50">
                                          {product.category}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                               ))}
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>

              {/* --- FOOTER: HINT --- */}
              <div className="shrink-0 py-4 border-t border-wood-900/5 dark:border-sand-100/5 bg-sand-50 dark:bg-wood-900/50">
                <div className="container mx-auto px-6 md:px-12 flex justify-between items-center text-[10px] uppercase tracking-widest text-wood-900/40 dark:text-sand-100/40">
                   <span>DavidSon's Design</span>
                   <div className="flex items-center gap-4">
                     <span className="hidden md:inline">Presiona ESC para cerrar</span>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
