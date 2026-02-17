"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Trash2, Box, Info, Sparkles, ChefHat, Utensils, Maximize2, Package } from 'lucide-react';
import { ProductItem, ProductType } from './types';
import { WoodSelector } from './WoodSelector';
import { EngravingConfigurator } from './EngravingConfigurator';

interface QuoteProductBlockProps {
  item: ProductItem;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  onUpdate: (item: ProductItem) => void;
  onDelete?: () => void;
}

const PRODUCT_TYPES_CONFIG: { type: ProductType; icon: any; label: string }[] = [
  { type: 'Tabla de decoración', icon: Box, label: 'Decorativa' },
  { type: 'Tabla de picar', icon: ChefHat, label: 'Cocina' },
  { type: 'Tabla de charcutería', icon: Utensils, label: 'Charcutería' },
  { type: 'Plato decorativo', icon: Sparkles, label: 'Plato' },
  { type: 'Caja personalizada', icon: Package, label: 'Caja' },
  { type: 'Otro', icon: Info, label: 'Personalizado' },
];

export const QuoteProductBlock: React.FC<QuoteProductBlockProps> = ({
  item,
  index,
  isActive,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  
  const handleDimensionChange = (field: 'length' | 'width' | 'thickness', value: string) => {
    onUpdate({
      ...item,
      dimensions: {
        ...item.dimensions,
        [field]: Number(value)
      }
    });
  };

  return (
    <div 
      className={`relative rounded-3xl transition-all duration-500 overflow-hidden group ${
        isActive 
          ? 'bg-white dark:bg-wood-900 shadow-2xl shadow-wood-900/10 dark:shadow-black/40 border-2 border-accent-gold/20 z-10' 
          : 'bg-white dark:bg-wood-950 border border-wood-100 dark:border-wood-800 hover:border-wood-300 dark:hover:border-wood-700 opacity-90 hover:opacity-100'
      }`}
    >
      {/* Header / Trigger */}
      <div 
        onClick={onToggle}
        className="flex items-center justify-between p-6 md:p-8 cursor-pointer select-none"
      >
        <div className="flex items-center gap-6">
           {/* Number Badge */}
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-lg transition-all duration-300 ${
             isActive 
               ? 'bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 rotate-3 shadow-lg' 
               : 'bg-wood-100 dark:bg-wood-800 text-wood-400 group-hover:bg-wood-200 dark:group-hover:bg-wood-700'
           }`}>
             {index + 1}
           </div>

           {/* Title & Subtitle */}
           <div>
             <h3 className={`font-serif text-2xl transition-colors duration-300 ${
                isActive ? 'text-wood-900 dark:text-sand-100' : 'text-wood-600 dark:text-sand-400'
             }`}>
               {item.type}
             </h3>
             <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
                    {item.woods.length > 0 ? item.woods.join(' + ') : 'Sin madera'}
                 </span>
                 <span className="text-wood-300 dark:text-wood-700">•</span>
                 <span className="text-xs text-wood-400 dark:text-wood-500 font-medium">
                    {item.quantity} pzas
                 </span>
             </div>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
            {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-wood-300 hover:text-red-500 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Eliminar producto"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
            <div className={`p-3 rounded-full bg-wood-50 dark:bg-wood-800 transition-transform duration-500 ${isActive ? 'rotate-180 bg-accent-gold/10 text-accent-gold' : 'text-wood-400'}`}>
               <ChevronDown className="w-5 h-5" />
            </div>
        </div>
      </div>

      {/* Expanded Content Body */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-6 md:px-10 pb-10 space-y-10 border-t border-wood-100 dark:border-wood-800/50 pt-8">
               
               {/* 1. Product Type Selector Grid */}
               <div className="space-y-4">
                 <label className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest block pl-1">
                    Tipo de Pieza
                 </label>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {PRODUCT_TYPES_CONFIG.map((conf) => {
                        const isSelected = item.type === conf.type;
                        const Icon = conf.icon;
                        return (
                            <motion.button
                                key={conf.type}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onUpdate({...item, type: conf.type})}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 gap-3 ${
                                    isSelected 
                                      ? 'bg-wood-900 border-wood-900 text-sand-100 dark:bg-sand-100 dark:border-sand-100 dark:text-wood-900 shadow-lg'
                                      : 'bg-white dark:bg-wood-900/50 border-wood-200 dark:border-wood-700 text-wood-500 hover:border-accent-gold hover:text-accent-gold'
                                }`}
                            >
                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                                    {conf.label}
                                </span>
                            </motion.button>
                        );
                    })}
                 </div>
                 {/* Custom Type Input */}
                 {item.type === 'Otro' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <input 
                           type="text" 
                           placeholder="Describe tu pieza personalizada..."
                           value={item.customType || ''}
                           onChange={(e) => onUpdate({...item, customType: e.target.value})}
                           className="w-full bg-sand-50 dark:bg-wood-800 border-b-2 border-wood-200 dark:border-wood-700 px-4 py-3 text-lg font-serif italic text-wood-900 dark:text-sand-100 focus:border-accent-gold outline-none transition-colors placeholder:text-wood-400"
                        />
                    </motion.div>
                 )}
               </div>

               {/* 2. Usage Selector (Pill Style) */}
               <div className="space-y-4">
                 <label className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest block pl-1">
                    Propósito
                 </label>
                 <div className="flex flex-wrap gap-3">
                    {['Decorativo', 'Funcional (cocina)', 'Evento / Regalo', 'Volumen Alto'].map((u) => (
                        <button
                            key={u}
                            onClick={() => onUpdate({...item, usage: u as any})}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                            item.usage === u 
                                ? 'bg-accent-gold text-white border-accent-gold shadow-md shadow-accent-gold/20' 
                                : 'bg-transparent border-wood-200 dark:border-wood-700 text-wood-500 hover:border-wood-400 dark:hover:border-wood-500'
                            }`}
                        >
                            {u}
                        </button>
                    ))}
                 </div>
               </div>

               {/* 3. Wood Selector Component */}
               <WoodSelector 
                  selectedWoods={item.woods}
                  primaryWood={item.primaryWood}
                  secondaryWood={item.secondaryWood}
                  onChange={(woods, prim, sec) => onUpdate({...item, woods, primaryWood: prim, secondaryWood: sec})}
               />

               {/* 4. Dimensions & Quantity (Clean Layout) */}
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end bg-sand-50 dark:bg-wood-800/30 p-8 rounded-2xl border border-wood-100 dark:border-wood-800">
                   
                   {/* Dimensions Inputs */}
                   <div className="md:col-span-8 space-y-4">
                       <label className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest flex items-center gap-2">
                           <Maximize2 className="w-3 h-3" />
                           Dimensiones (cm)
                       </label>
                       <div className="grid grid-cols-3 gap-4">
                           {['Largo', 'Ancho', 'Espesor'].map((label, idx) => {
                               const field = label === 'Largo' ? 'length' : label === 'Ancho' ? 'width' : 'thickness';
                               return (
                                   <div key={label} className="relative group">
                                       <input 
                                           type="number" 
                                           step={field === 'thickness' ? "0.5" : "1"}
                                           value={item.dimensions[field as keyof typeof item.dimensions]}
                                           onChange={(e) => handleDimensionChange(field as any, e.target.value)}
                                           className="w-full bg-white dark:bg-wood-900 border-2 border-transparent hover:border-wood-200 dark:hover:border-wood-700 focus:border-accent-gold rounded-xl px-4 py-4 text-center font-bold text-wood-900 dark:text-sand-100 text-lg shadow-sm outline-none transition-all"
                                       />
                                       <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-wood-900 px-2 text-[10px] uppercase font-bold text-wood-400 rounded-full">
                                           {label}
                                       </span>
                                   </div>
                               );
                           })}
                       </div>
                   </div>

                   {/* Quantity Stepper */}
                   <div className="md:col-span-4 flex flex-col items-center justify-center h-full pl-0 md:pl-8 border-l border-wood-200 dark:border-wood-700/50">
                       <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest mb-3">Cantidad</label>
                       <div className="flex items-center gap-4 bg-white dark:bg-wood-900 p-2 rounded-full shadow-sm border border-wood-100 dark:border-wood-800">
                          <button 
                            onClick={() => onUpdate({...item, quantity: Math.max(1, item.quantity - 1)})}
                            className="w-10 h-10 rounded-full bg-wood-100 dark:bg-wood-800 hover:bg-wood-200 dark:hover:bg-wood-700 flex items-center justify-center transition-colors text-wood-600 dark:text-sand-300"
                          >
                            -
                          </button>
                          <span className="font-serif text-2xl font-bold w-12 text-center text-wood-900 dark:text-sand-100">{item.quantity}</span>
                          <button 
                             onClick={() => onUpdate({...item, quantity: item.quantity + 1})}
                             className="w-10 h-10 rounded-full bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 flex items-center justify-center hover:bg-accent-gold hover:text-white transition-colors shadow-md"
                          >
                            +
                          </button>
                       </div>
                   </div>
               </div>

               {/* 5. Engraving Module */}
               <EngravingConfigurator 
                  config={item.engraving}
                  onChange={(cfg) => onUpdate({...item, engraving: cfg})}
               />

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
