"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Type, Image as ImageIcon, Sparkles, LayoutTemplate } from 'lucide-react';
import { EngravingConfig, EngravingType, EngravingComplexity, EngravingZone } from './types';
import { GrabadoIcon, QRIcon } from './QuoteIcons';
import { DesignGallery, DesignTemplate } from './DesignGallery';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

interface EngravingConfiguratorProps {
  config: EngravingConfig;
  onChange: (config: EngravingConfig) => void;
  forceEnabled?: boolean;
}

const TYPES: { value: EngravingType; label: string; desc: string; Icon: React.FC<any> }[] = [
  { value: 'Texto', label: 'Texto', desc: 'Nombres, frases', Icon: Type },
  { value: 'Logotipo', label: 'Logotipo', desc: 'SVG / Vector', Icon: LayoutTemplate },
  { value: 'Imagen personalizada', label: 'Imagen', desc: 'Foto / Ilustración', Icon: ImageIcon },
  { value: 'Código QR', label: 'Código QR', desc: 'URL, menú, playlist', Icon: QRIcon },
  { value: 'Combinación', label: 'Mixto', desc: 'Diseño complejo', Icon: Sparkles },
];

const COMPLEXITIES: { value: EngravingComplexity; label: string }[] = [
  { value: 'Básico', label: 'Básico' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Detallado', label: 'Detallado' },
  { value: 'Premium', label: 'Premium' },
];

// ZONE_GROUPS and ENGRAVING_PRICES now come from useQuoteConfig()

export const EngravingConfigurator: React.FC<EngravingConfiguratorProps> = ({
  config,
  onChange,
  forceEnabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGallery, setShowGallery] = React.useState(false);
  const isEnabled = forceEnabled || config.enabled;

  // Read engraving config from centralized admin-configurable source
  const { config: quoteConfig } = useQuoteConfig();
  const zoneGroups = quoteConfig.zoneGroups;
  const engravingPricesList = quoteConfig.engravingPrices;
  const zoneExtraPrice = quoteConfig.engravingZoneExtra;

  const handleSelectTemplate = (template: DesignTemplate) => {
    onChange({
      ...config,
      templateId: template.id,
      templateName: template.name,
      customText: template.defaultText || config.customText,
      file: null,
      fileName: undefined,
    });
    setShowGallery(false);
  };

  const handleToggle = () => {
    if (forceEnabled) return;
    onChange({ ...config, enabled: !config.enabled });
  };

  const handleZoneToggle = (zone: string) => {
    const z = zone as EngravingZone;
    const zones = config.zones.includes(z)
      ? config.zones.filter((existing) => existing !== z)
      : [...config.zones, z];
    onChange({ ...config, zones: zones.length > 0 ? zones : [z] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onChange({ ...config, file: e.target.files[0], fileName: e.target.files[0].name });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Header (hidden if forceEnabled) */}
      {!forceEnabled && (
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isEnabled
                  ? 'bg-accent-gold text-wood-900 shadow-lg shadow-accent-gold/20'
                  : 'bg-wood-100 dark:bg-wood-800 text-wood-400'
              }`}
            >
              <GrabadoIcon size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 group-hover:text-accent-gold transition-colors">
                Grabado Láser
              </h4>
              <p className="text-[11px] text-wood-500">
                {isEnabled ? 'Activado' : 'Añadir personalización'}
              </p>
            </div>
          </div>
          <div
            className={`w-12 h-7 rounded-full transition-colors relative ${
              isEnabled ? 'bg-accent-gold' : 'bg-wood-200 dark:bg-wood-700'
            }`}
          >
            <motion.div
              layout
              className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: isEnabled ? 20 : 0 }}
            />
          </div>
        </button>
      )}

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-6">
              {/* Type */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                  Estilo de Grabado
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {TYPES.map((t) => {
                    const sel = config.type === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => onChange({ ...config, type: t.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          sel
                            ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 text-sand-100 dark:text-wood-900 shadow-lg'
                            : 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800 hover:border-wood-300 text-wood-600'
                        }`}
                      >
                        <t.Icon
                          className={`w-5 h-5 mx-auto mb-1.5 ${sel ? '' : 'text-wood-400'}`}
                          size={20}
                        />
                        <span className="block text-xs font-bold">{t.label}</span>
                        <span className={`block text-[9px] mt-0.5 ${sel ? 'opacity-70' : 'text-wood-400'}`}>
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content area */}
              <div className="bg-white dark:bg-wood-900/40 rounded-xl p-5 border border-wood-100 dark:border-wood-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Zones */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                      Ubicación en la pieza
                    </label>
                    <div className="space-y-3">
                      {zoneGroups.map((group) => (
                        <div key={group.label}>
                          <span className="text-[9px] font-bold text-wood-300 uppercase tracking-widest mb-1.5 block">{group.label}</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {group.zones.map((zone: string) => {
                              const z = zone as EngravingZone;
                              const sel = config.zones.includes(z);
                              return (
                                <button
                                  key={zone}
                                  onClick={() => handleZoneToggle(zone)}
                                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all ${
                                    sel
                                      ? 'bg-accent-gold/10 border-accent-gold text-wood-900 dark:text-accent-gold font-bold'
                                      : 'bg-wood-50 dark:bg-wood-800 border-wood-200 dark:border-wood-700 text-wood-500'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${sel ? 'bg-accent-gold' : 'bg-wood-300'}`} />
                                  {zone}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {config.zones.length > 1 && (
                      <p className="text-[10px] text-accent-gold">
                        +${zoneExtraPrice * (config.zones.length - 1)} por zona adicional
                      </p>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    {/* Text input */}
                    {(config.type === 'Texto' || config.type === 'Combinación') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                          Texto a grabar
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre, fecha, frase..."
                          value={config.customText || ''}
                          onChange={(e) => onChange({ ...config, customText: e.target.value })}
                          className="w-full bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-600 rounded-lg px-4 py-3 text-sm focus:border-accent-gold outline-none transition-colors"
                        />
                      </div>
                    )}

                    {/* QR URL input */}
                    {config.type === 'Código QR' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                          URL para el QR
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={config.qrUrl || ''}
                          onChange={(e) => onChange({ ...config, qrUrl: e.target.value })}
                          className="w-full bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-600 rounded-lg px-4 py-3 text-sm focus:border-accent-gold outline-none transition-colors"
                        />
                        <p className="text-[10px] text-wood-400">
                          Menú digital, Spotify playlist, video dedicatoria, etc.
                        </p>
                      </div>
                    )}

                    {/* File upload */}
                    {config.type !== 'Texto' && config.type !== 'Código QR' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                          Subir archivo
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-wood-300 dark:border-wood-600 hover:border-accent-gold rounded-lg p-4 flex flex-col items-center text-center cursor-pointer transition-colors bg-white/50 dark:bg-wood-900/50"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".svg,.png,.jpg,.jpeg,.ai,.pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          {config.file ? (
                            <div className="flex items-center gap-2 text-accent-gold">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-xs font-bold truncate max-w-[150px]">
                                {config.fileName || (config.file as File).name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChange({ ...config, file: null, fileName: undefined });
                                }}
                                className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full text-wood-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-wood-400 mb-1" />
                              <span className="text-[10px] text-wood-500 font-medium">
                                SVG, PNG, JPG, AI
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Template selection indicator */}
                {config.templateId && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-accent-gold" />
                    <span className="text-xs font-bold text-wood-900 dark:text-sand-100">
                      Plantilla: {config.templateName}
                    </span>
                    <button
                      onClick={() => onChange({ ...config, templateId: undefined, templateName: undefined })}
                      className="ml-auto p-1 hover:bg-red-100 hover:text-red-500 rounded-full text-wood-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Gallery button + panel */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowGallery(!showGallery)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed transition-all text-xs font-bold uppercase tracking-wider ${
                      showGallery
                        ? 'border-accent-gold bg-accent-gold/5 text-accent-gold'
                        : 'border-wood-200 dark:border-wood-700 text-wood-400 hover:border-accent-gold hover:text-accent-gold'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {showGallery ? 'Cerrar galería' : 'Elegir de la galería de diseños'}
                  </button>
                  <AnimatePresence>
                    {showGallery && (
                      <div className="mt-3">
                        <DesignGallery
                          productCategory="madera"
                          selectedId={config.templateId}
                          onSelect={handleSelectTemplate}
                          onClose={() => setShowGallery(false)}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Complexity / Price */}
                <div className="mt-5 pt-4 border-t border-dashed border-wood-200 dark:border-wood-700">
                  <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block mb-3">
                    Nivel de detalle
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {COMPLEXITIES.map((c) => {
                      const sel = config.complexity === c.value;
                      const priceEntry = engravingPricesList.find(ep => ep.complexity === c.value);
                      const price = priceEntry?.price ?? 0;
                      return (
                        <button
                          key={c.value}
                          onClick={() => onChange({ ...config, complexity: c.value })}
                          className={`py-3 rounded-lg border-2 text-center transition-all ${
                            sel
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-wood-100 dark:border-wood-800 bg-wood-50 dark:bg-wood-900 hover:border-wood-300'
                          }`}
                        >
                          <span
                            className={`block text-xs font-bold ${
                              sel ? 'text-accent-gold' : 'text-wood-600 dark:text-wood-300'
                            }`}
                          >
                            {c.label}
                          </span>
                          <span
                            className={`block text-sm font-serif font-bold mt-0.5 ${
                              sel ? 'text-wood-900 dark:text-sand-100' : 'text-wood-400'
                            }`}
                          >
                            ${price}
                          </span>
                        </button>
                      );
                    })}
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
