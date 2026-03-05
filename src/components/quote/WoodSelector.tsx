"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import type { WoodType } from './types';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

interface WoodSelectorProps {
  selectedWoods: WoodType[];
  onChange: (woods: WoodType[], primary?: WoodType, secondary?: WoodType) => void;
  primaryWood?: WoodType;
  secondaryWood?: WoodType;
}

export const WoodSelector: React.FC<WoodSelectorProps> = ({
  selectedWoods,
  onChange,
  primaryWood,
  secondaryWood,
}) => {
  // Read wood options from centralized config (admin-configurable)
  const { config } = useQuoteConfig();
  const woodOptions = config.woodOptions.filter(w => w.enabled);

  const handleToggle = (wood: string) => {
    const w = wood as WoodType;
    if (w === 'Combinación') {
      onChange(['Combinación']);
      return;
    }
    if (selectedWoods.includes('Combinación')) {
      onChange([w]);
      return;
    }
    const newSelection = selectedWoods.includes(w)
      ? selectedWoods.filter((sw) => sw !== w)
      : [...selectedWoods, w];
    onChange(newSelection.length ? newSelection : []);
  };

  const isCombination = selectedWoods.includes('Combinación');

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest">
        Selección de madera
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {woodOptions.map((option) => {
          const isSelected = selectedWoods.includes(option.label as WoodType);
          return (
            <motion.button
              key={option.label}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggle(option.label)}
              className={`relative group flex flex-col overflow-hidden rounded-xl transition-all duration-300 text-left h-28 ${
                isSelected
                  ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-sand-100 dark:ring-offset-wood-900 shadow-xl'
                  : 'hover:shadow-lg opacity-80 hover:opacity-100'
              }`}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: option.gradient }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 mt-auto p-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-white font-serif font-medium text-base leading-none mb-1">
                      {option.label}
                    </span>
                    <span className="block text-white/70 text-[10px] uppercase tracking-wide">
                      {option.description}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="bg-accent-gold text-wood-900 rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Combination controls */}
      <AnimatePresence>
        {isCombination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white dark:bg-wood-800 rounded-xl border border-wood-100 dark:border-wood-700 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Madera Dominante', value: primaryWood, onChange: (v: string) => onChange(selectedWoods, v as WoodType, secondaryWood) },
                { label: 'Madera Acento', value: secondaryWood, onChange: (v: string) => onChange(selectedWoods, primaryWood, v as WoodType) },
              ].map(({ label, value, onChange: handleChange }) => (
                <div key={label} className="space-y-2">
                  <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">{label}</label>
                  <select
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full appearance-none bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded-lg p-3 text-sm focus:border-accent-gold outline-none font-medium"
                  >
                    <option value="">Seleccionar...</option>
                    {woodOptions.filter(w => w.label !== 'Combinación').map(w => (
                      <option key={w.label} value={w.label}>{w.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
