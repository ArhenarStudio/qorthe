"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, X } from 'lucide-react';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Galería de Templates de Diseño
// Lee templates y categorías desde QuoteConfigContext (admin-configurable)
// ═══════════════════════════════════════════════════════════════

import type { QuoteDesignTemplate } from '@/components/quote/quoteConfig';

// Re-export for backward compatibility with EngravingConfigurator
export type DesignTemplate = QuoteDesignTemplate;

interface DesignGalleryProps {
  productCategory: 'madera' | 'textil' | 'grabado';
  selectedId?: string;
  onSelect: (template: DesignTemplate) => void;
  onClose: () => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  productCategory,
  selectedId,
  onSelect,
  onClose,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const { config } = useQuoteConfig();

  const categories = config.designCategories?.filter(c => c.enabled) || [];
  const templates = (config.designTemplates || [])
    .filter(t => t.enabled !== false)
    .filter(t => t.applicableTo.includes(productCategory))
    .filter(t => filter === 'all' || t.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-wood-100 dark:border-wood-800 bg-wood-50/50 dark:bg-wood-900/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-gold" />
          <span className="text-sm font-bold text-wood-900 dark:text-sand-100">Galería de Diseños</span>
          <span className="text-[10px] text-wood-400">({templates.length})</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category filters */}
      <div className="px-4 py-2 border-b border-wood-100 dark:border-wood-800 flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900'
              : 'text-wood-400 hover:text-wood-900 hover:bg-wood-100'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              filter === cat.id
                ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900'
                : 'text-wood-400 hover:text-wood-900 hover:bg-wood-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-4 max-h-[320px] overflow-y-auto">
        {templates.length === 0 ? (
          <p className="text-center text-sm text-wood-400 py-8">No hay diseños en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {templates.map((template) => {
              const isSelected = selectedId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/5 shadow-md'
                      : 'border-transparent hover:border-wood-200 bg-wood-50 dark:bg-wood-900/50'
                  }`}
                >
                  <div className={`w-14 h-14 mb-2 ${isSelected ? 'text-accent-gold' : 'text-wood-500'}`}>
                    {template.svgCode ? (
                      <div dangerouslySetInnerHTML={{ __html: template.svgCode }} className="w-full h-full [&>svg]:w-full [&>svg]:h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-wood-300 border border-dashed border-wood-200 rounded-lg">SVG</div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight ${
                    isSelected ? 'text-accent-gold' : 'text-wood-600'
                  }`}>
                    {template.name}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-5 h-5 bg-accent-gold rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-wood-100 dark:border-wood-800 bg-wood-50/30">
        <p className="text-[10px] text-wood-400 text-center">
          Selecciona un diseño base. Puedes personalizarlo con tu texto después.
        </p>
      </div>
    </motion.div>
  );
};
