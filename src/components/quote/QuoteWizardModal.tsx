import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Check, 
  Layers, Palette, Ruler, Type, PenTool
} from 'lucide-react';
import { ProductItem, ProductType } from './types';
import { WoodSelector } from './WoodSelector';
import { EngravingConfigurator } from './EngravingConfigurator';
import { 
  Box, ChefHat, Utensils, Sparkles, Package, Info 
} from 'lucide-react';

interface QuoteWizardModalProps {
  initialItem: ProductItem;
  onSave: (item: ProductItem) => void;
  onClose: () => void;
}

const PRODUCT_ICONS: Record<ProductType, any> = {
  'Tabla de decoración': Box,
  'Tabla de picar': ChefHat,
  'Tabla de charcutería': Utensils,
  'Plato decorativo': Sparkles,
  'Caja personalizada': Package,
  'Servicio de Grabado': PenTool,
  'Otro': Info,
};

const ENGRAVING_MATERIALS = [
  { label: 'Madera', color: '#8B4513' },
  { label: 'Cuero', color: '#A0522D' },
  { label: 'Metal / Termo', color: '#708090' },
  { label: 'Acrílico', color: '#E0FFFF' },
  { label: 'Vidrio', color: '#F0F8FF' },
  { label: 'Otro', color: '#D3D3D3' }
];

