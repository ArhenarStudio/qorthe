"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, Trash2, Edit2, ShoppingBag, Eye, Heart, Share2, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// Mock Data
const SAVED_DESIGNS = [
  {
    id: 'des-001',
    name: 'Mesa Comedor Industrial',
    date: '14 Feb 2026',
    baseProduct: 'Mesa Roble Real',
    preview: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=800',
    specs: ['Roble Americano', 'Acabado Mate', 'Patas Acero Negro', '240x120cm'],
    price: '$45,000'
  },
  {
    id: 'des-002',
    name: 'Sillón Lounge Personalizado',
    date: '10 Feb 2026',
    baseProduct: 'Sillón Eames Replica',
    preview: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
    specs: ['Piel Italiana Cognac', 'Base Nogal', 'Reposapiés Incluido'],
    price: '$28,900'
  },
  {
    id: 'des-003',
    name: 'Estantería Modular Oficina',
    date: '28 Ene 2026',
    baseProduct: 'Sistema Modular V2',
    preview: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
    specs: ['Nogal', '5 Niveles', 'Iluminación LED'],
    price: '$32,500'
  }
];

export const DesignLibrary = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [designs, setDesigns] = useState(SAVED_DESIGNS);

  const handleDelete = (id: string) => {
    { // Direct delete
      setDesigns(designs.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1 flex items-center gap-2">
            <Palette className="w-6 h-6 text-accent-gold" /> Biblioteca de Diseños
          </h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Historial de tus personalizaciones y configuraciones guardadas.</p>
        </div>
        
        <div className="flex bg-wood-100 dark:bg-wood-800 p-1 rounded-lg self-start sm:self-auto">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-wood-700 text-wood-900 dark:text-sand-100 shadow-sm' : 'text-wood-500 dark:text-wood-400 hover:text-wood-800'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-wood-700 text-wood-900 dark:text-sand-100 shadow-sm' : 'text-wood-500 dark:text-wood-400 hover:text-wood-800'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {designs.length === 0 ? (
         <div className="bg-white dark:bg-wood-900 rounded-2xl p-16 text-center border border-dashed border-wood-200 dark:border-wood-800">
           <div className="w-20 h-20 bg-wood-50 dark:bg-wood-800 rounded-full flex items-center justify-center mx-auto mb-6 text-wood-300 dark:text-wood-600">
             <Palette size={32} />
           </div>
           <h3 className="text-xl font-serif text-wood-900 dark:text-sand-100 mb-3">Tu biblioteca está vacía</h3>
           <p className="text-wood-500 dark:text-sand-400 mb-8 max-w-md mx-auto">
             Explora nuestros productos personalizables y guarda tus configuraciones favoritas para revisarlas más tarde.
           </p>
           <Link href="/shop" className="inline-flex items-center gap-2 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
             Ir al Personalizador
           </Link>
         </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {designs.map((design) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
              className={`group bg-white dark:bg-wood-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-wood-800 hover:shadow-xl transition-all duration-300 ${
                viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'
              }`}
            >
              {/* Image Area */}
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-auto shrink-0' : 'w-full h-56'}`}>
                <img 
                  src={design.preview} 
                  alt={design.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                  <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                    {design.price}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 group-hover:text-accent-gold transition-colors">{design.name}</h3>
                      <p className="text-xs text-wood-500 dark:text-wood-400">{design.baseProduct}</p>
                    </div>
                    <span className="text-[10px] text-wood-400 bg-wood-50 dark:bg-wood-800 px-2 py-1 rounded-full">{design.date}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {design.specs.map((spec, i) => (
                      <span key={i} className="text-[10px] uppercase tracking-wider bg-wood-50 dark:bg-wood-800 text-wood-600 dark:text-sand-300 px-2 py-1 rounded border border-wood-100 dark:border-wood-700/50">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-wood-100 dark:border-wood-800 gap-3">
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleDelete(design.id)}
                       className="p-2 text-wood-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                       title="Eliminar"
                     >
                       <Trash2 size={16} />
                     </button>
                     <button className="p-2 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-800 rounded-lg transition-colors" title="Compartir">
                       <Share2 size={16} />
                     </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-wood-200 dark:border-wood-700 text-wood-900 dark:text-sand-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors flex items-center gap-2">
                      <Edit2 size={14} /> <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button className="px-4 py-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
                      <ShoppingBag size={14} /> <span className="hidden sm:inline">Comprar</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
