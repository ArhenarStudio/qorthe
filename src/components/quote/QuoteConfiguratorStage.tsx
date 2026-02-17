"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, ChefHat, Utensils, Sparkles, Package, Info, 
  Ruler, Palette, Layers, Type, Trash2, Copy, MoveRight, 
  CheckCircle2
} from 'lucide-react';
import { ProductItem, ProductType } from './types';
import { WoodSelector } from './WoodSelector';
import { EngravingConfigurator } from './EngravingConfigurator';

interface QuoteConfiguratorStageProps {
  item: ProductItem;
  onUpdate: (item: ProductItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const TABS = [
  { id: 'type', label: 'Tipo & Uso', icon: Layers },
  { id: 'material', label: 'Materiales', icon: Palette },
  { id: 'dimensions', label: 'Medidas', icon: Ruler },
  { id: 'engraving', label: 'Grabado', icon: Type },
];

const PRODUCT_ICONS: Record<ProductType, any> = {
  'Tabla de decoración': Box,
  'Tabla de picar': ChefHat,
  'Tabla de charcutería': Utensils,
  'Plato decorativo': Sparkles,
  'Caja personalizada': Package,
  'Servicio de Grabado': Type,
  'Otro': Info,
};

export const QuoteConfiguratorStage: React.FC<QuoteConfiguratorStageProps> = ({ 
  item, 
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [activeTab, setActiveTab] = useState('type');
  const CurrentIcon = PRODUCT_ICONS[item.type] || Box;

  // Función auxiliar para avanzar de pestaña
  const goNext = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sand-50 dark:bg-black w-full relative">
      
      {/* 1. Top Bar: Header Integrado */}
      <header className="flex-none flex items-center justify-between px-6 py-5 bg-white dark:bg-wood-950 border-b border-wood-100 dark:border-wood-800 z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 flex items-center justify-center shadow-md">
            <CurrentIcon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-wood-400 dark:text-wood-500">
                    Editando Item
                </span>
                <span className="w-1 h-1 rounded-full bg-wood-300"></span>
                <span className="text-[10px] font-mono text-wood-400">ID: {item.id.slice(0,4)}</span>
            </div>
            <h2 className="font-serif text-3xl text-wood-900 dark:text-sand-100 leading-none tracking-tight">
              {item.type === 'Otro' && item.customType ? item.customType : item.type}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={onDuplicate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-wood-600 hover:text-wood-900 hover:bg-wood-100 dark:text-wood-400 dark:hover:text-sand-100 dark:hover:bg-wood-800 rounded-lg transition-all"
            >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Duplicar</span>
            </button>
            <div className="w-px h-8 bg-wood-200 dark:bg-wood-800 mx-1" />
            <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
            </button>
        </div>
      </header>

      {/* 2. Tabs Navigation Bar (Sticky) */}
      <div className="flex-none bg-white dark:bg-wood-950 px-6 border-b border-wood-100 dark:border-wood-800 shadow-sm z-10">
        <div className="flex w-full max-w-4xl mx-auto">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 relative py-4 flex items-center justify-center gap-2 transition-all ${
                            isActive 
                            ? 'text-wood-900 dark:text-sand-100' 
                            : 'text-wood-400 hover:text-wood-600 dark:hover:text-wood-300'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-accent-gold stroke-[2.5px]' : ''}`} />
                        <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {tab.label}
                        </span>
                        {isActive && (
                            <motion.div 
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold"
                            />
                        )}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 3. Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-sand-50 dark:bg-black/50 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3c3c3c_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-4xl mx-auto px-6 py-10 pb-24 min-h-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    {/* -- CONTENT: TYPE -- */}
                    {activeTab === 'type' && (
                        <div className="space-y-10">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-wood-200 dark:bg-wood-800 text-xs font-bold text-wood-600">1</span>
                                    <h3 className="text-lg font-serif text-wood-900 dark:text-sand-100">Selecciona la Categoría</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(PRODUCT_ICONS).map(([name, Icon]) => (
                                        <button
                                            key={name}
                                            onClick={() => onUpdate({...item, type: name as ProductType})}
                                            className={`group relative p-6 rounded-xl border text-left transition-all duration-200 overflow-hidden ${
                                                item.type === name
                                                ? 'bg-white dark:bg-wood-900 border-accent-gold shadow-lg shadow-accent-gold/5 ring-1 ring-accent-gold'
                                                : 'bg-white dark:bg-wood-900/40 border-wood-200 dark:border-wood-800 hover:border-wood-300 hover:shadow-md'
                                            }`}
                                        >
                                            <div className={`mb-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                item.type === name ? 'bg-accent-gold text-white' : 'bg-wood-100 dark:bg-wood-800 text-wood-500'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`block font-serif text-lg leading-tight ${
                                                item.type === name ? 'text-wood-900 dark:text-sand-100' : 'text-wood-600 dark:text-wood-400'
                                            }`}>
                                                {name}
                                            </span>
                                            
                                            {item.type === name && (
                                                <div className="absolute top-4 right-4 text-accent-gold">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {item.type === 'Otro' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                        <input 
                                            type="text"
                                            placeholder="Especifique el tipo de producto..."
                                            value={item.customType || ''}
                                            onChange={(e) => onUpdate({...item, customType: e.target.value})}
                                            className="w-full bg-white dark:bg-wood-900 border border-wood-300 dark:border-wood-700 rounded-lg p-4 font-serif text-lg outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                        />
                                    </motion.div>
                                )}
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-wood-200 dark:bg-wood-800 text-xs font-bold text-wood-600">2</span>
                                    <h3 className="text-lg font-serif text-wood-900 dark:text-sand-100">Uso Principal</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {['Decorativo', 'Funcional (cocina)', 'Evento / Regalo', 'Volumen Alto'].map((usage) => (
                                        <button
                                            key={usage}
                                            onClick={() => onUpdate({...item, usage: usage as any})}
                                            className={`px-6 py-3 rounded-lg text-sm transition-all border font-medium ${
                                                item.usage === usage
                                                ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 text-sand-100 dark:text-wood-900 shadow-md'
                                                : 'bg-white dark:bg-wood-900 border-wood-200 dark:border-wood-700 text-wood-600 hover:border-wood-400'
                                            }`}
                                        >
                                            {usage}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* -- CONTENT: MATERIAL -- */}
                    {activeTab === 'material' && (
                        <div className="space-y-8">
                             <WoodSelector 
                                selectedWoods={item.woods}
                                primaryWood={item.primaryWood}
                                secondaryWood={item.secondaryWood}
                                onChange={(woods, prim, sec) => onUpdate({...item, woods, primaryWood: prim, secondaryWood: sec})}
                            />
                        </div>
                    )}

                    {/* -- CONTENT: DIMENSIONS -- */}
                    {activeTab === 'dimensions' && (
                        <div className="space-y-10">
                            <div className="bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 p-8 shadow-sm">
                                <h3 className="text-lg font-serif text-wood-900 dark:text-sand-100 mb-8 text-center">Dimensiones de la Pieza</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {['Largo', 'Ancho', 'Espesor'].map((label) => {
                                        const field = label === 'Largo' ? 'length' : label === 'Ancho' ? 'width' : 'thickness';
                                        const val = item.dimensions[field as keyof typeof item.dimensions];
                                        return (
                                            <div key={label} className="flex flex-col items-center group">
                                                <span className="text-[10px] font-bold text-wood-400 uppercase tracking-widest mb-3">{label} (cm)</span>
                                                <div className="relative">
                                                    <input 
                                                        type="number"
                                                        value={val}
                                                        step={field === 'thickness' ? 0.5 : 1}
                                                        onChange={(e) => onUpdate({
                                                            ...item,
                                                            dimensions: { ...item.dimensions, [field]: Number(e.target.value) }
                                                        })}
                                                        className="w-32 bg-sand-50 dark:bg-black border border-wood-200 dark:border-wood-800 rounded-xl py-4 text-4xl font-serif text-wood-900 dark:text-sand-100 text-center outline-none focus:border-accent-gold transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="bg-wood-900 dark:bg-sand-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-wood-900/10">
                                <div>
                                    <h3 className="text-xl font-serif text-sand-100 dark:text-wood-900 mb-1">Cantidad Requerida</h3>
                                    <p className="text-sand-100/60 dark:text-wood-900/60 text-sm">El precio unitario mejora con el volumen.</p>
                                </div>
                                <div className="flex items-center gap-6 bg-wood-800 dark:bg-wood-200/20 p-2 rounded-xl">
                                    <button 
                                        onClick={() => onUpdate({...item, quantity: Math.max(1, item.quantity - 1)})}
                                        className="w-12 h-12 rounded-lg bg-wood-950/30 dark:bg-white/50 text-sand-100 dark:text-wood-900 flex items-center justify-center hover:bg-black/20 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="font-serif text-4xl text-sand-100 dark:text-wood-900 w-16 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdate({...item, quantity: item.quantity + 1})}
                                        className="w-12 h-12 rounded-lg bg-accent-gold text-wood-900 flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* -- CONTENT: ENGRAVING -- */}
                    {activeTab === 'engraving' && (
                        <div className="space-y-8">
                             <EngravingConfigurator 
                                config={item.engraving}
                                onChange={(cfg) => onUpdate({...item, engraving: cfg})}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            
            {/* Bottom Navigation Helper */}
            {activeTab !== 'engraving' && (
                <div className="mt-12 flex justify-end">
                    <button 
                        onClick={goNext}
                        className="group flex items-center gap-3 px-8 py-4 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Siguiente Paso
                        <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