export const QuoteWizardModal: React.FC<QuoteWizardModalProps> = ({ 
  initialItem, 
  onSave, 
  onClose 
}) => {
  const [item, setItem] = useState<ProductItem>(initialItem);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  // Dynamic steps based on product type
  const getSteps = (type: ProductType) => {
    if (type === 'Servicio de Grabado') {
      return [
        { id: 'type', label: 'Tipo', icon: Layers, title: 'Selecciona el Servicio', subtitle: 'Grabado láser personalizado' },
        { id: 'material-engrave', label: 'Material', icon: Palette, title: 'Superficie a Grabar', subtitle: 'Elige el material del objeto' },
        { id: 'quantity', label: 'Cantidad', icon: Ruler, title: 'Volumen del Pedido', subtitle: '¿Cuántas piezas necesitas?' },
        { id: 'engraving', label: 'Detalles', icon: Type, title: 'Diseño del Grabado', subtitle: 'Personaliza tu mensaje o logo' },
      ];
    }
    return [
      { id: 'type', label: 'Tipo', icon: Layers, title: 'Selecciona la Pieza', subtitle: 'Define el propósito de tu creación' },
      { id: 'material', label: 'Material', icon: Palette, title: 'Esencia y Material', subtitle: 'La madera es el alma del diseño' },
      { id: 'dimensions', label: 'Medidas', icon: Ruler, title: 'Forma y Dimensión', subtitle: 'Especificaciones técnicas exactas' },
      { id: 'engraving', label: 'Detalles', icon: Type, title: 'Personalización', subtitle: 'Hazlo único con grabado láser' },
    ];
  };

  const STEPS = getSteps(item.type);
  
  // Ensure current step index is valid if steps change
  useEffect(() => {
    if (currentStepIdx >= STEPS.length) {
      setCurrentStepIdx(STEPS.length - 1);
    }
  }, [item.type, STEPS.length]);

  const currentStep = STEPS[currentStepIdx] || STEPS[0];
  const isLastStep = currentStepIdx === STEPS.length - 1;

  const navigate = (newDir: number) => {
    const nextIdx = currentStepIdx + newDir;
    if (nextIdx >= 0 && nextIdx < STEPS.length) {
      setDirection(newDir);
      setCurrentStepIdx(nextIdx);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-wood-950/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[90vh] md:h-[85vh] bg-sand-50 dark:bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-wood-100 dark:border-wood-800"
      >
        
        {/* Header: Steps & Close */}
        <div className="flex-none px-6 py-6 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-white dark:bg-wood-950/50">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto flex-1 min-w-0 mr-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {STEPS.map((step, idx) => {
                    const isActive = idx === currentStepIdx;
                    const isCompleted = idx < currentStepIdx;
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                             <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 m-1 ${
                                    isActive ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 scale-110 shadow-md' : 
                                    isCompleted ? 'bg-accent-gold text-wood-900' : 
                                    'bg-wood-200 dark:bg-wood-800 text-wood-400'
                                }`}
                             >
                                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                             </div>
                             {idx < STEPS.length - 1 && (
                                <div className={`w-4 md:w-8 h-0.5 rounded-full transition-colors ${
                                    isCompleted ? 'bg-accent-gold' : 'bg-wood-200 dark:bg-wood-800'
                                }`} />
                             )}
                        </div>
                    )
                })}
            </div>
            
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                
                {/* Step Title */}
                <div className="mb-8 md:mb-12 text-center">
                    <motion.h2 
                        key={currentStep.title}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-serif text-wood-900 dark:text-sand-100 mb-2"
                    >
                        {currentStep.title}
                    </motion.h2>
                    <motion.p 
                        key={currentStep.subtitle}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-wood-500 font-sans text-sm md:text-base"
                    >
                        {currentStep.subtitle}
                    </motion.p>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStepIdx}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="min-h-[400px]"
                    >
                        {/* STEP 1: TYPE */}
                        {currentStep.id === 'type' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {Object.entries(PRODUCT_ICONS).map(([name, Icon]) => (
                                        <button
                                            key={name}
                                            onClick={() => setItem({...item, type: name as ProductType, engraving: name === 'Servicio de Grabado' ? { ...item.engraving, enabled: true } : item.engraving })}
                                            className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                                                item.type === name
                                                ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 shadow-xl'
                                                : 'bg-white dark:bg-wood-900 border-transparent hover:border-wood-200 dark:hover:border-wood-700 shadow-sm'
                                            }`}
                                        >
                                            <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                item.type === name ? 'bg-accent-gold text-white' : 'bg-wood-100 dark:bg-wood-800 text-wood-500'
                                            }`}>
                                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <span className={`block font-serif text-sm md:text-lg leading-tight ${
                                                item.type === name ? 'text-sand-100 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'
                                            }`}>
                                                {name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-widest text-wood-400">Uso Principal</label>
                                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                                        {['Decorativo', 'Funcional (cocina)', 'Evento / Regalo', 'Volumen Alto'].map((usage) => (
                                            <button
                                                key={usage}
                                                onClick={() => setItem({...item, usage: usage as any})}
                                                className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm transition-all border ${
                                                    item.usage === usage
                                                    ? 'bg-accent-gold border-accent-gold text-wood-900 font-bold'
                                                    : 'bg-white dark:bg-wood-900 border-wood-200 dark:border-wood-700 text-wood-600'
                                                }`}
                                            >
                                                {usage}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: MATERIAL OR ENGRAVE MATERIAL */}
                        {currentStep.id === 'material' && (
                             <WoodSelector 
                                selectedWoods={item.woods}
                                primaryWood={item.primaryWood}
                                secondaryWood={item.secondaryWood}
                                onChange={(woods, prim, sec) => setItem({...item, woods, primaryWood: prim, secondaryWood: sec})}
                            />
                        )}

                        {currentStep.id === 'material-engrave' && (
                            <div className="space-y-6">
                                <label className="block text-center text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest mb-6">
                                    ¿Qué material deseas grabar?
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                                    {ENGRAVING_MATERIALS.map((mat) => (
                                        <button
                                            key={mat.label}
                                            onClick={() => setItem({...item, materialToEngrave: mat.label})}
                                            className={`relative h-32 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${
                                                item.materialToEngrave === mat.label
                                                    ? 'border-accent-gold bg-wood-900 dark:bg-sand-100'
                                                    : 'border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900 hover:border-wood-300'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                item.materialToEngrave === mat.label ? 'bg-accent-gold text-wood-900' : 'bg-wood-100 dark:bg-wood-800 text-wood-400'
                                            }`}>
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <span className={`font-serif font-medium ${
                                                item.materialToEngrave === mat.label ? 'text-sand-100 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'
                                            }`}>
                                                {mat.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DIMENSIONS OR QUANTITY */}
                        {(currentStep.id === 'dimensions' || currentStep.id === 'quantity') && (
                            <div className="space-y-12 py-8">
                                {currentStep.id === 'dimensions' && (
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
                                        {['Largo', 'Ancho', 'Espesor'].map((label) => {
                                            const field = label === 'Largo' ? 'length' : label === 'Ancho' ? 'width' : 'thickness';
                                            const val = item.dimensions[field as keyof typeof item.dimensions];
                                            return (
                                                <div key={label} className="relative group w-full md:w-auto">
                                                    {/* Label inside (Mobile: Left, Desktop: Top) */}
                                                    <div className="absolute left-5 md:left-0 md:top-5 md:w-full top-1/2 -translate-y-1/2 md:translate-y-0 flex flex-col md:items-center items-start pointer-events-none z-10">
                                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-wood-400">{label}</span>
                                                        <span className="text-[9px] text-wood-300 md:hidden">cm</span>
                                                    </div>

                                                    <input 
                                                        type="number"
                                                        value={val}
                                                        step={field === 'thickness' ? 0.5 : 1}
                                                        onChange={(e) => setItem({
                                                            ...item,
                                                            dimensions: { ...item.dimensions, [field]: Number(e.target.value) }
                                                        })}
                                                        className="w-full h-16 md:w-40 md:h-40 bg-white dark:bg-wood-900 border-2 border-wood-100 dark:border-wood-800 rounded-xl md:rounded-3xl text-2xl md:text-5xl font-serif text-wood-900 dark:text-sand-100 outline-none focus:border-accent-gold focus:scale-105 transition-all shadow-lg text-right pr-6 pl-24 md:text-center md:p-0 md:pt-8"
                                                    />
                                                    <span className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-wood-300 pointer-events-none uppercase tracking-widest">cm</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                
                                <div className="max-w-md mx-auto bg-wood-100 dark:bg-wood-900/50 rounded-2xl p-6 flex items-center justify-between">
                                    <span className="text-sm font-bold uppercase tracking-widest text-wood-600 dark:text-wood-400">Cantidad</span>
                                    <div className="flex items-center gap-6">
                                        <button 
                                            onClick={() => setItem({...item, quantity: Math.max(1, item.quantity - 1)})}
                                            className="w-10 h-10 rounded-lg bg-white dark:bg-wood-800 shadow-sm flex items-center justify-center hover:bg-wood-200 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="font-serif text-3xl">{item.quantity}</span>
                                        <button 
                                            onClick={() => setItem({...item, quantity: item.quantity + 1})}
                                            className="w-10 h-10 rounded-lg bg-accent-gold text-wood-900 shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: ENGRAVING */}
                        {currentStep.id === 'engraving' && (
                             <EngravingConfigurator 
                                config={item.engraving}
                                onChange={(cfg) => setItem({...item, engraving: cfg})}
                                forceEnabled={item.type === 'Servicio de Grabado'}
                            />
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        {/* Footer: Actions */}
        <div className="flex-none p-6 border-t border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-950 flex justify-between items-center z-20">
            <button
                onClick={() => navigate(-1)}
                disabled={currentStepIdx === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    currentStepIdx === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : 'text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800'
                }`}
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
            </button>

            {isLastStep ? (
                 <button
                    onClick={() => onSave(item)}
                    className="flex items-center gap-2 md:gap-3 px-5 py-3 md:px-10 md:py-4 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:shadow-xl hover:-translate-y-1 transition-all whitespace-nowrap"
                >
                    <Check className="w-4 h-4" />
                    Guardar
                </button>
            ) : (
                <button
                    onClick={() => navigate(1)}
                    className="flex items-center gap-3 px-8 py-4 bg-accent-gold text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-accent-gold/20 hover:-translate-y-1 transition-all"
                >
                    Siguiente Paso
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>

      </motion.div>
    </div>
  );
};
