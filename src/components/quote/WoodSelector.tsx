"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import type { WoodType } from './types';

interface WoodSelectorProps {
  selectedWoods: WoodType[];
  onChange: (woods: WoodType[], primary?: WoodType, secondary?: WoodType) => void;
  primaryWood?: WoodType;
  secondaryWood?: WoodType;
}

const WOOD_OPTIONS: { label: WoodType; color: string; gradient: string; description: string }[] = [
  { label: 'Cedro', color: '#A05A2C', gradient: 'linear-gradient(135deg, #C17840 0%, #8B4513 100%)', description: 'Aromático y rojizo' },
  { label: 'Nogal', color: '#4A3728', gradient: 'linear-gradient(135deg, #5C4033 0%, #3B2716 100%)', description: 'Oscuro y elegante' },
  { label: 'Encino', color: '#D7C49E', gradient: 'linear-gradient(135deg, #E8D9B8 0%, #B8A67A 100%)', description: 'Claro y resistente' },
  { label: 'Parota', color: '#594036', gradient: 'linear-gradient(135deg, #7A5C4F 0%, #3D2B22 100%)', description: 'Exótico y veteado' },
  { label: 'Combinación', color: '#8B7355', gradient: 'linear-gradient(135deg, #A05A2C 0%, #4A3728 50%, #594036 100%)', description: 'Fusión personalizada' },
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
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest">
        Selección de madera
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {WOOD_OPTIONS.map((option) => {
          const isSelected = selectedWoods.includes(option.label);
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
                    {WOOD_OPTIONS.filter(w => w.label !== 'Combinación').map(w => (
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
