import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { WoodType } from './types';

interface WoodSelectorProps {
  selectedWoods: WoodType[];
  onChange: (woods: WoodType[], primary?: WoodType, secondary?: WoodType) => void;
  primaryWood?: WoodType;
  secondaryWood?: WoodType;
}

const WOOD_OPTIONS: { label: WoodType; color: string; description: string }[] = [
  { label: 'Cedro', color: '#A05A2C', description: 'Aromático y rojizo' },
  { label: 'Nogal', color: '#4A3728', description: 'Oscuro y elegante' }, // Darker Walnut
  { label: 'Encino', color: '#D7C49E', description: 'Claro y resistente' },
  { label: 'Parota', color: '#594036', description: 'Exótico y veteado' },
  { label: 'Combinación', color: 'linear-gradient(135deg, #A05A2C 0%, #4A3728 100%)', description: 'Fusión personalizada' },
];

export const WoodSelector: React.FC<WoodSelectorProps> = ({
  selectedWoods,
  onChange,
  primaryWood,
  secondaryWood,
}) => {
  const handleToggle = (wood: WoodType) => {
    if (wood === 'Combinación') {
      onChange(['Combinación']);
      return;
    }
    if (selectedWoods.includes('Combinación')) {
      onChange([wood]);
      return;
    }
    const newSelection = selectedWoods.includes(wood)
      ? selectedWoods.filter((w) => w !== wood)
      : [...selectedWoods, wood];
    onChange(newSelection.length ? newSelection : []);
  };

  const isCombination = selectedWoods.includes('Combinación');

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest">
        Selección de Material
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {WOOD_OPTIONS.map((option) => {
          const isSelected = selectedWoods.includes(option.label);
          return (
            <motion.button
              key={option.label}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggle(option.label)}
              className={`relative group flex flex-col overflow-hidden rounded-xl transition-all duration-300 text-left h-32 ${
                isSelected
                  ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-sand-100 dark:ring-offset-wood-900 shadow-xl'
                  : 'hover:shadow-lg opacity-80 hover:opacity-100'
              }`}
            >
              {/* Background Color/Gradient */}
              <div 
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: option.color }}
              />
              
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Content */}
              <div className="relative z-10 mt-auto p-3">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="block text-white font-serif font-medium text-lg leading-none mb-1">
                        {option.label}
                        </span>
                        <span className="block text-white/70 text-[10px] uppercase tracking-wide">
                        {option.description}
                        </span>
                    </div>
                    {isSelected && (
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="bg-accent-gold text-wood-900 rounded-full p-0.5"
                        >
                            <Check className="w-3 h-3" />
                        </motion.div>
                    )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Advanced Combination Controls */}
      <AnimatePresence>
        {isCombination && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white dark:bg-wood-800 rounded-xl border border-wood-100 dark:border-wood-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Primary Wood */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">Madera Dominante</label>
                    <div className="relative">
                        <select
                            value={primaryWood || ''}
                            onChange={(e) => onChange(selectedWoods, e.target.value as WoodType, secondaryWood)}
                            className="w-full appearance-none bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded-lg p-3 text-sm focus:border-accent-gold outline-none text-wood-900 dark:text-sand-100 font-medium"
                        >
                            <option value="">Seleccionar...</option>
                            {WOOD_OPTIONS.filter(w => w.label !== 'Combinación').map(w => (
                            <option key={w.label} value={w.label}>{w.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="w-2 h-2 bg-wood-400 rotate-45 border-b border-r border-wood-600"></div>
                        </div>
                    </div>
                </div>

                {/* Secondary Wood */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">Madera Acento</label>
                    <div className="relative">
                        <select
                            value={secondaryWood || ''}
                            onChange={(e) => onChange(selectedWoods, primaryWood, e.target.value as WoodType)}
                            className="w-full appearance-none bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded-lg p-3 text-sm focus:border-accent-gold outline-none text-wood-900 dark:text-sand-100 font-medium"
                        >
                            <option value="">Seleccionar...</option>
                            {WOOD_OPTIONS.filter(w => w.label !== 'Combinación').map(w => (
                            <option key={w.label} value={w.label}>{w.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="w-2 h-2 bg-wood-400 rotate-45 border-b border-r border-wood-600"></div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
