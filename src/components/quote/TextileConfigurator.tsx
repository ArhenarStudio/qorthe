"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Palette } from 'lucide-react';
import { TextileConfig, TextileTechnique, TextileColor, TextileProductType } from './types';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

interface TextileConfiguratorProps {
  config: TextileConfig;
  productType: TextileProductType;
  onChange: (config: TextileConfig) => void;
}

// Technique descriptions (static, not admin-configurable)
const TECHNIQUE_DESCRIPTIONS: Record<string, string> = {
  'Sublimación': 'Full color, fotos, patrones — ideal para poliéster',
  'Vinilo HTV': 'Textos y logos nítidos — ideal para algodón',
  'Transfer': 'Económico, buena resolución',
};

// TECHNIQUES and COLORS now come from useQuoteConfig()

const PRINT_ZONES: Record<TextileProductType, string[]> = {
  'Tote bag': ['Frente', 'Reverso', 'Bolsillo', 'Panel completo'],
  'Mandil de cocina': ['Frente', 'Bolsillo', 'Panel completo'],
  'Servilletas': ['Frente', 'Panel completo'],
  'Funda de cojín': ['Frente', 'Reverso', 'Panel completo'],
};

export const TextileConfigurator: React.FC<TextileConfiguratorProps> = ({
  config,
  productType,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zones = PRINT_ZONES[productType] || ['Frente', 'Panel completo'];

  // Read textile config from centralized admin-configurable source
  const { config: quoteConfig } = useQuoteConfig();
  const techniques = quoteConfig.textileTechniques.filter(t => t.enabled);
  const colors = quoteConfig.textileColors.filter(c => c.enabled);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ ...config, file: e.target.files[0], fileName: e.target.files[0].name });
    }
  };

  return (
    <div className="space-y-8">
      {/* Technique */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Técnica de Estampado
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {techniques.map((t) => {
            const sel = config.technique === (t.label as TextileTechnique);
            const desc = TECHNIQUE_DESCRIPTIONS[t.label] || '';
            return (
              <button
                key={t.label}
                onClick={() => onChange({ ...config, technique: t.label as TextileTechnique })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sel
                    ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 text-sand-100 dark:text-wood-900 shadow-lg'
                    : 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800 hover:border-wood-300'
                }`}
              >
                <span className="block font-bold text-sm mb-1">{t.label}</span>
                <span className={`block text-[11px] ${sel ? 'opacity-80' : 'text-wood-400'}`}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color + Print Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Color */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
            Color de tela
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const sel = config.color === (c.label as TextileColor);
              return (
                <button
                  key={c.label}
                  onClick={() => onChange({ ...config, color: c.label as TextileColor })}
                  className="flex flex-col items-center gap-1.5 group"
                  title={c.label}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      sel
                        ? 'border-accent-gold scale-110 shadow-lg'
                        : 'border-wood-200 dark:border-wood-700 group-hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className={`text-[9px] font-bold uppercase ${sel ? 'text-accent-gold' : 'text-wood-400'}`}>
                    {c.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Print Zone */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
            Zona de impresión
          </label>
          <div className="grid grid-cols-2 gap-2">
            {zones.map((z) => {
              const sel = config.printZone === z;
              return (
                <button
                  key={z}
                  onClick={() => onChange({ ...config, printZone: z })}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    sel
                      ? 'bg-accent-gold/10 border-accent-gold text-wood-900 dark:text-accent-gold'
                      : 'bg-white dark:bg-wood-900 border-wood-200 dark:border-wood-700 text-wood-500 hover:border-wood-400'
                  }`}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Texto a estampar (opcional)
        </label>
        <input
          type="text"
          placeholder="Nombre, frase, o dejarlo en blanco para solo imagen..."
          value={config.customText || ''}
          onChange={(e) => onChange({ ...config, customText: e.target.value })}
          className="w-full bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent-gold transition-colors"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Sube tu diseño (logo, imagen, arte)
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-wood-300 dark:border-wood-700 hover:border-accent-gold rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition-colors bg-white/50 dark:bg-wood-900/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.pdf,.ai"
            className="hidden"
            onChange={handleFileUpload}
          />
          {config.file ? (
            <div className="flex items-center gap-3 text-accent-gold">
              <Palette className="w-5 h-5" />
              <span className="text-sm font-bold truncate max-w-[200px]">
                {config.fileName || config.file.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...config, file: null, fileName: undefined });
                }}
                className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full text-wood-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-wood-400 mb-2" />
              <span className="text-xs text-wood-500 font-medium">
                SVG, PNG, JPG, PDF o AI
              </span>
              <span className="text-[10px] text-wood-400 mt-1">
                Click o arrastra tu archivo
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
