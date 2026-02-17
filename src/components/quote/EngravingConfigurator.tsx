"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Image as ImageIcon, Sparkles, LayoutTemplate, Type, MousePointer2 } from 'lucide-react';
import { EngravingConfig } from './types';

interface EngravingConfiguratorProps {
  config: EngravingConfig;
  onChange: (config: EngravingConfig) => void;
  forceEnabled?: boolean;
}

// Card Selector Component moved outside
const ConfigCard = ({ icon: Icon, label, isActive, onClick, subtext }: any) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative p-4 rounded-xl text-left border transition-all h-full flex flex-col justify-between ${
      isActive 
        ? 'bg-wood-900 text-sand-100 border-wood-900 dark:bg-sand-100 dark:text-wood-900 dark:border-sand-100 shadow-lg' 
        : 'bg-white dark:bg-wood-900/40 border-wood-200 dark:border-wood-700 hover:border-wood-400 text-wood-600 dark:text-sand-300'
    }`}
  >
    <div className={`p-2 rounded-full w-fit mb-3 ${isActive ? 'bg-white/10' : 'bg-wood-100 dark:bg-wood-800'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <span className="block font-bold text-sm tracking-wide mb-1">{label}</span>
      {subtext && <span className="text-[10px] opacity-70 uppercase tracking-wider block">{subtext}</span>}
    </div>
  </motion.button>
);

export const EngravingConfigurator: React.FC<EngravingConfiguratorProps> = ({ config, onChange, forceEnabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (forceEnabled) return;
    onChange({ ...config, enabled: !config.enabled });
  };

  const handleZoneToggle = (zone: string) => {
    const zones = config.zones.includes(zone)
      ? config.zones.filter((z) => z !== zone)
      : [...config.zones, zone];
    onChange({ ...config, zones });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ ...config, file: e.target.files[0] });
    }
  };

  const isEnabled = forceEnabled || config.enabled;

  return (
    <div className="pt-8 border-t border-dashed border-wood-300 dark:border-wood-700/50">
      
      {/* Header / Toggle */}
      <div 
        className={`flex items-center justify-between group select-none mb-6 ${forceEnabled ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isEnabled ? 'bg-accent-gold text-white shadow-lg shadow-accent-gold/20' : 'bg-wood-100 dark:bg-wood-800 text-wood-400'}`}>
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-serif text-xl font-medium text-wood-900 dark:text-sand-100 group-hover:text-accent-gold transition-colors">
                    Personalización Láser
                </h4>
                <p className="text-xs text-wood-500 font-medium uppercase tracking-wider">
                    {isEnabled ? 'Activado' : 'Añadir grabado personalizado'}
                </p>
            </div>
        </div>
        
        {!forceEnabled && (
            <div className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${isEnabled ? 'bg-wood-900 dark:bg-accent-gold' : 'bg-wood-200 dark:bg-wood-700'}`}>
                <motion.div
                    layout
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: isEnabled ? 24 : 0 }}
                />
            </div>
        )}
      </div>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-4 md:pl-16 space-y-8 pb-4">
              
              {/* Type Selection Grid */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block">Estilo de Grabado</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ConfigCard 
                    icon={Type} 
                    label="Solo Texto" 
                    subtext="Nombres / Frases"
                    isActive={config.type === 'Texto'} 
                    onClick={() => onChange({ ...config, type: 'Texto' })}
                  />
                  <ConfigCard 
                    icon={LayoutTemplate} 
                    label="Logotipo" 
                    subtext="Vector (.SVG, .AI)"
                    isActive={config.type === 'Logotipo'} 
                    onClick={() => onChange({ ...config, type: 'Logotipo' })}
                  />
                  <ConfigCard 
                    icon={ImageIcon} 
                    label="Imagen" 
                    subtext="Foto / Ilustración"
                    isActive={config.type === 'Imagen personalizada'} 
                    onClick={() => onChange({ ...config, type: 'Imagen personalizada' })}
                  />
                  <ConfigCard 
                    icon={Sparkles} 
                    label="Mixto" 
                    subtext="Diseño Complejo"
                    isActive={config.type === 'Combinación'} 
                    onClick={() => onChange({ ...config, type: 'Combinación' })}
                  />
                </div>
              </div>

              {/* Dynamic Content based on Type */}
              <div className="bg-sand-50 dark:bg-wood-800/50 rounded-xl p-6 border border-wood-100 dark:border-wood-700/50">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Zone Selector */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block">Ubicación</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Centro', 'Esq. Inferior', 'Borde Sup.', 'Reverso'].map((zone) => (
                                <button
                                key={zone}
                                onClick={() => handleZoneToggle(zone)}
                                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all ${
                                    config.zones.includes(zone)
                                    ? 'bg-accent-gold/10 border-accent-gold text-wood-900 dark:text-accent-gold font-bold'
                                    : 'bg-white dark:bg-wood-900 border-wood-200 dark:border-wood-700 text-wood-500'
                                }`}
                                >
                                <div className={`w-1.5 h-1.5 rounded-full ${config.zones.includes(zone) ? 'bg-accent-gold' : 'bg-wood-300'}`} />
                                {zone}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {(config.type === 'Texto' || config.type === 'Combinación') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block">Texto a Grabar</label>
                                <input 
                                    type="text" 
                                    placeholder="Escribe aquí..."
                                    value={config.customText || ''}
                                    onChange={(e) => onChange({...config, customText: e.target.value})}
                                    className="w-full bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-600 rounded-lg px-4 py-3 text-sm focus:border-accent-gold outline-none shadow-sm transition-all"
                                />
                            </div>
                        )}

                        {(config.type !== 'Texto') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest block">Subir Archivo</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-wood-300 dark:border-wood-600 hover:border-accent-gold dark:hover:border-accent-gold rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/50 dark:bg-wood-900/50 min-h-[100px]"
                                >
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept=".svg,.png,.jpg,.ai" 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                    />
                                    {config.file ? (
                                        <div className="flex items-center gap-2 text-accent-gold animate-fadeIn">
                                            <div className="p-2 bg-accent-gold/10 rounded-full">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold truncate max-w-[120px]">{config.file.name}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onChange({...config, file: null}); }}
                                                className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full text-wood-400 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-wood-400 mb-2" />
                                            <span className="text-[10px] text-wood-500 uppercase font-medium">Click para subir</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Complexity Footer */}
                 <div className="mt-6 pt-4 border-t border-dashed border-wood-200 dark:border-wood-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">Nivel de Detalle</label>
                        <select 
                            value={config.complexity}
                            onChange={(e) => onChange({...config, complexity: e.target.value as any})}
                            className="bg-transparent text-xs font-bold text-wood-900 dark:text-sand-100 border-none outline-none cursor-pointer hover:text-accent-gold transition-colors"
                        >
                            <option>Básico</option>
                            <option>Intermedio</option>
                            <option>Detallado</option>
                        </select>
                    </div>
                    <span className="text-[10px] text-accent-gold italic hidden md:block">* Optimización incluida</span>
                 </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
